import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface GarageCardProps {
  make: string;
  model: string;
  year: number;
  hp?: number;
  drivesCount: number;
  imageUrl?: string;
  isPrimary?: boolean;
  onPress?: () => void;
}

export function GarageCard({ make, model, year, hp, drivesCount, imageUrl, isPrimary, onPress }: GarageCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Feather name="image" size={32} color={colors.foregroundMuted} />
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="h3">{make} {model}</Text>
            <Text variant="caption">{year}</Text>
          </View>
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Text variant="caption" color="white" weight="bold">PRIMARY</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsRow}>
          {hp && (
            <View style={styles.statItem}>
              <Text variant="label">POWER</Text>
              <Text variant="body" weight="semibold">{hp} HP</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text variant="label">DRIVES</Text>
            <Text variant="body" weight="semibold">{drivesCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    height: 160,
    width: '100%',
  },
  imagePlaceholder: {
    height: 160,
    width: '100%',
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  primaryBadge: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
  },
  statItem: {
    marginRight: spacing[6],
  },
});
