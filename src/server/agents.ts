/**
 * Server function for agents — wraps logic from src/cli/handlers/agents.ts.
 * Called by the /agents route to fetch the list of configured agents.
 */
import { createServerFn } from '@tanstack/react-start'
import { appMiddleware } from './middleware.js'

type AgentInfo = {
  name: string
  agentType: string
  model?: string
  memory?: string
  source: string
  overriddenBy?: string
}

export const getAgents = createServerFn({ method: 'GET' })
  .middleware([appMiddleware])
  .handler(async (): Promise<AgentInfo[]> => {
    const {
      AGENT_SOURCE_GROUPS,
      compareAgentsByName,
      getOverrideSourceLabel,
      resolveAgentModelDisplay,
      resolveAgentOverrides,
    } = await import(
      '@claude-code-best/builtin-tools/tools/AgentTool/agentDisplay.js'
    )
    const { getActiveAgentsFromList, getAgentDefinitionsWithOverrides } =
      await import(
        '@claude-code-best/builtin-tools/tools/AgentTool/loadAgentsDir.js'
      )
    const { getCwd } = await import('../utils/cwd.js')

    const cwd = getCwd()
    const { allAgents } = await getAgentDefinitionsWithOverrides(cwd)
    const activeAgents = getActiveAgentsFromList(allAgents)
    const resolvedAgents = resolveAgentOverrides(allAgents, activeAgents)

    const result: AgentInfo[] = []

    for (const { label, source } of AGENT_SOURCE_GROUPS) {
      const groupAgents = resolvedAgents
        .filter((a: { source: string }) => a.source === source)
        .sort(compareAgentsByName)

      for (const agent of groupAgents) {
        const model = resolveAgentModelDisplay(agent)
        result.push({
          name: agent.agentType,
          agentType: agent.agentType,
          model: model ?? undefined,
          memory: agent.memory ?? undefined,
          source: label,
          overriddenBy: agent.overriddenBy
            ? getOverrideSourceLabel(agent.overriddenBy)
            : undefined,
        })
      }
    }

    return result
  })
