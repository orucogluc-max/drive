import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, JourneyCard } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

const PAGE_SIZE = 5;

export function HomeScreen({ navigation }: any) {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = async (pageNumber = 0, isRefresh = false) => {
    try {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('drives')
        .select(`
          *,
          profiles:user_id ( username, display_name, avatar_url ),
          vehicles:vehicle_id ( make, model )
        `)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (data.length < PAGE_SIZE) setHasMore(false);
        if (isRefresh) {
          setFeed(data);
        } else {
          setFeed(prev => [...prev, ...data]);
        }
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchFeed(0, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const handleInteraction = async (driveId: string, type: 'inspired' | 'want_to_drive' | 'wishlist') => {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) return;

    // Optimistic UI Update (Simplified)
    // Real implementation would update state count immediately
    try {
      await supabase.from('journey_interactions').insert({
        user_id: authUser.user.id,
        drive_id: driveId,
        interaction_type: type
      });
    } catch (err) {
      // Catch unique constraint errors if already interacted
      console.error(err);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <JourneyCard
        title={item.title || "Untitled Journey"}
        username={item.profiles?.username || "driver"}
        distance={`${Math.round(item.distance_m / 1000)} km`}
        duration={`${Math.round(item.duration_s / 60)} min`}
        interactions={{ inspired: item.reaction_count || 0, wantToDrive: 0 }}
        comments={item.comment_count || 0}
        onInteract={(type) => handleInteraction(item.id, type)}
        onPress={() => navigation.navigate('JourneyDetail', { journeyId: item.id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="h1" style={{ letterSpacing: -1 }}>Journeys</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={11}
        removeClippedSubviews={true}
        ListFooterComponent={hasMore && feed.length > 0 ? <ActivityIndicator color={colors.brand} style={{ margin: spacing[4] }} /> : null}
        ListEmptyComponent={!loading ? (
           <View style={{ marginTop: spacing[12], alignItems: 'center' }}>
              <Feather name="image" size={48} color={colors.foregroundMuted} />
              <Text variant="body" color="foregroundMuted" style={{ marginTop: spacing[4] }}>No journeys to show yet.</Text>
           </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4], paddingBottom: spacing[2] },
  listContent: { padding: spacing[4], paddingBottom: 100 },
});
