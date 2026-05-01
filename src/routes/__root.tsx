/**
 * Root layout for the TanStack Start web application.
 * Replaces:
 *   - src/replLauncher.tsx (thin launcher)
 *   - src/components/App.tsx (provider wrapper)
 *
 * Provides:
 *   - WebThemeProvider (replaces @anthropic/ink ThemeProvider)
 *   - Navigation bar with links to all routes
 *   - <Outlet /> for child routes
 *
 * REMOVED from App.tsx wrapper:
 *   - FpsMetricsProvider (terminal frame metrics)
 *   - StatsProvider (terminal rendering stats)
 *   - ThemeProvider from @anthropic/ink
 */
import React from 'react';
import { Outlet, createRootRoute, Link } from '@tanstack/react-router';
import { WebThemeProvider } from '../components/web/WebThemeProvider.js';

export const Route = createRootRoute({
  component: RootLayout,
});

const NAV_ITEMS = [
  { to: '/' as const, label: 'Chat' },
  { to: '/resume' as const, label: 'Resume' },
  { to: '/doctor' as const, label: 'Doctor' },
  { to: '/agents' as const, label: 'Agents' },
  { to: '/tasks' as const, label: 'Tasks' },
  { to: '/skills' as const, label: 'Skills' },
  { to: '/mcp' as const, label: 'MCP' },
  { to: '/plugins' as const, label: 'Plugins' },
  { to: '/auth' as const, label: 'Auth' },
  { to: '/settings' as const, label: 'Settings' },
];

function RootLayout(): React.ReactNode {
  return (
    <WebThemeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-sidebar-bg)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontWeight: 'bold',
              color: 'var(--color-claude)',
              marginRight: '16px',
              fontSize: '16px',
            }}
          >
            Claude Code
          </span>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: '13px',
                transition: 'background-color 0.15s',
              }}
              activeProps={{
                style: {
                  backgroundColor: 'var(--color-permission)',
                  color: 'var(--color-text-inverse)',
                },
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </main>
      </div>
    </WebThemeProvider>
  );
}
