/**
 * Resume Conversation route — replaces src/screens/ResumeConversation.tsx.
 * Web-based session list replaces Ink LogSelector.
 * Uses useNavigate() from TanStack Router instead of state-based screen switching.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/resume')({
  component: ResumePage,
});

type SessionEntry = {
  id: string;
  name: string;
  lastModified: number;
  messageCount: number;
  cwd: string;
};

function ResumePage(): React.ReactNode {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Placeholder: load sessions from server function
    setIsLoading(false);
    setSessions([]);
  }, []);

  const filteredSessions = sessions.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cwd.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = useCallback(
    (session: SessionEntry) => {
      // Navigate to main chat with session ID
      void navigate({ to: '/', search: { session: session.id } });
    },
    [navigate],
  );

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Resume Conversation
        </Text>

        <input
          type="text"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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

        {isLoading ? (
          <Text dimColor>Loading sessions...</Text>
        ) : filteredSessions.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>
              {sessions.length === 0 ? 'No previous sessions found.' : 'No sessions match your search.'}
            </Text>
          </Box>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredSessions.map((session, idx) => (
              <button
                key={session.id}
                onClick={() => handleSelect(session)}
                type="button"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: idx === selectedIndex ? '1px solid var(--color-permission)' : '1px solid var(--color-border)',
                  backgroundColor: idx === selectedIndex ? 'var(--color-user-msg-bg)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: 'var(--color-text)',
                  width: '100%',
                }}
              >
                <div>
                  <Text bold>{session.name}</Text>
                  <br />
                  <Text dimColor style={{ fontSize: '12px' }}>
                    {session.cwd}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text dimColor style={{ fontSize: '12px' }}>
                    {session.messageCount} messages
                  </Text>
                  <br />
                  <Text dimColor style={{ fontSize: '11px' }}>
                    {new Date(session.lastModified).toLocaleString()}
                  </Text>
                </div>
              </button>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
