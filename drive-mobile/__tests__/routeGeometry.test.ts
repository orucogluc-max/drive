import {
  projectRouteToPlane,
  fitPointsToArea,
  computeRouteSafeArea,
  isRouteRenderable,
  computeRouteRenderPoints,
  ROUTE_HEADER_CLEARANCE_PX,
  ROUTE_FOOTER_CLEARANCE_PX,
} from '../src/utils/routeGeometry';
import { GeoPoint } from '../src/utils/geoUtils';

const DEFAULT_PLACEMENT = { top: 0.06, left: 0.06, width: 0.88, height: 0.88 };

// A real-ish short drive: mostly north with a bit of east drift, so the
// route's true bounding box is taller than it is wide.
const NORTH_SOUTH_ROUTE: GeoPoint[] = [
  { latitude: 37.7749, longitude: -122.4194 },
  { latitude: 37.7800, longitude: -122.4190 },
  { latitude: 37.7850, longitude: -122.4185 },
  { latitude: 37.7900, longitude: -122.4192 },
];

// A route that's much wider (east-west) than it is tall.
const EAST_WEST_ROUTE: GeoPoint[] = [
  { latitude: 37.7749, longitude: -122.5000 },
  { latitude: 37.7751, longitude: -122.4500 },
  { latitude: 37.7748, longitude: -122.4000 },
  { latitude: 37.7752, longitude: -122.3500 },
];

describe('projectRouteToPlane (coordinate normalization)', () => {
  it('produces one plane point per valid geo point', () => {
    const plane = projectRouteToPlane(NORTH_SOUTH_ROUTE);
    expect(plane).toHaveLength(NORTH_SOUTH_ROUTE.length);
  });

  it('places the northernmost point at the smallest y (screen "up")', () => {
    const plane = projectRouteToPlane(NORTH_SOUTH_ROUTE);
    const minYIndex = plane.reduce((best, p, i) => (p.y < plane[best].y ? i : best), 0);
    // NORTH_SOUTH_ROUTE's last point has the highest latitude (most north).
    expect(minYIndex).toBe(NORTH_SOUTH_ROUTE.length - 1);
  });

  it('drops non-finite coordinates instead of propagating NaN', () => {
    const withGarbage: GeoPoint[] = [
      { latitude: NaN, longitude: -122.4194 },
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.78, longitude: Infinity },
      { latitude: 37.79, longitude: -122.41 },
    ];
    const plane = projectRouteToPlane(withGarbage);
    expect(plane).toHaveLength(2);
    expect(plane.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  });

  it('returns an empty array for an empty or fully-invalid input', () => {
    expect(projectRouteToPlane([])).toEqual([]);
    expect(projectRouteToPlane([{ latitude: NaN, longitude: NaN }])).toEqual([]);
  });
});

describe('fitPointsToArea (route fitting)', () => {
  it('fits every point within the target area bounds', () => {
    const plane = projectRouteToPlane(NORTH_SOUTH_ROUTE);
    const area = { width: 400, height: 600 };
    const fitted = fitPointsToArea(plane, area);

    for (const p of fitted) {
      expect(p.x).toBeGreaterThanOrEqual(-0.001);
      expect(p.x).toBeLessThanOrEqual(area.width + 0.001);
      expect(p.y).toBeGreaterThanOrEqual(-0.001);
      expect(p.y).toBeLessThanOrEqual(area.height + 0.001);
    }
  });

  it('handles a degenerate (single-point / zero-span) route without NaN or Infinity', () => {
    const fitted = fitPointsToArea([{ x: 5, y: 5 }], { width: 300, height: 300 });
    expect(fitted).toHaveLength(1);
    expect(Number.isFinite(fitted[0].x)).toBe(true);
    expect(Number.isFinite(fitted[0].y)).toBe(true);
  });

  it('handles a perfectly straight vertical line (zero x-span) without dividing by zero', () => {
    const straight = [{ x: 10, y: 0 }, { x: 10, y: 5 }, { x: 10, y: 10 }];
    const fitted = fitPointsToArea(straight, { width: 300, height: 300 });
    // All x values should collapse to the same (centered) x.
    expect(fitted.every((p) => Math.abs(p.x - fitted[0].x) < 0.001)).toBe(true);
    expect(fitted.every((p) => Number.isFinite(p.y))).toBe(true);
  });

  it('returns an empty array for empty input', () => {
    expect(fitPointsToArea([], { width: 100, height: 100 })).toEqual([]);
  });
});

describe('aspect-ratio preservation', () => {
  function aspectRatioOf(points: { x: number; y: number }[]) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    return spanX / spanY;
  }

  it('a north-south route stays taller than wide after fitting into a wide area', () => {
    const plane = projectRouteToPlane(NORTH_SOUTH_ROUTE);
    const trueAspect = aspectRatioOf(plane);

    // Fit into a WIDE area (would be wrong to stretch the route to fill it).
    const fitted = fitPointsToArea(plane, { width: 1000, height: 300 });
    const fittedAspect = aspectRatioOf(fitted);

    expect(trueAspect).toBeLessThan(1); // taller than wide
    expect(fittedAspect).toBeCloseTo(trueAspect, 5);
  });

  it('an east-west route stays wider than tall after fitting into a tall area', () => {
    const plane = projectRouteToPlane(EAST_WEST_ROUTE);
    const trueAspect = aspectRatioOf(plane);

    // Fit into a TALL area (would be wrong to stretch the route to fill it).
    const fitted = fitPointsToArea(plane, { width: 300, height: 1000 });
    const fittedAspect = aspectRatioOf(fitted);

    expect(trueAspect).toBeGreaterThan(1); // wider than tall
    expect(fittedAspect).toBeCloseTo(trueAspect, 5);
  });

  it('preserves aspect ratio identically across all three export formats', () => {
    const plane = projectRouteToPlane(NORTH_SOUTH_ROUTE);
    const trueAspect = aspectRatioOf(plane);

    const areas = [
      { width: 1080, height: 1920 }, // story 9:16
      { width: 1080, height: 1350 }, // feed 4:5
      { width: 1080, height: 608 },  // landscape 16:9
    ];

    for (const area of areas) {
      const fitted = fitPointsToArea(plane, area);
      expect(aspectRatioOf(fitted)).toBeCloseTo(trueAspect, 5);
    }
  });
});

describe('computeRouteSafeArea', () => {
  it('keeps the safe band strictly between the header and footer clearances', () => {
    const area = computeRouteSafeArea(1080, 1920, DEFAULT_PLACEMENT);
    expect(area.y).toBeGreaterThanOrEqual(ROUTE_HEADER_CLEARANCE_PX);
    expect(area.y + area.height).toBeLessThanOrEqual(1920 - ROUTE_FOOTER_CLEARANCE_PX + 0.001);
  });

  it('never produces a negative-height band even on a very short (landscape) card', () => {
    const area = computeRouteSafeArea(1080, 608, DEFAULT_PLACEMENT);
    expect(area.height).toBeGreaterThanOrEqual(0);
  });

  it('scales the safe band correctly across all three export formats', () => {
    const story = computeRouteSafeArea(1080, 1920, DEFAULT_PLACEMENT);
    const feed = computeRouteSafeArea(1080, 1350, DEFAULT_PLACEMENT);
    const landscape = computeRouteSafeArea(1080, 608, DEFAULT_PLACEMENT);

    // Header/footer clearance is a fixed pixel budget, so the tallest card
    // must have the tallest safe band.
    expect(story.height).toBeGreaterThan(feed.height);
    expect(feed.height).toBeGreaterThan(landscape.height);
  });
});

describe('isRouteRenderable (invalid/insufficient route handling)', () => {
  it('rejects an empty route', () => {
    expect(isRouteRenderable([])).toBe(false);
  });

  it('rejects a single-point route', () => {
    expect(isRouteRenderable([{ latitude: 37.7749, longitude: -122.4194 }])).toBe(false);
  });

  it('rejects a route where the car never really moved (GPS jitter only)', () => {
    const stationary: GeoPoint[] = [
      { latitude: 37.774900, longitude: -122.419400 },
      { latitude: 37.774901, longitude: -122.419399 },
      { latitude: 37.774899, longitude: -122.419401 },
    ];
    expect(isRouteRenderable(stationary)).toBe(false);
  });

  it('rejects a route made entirely of invalid coordinates', () => {
    expect(isRouteRenderable([{ latitude: NaN, longitude: NaN }, { latitude: Infinity, longitude: 1 }])).toBe(false);
  });

  it('accepts a real, multi-point route that actually moved', () => {
    expect(isRouteRenderable(NORTH_SOUTH_ROUTE)).toBe(true);
  });
});

describe('computeRouteRenderPoints (orchestration + WYSIWYG guarantee)', () => {
  it('returns null for an unrenderable route instead of degenerate geometry', () => {
    expect(computeRouteRenderPoints([], 1080, 1920, DEFAULT_PLACEMENT)).toBeNull();
    expect(computeRouteRenderPoints([{ latitude: 1, longitude: 1 }], 1080, 1920, DEFAULT_PLACEMENT)).toBeNull();
  });

  it('returns pixel points fully inside the card for a valid route', () => {
    const points = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT);
    expect(points).not.toBeNull();
    for (const p of points!) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1080);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1920);
    }
  });

  it('never places a point inside the header or footer clearance', () => {
    const points = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT);
    for (const p of points!) {
      expect(p.y).toBeGreaterThanOrEqual(ROUTE_HEADER_CLEARANCE_PX - 0.001);
      expect(p.y).toBeLessThanOrEqual(1920 - ROUTE_FOOTER_CLEARANCE_PX + 0.001);
    }
  });

  it('produces byte-identical output for identical inputs - the WYSIWYG guarantee', () => {
    // This is exactly what JourneyComposerScreen does: the preview instance
    // and the hidden capture instance both call this with the same
    // (points, captureWidth, captureHeight, placement). If this test ever
    // fails, the preview and the export can visually diverge.
    const a = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT);
    const b = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT);
    expect(a).toEqual(b);
  });

  it('produces correctly different (but each internally consistent) layouts per export format', () => {
    const story = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT)!;
    const landscape = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 608, DEFAULT_PLACEMENT)!;
    expect(story).not.toEqual(landscape);
    // Both must still respect their own card's footer clearance.
    expect(Math.max(...story.map((p) => p.y))).toBeLessThanOrEqual(1920 - ROUTE_FOOTER_CLEARANCE_PX + 0.001);
    expect(Math.max(...landscape.map((p) => p.y))).toBeLessThanOrEqual(608 - ROUTE_FOOTER_CLEARANCE_PX + 0.001);
  });

  it('start and end render points correspond to the first and last input points', () => {
    const points = computeRouteRenderPoints(NORTH_SOUTH_ROUTE, 1080, 1920, DEFAULT_PLACEMENT)!;
    // The route runs south-to-north (see NORTH_SOUTH_ROUTE), so the end
    // point must be visually higher (smaller y) than the start point.
    expect(points[points.length - 1].y).toBeLessThan(points[0].y);
  });
});
