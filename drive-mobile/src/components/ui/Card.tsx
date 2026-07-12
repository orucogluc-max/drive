import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated = false, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.container,
        elevated && styles.elevated,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadows.sm,
    backgroundColor: colors.backgroundElevated,
    borderColor: 'transparent',
  },
});
