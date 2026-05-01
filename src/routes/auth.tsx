/**
 * Auth route — authentication status and login/logout management.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

type AuthStatus = {
  method: 'api-key' | 'oauth' | 'none';
  email?: string;
  accountId?: string;
  provider: string;
  isValid: boolean;
};

function AuthPage(): React.ReactNode {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    method: 'none',
    provider: 'unknown',
    isValid: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call authStatus server function
    setIsLoading(false);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Authentication
        </Text>

        {isLoading ? (
          <Text dimColor>Checking authentication status...</Text>
        ) : (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px',
                backgroundColor: 'var(--color-sidebar-bg)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Box flexDirection="row" gap={1} alignItems="center">
                <span
                  style={{
                    color: authStatus.isValid ? 'var(--color-success)' : 'var(--color-error)',
                    fontSize: '10px',
                  }}
                >
                  {'\u25CF'}
                </span>
                <Text bold>{authStatus.isValid ? 'Authenticated' : 'Not Authenticated'}</Text>
              </Box>
            </div>

            <div style={{ padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <AuthRow label="Method" value={authStatus.method} />
                  <AuthRow label="Provider" value={authStatus.provider} />
                  {authStatus.email && <AuthRow label="Email" value={authStatus.email} />}
                  {authStatus.accountId && <AuthRow label="Account" value={authStatus.accountId} />}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '16px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: '8px',
              }}
            >
              {authStatus.isValid ? (
                <button
                  type="button"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-error)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'var(--color-claude)',
                      color: 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    Login with OAuth
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                    }}
                  >
                    Enter API Key
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Box>
    </div>
  );
}

function AuthRow({ label, value }: { label: string; value: string }): React.ReactNode {
  return (
    <tr>
      <td style={{ padding: '4px 0', color: 'var(--color-subtle)', width: '100px' }}>
        <Text dimColor>{label}</Text>
      </td>
      <td style={{ padding: '4px 0' }}>
        <Text>{value}</Text>
      </td>
    </tr>
  );
}
