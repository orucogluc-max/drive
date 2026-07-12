import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { colors, borderRadius, spacing } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  style,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const containerStyles = [
    styles.container,
    styles[`${variant}Variant`],
    styles[`${size}Size`],
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textColor = variant === 'primary' ? 'white' : variant === 'outline' ? 'foreground' : 'brand';

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={colors[textColor as keyof typeof colors]} />
      ) : typeof children === 'string' ? (
        <Text variant="body" weight="semibold" color={textColor as keyof typeof colors}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  // Variants
  primaryVariant: {
    backgroundColor: colors.brand,
  },
  secondaryVariant: {
    backgroundColor: colors.backgroundElevated,
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostVariant: {
    backgroundColor: 'transparent',
  },
  // Sizes
  smSize: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  mdSize: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  lgSize: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
  },
});
