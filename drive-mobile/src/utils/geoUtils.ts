export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface TelemetryPoint extends GeoPoint {
  timestamp: number;
  speed_ms: number;
  accuracy: number;
  heading: number;
}

// 1. Haversine Distance (Meters)
export function getDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (p1.latitude * Math.PI) / 180;
  const lat2 = (p2.latitude * Math.PI) / 180;
  const deltaLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const deltaLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 2. Perpendicular Distance for Douglas-Peucker
function perpendicularDistance(point: GeoPoint, lineStart: GeoPoint, lineEnd: GeoPoint): number {
  const x = point.longitude;
  const y = point.latitude;
  const x1 = lineStart.longitude;
  const y1 = lineStart.latitude;
  const x2 = lineEnd.longitude;
  const y2 = lineEnd.latitude;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;

  let param = -1;
  if (len_sq !== 0) {
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  // Approximating distance using Pythagorean theorem on degrees (fast but inaccurate for large distances)
  // For precise Douglas-Peucker on sphere, cross track distance should be used.
  // For small segments, Euclidean on degrees is usually acceptable.
  return Math.sqrt(dx * dx + dy * dy); 
}

// 3. Douglas-Peucker Polyline Simplification
export function simplifyPolyline<T extends GeoPoint>(points: T[], epsilon: number): T[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDistance) {
      index = i;
      maxDistance = dist;
    }
  }

  if (maxDistance > epsilon) {
    const left = simplifyPolyline(points.slice(0, index + 1), epsilon);
    const right = simplifyPolyline(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[end]];
  }
}

// 4. GPS Accuracy & Outlier Filter
export function filterTelemetry(currentPoint: TelemetryPoint, lastPoint: TelemetryPoint | null): boolean {
  // Reject if accuracy is worse than 30 meters
  if (currentPoint.accuracy > 30) return false;

  if (lastPoint) {
    const dist = getDistance(lastPoint, currentPoint);
    const timeDiffSeconds = (currentPoint.timestamp - lastPoint.timestamp) / 1000;
    
    if (timeDiffSeconds > 0) {
      const impliedSpeedMs = dist / timeDiffSeconds;
      // Reject if implied speed is > 300 km/h (83.3 m/s)
      if (impliedSpeedMs > 85) return false;
    }
  }

  return true;
}

// 5. Privacy Obfuscation (Randomize within radius)
export function obfuscateLocation(lat: number, lon: number, radiusMeters: number = 500): GeoPoint {
  const R = 6371e3; // Earth radius
  // Random radius and angle
  const r = radiusMeters * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;

  const dx = r * Math.cos(theta);
  const dy = r * Math.sin(theta);

  const newLat = lat + (dy / R) * (180 / Math.PI);
  const newLon = lon + (dx / R) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);

  return { latitude: newLat, longitude: newLon };
}
