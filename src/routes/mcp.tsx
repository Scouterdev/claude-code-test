/**
 * MCP route — manage MCP (Model Context Protocol) server connections.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/mcp')({
  component: McpPage,
});

type McpServerInfo = {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  transport: string;
  toolCount: number;
  resourceCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  connected: 'var(--color-success)',
  disconnected: 'var(--color-subtle)',
  error: 'var(--color-error)',
};

function McpPage(): React.ReactNode {
  const [servers, setServers] = useState<McpServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call mcpList server function
    setIsLoading(false);
    setServers([]);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          MCP Servers
        </Text>
        <Text dimColor>Manage Model Context Protocol server connections.</Text>

        {isLoading ? (
          <Text dimColor>Loading MCP servers...</Text>
        ) : servers.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No MCP servers configured. Add servers via settings or .claude.json.</Text>
          </Box>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {servers.map(server => (
              <div
                key={server.name}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Box flexDirection="column">
                    <Box flexDirection="row" gap={1} alignItems="center">
                      <span style={{ color: STATUS_COLORS[server.status], fontSize: '10px' }}>{'\u25CF'}</span>
                      <Text bold>{server.name}</Text>
                    </Box>
                    <Text dimColor style={{ fontSize: '12px' }}>
                      {server.transport} \u00B7 {server.toolCount} tools \u00B7 {server.resourceCount} resources
                    </Text>
                  </Box>
                  <button
                    type="button"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '12px',
                    }}
                  >
                    {server.status === 'connected' ? 'Disconnect' : 'Connect'}
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
