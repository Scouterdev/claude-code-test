/**
 * Web replacement for @anthropic/ink Box component.
 * Maps Ink's Yoga-based flexbox props to CSS flexbox.
 */
import React from 'react';

type BorderStyle = 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic' | 'none';

type BoxProps = {
  children?: React.ReactNode;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' | 'auto';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  columnGap?: number;
  rowGap?: number;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginX?: number;
  marginY?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderStyle?: BorderStyle;
  borderColor?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  display?: 'flex' | 'none';
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

function mapBorderStyle(style?: BorderStyle): string {
  if (!style || style === 'none') return 'none';
  return '1px solid';
}

function toPx(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value * 8}px`;
  return value;
}

export function Box({
  children,
  flexDirection = 'column',
  flexGrow,
  flexShrink,
  flexBasis,
  flexWrap,
  alignItems,
  alignSelf,
  justifyContent,
  gap,
  columnGap,
  rowGap,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  margin,
  marginX,
  marginY,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  borderStyle,
  borderColor,
  overflow,
  overflowX,
  overflowY,
  display = 'flex',
  className,
  style: styleProp,
  onClick,
}: BoxProps): React.ReactNode {
  const computedStyle: React.CSSProperties = {
    display,
    flexDirection,
    flexGrow,
    flexShrink,
    flexBasis: typeof flexBasis === 'number' ? `${flexBasis}px` : flexBasis,
    flexWrap,
    alignItems,
    alignSelf,
    justifyContent,
    gap: gap !== undefined ? `${gap * 8}px` : undefined,
    columnGap: columnGap !== undefined ? `${columnGap * 8}px` : undefined,
    rowGap: rowGap !== undefined ? `${rowGap * 8}px` : undefined,
    width: toPx(width),
    height: toPx(height),
    minWidth: toPx(minWidth),
    minHeight: toPx(minHeight),
    maxWidth: toPx(maxWidth),
    maxHeight: toPx(maxHeight),
    padding: padding !== undefined ? `${padding * 8}px` : undefined,
    paddingTop:
      paddingTop !== undefined ? `${paddingTop * 8}px` : paddingY !== undefined ? `${paddingY * 8}px` : undefined,
    paddingBottom:
      paddingBottom !== undefined ? `${paddingBottom * 8}px` : paddingY !== undefined ? `${paddingY * 8}px` : undefined,
    paddingLeft:
      paddingLeft !== undefined ? `${paddingLeft * 8}px` : paddingX !== undefined ? `${paddingX * 8}px` : undefined,
    paddingRight:
      paddingRight !== undefined ? `${paddingRight * 8}px` : paddingX !== undefined ? `${paddingX * 8}px` : undefined,
    margin: margin !== undefined ? `${margin * 8}px` : undefined,
    marginTop: marginTop !== undefined ? `${marginTop * 8}px` : marginY !== undefined ? `${marginY * 8}px` : undefined,
    marginBottom:
      marginBottom !== undefined ? `${marginBottom * 8}px` : marginY !== undefined ? `${marginY * 8}px` : undefined,
    marginLeft:
      marginLeft !== undefined ? `${marginLeft * 8}px` : marginX !== undefined ? `${marginX * 8}px` : undefined,
    marginRight:
      marginRight !== undefined ? `${marginRight * 8}px` : marginX !== undefined ? `${marginX * 8}px` : undefined,
    border: mapBorderStyle(borderStyle),
    borderColor: borderColor ?? (borderStyle && borderStyle !== 'none' ? 'var(--color-border)' : undefined),
    overflow,
    overflowX,
    overflowY,
    boxSizing: 'border-box',
    ...styleProp,
  };

  return (
    <div className={className} style={computedStyle} onClick={onClick}>
      {children}
    </div>
  );
}
