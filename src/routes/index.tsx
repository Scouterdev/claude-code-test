/**
 * Main Chat route — replaces src/screens/REPL.tsx for web.
 * Decomposes the 6400+ line REPL into web-compatible components:
 *   - ChatMessages: renders message list
 *   - ChatInput: prompt input
 *   - StatusBar: status line + notices
 *
 * All @anthropic/ink imports replaced with web primitives.
 * child_process.spawnSync moved to server functions.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text, useInput, useDocumentTitle, useWindowSize } from '../components/web/index.js';

export const Route = createFileRoute('/')({
  component: ChatPage,
});

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

function ChatMessages({ messages }: { messages: ChatMessage[] }): React.ReactNode {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
        }}
      >
        <Box flexDirection="column" alignItems="center" gap={1}>
          <Text bold style={{ fontSize: '24px', color: 'var(--color-claude)' }}>
            Claude Code
          </Text>
          <Text dimColor>Type a message to start a conversation</Text>
        </Box>
      </Box>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {messages.map(msg => (
        <div
          key={msg.id}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor:
              msg.role === 'user' ? 'var(--color-user-msg-bg)' : msg.role === 'system' ? 'transparent' : 'transparent',
            borderLeft:
              msg.role === 'assistant'
                ? '3px solid var(--color-claude)'
                : msg.role === 'system'
                  ? '3px solid var(--color-subtle)'
                  : 'none',
            maxWidth: '800px',
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Text
            dimColor={msg.role === 'system'}
            bold={msg.role === 'assistant'}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {msg.content}
          </Text>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (value: string) => void;
  isLoading: boolean;
}): React.ReactNode {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-sidebar-bg)',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message Claude..."
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-prompt-border)',
            backgroundColor: 'var(--color-input-bg)',
            color: 'var(--color-text)',
            fontFamily: 'inherit',
            fontSize: '14px',
            lineHeight: '1.5',
            outline: 'none',
            minHeight: '42px',
            maxHeight: '200px',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          type="button"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: value.trim() && !isLoading ? 'var(--color-claude)' : 'var(--color-subtle)',
            color: 'white',
            cursor: value.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.15s',
          }}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

function StatusBar({ isLoading }: { isLoading: boolean }): React.ReactNode {
  if (!isLoading) return null;

  return (
    <div
      style={{
        padding: '4px 16px',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-sidebar-bg)',
        textAlign: 'center',
      }}
    >
      <Text dimColor style={{ fontSize: '12px' }}>
        Claude is thinking...
      </Text>
    </div>
  );
}

function ChatPage(): React.ReactNode {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useDocumentTitle('Claude Code');

  const handleSubmit = useCallback((content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Placeholder: in full implementation, this calls the query server function
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `This is the web UI for Claude Code. The full query engine integration is pending.\n\nYour message: "${content}"`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ChatMessages messages={messages} />
      <StatusBar isLoading={isLoading} />
      <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
