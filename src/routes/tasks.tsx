/**
 * Tasks route — lists and manages background tasks.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
});

type TaskInfo = {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
};

const STATUS_COLORS: Record<string, string> = {
  running: 'var(--color-info)',
  completed: 'var(--color-success)',
  failed: 'var(--color-error)',
  cancelled: 'var(--color-subtle)',
};

function TasksPage(): React.ReactNode {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call listTasks server function
    setIsLoading(false);
    setTasks([]);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Tasks
        </Text>
        <Text dimColor>View and manage background tasks.</Text>

        {isLoading ? (
          <Text dimColor>Loading tasks...</Text>
        ) : tasks.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No tasks found.</Text>
          </Box>
        ) : (
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 160px 100px',
                padding: '10px 16px',
                backgroundColor: 'var(--color-sidebar-bg)',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 'bold',
              }}
            >
              <Text bold>Task</Text>
              <Text bold>Status</Text>
              <Text bold>Created</Text>
              <Text bold>Actions</Text>
            </div>
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 160px 100px',
                  padding: '10px 16px',
                  borderBottom: idx < tasks.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'center',
                }}
              >
                <Text>{task.name}</Text>
                <span style={{ color: STATUS_COLORS[task.status] }}>{task.status}</span>
                <Text dimColor style={{ fontSize: '12px' }}>
                  {new Date(task.createdAt).toLocaleString()}
                </Text>
                <div>
                  {task.status === 'running' && (
                    <button
                      type="button"
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid var(--color-error)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '12px',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
