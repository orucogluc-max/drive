import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { Text } from '../components/ui';
import { colors, spacing } from '../theme';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export function ExploreScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'Discovery' | 'Creators'>('Discovery');
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDiscovery() {
      // Deterministic recommendation queries (Zero AI)
      // 1. Trending (Highest interactions + quality score in last 7 days)
      // 2. Hidden Gems (High quality score, low interactions)
      // 3. Coastal Roads (Road type = coastal)
      // 4. Night Drives (Tag = night_drive)

      // Mocking DB response for UI but simulating the logic
      setTimeout(() => {
        setCollections([
          { id: '1', title: 'Trending Journeys', subtitle: 'Highest rated this week', type: 'dynamic', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80', count: 120 },
          { id: '2', title: 'Hidden Gems', subtitle: 'High quality, undiscovered', type: 'dynamic', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', count: 45 },
          { id: '3', title: 'Coastal Roads', subtitle: 'Ocean views', type: 'road_type', image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=800&q=80', count: 82 },
          { id: '4', title: 'Midnight Runs', subtitle: 'Empty roads', type: 'tag', image: 'https://images.unsplash.com/photo-1503376713208-8e62243e8d9b?auto=format&fit=crop&w=800&q=80', count: 56 },
          { id: '5', title: 'Coffee Stops', subtitle: 'Weekend vibes', type: 'purpose', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80', count: 32 },
        ]);
        setLoading(false);
      }, 500);
    }
    fetchDiscovery();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1" style={{ letterSpacing: -1 }}>Discovery</Text>
        <TouchableOpacity>
          <Feather name="search" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setActiveTab('Discovery')}>
          <Text variant="h3" style={{ color: activeTab === 'Discovery' ? colors.foreground : colors.foregroundMuted }}>Journeys</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Creators')} style={{ marginLeft: spacing[6] }}>
          <Text variant="h3" style={{ color: activeTab === 'Creators' ? colors.foreground : colors.foregroundMuted }}>Creators</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'Discovery' && loading && (
           <ActivityIndicator color={colors.brand} style={{ marginTop: spacing[12] }} />
        )}

        {activeTab === 'Discovery' && !loading && (
          <View style={styles.grid}>
            {collections.map(col => (
              <TouchableOpacity key={col.id} style={styles.gridItem} activeOpacity={0.9}>
                <ImageBackground source={{ uri: col.image }} style={styles.imageBg} imageStyle={{ borderRadius: 16 }}>
                  <View style={styles.overlay}>
                    <View style={styles.badge}>
                      <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>{col.count} JOURNEYS</Text>
                    </View>
                    <View>
                       <Text variant="h2" style={{ color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                         {col.title}
                       </Text>
                       <Text variant="caption" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: 'bold' }}>
                         {col.subtitle.toUpperCase()}
                       </Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'Creators' && (
           <View style={{ alignItems: 'center', marginTop: spacing[12] }}>
              <Feather name="users" size={48} color={colors.foregroundMuted} />
              <Text variant="body" color="foregroundMuted" style={{ marginTop: spacing[4], textAlign: 'center' }}>
                 Discover top automotive creators and follow their journeys.
              </Text>
           </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], paddingTop: spacing[6] },
  tabsRow: { flexDirection: 'row', paddingHorizontal: spacing[4], marginBottom: spacing[6] },
  container: { paddingHorizontal: spacing[4], paddingBottom: spacing[12] },
  grid: { gap: spacing[4] },
  gridItem: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, overflow: 'hidden' },
  imageBg: { flex: 1, backgroundColor: colors.backgroundCard },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: spacing[4], justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 12 },
});
