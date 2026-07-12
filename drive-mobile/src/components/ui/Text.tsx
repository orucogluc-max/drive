import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes, fontWeights } from '../../theme';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'mono';
  color?: keyof typeof colors;
  weight?: keyof typeof fontWeights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Text({
  style,
  variant = 'body',
  color = 'foreground',
  weight,
  align,
  ...props
}: TextProps) {
  const textStyles = [
    styles.base,
    styles[variant],
    { color: colors[color] },
    weight && { fontWeight: fontWeights[weight] },
    align && { textAlign: align },
    style,
  ];

  return <RNText style={textStyles} {...props} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamilies.sans,
  },
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
  },
  body: {
    fontSize: fontSizes.md,
  },
  caption: {
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
  },
  label: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.md,
  },
});
