import React, { forwardRef } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from './Text';
import { ScoreRing } from './ScoreRing';
import { spacing } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { getTheme, ThemeId } from '../../lib/themeEngine';

interface ShareTplCardProps {
  title: string;
  score: number;
  distance: string;
  duration: string;
  mapImageUrl?: string;
  photoUrl?: string;
  username: string;
  template?: ThemeId;
  isPreview?: boolean;
}

export const ShareTplCard = forwardRef<View, ShareTplCardProps>((props, ref) => {
  const { title, score, distance, duration, mapImageUrl, photoUrl, username, template = 'cinematic', isPreview = false } = props;

  const bgSource = photoUrl ? { uri: photoUrl } : mapImageUrl ? { uri: mapImageUrl } : undefined;
  
  // Get JSON Theme Configuration
  const theme = getTheme(template);
  const { styles: ts } = theme;

  return (
    <View ref={ref} style={[
      styles.container, 
      isPreview ? styles.previewContainer : styles.renderContainer, 
      { backgroundColor: ts.overlayColor } // Base color if no image
    ]}>
      <ImageBackground 
        source={bgSource} 
        style={styles.mapBackground}
        imageStyle={{ opacity: ts.mapOpacity }}
        blurRadius={ts.blurEffect ? 10 : 0}
      >
        <View style={[styles.overlay, { backgroundColor: ts.overlayColor, opacity: ts.overlayOpacity, position: 'absolute', width: '100%', height: '100%' }]} />
        
        <View style={styles.contentLayer}>
          
          {/* Header Layout */}
          <View style={[
            styles.header, 
            ts.layout === 'minimal' && { alignItems: 'flex-start' },
            ts.layout === 'magazine' && { alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: ts.accentColor, paddingLeft: 16 }
          ]}>
            <Text style={{ 
              color: ts.textColor, 
              fontFamily: ts.fontFamilyTitle, 
              letterSpacing: ts.letterSpacingTitle, 
              textTransform: ts.textTransformTitle,
              fontSize: ts.layout === 'magazine' ? 48 : 32,
              fontWeight: 'bold'
            }}>
              {title}
            </Text>
            <Text style={{ color: ts.secondaryTextColor, marginTop: 4, fontFamily: 'monospace' }}>
              STORY BY @{username.toUpperCase()}
            </Text>
          </View>

          {/* Center Layout (Score) */}
          <View style={styles.centerScore}>
            {ts.showScore && ts.layout !== 'minimal' && (
              <ScoreRing score={score} size={140} strokeWidth={ts.scoreRingWidth} brandColor={ts.accentColor} />
            )}
            {ts.showScore && ts.layout === 'minimal' && (
               <View style={{ alignItems: 'flex-start', width: '100%' }}>
                  <Text style={{ color: ts.accentColor, fontSize: 80, fontWeight: 'bold' }}>{score}</Text>
                  <Text style={{ color: ts.secondaryTextColor, letterSpacing: 2 }}>DRIVE SCORE</Text>
               </View>
            )}
          </View>

          {/* Footer Layout */}
          <View style={[
            styles.footer, 
            ts.layout === 'minimal' && { flexDirection: 'column', alignItems: 'flex-start' },
            ts.layout === 'magazine' && { backgroundColor: ts.accentColor, padding: 16, borderRadius: 8 }
          ]}>
            <View style={[styles.statBox, ts.layout === 'minimal' && { alignItems: 'flex-start', marginBottom: 16 }]}>
              <Text style={{ color: ts.layout === 'magazine' ? '#000' : ts.accentColor, fontSize: 12, letterSpacing: 1 }}>DISTANCE</Text>
              <Text style={{ color: ts.layout === 'magazine' ? '#000' : ts.textColor, fontSize: 24, fontWeight: 'bold' }}>{distance}</Text>
            </View>
            
            {ts.layout !== 'minimal' && (
              <View style={styles.logoBox}>
                <Feather name="navigation" size={24} color={ts.layout === 'magazine' ? '#000' : ts.accentColor} />
                <Text style={{ color: ts.layout === 'magazine' ? '#000' : ts.textColor, letterSpacing: 2, marginTop: 4, fontWeight: 'bold' }}>DRIVE</Text>
              </View>
            )}

            <View style={[styles.statBox, ts.layout === 'minimal' && { alignItems: 'flex-start' }]}>
              <Text style={{ color: ts.layout === 'magazine' ? '#000' : ts.accentColor, fontSize: 12, letterSpacing: 1 }}>DURATION</Text>
              <Text style={{ color: ts.layout === 'magazine' ? '#000' : ts.textColor, fontSize: 24, fontWeight: 'bold' }}>{duration}</Text>
            </View>

            {ts.layout === 'minimal' && (
              <View style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="navigation" size={16} color={ts.textColor} />
                <Text style={{ color: ts.textColor, marginLeft: 8, letterSpacing: 2, fontSize: 12 }}>DRIVE APP</Text>
              </View>
            )}
          </View>

        </View>
      </ImageBackground>

      {/* Watermark (Organic Growth) */}
      <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>CREATED WITH DRIVE</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  previewContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    alignSelf: 'center',
  },
  renderContainer: {
    width: 1080 / 2,
    height: 1920 / 2,
    position: 'absolute',
    left: -10000,
  },
  mapBackground: { flex: 1 },
  overlay: { flex: 1 },
  contentLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: spacing[8],
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: spacing[8] },
  centerScore: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[8] },
  statBox: { alignItems: 'center' },
  logoBox: { alignItems: 'center' },
});
