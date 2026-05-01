/**
 * Plugins route — manage installed plugins.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/plugins')({
  component: PluginsPage,
});

type PluginInfo = {
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  source: string;
};

function PluginsPage(): React.ReactNode {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call plugin server functions
    setIsLoading(false);
    setPlugins([]);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Plugins
        </Text>
        <Text dimColor>Manage installed plugins and marketplace.</Text>

        {isLoading ? (
          <Text dimColor>Loading plugins...</Text>
        ) : plugins.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No plugins installed. Browse the marketplace to add plugins.</Text>
          </Box>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plugins.map(plugin => (
              <div
                key={plugin.name}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  opacity: plugin.enabled ? 1 : 0.6,
                }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Box flexDirection="column">
                    <Text bold>
                      {plugin.name}{' '}
                      <Text dimColor style={{ fontWeight: 'normal', fontSize: '12px' }}>
                        v{plugin.version}
                      </Text>
                    </Text>
                    <Text dimColor style={{ fontSize: '13px' }}>
                      {plugin.description}
                    </Text>
                  </Box>
                  <button
                    type="button"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: plugin.enabled ? 'transparent' : 'var(--color-success)',
                      color: plugin.enabled ? 'var(--color-text)' : 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                    }}
                  >
                    {plugin.enabled ? 'Disable' : 'Enable'}
                  </button>
                </Box>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
