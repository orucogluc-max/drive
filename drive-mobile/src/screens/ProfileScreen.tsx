import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text, Button } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

type TabType = 'Journeys' | 'Collections' | 'Garage' | 'Badges';

export function ProfileScreen({ route, navigation }: any) {
  const profileId = route?.params?.userId; // If null, viewing own profile
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isMe, setIsMe] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Journeys');
  const [tabData, setTabData] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const { data: authUser } = await supabase.auth.getUser();
      const targetId = profileId || authUser.user?.id;
      if (!targetId) return;

      setIsMe(targetId === authUser.user?.id);

      const { data } = await supabase.from('profiles').select('*').eq('id', targetId).single();
      if (data) setProfile(data);

      if (!isMe && authUser.user?.id) {
        const { count } = await supabase.from('follows').select('*', { count: 'exact' })
          .eq('follower_id', authUser.user.id)
          .eq('following_id', targetId);
        setIsFollowing(count ? count > 0 : false);
      }
      
      setLoading(false);
      loadTabData(targetId, 'Journeys');
    }
    loadProfile();
  }, [profileId]);

  const loadTabData = async (userId: string, tab: TabType) => {
    setActiveTab(tab);
    setTabData([]);
    if (tab === 'Garage') {
      const { data } = await supabase.from('vehicles').select('*').eq('owner_id', userId);
      setTabData(data || []);
    } else if (tab === 'Badges') {
      const { data } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId);
      setTabData(data || []);
    } else if (tab === 'Journeys') {
      const { data } = await supabase.from('drives').select('*').eq('user_id', userId).eq('status', 'completed').order('started_at', { ascending: false }).limit(10);
      setTabData(data || []);
    } else if (tab === 'Collections') {
      const { data } = await supabase.from('collections').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setTabData(data || []);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator color={colors.brand} /></SafeAreaView>;
  }

  if (!profile) {
    return <SafeAreaView style={styles.center}><Text>Profile not found</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header - Creator Style */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.avatar_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80' }} style={styles.avatarLarge} />
          <View style={styles.socialStats}>
             <View style={styles.statBox}>
                <Text variant="h3">{profile.total_drives || 0}</Text>
                <Text variant="caption" color="foregroundMuted">Journeys</Text>
             </View>
             <View style={styles.statBox}>
                <Text variant="h3">1.2k</Text>
                <Text variant="caption" color="foregroundMuted">Followers</Text>
             </View>
             <View style={styles.statBox}>
                <Text variant="h3">450</Text>
                <Text variant="caption" color="foregroundMuted">Following</Text>
             </View>
          </View>
        </View>

        <View style={styles.bioSection}>
           <Text variant="h3">{profile.display_name}</Text>
           <Text variant="caption" color="foregroundMuted" style={{ marginBottom: spacing[2] }}>@{profile.username}</Text>
           <Text variant="body">{profile.bio || "Driven by the journey, not the destination. 🛣️"}</Text>
        </View>

        {/* Action Button */}
        <View style={{ marginTop: spacing[4], marginBottom: spacing[6] }}>
          {!isMe ? (
            <Button onPress={() => {}} style={{ backgroundColor: isFollowing ? colors.backgroundElevated : colors.brand }}>
              <Text color={isFollowing ? 'foreground' : 'background'}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </Button>
          ) : (
            <TouchableOpacity style={styles.editBtn}>
               <Text variant="body" style={{ fontWeight: 'bold' }}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['Journeys', 'Collections', 'Garage', 'Badges'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => loadTabData(profile.id, tab as TabType)} style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Text color={activeTab === tab ? 'foreground' : 'foregroundMuted'} style={{ fontWeight: activeTab === tab ? 'bold' : 'normal' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Journeys' && (
             <View style={styles.grid}>
                {tabData.map((d: any, idx) => (
                   <View key={d.id} style={styles.gridItem}>
                      <Image source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + idx}?auto=format&fit=crop&w=400&q=80` }} style={{ flex: 1 }} />
                   </View>
                ))}
             </View>
          )}

          {activeTab === 'Collections' && (
             <View style={styles.collectionsGrid}>
                {isMe && (
                   <TouchableOpacity style={styles.newCollectionBtn}>
                      <Feather name="plus" size={32} color={colors.foreground} />
                      <Text style={{ marginTop: spacing[2], fontWeight: 'bold' }}>New Collection</Text>
                   </TouchableOpacity>
                )}
                {tabData.map((c: any, idx) => (
                   <TouchableOpacity key={c.id} style={styles.collectionItem}>
                      <Image source={{ uri: c.cover_image_url || `https://images.unsplash.com/photo-${1502877338593 + idx}?auto=format&fit=crop&w=400&q=80` }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                      <View style={styles.collectionOverlay}>
                         <Text variant="h3" style={{ color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>{c.title}</Text>
                      </View>
                   </TouchableOpacity>
                ))}
             </View>
          )}

          {activeTab === 'Garage' && tabData.map((v: any) => (
            <View key={v.id} style={styles.listItem}>
              <Text variant="body" style={{ fontWeight: 'bold' }}>{v.make} {v.model}</Text>
              <Text variant="caption" color="foregroundMuted">{v.year} • {v.horsepower} HP</Text>
            </View>
          ))}

          {activeTab === 'Badges' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {tabData.map((b: any) => (
                <View key={b.badge_id} style={styles.badgeItem}>
                  <Text style={{ fontSize: 32 }}>{b.badges?.icon_url}</Text>
                  <Text variant="caption" style={{ marginTop: spacing[1], textAlign: 'center' }}>{b.badges?.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  container: { paddingBottom: spacing[12] },
  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], marginTop: spacing[4] },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.backgroundElevated, borderWidth: 2, borderColor: colors.brand },
  socialStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', marginLeft: spacing[4] },
  statBox: { alignItems: 'center' },
  bioSection: { paddingHorizontal: spacing[4], marginTop: spacing[4] },
  editBtn: { backgroundColor: colors.backgroundElevated, paddingVertical: spacing[3], borderRadius: 8, alignItems: 'center', marginHorizontal: spacing[4] },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing[4], alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.foreground },
  tabContent: { minHeight: 400 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '33.33%', aspectRatio: 1, borderWidth: 1, borderColor: colors.background },
  collectionsGrid: { padding: spacing[4], gap: spacing[4] },
  collectionItem: { width: '100%', height: 160, borderRadius: 12, backgroundColor: colors.backgroundElevated },
  collectionOverlay: { position: 'absolute', bottom: 0, left: 0, width: '100%', padding: spacing[4], backgroundColor: 'rgba(0,0,0,0.3)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  newCollectionBtn: { width: '100%', height: 160, borderRadius: 12, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[4] },
  listItem: { padding: spacing[4], backgroundColor: colors.backgroundCard, borderRadius: 8, marginHorizontal: spacing[4], marginTop: spacing[3] },
  badgeItem: { width: '30%', alignItems: 'center', margin: '1.5%', padding: spacing[3], backgroundColor: colors.backgroundElevated, borderRadius: 12 },
});
