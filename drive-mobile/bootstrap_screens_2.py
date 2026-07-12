import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

screens = {
    "src/screens/RecordScreen.tsx": """
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text, FloatingRecordButton, StatTile, colors, spacing } from '../components/ui';
import { useDriveStore } from '../store/useDriveStore';
import * as Location from 'expo-location';

export function RecordScreen({ navigation }: any) {
  const { status, startDrive, stopDrive, addTelemetry } = useDriveStore();
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    let sub: Location.LocationSubscription;
    if (status === 'RECORDING' || status === 'STARTING') {
      (async () => {
        const { status: pStatus } = await Location.requestForegroundPermissionsAsync();
        if (pStatus === 'granted') {
          sub = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1
          }, (loc) => {
            const currentSpeed = (loc.coords.speed || 0) * 3.6; // m/s to km/h
            setSpeed(currentSpeed);
            addTelemetry({ speed_ms: loc.coords.speed || 0, accel_x: 0, accel_y: 0, accel_z: 1 });
          });
        }
      })();
    }
    return () => {
      if (sub) sub.remove();
    };
  }, [status]);

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
          <Text variant="caption" color="foregroundMuted">GPS Signal: Good</Text>
        </View>

        <View style={styles.mainMetrics}>
          <Text variant="h1" style={styles.speedText}>{Math.round(speed)}</Text>
          <Text variant="h3" color="foregroundMuted">KM/H</Text>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="DISTANCE" value="0.0" unit="km" />
          <View style={{ width: spacing[4] }} />
          <StatTile label="DURATION" value="00:00" />
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
""",
    "src/screens/DriveSummaryScreen.tsx": """
import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, ScoreRing, StatTile, TelemetryChart, Button, ShareTplCard, colors, spacing } from '../components/ui';
import { Feather } from '@expo/vector-icons';
import { useDriveStore } from '../store/useDriveStore';
import { calculateDriveScore } from '../utils/scoreEngine';

export function DriveSummaryScreen({ navigation }: any) {
  const { telemetryPoints, resetDrive } = useDriveStore();
  const shareRef = useRef<View>(null);

  // Calculate score based on actual recorded telemetry (if any), else mock
  const scoreData = calculateDriveScore(telemetryPoints.length > 10 ? telemetryPoints : Array(20).fill({ speed_ms: 15, accel_x: 0, accel_y: 0, accel_z: 1 }));
  
  // Generate dummy chart data based on telemetry length to show UI
  const chartData = Array.from({length: 20}, (_, i) => ({ time: i, value: Math.random() * 60 + 40 }));

  const handleDone = () => {
    resetDrive();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Options */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDone}>
            <Feather name="x" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="share" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <Feather name="map" size={48} color={colors.foregroundMuted} />
          <Text variant="caption" style={{ marginTop: spacing[2] }}>Route Polygon</Text>
        </View>

        {/* Score Ring */}
        <View style={styles.scoreContainer}>
          <ScoreRing score={scoreData.overall} size={160} strokeWidth={12} />
          <Text variant="h3" style={{ marginTop: spacing[4] }}>Excellent Drive</Text>
        </View>

        {/* Score Breakdown */}
        <Text variant="h3" style={styles.sectionTitle}>Score Breakdown</Text>
        <View style={styles.breakdownRow}>
          <StatTile label="SMOOTHNESS" value={scoreData.smoothness} />
          <View style={{ width: spacing[3] }} />
          <StatTile label="COMFORT" value={scoreData.comfort} />
          <View style={{ width: spacing[3] }} />
          <StatTile label="CONSISTENCY" value={scoreData.consistency} />
        </View>

        {/* Telemetry Charts */}
        <Text variant="h3" style={[styles.sectionTitle, { marginTop: spacing[6] }]}>Speed Telemetry</Text>
        <View style={styles.chartContainer}>
          <TelemetryChart data={chartData} />
        </View>

        <Button style={{ marginTop: spacing[8] }} onPress={handleDone}>Save & Finish</Button>

      </ScrollView>

      {/* Hidden Share Template for snapshotting */}
      <ShareTplCard 
        ref={shareRef}
        title="Midnight Run"
        score={scoreData.overall}
        distance="32 km"
        duration="45 min"
        username="alexd"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing[4], paddingBottom: spacing[12] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
  mapContainer: { height: 200, backgroundColor: colors.backgroundElevated, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[6] },
  scoreContainer: { alignItems: 'center', marginBottom: spacing[8] },
  sectionTitle: { marginBottom: spacing[4] },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chartContainer: { backgroundColor: colors.backgroundCard, padding: spacing[4], borderRadius: 16, borderWidth: 1, borderColor: colors.border },
});
"""
}

for name, content in screens.items():
    write_file(name, content)
