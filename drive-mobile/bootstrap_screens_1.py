import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

screens = {
    "src/screens/HomeScreen.tsx": """
import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, DriveCard, StatTile, UserCard, colors, spacing } from '../components/ui';

export function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1">Dashboard</Text>
          <UserCard 
            name="Alex Driver" 
            username="alexd" 
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Hero Card - Recent Drive */}
        <Text variant="h3" style={styles.sectionTitle}>Latest Drive</Text>
        <DriveCard
          title="Pacific Coast Highway"
          date="Today, 08:30 AM"
          score={92}
          distance="45 km"
          duration="42 min"
          onPress={() => navigation.navigate('DriveSummary')}
        />

        {/* Weekly Stats Strip */}
        <Text variant="h3" style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsRow}>
          <StatTile label="DISTANCE" value="128" unit="km" icon="map" />
          <View style={{ width: spacing[4] }} />
          <StatTile label="AVG SCORE" value="88" icon="activity" />
        </View>
        <View style={[styles.statsRow, { marginTop: spacing[4] }]}>
          <StatTile label="DRIVES" value="4" icon="navigation" />
          <View style={{ width: spacing[4] }} />
          <StatTile label="TIME" value="2.5" unit="h" icon="clock" />
        </View>

        {/* Community Feed */}
        <Text variant="h3" style={[styles.sectionTitle, { marginTop: spacing[6] }]}>Friends Activity</Text>
        <DriveCard
          title="Morning Canyon Run"
          date="Yesterday"
          score={85}
          distance="22 km"
          duration="25 min"
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing[4],
    paddingBottom: 100, // For bottom tab & floating button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
    marginTop: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[4],
    color: colors.foreground,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
""",
    "src/screens/ExploreScreen.tsx": """
import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Text, RouteCard, Input, colors, spacing } from '../components/ui';

export function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text variant="h1">Explore</Text>
          <Text variant="body" color="foregroundMuted" style={{ marginTop: 8 }}>
            Discover the best driving roads near you.
          </Text>
        </View>

        <Input placeholder="Search routes, cities..." style={{ marginBottom: spacing[6] }} />

        {/* Curated Categories */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Coastal Drives</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
            <RouteCard
              title="Ocean View Route"
              difficulty="moderate"
              distance="32 km"
              rating={4.8}
              imageUrl="https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=600&h=400&fit=crop"
            />
            <RouteCard
              title="Cliffside Run"
              difficulty="challenging"
              distance="18 km"
              rating={4.5}
            />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Mountain Touge</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
            <RouteCard
              title="Snake Pass"
              difficulty="expert"
              distance="12 km"
              rating={4.9}
              imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop"
            />
            <RouteCard
              title="Valley Loop"
              difficulty="moderate"
              distance="45 km"
              rating={4.2}
            />
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
    marginTop: spacing[4],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  scrollRow: {
    paddingRight: spacing[4],
  },
});
"""
}

for name, content in screens.items():
    write_file(name, content)
