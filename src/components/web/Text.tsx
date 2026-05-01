/**
 * Web replacement for @anthropic/ink Text component.
 * Maps Ink text props to CSS styling.
 */
import React from 'react';

type TextProps = {
  children?: React.ReactNode;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dimColor?: boolean;
  color?: string;
  backgroundColor?: string;
  wrap?: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' | 'truncate-end';
  inverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const SEMANTIC_COLOR_MAP: Record<string, string> = {
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  success: 'var(--color-success)',
  info: 'var(--color-info, #3b82f6)',
  subtle: 'var(--color-subtle)',
  inactive: 'var(--color-inactive)',
};

function resolveColor(color?: string): string | undefined {
  if (!color) return undefined;
  return SEMANTIC_COLOR_MAP[color] ?? color;
}

export function Text({
  children,
  bold,
  italic,
  underline,
  strikethrough,
  dimColor,
  color,
  backgroundColor,
  wrap,
  inverse,
  className,
  style: styleProp,
}: TextProps): React.ReactNode {
  const computedStyle: React.CSSProperties = {
    fontWeight: bold ? 'bold' : undefined,
    fontStyle: italic ? 'italic' : undefined,
    textDecoration:
      [underline ? 'underline' : '', strikethrough ? 'line-through' : ''].filter(Boolean).join(' ') || undefined,
    opacity: dimColor ? 0.6 : undefined,
    color: inverse ? (resolveColor(backgroundColor) ?? 'var(--color-bg)') : resolveColor(color),
    backgroundColor: inverse ? (resolveColor(color) ?? 'var(--color-text)') : resolveColor(backgroundColor),
    whiteSpace:
      wrap === 'wrap' ? 'pre-wrap' : wrap === 'truncate' || wrap?.startsWith('truncate') ? 'nowrap' : undefined,
    overflow: wrap?.startsWith('truncate') ? 'hidden' : undefined,
    textOverflow: wrap?.startsWith('truncate') ? 'ellipsis' : undefined,
    ...styleProp,
  };

  return (
    <span className={className} style={computedStyle}>
      {children}
    </span>
  );
}
