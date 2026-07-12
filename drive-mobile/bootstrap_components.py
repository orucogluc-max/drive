import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

components = {
    "src/components/ui/Text.tsx": """
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
""",
    "src/components/ui/Button.tsx": """
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
""",
    "src/components/ui/Card.tsx": """
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
""",
    "src/components/ui/Input.tsx": """
import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, fontFamilies, fontSizes, borderRadius, spacing } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.foregroundMuted}
        {...props}
      />
      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    marginBottom: spacing[2],
  },
  input: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    color: colors.foreground,
    fontFamily: fontFamilies.sans,
    fontSize: fontSizes.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: spacing[1],
  },
});
"""
}

for name, content in components.items():
    write_file(name, content)
