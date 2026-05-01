/**
 * Server middleware — replaces Commander.js preAction hook from src/main.tsx.
 * Uses createMiddleware() from @tanstack/react-start.
 *
 * Runs before every server function:
 *   1. Awaits MDM settings + keychain prefetch
 *   2. Calls serverInit() (memoized, one-time)
 *   3. Initializes logging sinks
 *   4. Runs config migrations
 *   5. Fires remote settings + policy limits (non-blocking)
 *
 * REMOVED vs CLI preAction:
 *   - process.title = 'claude' (terminal-only)
 *   - setInlinePlugins(pluginDir) (CLI --plugin-dir flag)
 */
import { createMiddleware } from '@tanstack/react-start'
import { ensureMdmSettingsLoaded } from '../utils/settings/mdm/settings.js'
import { ensureKeychainPrefetchCompleted } from '../utils/secureStorage/keychainPrefetch.js'
import { loadPolicyLimits } from '../services/policyLimits/index.js'
import { loadRemoteManagedSettings } from '../services/remoteManagedSettings/index.js'
import { serverInit } from './init.js'
import { runMigrations } from './migrations.js'

export const appMiddleware = createMiddleware().server(async ({ next }) => {
  // Await async subprocess loads
  await Promise.all([
    ensureMdmSettingsLoaded(),
    ensureKeychainPrefetchCompleted(),
  ])

  // One-time server initialization
  await serverInit()

  // Attach logging sinks
  const { initSinks } = await import('../utils/sinks.js')
  initSinks()

  // Run config migrations
  runMigrations()

  // Non-blocking remote settings + policy limits
  void loadRemoteManagedSettings()
  void loadPolicyLimits()

  return next()
})
