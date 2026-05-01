/**
 * Web replacement for @anthropic/ink ThemeProvider.
 * Reads theme from config and applies CSS custom properties on a root div.
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js';

type ThemeName = 'dark' | 'light' | 'light-daltonized' | 'dark-daltonized' | 'light-ansi' | 'dark-ansi';
type ThemeSetting = 'auto' | ThemeName;

type WebThemeContextValue = {
  themeSetting: ThemeSetting;
  setThemeSetting: (setting: ThemeSetting) => void;
  currentTheme: ThemeName;
};

const WebThemeContext = createContext<WebThemeContextValue>({
  themeSetting: 'dark',
  setThemeSetting: () => {},
  currentTheme: 'dark',
});

/**
 * CSS variable mappings for each theme. Covers the most commonly used
 * tokens from the Ink theme (see packages/@ant/ink/src/theme/theme-types.ts).
 */
const THEME_VARS: Record<ThemeName, Record<string, string>> = {
  dark: {
    '--color-bg': '#1a1a2e',
    '--color-text': '#e0e0e0',
    '--color-text-inverse': '#000000',
    '--color-border': '#444444',
    '--color-claude': '#d77757',
    '--color-permission': '#5769f7',
    '--color-success': '#2c7a39',
    '--color-error': '#ab2b3f',
    '--color-warning': '#966c1e',
    '--color-info': '#3b82f6',
    '--color-subtle': '#666666',
    '--color-inactive': '#888888',
    '--color-prompt-border': '#555555',
    '--color-suggestion': '#5769f7',
    '--color-diff-added': '#69db7c',
    '--color-diff-removed': '#ff6b6b',
    '--color-user-msg-bg': '#2a2a3e',
    '--color-sidebar-bg': '#16162a',
    '--color-input-bg': '#222236',
  },
  light: {
    '--color-bg': '#ffffff',
    '--color-text': '#000000',
    '--color-text-inverse': '#ffffff',
    '--color-border': '#d0d0d0',
    '--color-claude': '#d77757',
    '--color-permission': '#5769f7',
    '--color-success': '#2c7a39',
    '--color-error': '#ab2b3f',
    '--color-warning': '#966c1e',
    '--color-info': '#3b82f6',
    '--color-subtle': '#afafaf',
    '--color-inactive': '#666666',
    '--color-prompt-border': '#999999',
    '--color-suggestion': '#5769f7',
    '--color-diff-added': '#69db7c',
    '--color-diff-removed': '#ff6b6b',
    '--color-user-msg-bg': '#f5f5f5',
    '--color-sidebar-bg': '#fafafa',
    '--color-input-bg': '#ffffff',
  },
  'light-daltonized': {
    '--color-bg': '#ffffff',
    '--color-text': '#000000',
    '--color-text-inverse': '#ffffff',
    '--color-border': '#d0d0d0',
    '--color-claude': '#d77757',
    '--color-permission': '#5769f7',
    '--color-success': '#0072b2',
    '--color-error': '#cc79a7',
    '--color-warning': '#e69f00',
    '--color-info': '#56b4e9',
    '--color-subtle': '#afafaf',
    '--color-inactive': '#666666',
    '--color-prompt-border': '#999999',
    '--color-suggestion': '#5769f7',
    '--color-diff-added': '#009e73',
    '--color-diff-removed': '#d55e00',
    '--color-user-msg-bg': '#f5f5f5',
    '--color-sidebar-bg': '#fafafa',
    '--color-input-bg': '#ffffff',
  },
  'dark-daltonized': {
    '--color-bg': '#1a1a2e',
    '--color-text': '#e0e0e0',
    '--color-text-inverse': '#000000',
    '--color-border': '#444444',
    '--color-claude': '#d77757',
    '--color-permission': '#5769f7',
    '--color-success': '#56b4e9',
    '--color-error': '#cc79a7',
    '--color-warning': '#e69f00',
    '--color-info': '#56b4e9',
    '--color-subtle': '#666666',
    '--color-inactive': '#888888',
    '--color-prompt-border': '#555555',
    '--color-suggestion': '#5769f7',
    '--color-diff-added': '#009e73',
    '--color-diff-removed': '#d55e00',
    '--color-user-msg-bg': '#2a2a3e',
    '--color-sidebar-bg': '#16162a',
    '--color-input-bg': '#222236',
  },
  'light-ansi': {
    '--color-bg': '#ffffff',
    '--color-text': '#000000',
    '--color-text-inverse': '#ffffff',
    '--color-border': '#cccccc',
    '--color-claude': '#d77757',
    '--color-permission': '#0000ff',
    '--color-success': '#008000',
    '--color-error': '#ff0000',
    '--color-warning': '#808000',
    '--color-info': '#0000ff',
    '--color-subtle': '#808080',
    '--color-inactive': '#808080',
    '--color-prompt-border': '#808080',
    '--color-suggestion': '#0000ff',
    '--color-diff-added': '#008000',
    '--color-diff-removed': '#ff0000',
    '--color-user-msg-bg': '#f0f0f0',
    '--color-sidebar-bg': '#f8f8f8',
    '--color-input-bg': '#ffffff',
  },
  'dark-ansi': {
    '--color-bg': '#000000',
    '--color-text': '#ffffff',
    '--color-text-inverse': '#000000',
    '--color-border': '#555555',
    '--color-claude': '#d77757',
    '--color-permission': '#5555ff',
    '--color-success': '#00ff00',
    '--color-error': '#ff5555',
    '--color-warning': '#ffff55',
    '--color-info': '#5555ff',
    '--color-subtle': '#555555',
    '--color-inactive': '#aaaaaa',
    '--color-prompt-border': '#555555',
    '--color-suggestion': '#5555ff',
    '--color-diff-added': '#00ff00',
    '--color-diff-removed': '#ff5555',
    '--color-user-msg-bg': '#111111',
    '--color-sidebar-bg': '#0a0a0a',
    '--color-input-bg': '#111111',
  },
};

function resolveAutoTheme(): ThemeName {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

type Props = {
  children: React.ReactNode;
  initialSetting?: ThemeSetting;
};

export function WebThemeProvider({ children, initialSetting }: Props): React.ReactNode {
  const [themeSetting, setThemeSettingRaw] = useState<ThemeSetting>(
    () => initialSetting ?? (getGlobalConfig().theme as ThemeSetting) ?? 'dark',
  );

  const currentTheme: ThemeName = themeSetting === 'auto' ? resolveAutoTheme() : themeSetting;

  const setThemeSetting = (setting: ThemeSetting) => {
    setThemeSettingRaw(setting);
    saveGlobalConfig(current => ({ ...current, theme: setting }));
  };

  const value = useMemo<WebThemeContextValue>(
    () => ({ themeSetting, setThemeSetting, currentTheme }),
    [themeSetting, currentTheme],
  );

  const vars = THEME_VARS[currentTheme] ?? THEME_VARS.dark;

  return (
    <WebThemeContext.Provider value={value}>
      <div
        style={{
          ...(vars as React.CSSProperties),
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
          fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
          fontSize: '14px',
          lineHeight: '1.6',
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </WebThemeContext.Provider>
  );
}

export function useWebTheme(): WebThemeContextValue {
  return useContext(WebThemeContext);
}
