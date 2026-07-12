import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Button } from '../components/ui';
import { colors, spacing } from '../theme';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export function JourneyDetailScreen({ route, navigation }: any) {
  const { journeyId } = route.params;
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    async function fetchJourney() {
      // Mock fetch, but using real structure
      const { data, error } = await supabase
        .from('drives')
        .select(`
          *,
          profiles:user_id ( username, display_name, avatar_url ),
          vehicles:vehicle_id ( make, model, year ),
          drive_media ( photo_url, caption, sort_order )
        `)
        .eq('id', journeyId)
        .single();
      
      if (data) {
        setJourney(data);
      } else {
        // Fallback for UI building if no data found
        setJourney({
          title: 'Midnight Run Through the Canyons',
          description: 'A spontaneous drive to clear the mind. The roads were completely empty.',
          favorite_moment: 'Hitting the apex on turn 14 with the windows down, hearing the exhaust echo off the canyon walls.',
          advice: 'Go after 11 PM to avoid traffic. Watch out for debris near mile marker 4.',
          tags: ['night_drive', 'canyon', 'spirited'],
          road_type: 'mountain',
          distance_m: 45000,
          duration_s: 3600,
          score_overall: 94,
          reaction_count: 142,
          profiles: { username: 'alex_gti', display_name: 'Alex' },
          vehicles: { make: 'Porsche', model: '911 Carrera S', year: 2022 },
          drive_media: [
             { photo_url: 'https://images.unsplash.com/photo-1503376713208-8e62243e8d9b?w=1080' },
             { photo_url: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1080' }
          ]
        });
      }
      setLoading(false);
    }
    fetchJourney();
  }, [journeyId]);

  if (loading || !journey) {
    return <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={colors.brand} /></SafeAreaView>;
  }

  const media = journey.drive_media && journey.drive_media.length > 0 
    ? journey.drive_media 
    : [{ photo_url: 'https://images.unsplash.com/photo-1544885834-031e403d15fd?w=1080' }];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Full Screen Image Gallery / Hero */}
        <View style={styles.heroContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
               const slide = Math.round(e.nativeEvent.contentOffset.x / width);
               setActivePhotoIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {media.map((img: any, idx: number) => (
               <Image key={idx} source={{ uri: img.photo_url }} style={styles.heroImage} />
            ))}
          </ScrollView>
          
          {/* Header Controls */}
          <View style={styles.headerAbsolute}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bookmark" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Dots */}
          {media.length > 1 && (
             <View style={styles.dotsContainer}>
                {media.map((_: any, idx: number) => (
                   <View key={idx} style={[styles.dot, activePhotoIndex === idx && styles.dotActive]} />
                ))}
             </View>
          )}
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
           
           {/* Title & Author */}
           <View style={{ marginBottom: spacing[6] }}>
              <Text variant="h1" style={{ marginBottom: spacing[4] }}>{journey.title || 'Untitled Journey'}</Text>
              
              <View style={styles.authorRow}>
                 <View style={styles.avatar} />
                 <View>
                    <Text variant="body" style={{ fontWeight: 'bold' }}>{journey.profiles?.display_name || journey.profiles?.username}</Text>
                    <Text variant="caption" color="foregroundMuted">@{journey.profiles?.username} • 2 hours ago</Text>
                 </View>
                 <Button style={[styles.followBtn, { marginLeft: 'auto' }]}><Text color="background" style={{ fontSize: 12, fontWeight: 'bold' }}>Follow</Text></Button>
              </View>
           </View>

           {/* Quick Stats Grid */}
           <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                 <Feather name="navigation" size={20} color={colors.foregroundMuted} />
                 <Text variant="h3" style={{ marginTop: spacing[2] }}>{Math.round((journey.distance_m || 0) / 1000)} km</Text>
                 <Text variant="caption" color="foregroundMuted">Distance</Text>
              </View>
              <View style={styles.statBox}>
                 <Feather name="clock" size={20} color={colors.foregroundMuted} />
                 <Text variant="h3" style={{ marginTop: spacing[2] }}>{Math.round((journey.duration_s || 0) / 60)} m</Text>
                 <Text variant="caption" color="foregroundMuted">Duration</Text>
              </View>
              <View style={styles.statBox}>
                 <Feather name="award" size={20} color={colors.foregroundMuted} />
                 <Text variant="h3" style={{ marginTop: spacing[2], color: colors.brand }}>{journey.score_overall || 0}</Text>
                 <Text variant="caption" color="foregroundMuted">Drive Score</Text>
              </View>
           </View>

           {/* Vehicle Info */}
           {journey.vehicles && (
             <View style={styles.vehicleBox}>
                <Feather name="cpu" size={24} color={colors.foreground} />
                <View style={{ marginLeft: spacing[4] }}>
                   <Text variant="body" style={{ fontWeight: 'bold' }}>Driven with</Text>
                   <Text variant="caption" color="foregroundMuted">{journey.vehicles.year} {journey.vehicles.make} {journey.vehicles.model}</Text>
                </View>
             </View>
           )}

           {/* Story / Description */}
           {journey.description && (
              <View style={styles.section}>
                 <Text variant="body" style={{ lineHeight: 24, fontSize: 16 }}>{journey.description}</Text>
              </View>
           )}

           {/* Favorite Moment */}
           {journey.favorite_moment && (
              <View style={styles.quoteBox}>
                 <Feather name="star" size={20} color={colors.brand} />
                 <Text variant="h3" style={{ marginTop: spacing[3], fontStyle: 'italic' }}>"{journey.favorite_moment}"</Text>
                 <Text variant="caption" color="foregroundMuted" style={{ marginTop: spacing[2] }}>— FAVORITE MOMENT</Text>
              </View>
           )}

           {/* Advice */}
           {journey.advice && (
              <View style={styles.section}>
                 <Text variant="h3" style={{ marginBottom: spacing[2] }}>Creator's Advice</Text>
                 <Text variant="body" color="foregroundMuted" style={{ lineHeight: 22 }}>{journey.advice}</Text>
              </View>
           )}

           {/* Tags */}
           {journey.tags && journey.tags.length > 0 && (
              <View style={styles.tagsRow}>
                 {journey.tags.map((tag: string) => (
                    <View key={tag} style={styles.tagBadge}>
                       <Text style={{ color: colors.foreground, fontSize: 12 }}>#{tag}</Text>
                    </View>
                 ))}
                 {journey.road_type && (
                    <View style={styles.tagBadge}>
                       <Text style={{ color: colors.foreground, fontSize: 12 }}>🗺️ {journey.road_type}</Text>
                    </View>
                 )}
              </View>
           )}

           {/* Map Preview (Placeholder) */}
           <View style={styles.mapPreview}>
              <View style={styles.mapPlaceholder}>
                 <Feather name="map" size={48} color={colors.foregroundMuted} />
                 <Text style={{ marginTop: spacing[2], color: colors.foregroundMuted }}>Interactive Route Map</Text>
              </View>
           </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
         <TouchableOpacity style={styles.actionBtn}>
            <Feather name="zap" size={24} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[2], fontWeight: 'bold' }}>{journey.reaction_count || 0}</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.actionBtn}>
            <Feather name="message-circle" size={24} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[2], fontWeight: 'bold' }}>12</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto', backgroundColor: colors.backgroundElevated, paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: 20 }]}>
            <Feather name="navigation" size={20} color={colors.foreground} />
            <Text style={{ marginLeft: spacing[2], fontWeight: 'bold' }}>Drive This Route</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 100 },
  heroContainer: { width: '100%', aspectRatio: 4/5, backgroundColor: colors.backgroundCard },
  heroImage: { width: width, height: '100%', resizeMode: 'cover' },
  headerAbsolute: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing[4] },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dotsContainer: { position: 'absolute', bottom: spacing[4], left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  contentBody: { padding: spacing[4], paddingTop: spacing[6] },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundElevated, marginRight: spacing[3] },
  followBtn: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[8] },
  statBox: { flex: 1, backgroundColor: colors.backgroundElevated, padding: spacing[4], borderRadius: 16, marginRight: spacing[2] },
  vehicleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCard, padding: spacing[4], borderRadius: 16, marginBottom: spacing[6], borderWidth: 1, borderColor: colors.border },
  section: { marginBottom: spacing[8] },
  quoteBox: { backgroundColor: 'rgba(0, 255, 102, 0.05)', padding: spacing[6], borderRadius: 16, borderLeftWidth: 4, borderLeftColor: colors.brand, marginBottom: spacing[8] },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing[8] },
  tagBadge: { backgroundColor: colors.backgroundElevated, paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 16, marginRight: spacing[2], marginBottom: spacing[2] },
  mapPreview: { width: '100%', aspectRatio: 1, backgroundColor: colors.backgroundCard, borderRadius: 24, overflow: 'hidden', marginBottom: spacing[8] },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', padding: spacing[4], paddingBottom: spacing[8], borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: spacing[6] }
});
