import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface StatTileProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function StatTile({ label, value, unit, icon }: StatTileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && <Feather name={icon} size={14} color={colors.foregroundMuted} style={styles.icon} />}
        <Text variant="label" color="foregroundMuted">{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text variant="h2">{value}</Text>
        {unit && <Text variant="body" color="foregroundMuted" style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundElevated,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  icon: {
    marginRight: spacing[2],
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unit: {
    marginLeft: spacing[1],
  },
});
