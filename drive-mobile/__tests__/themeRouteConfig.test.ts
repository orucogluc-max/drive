import { getAllThemes, THEME_REGISTRY } from '../src/lib/themeEngine';

describe('Theme route configuration (schema extension, not hardcoded per-theme logic)', () => {
  const themes = getAllThemes();

  it('keeps all 20 existing themes', () => {
    expect(themes).toHaveLength(20);
  });

  it.each(themes.map((t) => [t.id, t] as const))('%s has a complete, valid route config', (_id, theme) => {
    const { route } = theme.styles;

    expect(typeof route.strokeColor).toBe('string');
    expect(route.strokeColor.length).toBeGreaterThan(0);

    expect(route.strokeWidth).toBeGreaterThan(0);

    expect(route.opacity).toBeGreaterThanOrEqual(0);
    expect(route.opacity).toBeLessThanOrEqual(1);

    expect(typeof route.glow).toBe('boolean');
    expect(['solid', 'dashed']).toContain(route.lineStyle);

    expect(typeof route.showMarkers).toBe('boolean');
    expect(typeof route.startMarkerColor).toBe('string');
    expect(typeof route.endMarkerColor).toBe('string');
    expect(route.markerRadius).toBeGreaterThan(0);

    // Placement fractions must all be within [0, 1] and describe a
    // non-degenerate rectangle, or the route would render outside the
    // safe band or collapse to zero size.
    const { top, left, width, height } = route.placement;
    for (const v of [top, left, width, height]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    expect(top + height).toBeLessThanOrEqual(1.0001);
    expect(left + width).toBeLessThanOrEqual(1.0001);
  });

  it('dashed themes always provide a usable dash pattern or fall back correctly', () => {
    for (const theme of themes) {
      const { route } = theme.styles;
      if (route.lineStyle === 'dashed' && route.dashPattern) {
        expect(route.dashPattern).toHaveLength(2);
        expect(route.dashPattern[0]).toBeGreaterThan(0);
        expect(route.dashPattern[1]).toBeGreaterThan(0);
      }
    }
  });

  it('themes that already had showMapLine=false keep the route master toggle off (respects prior theme intent)', () => {
    // vintage, ocean_drive and stealth were authored with showMapLine=false
    // before this feature existed. Extending the schema must not silently
    // turn route rendering on for them.
    expect(THEME_REGISTRY.vintage.styles.showMapLine).toBe(false);
    expect(THEME_REGISTRY.ocean_drive.styles.showMapLine).toBe(false);
    expect(THEME_REGISTRY.stealth.styles.showMapLine).toBe(false);
    // But they still have a fully valid route config on standby, in case
    // that toggle is ever flipped.
    expect(THEME_REGISTRY.vintage.styles.route.strokeColor).toBeTruthy();
  });

  it('getTheme falls back to cinematic for an unknown id and still has a route config', () => {
    const { getTheme } = require('../src/lib/themeEngine');
    const fallback = getTheme('does-not-exist');
    expect(fallback.id).toBe('cinematic');
    expect(fallback.styles.route).toBeDefined();
  });
});
