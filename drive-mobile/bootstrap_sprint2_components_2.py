import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

components = {
    "src/components/ui/RouteCard.tsx": """
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
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
""",
    "src/components/ui/UserCard.tsx": """
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from './Text';
import { colors, spacing, borderRadius } from '../../theme';

interface UserCardProps {
  name: string;
  username: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export function UserCard({ name, username, avatarUrl, onPress }: UserCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text variant="h3" color="white">{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text variant="body" weight="semibold">{name}</Text>
        <Text variant="caption">@{username}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  avatarContainer: {
    marginRight: spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
});
""",
    "src/components/ui/GarageCard.tsx": """
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
""",
    "src/components/ui/IconBadge.tsx": """
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme';

interface IconBadgeProps {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
  onPress?: () => void;
}

export function IconBadge({ 
  name, 
  size = 20, 
  color = colors.foreground, 
  backgroundColor = colors.backgroundElevated,
  onPress 
}: IconBadgeProps) {
  const containerSize = size * 2;
  
  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[
        styles.container, 
        { width: containerSize, height: containerSize, borderRadius: containerSize / 2, backgroundColor }
      ]}
    >
      <Feather name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
"""
}

for name, content in components.items():
    write_file(name, content)
