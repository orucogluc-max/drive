import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, FloatingRecordButton, StatTile } from '../components/ui';
import { colors, spacing } from '../theme';
import { useDriveStore } from '../store/useDriveStore';

export function RecordScreen({ navigation }: any) {
  const { status, telemetryPoints, startTime, startDrive, stopDrive } = useDriveStore();
  
  const currentSpeedMs = telemetryPoints.length > 0 ? telemetryPoints[telemetryPoints.length - 1].speed_ms : 0;
  const speedKmh = Math.round(currentSpeedMs * 3.6);

  // Compute duration
  const durationS = startTime && status === 'RECORDING' ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(durationS / 60).toString().padStart(2, '0');
  const seconds = (durationS % 60).toString().padStart(2, '0');

  const handlePress = () => {
    if (status === 'IDLE' || status === 'COMPLETED') {
      startDrive();
    } else {
      stopDrive();
      navigation.navigate('DriveSummary');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h2" color={status === 'RECORDING' ? 'error' : 'foreground'}>
            {status === 'IDLE' ? 'Ready to Drive' : status}
          </Text>
          <Text variant="caption" color="foregroundMuted">
            {status === 'RECORDING' ? 'GPS Active (Background)' : 'Awaiting Start'}
          </Text>
        </View>

        <View style={styles.mainMetrics}>
          <Text variant="h1" style={styles.speedText}>{speedKmh}</Text>
          <Text variant="h3" color="foregroundMuted">KM/H</Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="POINTS" value={telemetryPoints.length.toString()} />
          <View style={{ width: spacing[4] }} />
          <StatTile label="DURATION" value={`${minutes}:${seconds}`} />
        </View>
      </View>

      <FloatingRecordButton 
        isRecording={status === 'RECORDING' || status === 'STARTING'} 
        onPress={handlePress} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing[4] },
  header: { alignItems: 'center', marginTop: spacing[8] },
  mainMetrics: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  speedText: { fontSize: 96, lineHeight: 100, color: colors.brand },
  statsRow: { flexDirection: 'row', marginBottom: 120 },
});
