// Theme Engine for DRIVE Journey Composer

export type ThemeId =
  | 'cinematic' | 'minimal' | 'night_drive' | 'blueprint' | 'vaporwave'
  | 'luxury' | 'rally' | 'track_day' | 'vintage' | 'cyberpunk'
  | 'monochrome' | 'neon_tokyo' | 'sunset_chaser' | 'alpine' | 'desert_run'
  | 'ocean_drive' | 'stealth' | 'golden_hour' | 'retro_grid' | 'synthwave';

// Route (GPS polyline) styling. Purely data — RouteOverlay.tsx has no
// per-theme branching, it only reads these fields. `placement` is
// expressed as fractions of the card's safe band (see routeGeometry.ts),
// not the whole card, so the same fractions place the route correctly on
// every export format without any per-format logic here.
export interface RouteStyleConfig {
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  glow: boolean;
  glowColor?: string;
  glowWidth?: number;
  glowOpacity?: number;
  lineStyle: 'solid' | 'dashed';
  dashPattern?: [number, number];
  showMarkers: boolean;
  startMarkerColor: string;
  endMarkerColor: string;
  markerRadius: number;
  placement: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface JourneyTheme {
  id: ThemeId;
  name: string;
  category: 'Aesthetic' | 'Technical' | 'Mood' | 'Location';
  styles: {
    overlayColor: string;
    overlayOpacity: number;
    accentColor: string;
    textColor: string;
    secondaryTextColor: string;
    fontFamilyTitle: 'Inter' | 'sans-serif' | 'serif' | 'monospace';
    letterSpacingTitle: number;
    textTransformTitle: 'uppercase' | 'none' | 'lowercase' | 'capitalize';
    showScore: boolean;
    // Existing master on/off toggle for the route overlay (was already
    // part of the schema but never had anything to control before now).
    showMapLine: boolean;
    mapOpacity: number;
    scoreRingWidth: number;
    blurEffect: boolean;
    layout: 'classic' | 'minimal' | 'centered' | 'magazine';
    route: RouteStyleConfig;
  };
}

// Shared default placement: fills most of the safe band with a small
// margin. Every theme can override this independently (the field exists
// per-theme, not globally), but a first correct implementation doesn't need
// 20 bespoke placements to prove the mechanism works — the visual
// differentiation between themes here comes from stroke color/width/glow/
// line style/markers, which is where it's cheap to make each theme feel
// distinct and where per-theme tuning actually pays off without a device to
// iterate against.
const DEFAULT_PLACEMENT = { top: 0.06, left: 0.06, width: 0.88, height: 0.88 };

export const THEME_REGISTRY: Record<ThemeId, JourneyTheme> = {
  cinematic: {
    id: 'cinematic', name: 'Cinematic', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.6, accentColor: '#FF3366', textColor: '#FFFFFF', secondaryTextColor: 'rgba(255,255,255,0.8)', fontFamilyTitle: 'Inter', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 10, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#FF3366', strokeWidth: 6, opacity: 0.9, glow: true, lineStyle: 'solid', showMarkers: true, startMarkerColor: 'rgba(255,255,255,0.85)', endMarkerColor: '#FF3366', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  },
  minimal: {
    id: 'minimal', name: 'Minimal', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.4, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: 'rgba(255,255,255,0.7)', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: true, showMapLine: false, mapOpacity: 0.8, scoreRingWidth: 2, blurEffect: true, layout: 'minimal',
      route: { strokeColor: '#FFFFFF', strokeWidth: 3, opacity: 0.7, glow: false, lineStyle: 'solid', showMarkers: false, startMarkerColor: '#FFFFFF', endMarkerColor: '#FFFFFF', markerRadius: 6, placement: DEFAULT_PLACEMENT }
    }
  },
  night_drive: {
    id: 'night_drive', name: 'Night Drive', category: 'Mood',
    styles: { overlayColor: '#000A00', overlayOpacity: 0.85, accentColor: '#00FF66', textColor: '#FFFFFF', secondaryTextColor: '#00FF66', fontFamilyTitle: 'monospace', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.5, scoreRingWidth: 8, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#00FF66', strokeWidth: 5, opacity: 0.95, glow: true, glowOpacity: 0.45, lineStyle: 'solid', showMarkers: true, startMarkerColor: 'rgba(255,255,255,0.85)', endMarkerColor: '#00FF66', markerRadius: 8, placement: DEFAULT_PLACEMENT }
    }
  },
  blueprint: {
    id: 'blueprint', name: 'Blueprint', category: 'Technical',
    styles: { overlayColor: '#001E50', overlayOpacity: 0.9, accentColor: '#00A8FF', textColor: '#FFFFFF', secondaryTextColor: '#00A8FF', fontFamilyTitle: 'monospace', letterSpacingTitle: 4, textTransformTitle: 'uppercase', showScore: false, showMapLine: true, mapOpacity: 0.3, scoreRingWidth: 4, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#00A8FF', strokeWidth: 3, opacity: 0.9, glow: false, lineStyle: 'dashed', dashPattern: [12, 8], showMarkers: true, startMarkerColor: '#00A8FF', endMarkerColor: '#00A8FF', markerRadius: 6, placement: DEFAULT_PLACEMENT }
    }
  },
  vaporwave: {
    id: 'vaporwave', name: 'Vaporwave', category: 'Aesthetic',
    styles: { overlayColor: '#2B00FF', overlayOpacity: 0.5, accentColor: '#FF00FF', textColor: '#00FFFF', secondaryTextColor: '#FF00FF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 3, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.7, scoreRingWidth: 12, blurEffect: false, layout: 'centered',
      route: { strokeColor: '#FF00FF', strokeWidth: 6, opacity: 0.9, glow: true, glowColor: '#00FFFF', glowOpacity: 0.4, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#00FFFF', endMarkerColor: '#FF00FF', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  },
  luxury: {
    id: 'luxury', name: 'Luxury', category: 'Aesthetic',
    styles: { overlayColor: '#1A1A1A', overlayOpacity: 0.7, accentColor: '#D4AF37', textColor: '#FFFFFF', secondaryTextColor: '#D4AF37', fontFamilyTitle: 'serif', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: false, showMapLine: true, mapOpacity: 0.6, scoreRingWidth: 4, blurEffect: true, layout: 'magazine',
      route: { strokeColor: '#D4AF37', strokeWidth: 3, opacity: 0.85, glow: false, lineStyle: 'solid', showMarkers: true, startMarkerColor: 'rgba(255,255,255,0.7)', endMarkerColor: '#D4AF37', markerRadius: 6, placement: DEFAULT_PLACEMENT }
    }
  },
  rally: {
    id: 'rally', name: 'Dirt & Rally', category: 'Technical',
    styles: { overlayColor: '#3E2723', overlayOpacity: 0.8, accentColor: '#FF5722', textColor: '#FFFFFF', secondaryTextColor: '#FFCCBC', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 14, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#FF5722', strokeWidth: 8, opacity: 0.95, glow: false, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#FFCCBC', endMarkerColor: '#FF5722', markerRadius: 11, placement: DEFAULT_PLACEMENT }
    }
  },
  track_day: {
    id: 'track_day', name: 'Track Day', category: 'Technical',
    styles: { overlayColor: '#000000', overlayOpacity: 0.6, accentColor: '#F44336', textColor: '#FFFFFF', secondaryTextColor: '#EEEEEE', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 16, blurEffect: false, layout: 'centered',
      route: { strokeColor: '#F44336', strokeWidth: 6, opacity: 0.95, glow: true, glowOpacity: 0.4, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#EEEEEE', endMarkerColor: '#F44336', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  },
  vintage: {
    id: 'vintage', name: 'Vintage 70s', category: 'Mood',
    styles: { overlayColor: '#4E342E', overlayOpacity: 0.5, accentColor: '#FFB300', textColor: '#FFF8E1', secondaryTextColor: '#FFECB3', fontFamilyTitle: 'serif', letterSpacingTitle: 1, textTransformTitle: 'capitalize', showScore: false, showMapLine: false, mapOpacity: 0.8, scoreRingWidth: 6, blurEffect: true, layout: 'minimal',
      route: { strokeColor: '#FFB300', strokeWidth: 3, opacity: 0.8, glow: false, lineStyle: 'dashed', dashPattern: [8, 6], showMarkers: false, startMarkerColor: '#FFECB3', endMarkerColor: '#FFB300', markerRadius: 6, placement: DEFAULT_PLACEMENT }
    }
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk', category: 'Mood',
    styles: { overlayColor: '#120024', overlayOpacity: 0.8, accentColor: '#FDF500', textColor: '#00FFEE', secondaryTextColor: '#FF003C', fontFamilyTitle: 'monospace', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.4, scoreRingWidth: 8, blurEffect: false, layout: 'centered',
      route: { strokeColor: '#FDF500', strokeWidth: 5, opacity: 0.9, glow: true, glowColor: '#FF003C', glowOpacity: 0.4, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#00FFEE', endMarkerColor: '#FDF500', markerRadius: 8, placement: DEFAULT_PLACEMENT }
    }
  },
  monochrome: {
    id: 'monochrome', name: 'Monochrome', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.9, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: '#999999', fontFamilyTitle: 'Inter', letterSpacingTitle: 4, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.2, scoreRingWidth: 2, blurEffect: false, layout: 'minimal',
      route: { strokeColor: '#FFFFFF', strokeWidth: 2, opacity: 0.75, glow: false, lineStyle: 'solid', showMarkers: false, startMarkerColor: '#999999', endMarkerColor: '#FFFFFF', markerRadius: 5, placement: DEFAULT_PLACEMENT }
    }
  },
  neon_tokyo: {
    id: 'neon_tokyo', name: 'Neon Tokyo', category: 'Location',
    styles: { overlayColor: '#050014', overlayOpacity: 0.7, accentColor: '#FF0055', textColor: '#FFFFFF', secondaryTextColor: '#00FFFF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.6, scoreRingWidth: 10, blurEffect: true, layout: 'magazine',
      route: { strokeColor: '#FF0055', strokeWidth: 6, opacity: 0.9, glow: true, glowColor: '#00FFFF', glowOpacity: 0.45, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#00FFFF', endMarkerColor: '#FF0055', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  },
  sunset_chaser: {
    id: 'sunset_chaser', name: 'Sunset Chaser', category: 'Mood',
    styles: { overlayColor: '#4A148C', overlayOpacity: 0.4, accentColor: '#FF7043', textColor: '#FFFFFF', secondaryTextColor: '#FFE0B2', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: false, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 6, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#FF7043', strokeWidth: 5, opacity: 0.85, glow: false, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#FFE0B2', endMarkerColor: '#FF7043', markerRadius: 8, placement: DEFAULT_PLACEMENT }
    }
  },
  alpine: {
    id: 'alpine', name: 'Alpine Pass', category: 'Location',
    styles: { overlayColor: '#ECEFF1', overlayOpacity: 0.2, accentColor: '#1976D2', textColor: '#263238', secondaryTextColor: '#546E7A', fontFamilyTitle: 'Inter', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 8, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#1976D2', strokeWidth: 5, opacity: 0.9, glow: false, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#546E7A', endMarkerColor: '#1976D2', markerRadius: 8, placement: DEFAULT_PLACEMENT }
    }
  },
  desert_run: {
    id: 'desert_run', name: 'Desert Run', category: 'Location',
    styles: { overlayColor: '#FFECB3', overlayOpacity: 0.3, accentColor: '#E65100', textColor: '#3E2723', secondaryTextColor: '#5D4037', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'capitalize', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 12, blurEffect: false, layout: 'centered',
      route: { strokeColor: '#E65100', strokeWidth: 6, opacity: 0.9, glow: false, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#5D4037', endMarkerColor: '#E65100', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  },
  ocean_drive: {
    id: 'ocean_drive', name: 'Ocean Drive', category: 'Location',
    styles: { overlayColor: '#006064', overlayOpacity: 0.5, accentColor: '#00BCD4', textColor: '#E0F7FA', secondaryTextColor: '#84FFFF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: false, showMapLine: false, mapOpacity: 0.8, scoreRingWidth: 6, blurEffect: true, layout: 'minimal',
      route: { strokeColor: '#00BCD4', strokeWidth: 4, opacity: 0.85, glow: true, glowOpacity: 0.35, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#E0F7FA', endMarkerColor: '#00BCD4', markerRadius: 7, placement: DEFAULT_PLACEMENT }
    }
  },
  stealth: {
    id: 'stealth', name: 'Stealth Mode', category: 'Technical',
    styles: { overlayColor: '#000000', overlayOpacity: 0.95, accentColor: '#333333', textColor: '#777777', secondaryTextColor: '#444444', fontFamilyTitle: 'monospace', letterSpacingTitle: 5, textTransformTitle: 'uppercase', showScore: false, showMapLine: false, mapOpacity: 0.1, scoreRingWidth: 1, blurEffect: false, layout: 'minimal',
      route: { strokeColor: '#444444', strokeWidth: 2, opacity: 0.6, glow: false, lineStyle: 'dashed', dashPattern: [6, 6], showMarkers: false, startMarkerColor: '#333333', endMarkerColor: '#444444', markerRadius: 4, placement: DEFAULT_PLACEMENT }
    }
  },
  golden_hour: {
    id: 'golden_hour', name: 'Golden Hour', category: 'Mood',
    styles: { overlayColor: '#FF8F00', overlayOpacity: 0.3, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: '#FFF3E0', fontFamilyTitle: 'serif', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: true, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 8, blurEffect: true, layout: 'magazine',
      route: { strokeColor: '#FFFFFF', strokeWidth: 4, opacity: 0.85, glow: true, glowColor: '#FFD54F', glowOpacity: 0.4, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#FFF3E0', endMarkerColor: '#FFFFFF', markerRadius: 7, placement: DEFAULT_PLACEMENT }
    }
  },
  retro_grid: {
    id: 'retro_grid', name: 'Retro Grid', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.7, accentColor: '#FF00AA', textColor: '#FFFFFF', secondaryTextColor: '#00FFCC', fontFamilyTitle: 'monospace', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.5, scoreRingWidth: 10, blurEffect: false, layout: 'centered',
      route: { strokeColor: '#FF00AA', strokeWidth: 5, opacity: 0.9, glow: false, lineStyle: 'dashed', dashPattern: [10, 6], showMarkers: true, startMarkerColor: '#00FFCC', endMarkerColor: '#FF00AA', markerRadius: 8, placement: DEFAULT_PLACEMENT }
    }
  },
  synthwave: {
    id: 'synthwave', name: 'Synthwave', category: 'Aesthetic',
    styles: { overlayColor: '#1A0B2E', overlayOpacity: 0.6, accentColor: '#FE019A', textColor: '#00FFFF', secondaryTextColor: '#FE019A', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 3, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.8, scoreRingWidth: 12, blurEffect: false, layout: 'classic',
      route: { strokeColor: '#FE019A', strokeWidth: 6, opacity: 0.9, glow: true, glowColor: '#00FFFF', glowOpacity: 0.45, lineStyle: 'solid', showMarkers: true, startMarkerColor: '#00FFFF', endMarkerColor: '#FE019A', markerRadius: 9, placement: DEFAULT_PLACEMENT }
    }
  }
};

export const getAllThemes = (): JourneyTheme[] => Object.values(THEME_REGISTRY);
export const getTheme = (id: ThemeId): JourneyTheme => THEME_REGISTRY[id] || THEME_REGISTRY['cinematic'];
