/**
 * Skills route — browse and manage learned skills.
 */
import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Box, Text } from '../components/web/index.js';

export const Route = createFileRoute('/skills')({
  component: SkillsPage,
});

type SkillInfo = {
  id: string;
  name: string;
  description: string;
  source: string;
  createdAt: number;
};

function SkillsPage(): React.ReactNode {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: call listSkills server function
    setIsLoading(false);
    setSkills([]);
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Box flexDirection="column" gap={2}>
        <Text bold style={{ fontSize: '20px' }}>
          Skills
        </Text>
        <Text dimColor>Browse learned behavioral patterns and skills.</Text>

        {isLoading ? (
          <Text dimColor>Loading skills...</Text>
        ) : skills.length === 0 ? (
          <Box
            style={{
              padding: '32px',
              textAlign: 'center',
              border: '1px dashed var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <Text dimColor>No skills learned yet. Skills are generated from session observations.</Text>
          </Box>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {skills.map(skill => (
              <div
                key={skill.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Box flexDirection="row" justifyContent="space-between">
                  <Text bold>{skill.name}</Text>
                  <Text dimColor style={{ fontSize: '12px' }}>
                    {skill.source}
                  </Text>
                </Box>
                <Text dimColor style={{ fontSize: '13px' }}>
                  {skill.description}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Box>
    </div>
  );
}
