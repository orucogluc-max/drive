import React, { forwardRef, memo } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from './Text';
import { ScoreRing } from './ScoreRing';
import { RouteOverlay } from './RouteOverlay';
import { spacing } from '../../theme';
import { Feather } from '@expo/vector-icons';
import { getTheme, ThemeId } from '../../lib/themeEngine';
import { GeoPoint } from '../../utils/geoUtils';

interface ShareTplCardProps {
  title: string;
  score: number;
  distance: string;
  duration: string;
  mapImageUrl?: string;
  photoUrl?: string;
  username: string;
  template?: ThemeId;
  // The Journey's filtered GPS trace. Optional — when omitted, too short,
  // or the drive never really moved, RouteOverlay simply renders nothing
  // rather than a broken placeholder (see routeGeometry.isRouteRenderable).
  routePoints?: GeoPoint[];
  // The card ALWAYS renders at these literal pixel dimensions — this is the
  // single source of truth for its layout. There is no "preview mode" with
  // its own sizing: callers who want an on-screen preview wrap this same
  // component in <ScaledPreview> instead of asking ShareTplCard to lay
  // itself out differently. That's what makes the preview provably
  // WYSIWYG rather than a parallel approximation.
  width: number;
  height: number;
}

// Wrapped in memo so re-renders in JourneyComposerScreen that don't change
// any of this component's own props (e.g. switching export format, which
// changes width/height and is correctly caught by memo's prop comparison)
// don't re-render the ImageBackground + ScoreRing + theme lookup uselessly.
const ShareTplCardImpl = forwardRef<View, ShareTplCardProps>((props, ref) => {
  const { title, score, distance, duration, mapImageUrl, photoUrl, username, template = 'cinematic', routePoints, width, height } = props;

  const bgSource = photoUrl ? { uri: photoUrl } : mapImageUrl ? { uri: mapImageUrl } : undefined;

  // Get JSON Theme Configuration
  const theme = getTheme(template);
  const { styles: ts } = theme;

  return (
    <View ref={ref} style={[
      styles.container,
      { width, height, backgroundColor: ts.overlayColor } // Base color if no image
    ]}>
      <ImageBackground 
        source={bgSource} 
        style={styles.mapBackground}
        imageStyle={{ opacity: ts.mapOpacity }}
        blurRadius={ts.blurEffect ? 10 : 0}
      >
        <View style={[styles.overlay, { backgroundColor: ts.overlayColor, opacity: ts.overlayOpacity, position: 'absolute', width: '100%', height: '100%' }]} />

        {/* Route overlay renders above the photo/scrim but below the text
            content layer below, so title/score/stats stay fully legible. */}
        {ts.showMapLine && (
          <RouteOverlay points={routePoints ?? []} cardWidth={width} cardHeight={height} config={ts.route} />
        )}

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

export const ShareTplCard = memo(ShareTplCardImpl);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
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
