import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface RouteCardProps {
  title: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance: string;
  rating: number;
  imageUrl?: string;
  onPress?: () => void;
}

export function RouteCard({ title, difficulty, distance, rating, imageUrl, onPress }: RouteCardProps) {
  const difficultyColors = {
    easy: colors.success,
    moderate: colors.warning,
    challenging: colors.error,
    expert: '#9d174d' // Dark pink/red
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <ImageBackground 
        source={imageUrl ? { uri: imageUrl } : undefined} 
        style={styles.image}
        imageStyle={{ borderRadius: borderRadius.lg }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: difficultyColors[difficulty] }]}>
              <Text variant="caption" weight="bold" color="white">{difficulty.toUpperCase()}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Feather name="star" size={12} color={colors.warning} />
              <Text variant="caption" weight="bold" style={{ marginLeft: 4 }}>{rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text variant="h3" color="white" style={styles.title}>{title}</Text>
            <View style={styles.distanceRow}>
              <Feather name="map" size={14} color={colors.white} opacity={0.8} />
              <Text variant="caption" color="white" style={styles.distanceText}>{distance}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 180,
    marginRight: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundElevated,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 6 }
    }),
  },
  image: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  footer: {
    marginTop: 'auto',
  },
  title: {
    marginBottom: spacing[1],
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: spacing[2],
    opacity: 0.9,
  },
});
