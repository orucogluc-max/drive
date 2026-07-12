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
