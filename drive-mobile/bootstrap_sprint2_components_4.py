import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

components = {
    "src/components/ui/BottomSheet.tsx": """
import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  isVisible: boolean;
  children: React.ReactNode;
  height?: number;
}

export function BottomSheet({ isVisible, children, height = 300 }: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      {isVisible && <View style={styles.backdrop} />}
      <Animated.View style={[styles.sheet, { height }, animatedStyle]}>
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
});
""",
    "src/components/ui/ShareTplCard.tsx": """
import React, { forwardRef } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from './Text';
import { ScoreRing } from './ScoreRing';
import { colors, spacing, borderRadius } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface ShareTplCardProps {
  title: string;
  score: number;
  distance: string;
  duration: string;
  mapImageUrl?: string;
  username: string;
}

export const ShareTplCard = forwardRef<View, ShareTplCardProps>((props, ref) => {
  const { title, score, distance, duration, mapImageUrl, username } = props;

  return (
    <View ref={ref} style={styles.container}>
      <ImageBackground 
        source={mapImageUrl ? { uri: mapImageUrl } : undefined} 
        style={styles.mapBackground}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text variant="h2" color="white">{title}</Text>
            <Text variant="caption" color="white" style={{ opacity: 0.8 }}>by @{username}</Text>
          </View>

          <View style={styles.centerScore}>
            <ScoreRing score={score} size={140} strokeWidth={10} />
          </View>

          <View style={styles.footer}>
            <View style={styles.statBox}>
              <Text variant="label" color="white">DISTANCE</Text>
              <Text variant="h3" color="white">{distance}</Text>
            </View>
            <View style={styles.logoBox}>
              <Feather name="navigation" size={24} color={colors.brand} />
              <Text variant="h3" color="white" style={styles.logoText}>DRIVE</Text>
            </View>
            <View style={styles.statBox}>
              <Text variant="label" color="white">DURATION</Text>
              <Text variant="h3" color="white">{duration}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 1080 / 3, // Instagram story aspect ratio scaled down for preview/render
    height: 1920 / 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
    position: 'absolute',
    left: -10000, // Hide off-screen
  },
  mapBackground: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing[6],
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing[8],
  },
  centerScore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  statBox: {
    alignItems: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
  logoText: {
    marginTop: spacing[2],
    letterSpacing: 2,
  },
});
""",
    "src/components/ui/AnimatedNumber.tsx": """
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { TextInput } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../../theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  format?: (val: number) => string;
  duration?: number;
  variant?: 'h1' | 'h2' | 'h3';
  color?: string;
}

export function AnimatedNumber({ 
  value, 
  format = (v) => Math.round(v).toString(), 
  duration = 1000,
  variant = 'h1',
  color = colors.foreground 
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: format(animatedValue.value),
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={format(value)} // Fallback for initial render
      animatedProps={animatedProps}
      style={[
        styles.base,
        styles[variant],
        { color }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamilies.sans,
    padding: 0,
    margin: 0,
  },
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: 'bold',
  },
  h2: {
    fontSize: fontSizes['2xl'],
    fontWeight: '600',
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: '500',
  },
});
""",
    "src/components/ui/index.ts": """
export * from './Text';
export * from './Button';
export * from './Card';
export * from './Input';
export * from './ScoreRing';
export * from './DriveCard';
export * from './StatTile';
export * from './FloatingRecordButton';
export * from './RouteCard';
export * from './UserCard';
export * from './GarageCard';
export * from './IconBadge';
export * from './MapOverlay';
export * from './AchievementBadge';
export * from './SkeletonLoader';
export * from './TelemetryChart';
export * from './BottomSheet';
export * from './ShareTplCard';
export * from './AnimatedNumber';
"""
}

for name, content in components.items():
    write_file(name, content)
