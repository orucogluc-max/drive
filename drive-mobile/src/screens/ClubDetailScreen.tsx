import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

export function ClubDetailScreen({ route, navigation }: any) {
  const { clubId } = route.params;
  const [club, setClub] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: cData } = await supabase.from('clubs').select('*').eq('id', clubId).single();
      if (cData) setClub(cData);

      const { data: eData } = await supabase.from('club_events').select('*').eq('club_id', clubId).order('event_date', { ascending: true });
      if (eData) setEvents(eData);

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        const { count } = await supabase.from('club_members').select('*', { count: 'exact' }).eq('club_id', clubId).eq('user_id', authUser.user.id);
        setIsMember(count ? count > 0 : false);
      }
      setLoading(false);
    }
    loadData();
  }, [clubId]);

  const toggleMembership = async () => {
    setIsMember(!isMember);
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) return;
    
    if (isMember) {
      await supabase.from('club_members').delete().eq('club_id', clubId).eq('user_id', authUser.user.id);
    } else {
      await supabase.from('club_members').insert({ club_id: clubId, user_id: authUser.user.id });
    }
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.brand} /></SafeAreaView>;
  if (!club) return <SafeAreaView style={styles.center}><Text>Club not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color={colors.foreground} /></TouchableOpacity>
        </View>

        <View style={styles.clubHeader}>
          <View style={styles.avatarLarge} />
          <Text variant="h1" style={{ marginTop: spacing[4] }}>{club.name}</Text>
          <Text variant="body" color="foregroundMuted" style={{ marginVertical: spacing[2] }}>{club.region || 'Global'} • {club.member_count} Members</Text>
          <Text style={{ textAlign: 'center', marginBottom: spacing[6] }}>{club.description || 'A community of passionate drivers.'}</Text>
          
          <Button onPress={toggleMembership} style={{ backgroundColor: isMember ? colors.backgroundElevated : colors.brand, width: '100%' }}>
            <Text color={isMember ? 'foreground' : 'background'}>{isMember ? 'Leave Club' : 'Join Club'}</Text>
          </Button>
        </View>

        <Text variant="h3" style={styles.sectionTitle}>Upcoming Events</Text>
        {events.length === 0 ? (
          <Text color="foregroundMuted" style={{ textAlign: 'center', marginTop: spacing[4] }}>No upcoming events.</Text>
        ) : (
          events.map(ev => (
            <View key={ev.id} style={styles.eventCard}>
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: 'bold' }}>{ev.title}</Text>
                <Text variant="caption" color="brand" style={{ marginTop: spacing[1] }}>{new Date(ev.event_date).toLocaleString()}</Text>
                <Text variant="caption" color="foregroundMuted" style={{ marginTop: spacing[1] }}>📍 {ev.meeting_address || 'TBD'}</Text>
              </View>
              <Button style={{ paddingHorizontal: spacing[3], paddingVertical: spacing[2] }} onPress={() => navigation.navigate('DriveSummary')}>Join</Button>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: spacing[4] },
  headerRow: { marginBottom: spacing[4] },
  clubHeader: { alignItems: 'center', marginBottom: spacing[8] },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.backgroundElevated },
  sectionTitle: { marginBottom: spacing[4] },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, padding: spacing[4], borderRadius: 12, marginBottom: spacing[3] },
});
