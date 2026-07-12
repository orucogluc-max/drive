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
  // Optional static stroke color (e.g. a Journey theme's accent color).
  // When provided, overrides the default error/warning/success score
  // interpolation — lets ShareTplCard tint the ring to match the active
  // theme instead of always showing a generic health-style gradient.
  brandColor?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, brandColor }: ScoreRingProps) {
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
    const interpolatedColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [colors.error, colors.warning, colors.success]
    );

    return {
      strokeDashoffset,
      stroke: brandColor ?? (interpolatedColor as string),
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
