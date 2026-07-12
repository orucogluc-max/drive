import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '../components/ui';
import { colors, spacing } from '../theme';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';

export function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) return;

      const { data } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id ( username, display_name, avatar_url )
        `)
        .eq('recipient_id', authUser.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
      setLoading(false);

      // Mark as read
      await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', authUser.user.id).eq('is_read', false);
    }
    loadNotifications();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'follow': return 'user-plus';
      case 'reaction': return 'heart';
      case 'comment': return 'message-circle';
      case 'badge_earned': return 'award';
      default: return 'bell';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
        onPress={() => {
           if (item.type === 'follow' && item.sender_id) navigation.navigate('Profile', { userId: item.sender_id });
           // Route to drive or badge if applicable
        }}
      >
        <View style={styles.iconContainer}>
          <Feather name={getIconForType(item.type) as any} size={20} color={colors.brand} />
        </View>
        <View style={styles.content}>
          <Text variant="body">
            {item.sender ? <Text style={{ fontWeight: 'bold' }}>{item.sender.display_name} </Text> : null}
            {item.message}
          </Text>
          <Text variant="caption" color="foregroundMuted" style={{ marginTop: spacing[1] }}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing[2], marginLeft: -spacing[2] }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text variant="h2" style={{ marginLeft: spacing[2] }}>Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: spacing[8] }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: spacing[8] }}>No notifications yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  listContent: { padding: spacing[4] },
  notificationCard: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], backgroundColor: colors.backgroundCard, borderRadius: 12, marginBottom: spacing[3] },
  unreadCard: { borderWidth: 1, borderColor: colors.brand },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundElevated, justifyContent: 'center', alignItems: 'center', marginRight: spacing[4] },
  content: { flex: 1 },
});
