import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { colors, spacing, borderRadius } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface DriveCardProps {
  title: string;
  date: string;
  score: number;
  distance: string;
  duration: string;
  onPress?: () => void;
  style?: any;
}

export function DriveCard({ title, date, score, distance, duration, onPress, style }: DriveCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={style}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text variant="h3">{title}</Text>
            <Text variant="caption">{date}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text variant="h2" color="brand">{score}</Text>
            <Text variant="caption">Score</Text>
          </View>
        </View>
        
        <View style={styles.mapPlaceholder}>
          <Feather name="map" size={24} color={colors.foregroundMuted} />
          <Text variant="caption" style={{ marginTop: 8 }}>Route Map Preview</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="navigation" size={16} color={colors.foregroundMuted} />
            <Text variant="body" style={styles.statText}>{distance}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="clock" size={16} color={colors.foregroundMuted} />
            <Text variant="body" style={styles.statText}>{duration}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing[4],
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing[4],
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing[6],
  },
  statText: {
    marginLeft: spacing[2],
  },
});
