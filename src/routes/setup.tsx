/**
 * Setup/Onboarding route — replaces showSetupScreens() from src/interactiveHelpers.tsx.
 * Each dialog (Onboarding, TrustDialog, GroveDialog, ApproveApiKey,
 * BypassPermissionsModeDialog) becomes a step in a wizard component.
 */
import React, { useCallback, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/setup')({
  component: SetupPage,
});

type SetupStep = 'welcome' | 'trust' | 'api-key' | 'permissions' | 'complete';

function SetupPage(): React.ReactNode {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>('welcome');

  const handleNext = useCallback(() => {
    const steps: SetupStep[] = ['welcome', 'trust', 'api-key', 'permissions', 'complete'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx < steps.length - 1) {
      setStep(steps[currentIdx + 1]!);
    }
  }, [step]);

  const handleComplete = useCallback(() => {
    void navigate({ to: '/' });
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '32px',
          backgroundColor: 'var(--color-sidebar-bg)',
        }}
      >
        {step === 'welcome' && (
          <Box flexDirection="column" gap={2}>
            <Text bold style={{ fontSize: '24px', color: 'var(--color-claude)' }}>
              Welcome to Claude Code
            </Text>
            <Text>Claude Code is an AI coding assistant that runs in your development environment.</Text>
            <Text dimColor>This setup wizard will help you configure your environment.</Text>
            <WizardButton onClick={handleNext}>Get Started</WizardButton>
          </Box>
        )}

        {step === 'trust' && (
          <Box flexDirection="column" gap={2}>
            <Text bold style={{ fontSize: '20px' }}>
              Trust & Safety
            </Text>
            <Text>
              Claude Code can read files, execute commands, and make changes to your project. Please review and accept
              the trust dialog to continue.
            </Text>
            <Text dimColor style={{ fontSize: '12px' }}>
              You can configure permissions in Settings at any time.
            </Text>
            <WizardButton onClick={handleNext}>Accept & Continue</WizardButton>
          </Box>
        )}

        {step === 'api-key' && (
          <Box flexDirection="column" gap={2}>
            <Text bold style={{ fontSize: '20px' }}>
              API Key
            </Text>
            <Text>Claude Code requires an Anthropic API key or OAuth login to function.</Text>
            <input
              type="password"
              placeholder="sk-ant-..."
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text)',
                fontFamily: 'inherit',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <Text dimColor style={{ fontSize: '12px' }}>
              Or use OAuth login via the Auth page.
            </Text>
            <WizardButton onClick={handleNext}>Continue</WizardButton>
          </Box>
        )}

        {step === 'permissions' && (
          <Box flexDirection="column" gap={2}>
            <Text bold style={{ fontSize: '20px' }}>
              Permission Mode
            </Text>
            <Text>Choose how Claude Code handles tool permissions.</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PermissionOption
                title="Normal Mode"
                description="Claude asks for approval before running commands and editing files."
                selected
              />
              <PermissionOption
                title="Bypass Mode"
                description="Claude automatically approves tool calls (for trusted environments)."
                selected={false}
              />
            </div>
            <WizardButton onClick={handleNext}>Continue</WizardButton>
          </Box>
        )}

        {step === 'complete' && (
          <Box flexDirection="column" gap={2} alignItems="center">
            <Text bold style={{ fontSize: '24px', color: 'var(--color-success)' }}>
              Setup Complete
            </Text>
            <Text>You're ready to start using Claude Code.</Text>
            <WizardButton onClick={handleComplete}>Start Chatting</WizardButton>
          </Box>
        )}

        {/* Progress indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
          }}
        >
          {(['welcome', 'trust', 'api-key', 'permissions', 'complete'] as SetupStep[]).map(s => (
            <div
              key={s}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: s === step ? 'var(--color-claude)' : 'var(--color-subtle)',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WizardButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }): React.ReactNode {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'var(--color-claude)',
        color: 'white',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: 'bold',
        marginTop: '8px',
        transition: 'opacity 0.15s',
        width: '100%',
      }}
    >
      {children}
    </button>
  );
}

function PermissionOption({
  title,
  description,
  selected,
}: {
  title: string;
  description: string;
  selected: boolean;
}): React.ReactNode {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: `1px solid ${selected ? 'var(--color-permission)' : 'var(--color-border)'}`,
        backgroundColor: selected ? 'var(--color-user-msg-bg)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <Text bold>{title}</Text>
      <br />
      <Text dimColor style={{ fontSize: '12px' }}>
        {description}
      </Text>
    </div>
  );
}
