import { Platform } from 'react-native';
export const fontFamilies = {
  sans: Platform.select({ ios: 'Inter', android: 'Inter', default: 'Inter' }),
  mono: Platform.select({ ios: 'JetBrainsMono', android: 'JetBrainsMono', default: 'JetBrainsMono' }),
} as const;
export const fontSizes = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 22, '3xl': 28, '4xl': 34, '5xl': 42, display: 64, hud: 96,
} as const;
export const fontWeights = {
  regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const,
};
export const lineHeights = { tight: 1.1, normal: 1.4, relaxed: 1.6 } as const;
export const letterSpacings = {
  tighter: -0.5, tight: -0.25, normal: 0, wide: 0.5, wider: 1.0, widest: 2.0, mono: 0.5,
} as const;
