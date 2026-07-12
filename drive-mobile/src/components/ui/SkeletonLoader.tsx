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
