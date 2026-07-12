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
