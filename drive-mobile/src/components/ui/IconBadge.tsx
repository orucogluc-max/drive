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
