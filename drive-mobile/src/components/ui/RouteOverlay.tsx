import React from 'react';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { GeoPoint } from '../../utils/geoUtils';
import { computeRouteRenderPoints, RoutePlacement } from '../../utils/routeGeometry';
import { RouteStyleConfig } from '../../lib/themeEngine';

interface RouteOverlayProps {
  points: GeoPoint[];
  cardWidth: number;
  cardHeight: number;
  config: RouteStyleConfig;
}

// Local-only SVG route rendering — no static-map API, no network image, no
// paid service. Draws directly over whatever background (a user photo or
// the theme's overlay color) ShareTplCard already has. Renders nothing if
// the route has too few points or didn't really move (see
// computeRouteRenderPoints / isRouteRenderable) instead of showing a
// broken placeholder.
export function RouteOverlay({ points, cardWidth, cardHeight, config }: RouteOverlayProps) {
  const placement: RoutePlacement = config.placement;
  const routePoints = computeRouteRenderPoints(points, cardWidth, cardHeight, placement);

  if (!routePoints || routePoints.length < 2) return null;

  const pointsAttr = routePoints.map((p) => `${p.x},${p.y}`).join(' ');
  const start = routePoints[0];
  const end = routePoints[routePoints.length - 1];
  const dashArray = config.lineStyle === 'dashed' ? (config.dashPattern ?? [14, 8]).join(',') : undefined;

  return (
    <Svg
      width={cardWidth}
      height={cardHeight}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      {config.glow && (
        <Polyline
          points={pointsAttr}
          fill="none"
          stroke={config.glowColor ?? config.strokeColor}
          strokeWidth={config.strokeWidth + (config.glowWidth ?? config.strokeWidth * 2)}
          strokeOpacity={config.glowOpacity ?? 0.35}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <Polyline
        points={pointsAttr}
        fill="none"
        stroke={config.strokeColor}
        strokeWidth={config.strokeWidth}
        strokeOpacity={config.opacity}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {config.showMarkers && (
        <>
          <Circle cx={start.x} cy={start.y} r={config.markerRadius} fill={config.startMarkerColor} />
          <Circle cx={end.x} cy={end.y} r={config.markerRadius} fill={config.endMarkerColor} />
        </>
      )}
    </Svg>
  );
}
