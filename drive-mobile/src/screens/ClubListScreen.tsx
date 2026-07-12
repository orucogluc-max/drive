import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Input } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

export function ClubListScreen({ navigation }: any) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClubs() {
      const { data } = await supabase.from('clubs').select('*').eq('is_public', true).order('member_count', { ascending: false });
      if (data) setClubs(data);
      setLoading(false);
    }
    loadClubs();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.clubCard} onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}>
      <View style={styles.avatarPlaceholder} />
      <View style={{ flex: 1, marginLeft: spacing[4] }}>
        <Text variant="h3">{item.name}</Text>
        <Text variant="caption" color="foregroundMuted">{item.region || 'Global'} • {item.member_count} Members</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.foregroundMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="h1">Communities</Text>
      </View>
      <Input placeholder="Search clubs by name or region..." style={{ marginHorizontal: spacing[4], marginBottom: spacing[4] }} />
      
      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: spacing[12] }} />
      ) : (
        <FlatList
          data={clubs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing[4] },
  listContent: { paddingHorizontal: spacing[4], paddingBottom: spacing[12] },
  clubCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundElevated, padding: spacing[4], borderRadius: 12, marginBottom: spacing[3] },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundCard },
});
