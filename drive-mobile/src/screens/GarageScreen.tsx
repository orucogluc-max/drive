import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function GarageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>FLEET</Text>
      <Text style={styles.title}>Garage</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
});
