import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../theme';

interface AchievementBadgeProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isUnlocked?: boolean;
}

export function AchievementBadge({ icon, label, isUnlocked = true }: AchievementBadgeProps) {
  return (
    <View style={[styles.container, !isUnlocked && styles.locked]}>
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={isUnlocked ? colors.brand : colors.foregroundMuted} />
      </View>
      <Text variant="caption" weight="medium" style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginRight: spacing[4],
  },
  locked: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    textAlign: 'center',
  },
});
