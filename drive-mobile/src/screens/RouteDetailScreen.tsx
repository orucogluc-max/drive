import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, StatTile } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

export function RouteDetailScreen({ route: routeParams, navigation }: any) {
  const { routeId } = routeParams.params;
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadRouteDetails() {
      const { data } = await supabase.from('routes').select('*').eq('id', routeId).single();
      setRoute(data);

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const { count } = await supabase.from('saved_routes').select('*', { count: 'exact' })
          .eq('user_id', authUser.user.id)
          .eq('route_id', routeId);
        setIsSaved(count ? count > 0 : false);
      }
      setLoading(false);
    }
    loadRouteDetails();
  }, [routeId]);

  const toggleSave = async () => {
    setIsSaved(!isSaved);
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) return;
    
    if (isSaved) {
      await supabase.from('saved_routes').delete().eq('user_id', authUser.user.id).eq('route_id', routeId);
    } else {
      await supabase.from('saved_routes').insert({ user_id: authUser.user.id, route_id: routeId });
    }
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.brand} /></SafeAreaView>;
  if (!route) return <SafeAreaView style={styles.center}><Text>Route not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[24] }}>
        
        {/* Placeholder for Route Header Image / Map Snapshot */}
        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Feather name="map" size={48} color={colors.foregroundMuted} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text variant="h1" style={{ flex: 1 }}>{route.name}</Text>
            <TouchableOpacity onPress={toggleSave}>
              <Feather name="bookmark" size={28} color={isSaved ? colors.brand : colors.foreground} />
            </TouchableOpacity>
          </View>
          
          <Text variant="body" color="foregroundMuted" style={{ marginTop: spacing[2] }}>
            {route.road_type.toUpperCase()} • {route.difficulty.toUpperCase()} • ★ {route.avg_rating?.toFixed(1) || 0}
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatTile label="DISTANCE" value={`${Math.round(route.distance_m / 1000)}`} unit="km" />
            <View style={{ width: spacing[4] }} />
            <StatTile label="ELEVATION" value={`${route.elevation_gain_m || 0}`} unit="m" />
            <View style={{ width: spacing[4] }} />
            <StatTile label="DRIVES" value={route.drive_count || 0} />
          </View>

          <Text variant="h3" style={styles.sectionTitle}>Description</Text>
          <Text style={{ lineHeight: 22 }}>
            {route.description || "A beautiful driving route waiting to be explored. Perfect for weekend runs and testing your vehicle's handling."}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.floatingActionBar}>
        <Button style={{ flex: 1 }} onPress={() => navigation.navigate('MainTabs', { screen: 'Record', params: { routeId: route.id } })}>
          Drive This Route
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  mapHeader: { height: 250, backgroundColor: colors.backgroundElevated, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: spacing[4], left: spacing[4], zIndex: 10, padding: spacing[2], backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  content: { padding: spacing[4] },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', marginVertical: spacing[6] },
  sectionTitle: { marginBottom: spacing[3] },
  floatingActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing[4], backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
});
