/**
 * Settings route — settings management UI.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text, useWebTheme } from '../components/web/index.js';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

type SettingsItem = {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'text';
  value: string | boolean;
  options?: string[];
};

function SettingsPage(): React.ReactNode {
  const { themeSetting, setThemeSetting, currentTheme } = useWebTheme();

  const sections: SettingsSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose the color theme for the application',
          type: 'select',
          value: themeSetting,
          options: ['auto', 'dark', 'light', 'dark-daltonized', 'light-daltonized', 'dark-ansi', 'light-ansi'],
        },
      ],
    },
    {
      title: 'Model',
      items: [
        {
          key: 'model',
          label: 'Default Model',
          description: 'The default model to use for conversations',
          type: 'text',
          value: 'claude-sonnet-4-20250514',
        },
        {
          key: 'thinking',
          label: 'Extended Thinking',
          description: 'Enable extended thinking mode for deeper reasoning',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      title: 'Behavior',
      items: [
        {
          key: 'poorMode',
          label: 'Budget Mode',
          description: 'Skip memory extraction and verification to reduce token usage',
          type: 'toggle',
          value: false,
        },
        {
          key: 'autoUpdater',
          label: 'Auto-Update',
          description: 'Automatically check for and install updates',
          type: 'toggle',
          value: true,
        },
      ],
    },
  ];

  const handleChange = useCallback(
    (key: string, value: string | boolean) => {
      if (key === 'theme' && typeof value === 'string') {
        setThemeSetting(value as Parameters<typeof setThemeSetting>[0]);
      }
      // Other settings would call respective server functions
    },
    [setThemeSetting],
  );

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={3}>
        <Text bold style={{ fontSize: '20px' }}>
          Settings
        </Text>

        {sections.map(section => (
          <div key={section.title}>
            <Text bold style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
              {section.title}
            </Text>
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, idx) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderBottom: idx < section.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <Box flexDirection="column" style={{ flex: 1, marginRight: '16px' }}>
                    <Text bold>{item.label}</Text>
                    <Text dimColor style={{ fontSize: '12px' }}>
                      {item.description}
                    </Text>
                  </Box>

                  {item.type === 'toggle' && (
                    <ToggleSwitch
                      checked={item.value as boolean}
                      onChange={checked => handleChange(item.key, checked)}
                    />
                  )}

                  {item.type === 'select' && (
                    <select
                      value={item.value as string}
                      onChange={e => handleChange(item.key, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-input-bg)',
                        color: 'var(--color-text)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      {item.options?.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {item.type === 'text' && (
                    <input
                      type="text"
                      value={item.value as string}
                      onChange={e => handleChange(item.key, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-input-bg)',
                        color: 'var(--color-text)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        outline: 'none',
                        width: '200px',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Box>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}): React.ReactNode {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: checked ? 'var(--color-success)' : 'var(--color-subtle)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}
