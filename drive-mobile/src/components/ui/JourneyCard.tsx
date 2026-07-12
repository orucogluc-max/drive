import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface JourneyCardProps {
  title: string;
  username: string;
  photoUrl?: string;
  mapImageUrl?: string;
  distance: string;
  duration: string;
  interactions: {
    inspired: number;
    wantToDrive: number;
  };
  comments: number;
  onPress?: () => void;
  onInteract?: (type: 'inspired' | 'want_to_drive' | 'wishlist') => void;
}

const JourneyCardComponent = ({ title, username, photoUrl, mapImageUrl, distance, duration, interactions, comments, onPress, onInteract }: JourneyCardProps) => {
  const bgSource = photoUrl ? { uri: photoUrl } : mapImageUrl ? { uri: mapImageUrl } : { uri: 'https://images.unsplash.com/photo-1544885834-031e403d15fd?auto=format&fit=crop&w=800&q=80' };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardContainer}>
      {/* Header (User Info) */}
      <View style={styles.headerRow}>
        <View style={styles.avatarPlaceholder} />
        <View style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: 'bold' }}>{username}</Text>
          <Text variant="caption" color="foregroundMuted">Just finished a journey</Text>
        </View>
        <Feather name="more-horizontal" size={20} color={colors.foregroundMuted} />
      </View>

      {/* Main Image Content */}
      <ImageBackground source={bgSource} style={styles.imageBackground} imageStyle={{ borderRadius: spacing[4] }}>
        <View style={styles.imageOverlay}>
          <Text variant="h2" style={{ color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
            {title}
          </Text>
          <View style={styles.statsPill}>
            <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>{distance} • {duration}</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Footer (Social Actions) */}
      <View style={styles.footerRow}>
        <View style={{ flexDirection: 'row' }}>
          {/* Inspired Interaction */}
          <TouchableOpacity style={styles.actionBtn} onPress={() => onInteract?.('inspired')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="zap" size={24} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[1], fontWeight: 'bold' }}>{interactions.inspired}</Text>
          </TouchableOpacity>
          
          {/* Want to Drive Interaction */}
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: spacing[4] }]} onPress={() => onInteract?.('want_to_drive')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="navigation" size={24} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[1], fontWeight: 'bold' }}>{interactions.wantToDrive}</Text>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: spacing[4] }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="message-circle" size={24} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[1], fontWeight: 'bold' }}>{comments}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Wishlist Interaction */}
        <TouchableOpacity onPress={() => onInteract?.('wishlist')} style={styles.wishlistBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="bookmark" size={20} color={colors.foreground} />
          <Text style={{ marginLeft: spacing[2], fontSize: 12, fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Export as a memoized component to prevent unnecessary re-renders in FlatList
export const JourneyCard = memo(JourneyCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.interactions.inspired === nextProps.interactions.inspired &&
    prevProps.interactions.wantToDrive === nextProps.interactions.wantToDrive &&
    prevProps.photoUrl === nextProps.photoUrl
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing[8],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundElevated,
    marginRight: spacing[3],
  },
  imageBackground: {
    width: '100%',
    aspectRatio: 4 / 5, // Instagram Portrait Ratio
    backgroundColor: colors.backgroundCard,
    borderRadius: spacing[4],
    overflow: 'hidden',
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)', // Light gradient/overlay
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  statsPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: spacing[4],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: spacing[4]
  }
});
