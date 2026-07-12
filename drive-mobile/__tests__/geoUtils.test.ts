import { filterTelemetry, simplifyPolyline, GeoPoint } from '../src/utils/geoUtils';

describe('GeoUtils Telemetry Filter', () => {
  it('rejects points with accuracy worse than 30m', () => {
    const lastPoint = { latitude: 0, longitude: 0, timestamp: 0, speed_ms: 0, accuracy: 5, heading: 0 };
    const badPoint = { latitude: 0, longitude: 0, timestamp: 1000, speed_ms: 0, accuracy: 35, heading: 0 };
    
    expect(filterTelemetry(badPoint, lastPoint)).toBe(false);
  });

  it('rejects points that imply physically impossible speeds', () => {
    const lastPoint = { latitude: 0, longitude: 0, timestamp: 0, speed_ms: 10, accuracy: 5, heading: 0 };
    // 1 degree latitude is ~111km. Travelling that in 1 second is impossible.
    const impossiblePoint = { latitude: 1, longitude: 0, timestamp: 1000, speed_ms: 10, accuracy: 5, heading: 0 };
    
    expect(filterTelemetry(impossiblePoint, lastPoint)).toBe(false);
  });

  it('accepts valid points', () => {
    const lastPoint = { latitude: 40.7128, longitude: -74.0060, timestamp: 0, speed_ms: 15, accuracy: 5, heading: 0 };
    // Very small change, 1 second later
    const validPoint = { latitude: 40.7129, longitude: -74.0060, timestamp: 1000, speed_ms: 15, accuracy: 5, heading: 0 };
    
    expect(filterTelemetry(validPoint, lastPoint)).toBe(true);
  });
});

describe('Douglas-Peucker Polyline Simplification', () => {
  it('simplifies a straight line by removing middle points', () => {
    const points: GeoPoint[] = [
      { latitude: 0, longitude: 0 },
      { latitude: 0.5, longitude: 0 }, // redundant
      { latitude: 1, longitude: 0 },
    ];
    // Epsilon of 0.1 degrees
    const simplified = simplifyPolyline(points, 0.1);
    expect(simplified.length).toBe(2);
    expect(simplified[0].latitude).toBe(0);
    expect(simplified[1].latitude).toBe(1);
  });

  it('preserves sharp corners', () => {
    const points: GeoPoint[] = [
      { latitude: 0, longitude: 0 },
      { latitude: 1, longitude: 0 }, // sharp turn right
      { latitude: 1, longitude: 1 },
    ];
    // This forms a right angle, point 2 cannot be removed without massive error
    const simplified = simplifyPolyline(points, 0.1);
    expect(simplified.length).toBe(3);
  });
});
