import { GeoPoint, simplifyPolyline } from './geoUtils';

export interface PlanePoint {
  x: number;
  y: number;
}

export interface AreaSize {
  width: number;
  height: number;
}

export interface SafeAreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Placement of the route within the card's safe (header/footer-excluded)
// band, all as fractions in [0, 1] of that band's own width/height — not of
// the whole card. This is what makes a theme's placement config work
// identically across every export format: the safe band's actual pixel
// height already varies correctly per format (see computeRouteSafeArea),
// so a theme only ever has to say "how much of the available space" and
// "where within it," never a format-specific pixel value.
export interface RoutePlacement {
  top: number;
  left: number;
  width: number;
  height: number;
}

// --- 1. Geographic projection -----------------------------------------
//
// Converts lat/lon into a flat local coordinate system where one unit on
// the x axis and one unit on the y axis represent equal real-world
// distance. Longitude degrees shrink toward the poles (a degree of
// longitude is shorter than a degree of latitude away from the equator),
// so we correct for that with cos(avgLatitude) — a standard local
// equirectangular ("Plate Carrée") projection. This is accurate enough for
// a single drive (tens of km at most) and is exactly the "format-independent
// design coordinate system" the route fitting step below operates on: it
// depends only on geography, never on any card's pixel dimensions.
export function projectRouteToPlane(points: GeoPoint[]): PlanePoint[] {
  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );
  if (valid.length === 0) return [];

  const avgLat = valid.reduce((sum, p) => sum + p.latitude, 0) / valid.length;
  const lonScale = Math.cos((avgLat * Math.PI) / 180);

  const minLon = Math.min(...valid.map((p) => p.longitude));
  const maxLat = Math.max(...valid.map((p) => p.latitude));

  return valid.map((p) => ({
    x: (p.longitude - minLon) * lonScale,
    // Flip so increasing latitude (north) moves up the screen (decreasing
    // y), matching how the route would actually look on a north-up map.
    y: maxLat - p.latitude,
  }));
}

// --- 2. Fit-and-center ("contain") --------------------------------------
//
// Scales the projected point cloud by a single uniform factor (never
// separate x/y factors, which would distort the route's true shape) so it
// fits entirely within `area`, then centers it. This is what "automatically
// fit and center the complete route while preserving its geographic
// proportions" means in practice.
export function fitPointsToArea(points: PlanePoint[], area: AreaSize): PlanePoint[] {
  if (points.length === 0) return [];

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  const scaleX = spanX > 0 ? area.width / spanX : Infinity;
  const scaleY = spanY > 0 ? area.height / spanY : Infinity;
  const rawScale = Math.min(scaleX, scaleY);
  // Both spans are 0 (a single point / no real movement) -> both scales are
  // Infinity; fall back to 1 rather than producing Infinity/NaN geometry.
  const scale = Number.isFinite(rawScale) ? rawScale : 1;

  const offsetX = (area.width - spanX * scale) / 2;
  const offsetY = (area.height - spanY * scale) / 2;

  return points.map((p) => ({
    x: (p.x - minX) * scale + offsetX,
    y: (p.y - minY) * scale + offsetY,
  }));
}

// --- 3. Safe area ---------------------------------------------------------
//
// Conservative, fixed pixel clearance reserved for ShareTplCard's header
// (title + "STORY BY @username" line) and footer (distance/duration stat
// boxes + the bottom-right watermark). Deliberately generous to safely
// cover the largest layout variant across all 20 themes (the 'magazine'
// layout's 48px title, the 'minimal' layout's extra "DRIVE APP" footer
// row), not measured on a device. Card width is always 1080 regardless of
// export format (see exportFormat.ts) — only height varies — so these two
// constants alone are what makes the safe band correct on 9:16, 4:5 and
// 16:9 without any per-format special-casing.
export const ROUTE_HEADER_CLEARANCE_PX = 140;
export const ROUTE_FOOTER_CLEARANCE_PX = 150;

export function computeRouteSafeArea(
  cardWidth: number,
  cardHeight: number,
  placement: RoutePlacement
): SafeAreaRect {
  const bandHeight = Math.max(
    0,
    cardHeight - ROUTE_HEADER_CLEARANCE_PX - ROUTE_FOOTER_CLEARANCE_PX
  );

  return {
    x: placement.left * cardWidth,
    y: ROUTE_HEADER_CLEARANCE_PX + placement.top * bandHeight,
    width: placement.width * cardWidth,
    height: placement.height * bandHeight,
  };
}

// --- 4. Renderability guard ----------------------------------------------
//
// Below this span, consecutive points are indistinguishable from GPS drift
// (a parked/idle car), and drawing a "route" would be visually meaningless.
// ~10 meters, expressed in the same locally-corrected degree units
// projectRouteToPlane produces (1 degree of latitude ~= 111,320m).
export const MIN_ROUTE_SPAN_DEGREES = 10 / 111_320;

export function isRouteRenderable(points: GeoPoint[]): boolean {
  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );
  if (valid.length < 2) return false;

  const projected = projectRouteToPlane(valid);
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);

  return Math.max(spanX, spanY) >= MIN_ROUTE_SPAN_DEGREES;
}

// --- 5. Orchestration ------------------------------------------------------
//
// GPS jitter tolerance for the Douglas-Peucker simplification pass, in the
// same locally-corrected degree units as projectRouteToPlane (~8 meters).
// Deliberately a fresh, correctly-derived constant rather than reusing
// SyncWorker's `simplifyPolyline(points, 5)` call — that "5" is 5 *degrees*
// (~555km), which would collapse almost any real route to a straight line;
// it's a pre-existing, unrelated issue in SyncWorker, not something this
// change touches.
export const ROUTE_SIMPLIFY_EPSILON_DEGREES = 8 / 111_320;

// The single function RouteOverlay calls: raw GPS points in, final
// card-absolute pixel coordinates out (or null if the route shouldn't be
// drawn at all). Depends only on its arguments, so calling it with the same
// (points, cardWidth, cardHeight, placement) always produces identical
// output — which is exactly what guarantees the preview and the export stay
// pixel-proportionally identical: both call this with the same
// captureWidth/captureHeight, just rendered at different on-screen scales.
export function computeRouteRenderPoints(
  points: GeoPoint[],
  cardWidth: number,
  cardHeight: number,
  placement: RoutePlacement
): PlanePoint[] | null {
  if (!isRouteRenderable(points)) return null;

  const valid = points.filter(
    (p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
  );
  const simplified = simplifyPolyline(valid, ROUTE_SIMPLIFY_EPSILON_DEGREES);
  const projected = projectRouteToPlane(simplified);
  const safeArea = computeRouteSafeArea(cardWidth, cardHeight, placement);
  const fitted = fitPointsToArea(projected, { width: safeArea.width, height: safeArea.height });

  return fitted.map((p) => ({ x: p.x + safeArea.x, y: p.y + safeArea.y }));
}
