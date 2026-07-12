import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

components = {
    "src/components/ui/MapOverlay.tsx": """
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function MapOverlay() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.2, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
""",
    "src/components/ui/AchievementBadge.tsx": """
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
""",
    "src/components/ui/SkeletonLoader.tsx": """
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme';

interface SkeletonLoaderProps {
  style?: ViewStyle;
}

export function SkeletonLoader({ style }: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.base, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
  },
});
""",
    "src/components/ui/TelemetryChart.tsx": """
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { colors, fontFamilies, fontSizes } from '../../theme';

interface TelemetryPoint {
  time: number;
  value: number;
}

interface TelemetryChartProps {
  data: TelemetryPoint[];
  color?: string;
  height?: number;
}

export function TelemetryChart({ data, color = colors.brand, height = 150 }: TelemetryChartProps) {
  if (!data || data.length === 0) {
    return <View style={[{ height }, styles.empty]} />;
  }

  return (
    <View style={{ height }}>
      <CartesianChart
        data={data}
        xKey="time"
        yKeys={["value"]}
        domainPadding={{ top: 20, bottom: 20 }}
      >
        {({ points }) => (
          <Line
            points={points.value}
            color={color}
            strokeWidth={3}
            animate={{ type: 'timing', duration: 1000 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 8,
  },
});
"""
}

for name, content in components.items():
    write_file(name, content)
