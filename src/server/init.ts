/**
 * Web-compatible server initialization.
 * Ported from src/entrypoints/init.ts — strips terminal-only concerns
 * (theme callbacks, JetBrains detection) and runs once per server lifecycle.
 */
import type { Attributes, MetricOptions } from '@opentelemetry/api'
import memoize from 'lodash-es/memoize.js'
import { getIsNonInteractiveSession } from 'src/bootstrap/state.js'
import type { AttributedCounter } from '../bootstrap/state.js'
import { getSessionCounter, setMeter } from '../bootstrap/state.js'
import { shutdownLspServerManager } from '../services/lsp/manager.js'
import { populateOAuthAccountInfoIfNeeded } from '../services/oauth/client.js'
import {
  initializePolicyLimitsLoadingPromise,
  isPolicyLimitsEligible,
} from '../services/policyLimits/index.js'
import {
  initializeRemoteManagedSettingsLoadingPromise,
  isEligibleForRemoteManagedSettings,
  waitForRemoteManagedSettingsToLoad,
} from '../services/remoteManagedSettings/index.js'
import { preconnectAnthropicApi } from '../utils/apiPreconnect.js'
import { applyExtraCACertsFromConfig } from '../utils/caCertsConfig.js'
import { registerCleanup } from '../utils/cleanupRegistry.js'
import {
  enableConfigs,
  getGlobalConfig,
  recordFirstStartTime,
  saveGlobalConfig,
} from '../utils/config.js'
import { logForDebugging } from '../utils/debug.js'
import { detectCurrentRepository } from '../utils/detectRepository.js'
import { logForDiagnosticsNoPII } from '../utils/diagLogs.js'
import { isEnvTruthy } from '../utils/envUtils.js'
import { ConfigParseError, errorMessage } from '../utils/errors.js'
import {
  gracefulShutdownSync,
  setupGracefulShutdown,
} from '../utils/gracefulShutdown.js'
import {
  applyConfigEnvironmentVariables,
  applySafeConfigEnvironmentVariables,
} from '../utils/managedEnv.js'
import { configureGlobalMTLS } from '../utils/mtls.js'
import {
  ensureScratchpadDir,
  isScratchpadEnabled,
} from '../utils/permissions/filesystem.js'
import { configureGlobalAgents } from '../utils/proxy.js'
import { isBetaTracingEnabled } from '../utils/telemetry/betaSessionTracing.js'
import { getTelemetryAttributes } from '../utils/telemetryAttributes.js'
import { setShellIfWindows } from '../utils/windowsPaths.js'
import { initSentry } from '../utils/sentry.js'
import { initUser } from '../utils/user.js'
import { initLangfuse, shutdownLangfuse } from '../services/langfuse/index.js'

// Track if telemetry has been initialized to prevent double initialization
let telemetryInitialized = false

/**
 * Memoized server init — runs once per server lifecycle.
 * REMOVED vs CLI init:
 *   - setThemeConfigCallbacks() (terminal theme)
 *   - initJetBrainsDetection() (IDE detection)
 */
export const serverInit = memoize(async (): Promise<void> => {
  const initStartTime = Date.now()
  logForDiagnosticsNoPII('info', 'server_init_started')

  try {
    enableConfigs()
    logForDiagnosticsNoPII('info', 'server_init_configs_enabled', {
      duration_ms: Date.now() - initStartTime,
    })

    applySafeConfigEnvironmentVariables()
    applyExtraCACertsFromConfig()

    setupGracefulShutdown()

    // 1P event logging + GrowthBook
    void Promise.all([
      import('../services/analytics/firstPartyEventLogger.js'),
      import('../services/analytics/growthbook.js'),
    ]).then(([fp, gb]) => {
      fp.initialize1PEventLogging()
      gb.onGrowthBookRefresh(() => {
        void fp.reinitialize1PEventLoggingIfConfigChanged()
      })
    })

    // Balance polling
    void import('../services/providerUsage/balance/poller.js').then(m =>
      m.startBalancePolling(),
    )

    // OAuth account info
    void populateOAuthAccountInfoIfNeeded()

    // Detect GitHub repository (populates cache for gitDiff PR linking)
    void detectCurrentRepository()

    // Remote managed settings
    if (isEligibleForRemoteManagedSettings()) {
      initializeRemoteManagedSettingsLoadingPromise()
    }
    if (isPolicyLimitsEligible()) {
      initializePolicyLimitsLoadingPromise()
    }

    recordFirstStartTime()

    // mTLS + proxy
    configureGlobalMTLS()
    configureGlobalAgents()

    // Sentry
    initSentry()

    // Langfuse
    await initUser()
    initLangfuse()
    registerCleanup(shutdownLangfuse)

    // Preconnect API
    preconnectAnthropicApi()

    // Upstream proxy for CCR
    if (isEnvTruthy(process.env.CLAUDE_CODE_REMOTE)) {
      try {
        const { initUpstreamProxy, getUpstreamProxyEnv } = await import(
          '../upstreamproxy/upstreamproxy.js'
        )
        const { registerUpstreamProxyEnvFn } = await import(
          '../utils/subprocessEnv.js'
        )
        registerUpstreamProxyEnvFn(getUpstreamProxyEnv)
        await initUpstreamProxy()
      } catch (err) {
        logForDebugging(
          `[server/init] upstreamproxy init failed: ${err instanceof Error ? err.message : String(err)}; continuing without proxy`,
          { level: 'warn' },
        )
      }
    }

    setShellIfWindows()

    // LSP manager cleanup
    registerCleanup(shutdownLspServerManager)

    // Swarm team cleanup
    registerCleanup(async () => {
      const { cleanupSessionTeams } = await import(
        '../utils/swarm/teamHelpers.js'
      )
      await cleanupSessionTeams()
    })

    // Scratchpad
    if (isScratchpadEnabled()) {
      await ensureScratchpadDir()
    }

    logForDiagnosticsNoPII('info', 'server_init_completed', {
      duration_ms: Date.now() - initStartTime,
    })
  } catch (error) {
    if (error instanceof ConfigParseError) {
      // In web mode, log and continue rather than showing an Ink dialog
      console.error(
        `Configuration error in ${error.filePath}: ${error.message}`,
      )
      return
    }
    throw error
  }
})

/**
 * Initialize telemetry after trust has been granted (ported from init.ts).
 */
export function initializeTelemetryAfterTrust(): void {
  if (isEligibleForRemoteManagedSettings()) {
    if (getIsNonInteractiveSession() && isBetaTracingEnabled()) {
      void doInitializeTelemetry().catch(error => {
        logForDebugging(
          `[3P telemetry] Eager telemetry init failed (beta tracing): ${errorMessage(error)}`,
          { level: 'error' },
        )
      })
    }
    void waitForRemoteManagedSettingsToLoad()
      .then(async () => {
        applyConfigEnvironmentVariables()
        await doInitializeTelemetry()
      })
      .catch(error => {
        logForDebugging(
          `[3P telemetry] Telemetry init failed (remote settings path): ${errorMessage(error)}`,
          { level: 'error' },
        )
      })
  } else {
    void doInitializeTelemetry().catch(error => {
      logForDebugging(
        `[3P telemetry] Telemetry init failed: ${errorMessage(error)}`,
        { level: 'error' },
      )
    })
  }
}

async function doInitializeTelemetry(): Promise<void> {
  if (telemetryInitialized) return
  telemetryInitialized = true
  try {
    await setMeterState()
  } catch (error) {
    telemetryInitialized = false
    throw error
  }
}

async function setMeterState(): Promise<void> {
  const { initializeTelemetry } = await import(
    '../utils/telemetry/instrumentation.js'
  )
  const meter = await initializeTelemetry()
  if (meter) {
    const createAttributedCounter = (
      name: string,
      options: MetricOptions,
    ): AttributedCounter => {
      const counter = meter?.createCounter(name, options)
      return {
        add(value: number, additionalAttributes: Attributes = {}) {
          const currentAttributes = getTelemetryAttributes()
          const mergedAttributes = {
            ...currentAttributes,
            ...additionalAttributes,
          }
          counter?.add(value, mergedAttributes)
        },
      }
    }
    setMeter(meter, createAttributedCounter)
    getSessionCounter()?.add(1)
  }
}
