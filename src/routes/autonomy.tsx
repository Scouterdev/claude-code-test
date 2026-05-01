/**
 * Autonomy route — autonomy rules dashboard.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/autonomy')({
  component: AutonomyPage,
});

type AutonomyRule = {
  id: string;
  pattern: string;
  action: 'allow' | 'deny' | 'ask';
  scope: 'project' | 'global';
};

function AutonomyPage(): React.ReactNode {
  const [rules, setRules] = useState<AutonomyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call autonomy server functions
    setIsLoading(false);
    setRules([]);
  }, []);

  const actionColors: Record<string, string> = {
    allow: 'var(--color-success)',
    deny: 'var(--color-error)',
    ask: 'var(--color-warning)',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Autonomy Rules
        </Text>
        <Text dimColor>Configure rules in .claude/autonomy to guide independent actions.</Text>

        {isLoading ? (
          <Text dimColor>Loading autonomy rules...</Text>
        ) : rules.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No autonomy rules configured.</Text>
          </Box>
        ) : (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {rules.map((rule, idx) => (
              <div
                key={rule.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: idx < rules.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <Box flexDirection="column">
                  <Text bold style={{ fontFamily: 'monospace' }}>
                    {rule.pattern}
                  </Text>
                  <Text dimColor style={{ fontSize: '12px' }}>
                    {rule.scope}
                  </Text>
                </Box>
                <span
                  style={{
                    color: actionColors[rule.action],
                    fontWeight: 'bold',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  {rule.action}
                </span>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
