import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
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
