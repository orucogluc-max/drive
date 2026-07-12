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
