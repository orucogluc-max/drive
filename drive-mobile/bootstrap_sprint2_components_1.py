import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

components = {
    "src/components/ui/ScoreRing.tsx": """
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, interpolateColor } from 'react-native-reanimated';
import { colors, fontFamilies, fontSizes } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    const strokeColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [colors.error, colors.warning, colors.success]
    );

    return {
      strokeDashoffset,
      stroke: strokeColor as string,
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            stroke={colors.border}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.centerText]}>
        <SvgText
          x="50%"
          y="50%"
          textAnchor="middle"
          alignmentBaseline="central"
          fill={colors.foreground}
          fontSize={fontSizes['3xl']}
          fontWeight="bold"
          fontFamily={fontFamilies.sans}
        >
          {Math.round(score)}
        </SvgText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
""",
    "src/components/ui/DriveCard.tsx": """
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
}

export function DriveCard({ title, date, score, distance, duration, onPress }: DriveCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
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
""",
    "src/components/ui/StatTile.tsx": """
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
""",
    "src/components/ui/FloatingRecordButton.tsx": """
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue, useEffect } from 'react-native-reanimated';
import { colors, shadows } from '../../theme';
import { Feather } from '@expo/vector-icons';

interface Props {
  isRecording: boolean;
  onPress: () => void;
}

export function FloatingRecordButton({ isRecording, onPress }: Props) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={[styles.button, isRecording ? styles.recording : styles.idle]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Feather name={isRecording ? 'square' : 'play'} size={32} color={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    ...shadows.lg,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idle: {
    backgroundColor: colors.brand,
  },
  recording: {
    backgroundColor: colors.error,
  },
});
"""
}

for name, content in components.items():
    write_file(name, content)
