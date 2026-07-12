import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Text, ShareTplCard } from '../components/ui';
import { colors, spacing } from '../theme';
import { Feather } from '@expo/vector-icons';
import { useDriveStore } from '../store/useDriveStore';
import { supabase } from '../lib/supabase';
import ViewShot from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { getAllThemes, ThemeId } from '../lib/themeEngine';
import { EXPORT_FORMATS, ExportFormatId, getExportFormat, getExportDimensions } from '../utils/exportFormat';
import { resolvePickedPhotoUri } from '../utils/imagePicker';

export function JourneyComposerScreen({ navigation }: any) {
  const { currentDriveId, resetDrive, distanceMeters } = useDriveStore();
  const shareRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [scoreData, setScoreData] = useState<any>(null);

  // Composer State
  const ALL_THEMES = getAllThemes();
  const [activeTemplate, setActiveTemplate] = useState<ThemeId>('cinematic');
  const [exportFormat, setExportFormat] = useState<ExportFormatId>('story');
  const [storyTitle, setStoryTitle] = useState('My Journey');
  const [username, setUsername] = useState('driver');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        supabase.from('profiles').select('username').eq('id', data.user.id).single()
          .then(({ data: profile }) => {
            if (profile) setUsername(profile.username);
          });
      }
    });

    if (!currentDriveId) {
      setScoreData({ score_overall: 95, duration_s: 3600 });
      setIsLoading(false);
      return;
    }

    supabase.from('drives').select('*').eq('id', currentDriveId).single().then(({ data }) => {
      if (data && data.status === 'completed') {
        setScoreData(data);
        setIsLoading(false);
      }
    });

    const channel = supabase.channel('public:drives')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drives', filter: `id=eq.${currentDriveId}` }, (payload) => {
        if (payload.new.status === 'completed') {
          setScoreData(payload.new);
          setIsLoading(false);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentDriveId]);

  const handleDone = () => {
    resetDrive();
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });

    const uri = resolvePickedPhotoUri(result);
    if (uri) setPhotoUrl(uri);
  };

  const handleShare = async () => {
    if (!shareRef.current || !shareRef.current.capture) return;
    try {
      const uri = await shareRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: storyTitle || 'Share your Journey',
        });
      }
    } catch (err) {
      console.error("Share error", err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={{ marginTop: spacing[4] }}>Crafting your story...</Text>
      </SafeAreaView>
    );
  }

  const durationStr = scoreData ? `${Math.round(scoreData.duration_s / 60)} min` : "0 min";
  const distStr = `${Math.round(distanceMeters / 1000)} km`;
  const score = scoreData?.score_overall || 0;
  
  const currentFormatDef = getExportFormat(exportFormat);
  const screenWidth = Dimensions.get('window').width;
  const previewWidth = screenWidth - spacing[8] * 2;
  const previewHeight = previewWidth / currentFormatDef.ratio;
  const captureDimensions = getExportDimensions(currentFormatDef.ratio);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Header Options */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDone}>
            <Feather name="x" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <Text variant="h3">Composer</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text variant="body" color="white" style={{ fontWeight: 'bold' }}>Export</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Format Selector */}
          <View style={styles.formatSelector}>
             {EXPORT_FORMATS.map(fmt => (
                <TouchableOpacity 
                   key={fmt.id} 
                   style={[styles.formatBtn, exportFormat === fmt.id && styles.formatBtnActive]}
                   onPress={() => setExportFormat(fmt.id)}
                >
                   <Feather name={fmt.icon} size={18} color={exportFormat === fmt.id ? colors.background : colors.foregroundMuted} />
                   <Text style={{ marginLeft: spacing[2], color: exportFormat === fmt.id ? colors.background : colors.foregroundMuted, fontWeight: 'bold', fontSize: 12 }}>{fmt.label}</Text>
                </TouchableOpacity>
             ))}
          </View>

          {/* Live Preview (Visual Component) */}
          <View style={[styles.previewContainer, { width: screenWidth, alignItems: 'center' }]}>
             <View style={{ width: previewWidth, height: previewHeight, borderRadius: 24, overflow: 'hidden' }}>
                <ShareTplCard 
                  title={storyTitle}
                  score={score}
                  distance={distStr}
                  duration={durationStr}
                  username={username}
                  template={activeTemplate}
                  photoUrl={photoUrl}
                  isPreview={true}
                />
             </View>
          </View>

          {/* Editor Controls */}
          <View style={styles.editorControls}>
            <Text variant="label" color="foregroundMuted" style={{ marginBottom: spacing[2] }}>STORY TITLE</Text>
            <TextInput 
              style={styles.input}
              value={storyTitle}
              onChangeText={setStoryTitle}
              placeholder="Give your journey a name..."
              placeholderTextColor={colors.foregroundMuted}
            />

            <Text variant="label" color="foregroundMuted" style={{ marginTop: spacing[6], marginBottom: spacing[4] }}>CHOOSE AESTHETIC (20+ TEMPLATES)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {ALL_THEMES.map(tpl => {
                const isActive = activeTemplate === tpl.id;
                return (
                  <TouchableOpacity 
                    key={tpl.id} 
                    style={[styles.templateBtn, isActive && styles.templateBtnActive]}
                    onPress={() => setActiveTemplate(tpl.id)}
                  >
                    <Text variant="body" style={{ color: isActive ? colors.background : colors.foreground, fontWeight: isActive ? 'bold' : 'normal' }}>
                      {tpl.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: isActive ? colors.background : colors.foregroundMuted, marginTop: 4 }}>{tpl.category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
              <Feather name="camera" size={20} color={colors.foreground} />
              <Text style={{ marginLeft: spacing[2] }}>{photoUrl ? "Change Background Photo" : "Add Background Photo"}</Text>
            </TouchableOpacity>

            <View style={{ marginTop: spacing[6], padding: spacing[4], backgroundColor: colors.backgroundCard, borderRadius: 12 }}>
               <Text variant="h3" style={{ marginBottom: spacing[4] }}>Storytelling</Text>
               
               <Text variant="caption" color="foregroundMuted" style={{ marginBottom: spacing[2], fontWeight: 'bold' }}>TITLE</Text>
               <View style={{ backgroundColor: colors.backgroundElevated, padding: spacing[3], borderRadius: 8, marginBottom: spacing[4] }}>
                  <Text color="foregroundMuted">Midnight Run Through the Canyons</Text>
               </View>

               <Text variant="caption" color="foregroundMuted" style={{ marginBottom: spacing[2], fontWeight: 'bold' }}>FAVORITE MOMENT</Text>
               <View style={{ backgroundColor: colors.backgroundElevated, padding: spacing[3], borderRadius: 8, marginBottom: spacing[4] }}>
                  <Text color="foregroundMuted">What was the highlight of this journey?</Text>
               </View>

               <Text variant="caption" color="foregroundMuted" style={{ marginBottom: spacing[2], fontWeight: 'bold' }}>ADVICE FOR OTHERS</Text>
               <View style={{ backgroundColor: colors.backgroundElevated, padding: spacing[3], borderRadius: 8, marginBottom: spacing[4] }}>
                  <Text color="foregroundMuted">Any tips? (e.g. Go early to avoid traffic)</Text>
               </View>

               <Text variant="caption" color="foregroundMuted" style={{ marginBottom: spacing[2], fontWeight: 'bold' }}>TAGS & ROAD TYPE</Text>
               <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <View style={[styles.templateBtn, { marginBottom: spacing[2] }]}><Text>🗺️ Mountain</Text></View>
                  <View style={[styles.templateBtn, { marginBottom: spacing[2] }]}><Text>#spirited</Text></View>
                  <View style={[styles.templateBtn, { marginBottom: spacing[2], borderStyle: 'dashed' }]}><Text>+ Add Tag</Text></View>
               </View>
            </View>

            {/* Zero AI Privacy Badge */}
            <View style={styles.privacyBadge}>
               <Feather name="shield" size={16} color={colors.brand} />
               <Text style={styles.privacyText}>
                 100% On-Device Render • Zero Paid AI • Private
               </Text>
            </View>

          </View>

        </ScrollView>

        {/* Hidden ViewShot for actual rendering in high quality (Render Canvas) */}
        <ViewShot
            ref={shareRef}
            options={{ format: "jpg", quality: 1.0 }}
            style={[styles.hiddenSnapshot, { width: captureDimensions.width, height: captureDimensions.height }]}
        >
          <ShareTplCard 
            title={storyTitle}
            score={score}
            distance={distStr}
            duration={durationStr}
            username={username}
            template={activeTemplate}
            photoUrl={photoUrl}
            isPreview={false}
          />
        </ViewShot>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing[12] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4] },
  shareButton: { backgroundColor: colors.brand, paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: 20 },
  formatSelector: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: spacing[4], marginBottom: spacing[6] },
  formatBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20, backgroundColor: colors.backgroundElevated, marginHorizontal: spacing[1] },
  formatBtnActive: { backgroundColor: colors.foreground },
  previewContainer: { paddingVertical: spacing[4] },
  editorControls: { padding: spacing[4], backgroundColor: colors.backgroundElevated, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: spacing[4], paddingTop: spacing[6], minHeight: 400 },
  input: { backgroundColor: colors.backgroundCard, color: colors.foreground, fontSize: 18, padding: spacing[4], borderRadius: 12, fontFamily: 'Inter' },
  templateScroll: { flexGrow: 0 },
  templateBtn: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: 16, backgroundColor: colors.backgroundCard, marginRight: spacing[3], borderWidth: 1, borderColor: colors.border },
  templateBtnActive: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing[6], padding: spacing[4], borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.foregroundMuted },
  hiddenSnapshot: { position: 'absolute', left: -10000 },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing[6], padding: spacing[3], backgroundColor: 'rgba(0, 255, 102, 0.1)', borderRadius: 20 },
  privacyText: { marginLeft: spacing[2], fontSize: 11, color: colors.brand, fontWeight: 'bold', letterSpacing: 0.5 }
});
