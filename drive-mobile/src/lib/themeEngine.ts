// Theme Engine for DRIVE Journey Composer

export type ThemeId = 
  | 'cinematic' | 'minimal' | 'night_drive' | 'blueprint' | 'vaporwave' 
  | 'luxury' | 'rally' | 'track_day' | 'vintage' | 'cyberpunk'
  | 'monochrome' | 'neon_tokyo' | 'sunset_chaser' | 'alpine' | 'desert_run'
  | 'ocean_drive' | 'stealth' | 'golden_hour' | 'retro_grid' | 'synthwave';

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
    showMapLine: boolean;
    mapOpacity: number;
    scoreRingWidth: number;
    blurEffect: boolean;
    layout: 'classic' | 'minimal' | 'centered' | 'magazine';
  };
}

export const THEME_REGISTRY: Record<ThemeId, JourneyTheme> = {
  cinematic: {
    id: 'cinematic', name: 'Cinematic', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.6, accentColor: '#FF3366', textColor: '#FFFFFF', secondaryTextColor: 'rgba(255,255,255,0.8)', fontFamilyTitle: 'Inter', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 10, blurEffect: false, layout: 'classic' }
  },
  minimal: {
    id: 'minimal', name: 'Minimal', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.4, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: 'rgba(255,255,255,0.7)', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: true, showMapLine: false, mapOpacity: 0.8, scoreRingWidth: 2, blurEffect: true, layout: 'minimal' }
  },
  night_drive: {
    id: 'night_drive', name: 'Night Drive', category: 'Mood',
    styles: { overlayColor: '#000A00', overlayOpacity: 0.85, accentColor: '#00FF66', textColor: '#FFFFFF', secondaryTextColor: '#00FF66', fontFamilyTitle: 'monospace', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.5, scoreRingWidth: 8, blurEffect: false, layout: 'classic' }
  },
  blueprint: {
    id: 'blueprint', name: 'Blueprint', category: 'Technical',
    styles: { overlayColor: '#001E50', overlayOpacity: 0.9, accentColor: '#00A8FF', textColor: '#FFFFFF', secondaryTextColor: '#00A8FF', fontFamilyTitle: 'monospace', letterSpacingTitle: 4, textTransformTitle: 'uppercase', showScore: false, showMapLine: true, mapOpacity: 0.3, scoreRingWidth: 4, blurEffect: false, layout: 'classic' }
  },
  vaporwave: {
    id: 'vaporwave', name: 'Vaporwave', category: 'Aesthetic',
    styles: { overlayColor: '#2B00FF', overlayOpacity: 0.5, accentColor: '#FF00FF', textColor: '#00FFFF', secondaryTextColor: '#FF00FF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 3, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.7, scoreRingWidth: 12, blurEffect: false, layout: 'centered' }
  },
  luxury: {
    id: 'luxury', name: 'Luxury', category: 'Aesthetic',
    styles: { overlayColor: '#1A1A1A', overlayOpacity: 0.7, accentColor: '#D4AF37', textColor: '#FFFFFF', secondaryTextColor: '#D4AF37', fontFamilyTitle: 'serif', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: false, showMapLine: true, mapOpacity: 0.6, scoreRingWidth: 4, blurEffect: true, layout: 'magazine' }
  },
  rally: {
    id: 'rally', name: 'Dirt & Rally', category: 'Technical',
    styles: { overlayColor: '#3E2723', overlayOpacity: 0.8, accentColor: '#FF5722', textColor: '#FFFFFF', secondaryTextColor: '#FFCCBC', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 14, blurEffect: false, layout: 'classic' }
  },
  track_day: {
    id: 'track_day', name: 'Track Day', category: 'Technical',
    styles: { overlayColor: '#000000', overlayOpacity: 0.6, accentColor: '#F44336', textColor: '#FFFFFF', secondaryTextColor: '#EEEEEE', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 16, blurEffect: false, layout: 'centered' }
  },
  vintage: {
    id: 'vintage', name: 'Vintage 70s', category: 'Mood',
    styles: { overlayColor: '#4E342E', overlayOpacity: 0.5, accentColor: '#FFB300', textColor: '#FFF8E1', secondaryTextColor: '#FFECB3', fontFamilyTitle: 'serif', letterSpacingTitle: 1, textTransformTitle: 'capitalize', showScore: false, showMapLine: false, mapOpacity: 0.8, scoreRingWidth: 6, blurEffect: true, layout: 'minimal' }
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Cyberpunk', category: 'Mood',
    styles: { overlayColor: '#120024', overlayOpacity: 0.8, accentColor: '#FDF500', textColor: '#00FFEE', secondaryTextColor: '#FF003C', fontFamilyTitle: 'monospace', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.4, scoreRingWidth: 8, blurEffect: false, layout: 'centered' }
  },
  monochrome: {
    id: 'monochrome', name: 'Monochrome', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.9, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: '#999999', fontFamilyTitle: 'Inter', letterSpacingTitle: 4, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.2, scoreRingWidth: 2, blurEffect: false, layout: 'minimal' }
  },
  neon_tokyo: {
    id: 'neon_tokyo', name: 'Neon Tokyo', category: 'Location',
    styles: { overlayColor: '#050014', overlayOpacity: 0.7, accentColor: '#FF0055', textColor: '#FFFFFF', secondaryTextColor: '#00FFFF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.6, scoreRingWidth: 10, blurEffect: true, layout: 'magazine' }
  },
  sunset_chaser: {
    id: 'sunset_chaser', name: 'Sunset Chaser', category: 'Mood',
    styles: { overlayColor: '#4A148C', overlayOpacity: 0.4, accentColor: '#FF7043', textColor: '#FFFFFF', secondaryTextColor: '#FFE0B2', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: false, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 6, blurEffect: false, layout: 'classic' }
  },
  alpine: {
    id: 'alpine', name: 'Alpine Pass', category: 'Location',
    styles: { overlayColor: '#ECEFF1', overlayOpacity: 0.2, accentColor: '#1976D2', textColor: '#263238', secondaryTextColor: '#546E7A', fontFamilyTitle: 'Inter', letterSpacingTitle: 1, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 8, blurEffect: false, layout: 'classic' }
  },
  desert_run: {
    id: 'desert_run', name: 'Desert Run', category: 'Location',
    styles: { overlayColor: '#FFECB3', overlayOpacity: 0.3, accentColor: '#E65100', textColor: '#3E2723', secondaryTextColor: '#5D4037', fontFamilyTitle: 'Inter', letterSpacingTitle: 0, textTransformTitle: 'capitalize', showScore: true, showMapLine: true, mapOpacity: 1, scoreRingWidth: 12, blurEffect: false, layout: 'centered' }
  },
  ocean_drive: {
    id: 'ocean_drive', name: 'Ocean Drive', category: 'Location',
    styles: { overlayColor: '#006064', overlayOpacity: 0.5, accentColor: '#00BCD4', textColor: '#E0F7FA', secondaryTextColor: '#84FFFF', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: false, showMapLine: true, mapOpacity: 0.8, scoreRingWidth: 6, blurEffect: true, layout: 'minimal' }
  },
  stealth: {
    id: 'stealth', name: 'Stealth Mode', category: 'Technical',
    styles: { overlayColor: '#000000', overlayOpacity: 0.95, accentColor: '#333333', textColor: '#777777', secondaryTextColor: '#444444', fontFamilyTitle: 'monospace', letterSpacingTitle: 5, textTransformTitle: 'uppercase', showScore: false, showMapLine: false, mapOpacity: 0.1, scoreRingWidth: 1, blurEffect: false, layout: 'minimal' }
  },
  golden_hour: {
    id: 'golden_hour', name: 'Golden Hour', category: 'Mood',
    styles: { overlayColor: '#FF8F00', overlayOpacity: 0.3, accentColor: '#FFFFFF', textColor: '#FFFFFF', secondaryTextColor: '#FFF3E0', fontFamilyTitle: 'serif', letterSpacingTitle: 0, textTransformTitle: 'none', showScore: true, showMapLine: true, mapOpacity: 0.9, scoreRingWidth: 8, blurEffect: true, layout: 'magazine' }
  },
  retro_grid: {
    id: 'retro_grid', name: 'Retro Grid', category: 'Aesthetic',
    styles: { overlayColor: '#000000', overlayOpacity: 0.7, accentColor: '#FF00AA', textColor: '#FFFFFF', secondaryTextColor: '#00FFCC', fontFamilyTitle: 'monospace', letterSpacingTitle: 2, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.5, scoreRingWidth: 10, blurEffect: false, layout: 'centered' }
  },
  synthwave: {
    id: 'synthwave', name: 'Synthwave', category: 'Aesthetic',
    styles: { overlayColor: '#1A0B2E', overlayOpacity: 0.6, accentColor: '#FE019A', textColor: '#00FFFF', secondaryTextColor: '#FE019A', fontFamilyTitle: 'sans-serif', letterSpacingTitle: 3, textTransformTitle: 'uppercase', showScore: true, showMapLine: true, mapOpacity: 0.8, scoreRingWidth: 12, blurEffect: false, layout: 'classic' }
  }
};

export const getAllThemes = (): JourneyTheme[] => Object.values(THEME_REGISTRY);
export const getTheme = (id: ThemeId): JourneyTheme => THEME_REGISTRY[id] || THEME_REGISTRY['cinematic'];
