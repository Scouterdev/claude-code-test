/**
 * Agents route — lists configured agents.
 * Wraps logic from src/cli/handlers/agents.ts as a web page.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/agents')({
  component: AgentsPage,
});

type AgentInfo = {
  name: string;
  agentType: string;
  model?: string;
  memory?: string;
  source: string;
  overriddenBy?: string;
};

function AgentsPage(): React.ReactNode {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call getAgents server function
    setIsLoading(false);
    setAgents([]);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Agents
        </Text>
        <Text dimColor>View and manage configured agent definitions.</Text>

        {isLoading ? (
          <Text dimColor>Loading agents...</Text>
        ) : agents.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No agents configured. Add agent definitions to .claude/agents/ to get started.</Text>
          </Box>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {agents.map(agent => (
              <div
                key={agent.name}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  opacity: agent.overriddenBy ? 0.5 : 1,
                }}
              >
                <Box flexDirection="row" justifyContent="space-between">
                  <Box flexDirection="column">
                    <Text bold>{agent.name}</Text>
                    <Text dimColor style={{ fontSize: '12px' }}>
                      {[agent.agentType, agent.model, agent.memory ? `${agent.memory} memory` : '']
                        .filter(Boolean)
                        .join(' \u00B7 ')}
                    </Text>
                  </Box>
                  <Text dimColor style={{ fontSize: '12px' }}>
                    {agent.source}
                  </Text>
                </Box>
                {agent.overriddenBy && (
                  <Text color="warning" style={{ fontSize: '11px' }}>
                    Shadowed by {agent.overriddenBy}
                  </Text>
                )}
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
