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
