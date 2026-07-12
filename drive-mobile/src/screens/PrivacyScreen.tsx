import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from '../components/ui';
import { colors, spacing } from '../theme';
import { Feather } from '@expo/vector-icons';

export function PrivacyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        </View>

        <Text variant="h1" style={{ marginBottom: spacing[6] }}>Privacy Policy</Text>

        <View style={styles.alertBox}>
          <Feather name="shield" size={24} color={colors.success} style={{ marginRight: spacing[3] }} />
          <View style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: 'bold' }}>Zero AI Data Sharing</Text>
            <Text variant="caption" style={{ marginTop: spacing[1] }}>
              DRIVE does not send your driving data to third-party AI providers. All intelligence, coaching, and analysis are calculated locally on your device or securely within our own isolated database using deterministic algorithms.
            </Text>
          </View>
        </View>

        <Text variant="h3" style={styles.sectionTitle}>1. Data Collection</Text>
        <Text style={styles.paragraph}>
          We collect telemetry data such as GPS coordinates, speed, and device sensor data during your active drives. This data is required to provide the core functionality of DRIVE.
        </Text>

        <Text variant="h3" style={styles.sectionTitle}>2. Data Storage</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely in our cloud infrastructure (Supabase). We do not sell your personal data or your driving telemetry to insurance companies, data brokers, or advertisers.
        </Text>

        <Text variant="h3" style={styles.sectionTitle}>3. Location Services</Text>
        <Text style={styles.paragraph}>
          Background location is only accessed when you start a recording. We use your location to calculate routes, distance, and performance metrics. You can stop the recording at any time to halt location tracking.
        </Text>
        
        <Text variant="h3" style={styles.sectionTitle}>4. Open Source & Zero Cost</Text>
        <Text style={styles.paragraph}>
          DRIVE is built to be independent. We do not rely on paid external APIs for core functions, ensuring your experience remains private, uninterrupted, and free from hidden tracking.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing[4], paddingBottom: spacing[12] },
  headerRow: { marginBottom: spacing[4] },
  sectionTitle: { marginTop: spacing[6], marginBottom: spacing[2] },
  paragraph: { lineHeight: 22, color: colors.foregroundMuted },
  alertBox: { flexDirection: 'row', backgroundColor: colors.backgroundElevated, padding: spacing[4], borderRadius: 12, marginBottom: spacing[4], alignItems: 'center' }
});
