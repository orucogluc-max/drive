import { supabase } from '../lib/supabase';
import { TelemetryPoint, simplifyPolyline, obfuscateLocation, GeoPoint } from '../utils/geoUtils';
// @ts-ignore
import { storage } from '../lib/mmkv';

export interface DrivePayload {
  drive_id: string;
  points: TelemetryPoint[];
  start_time: number;
  end_time: number;
  distance_meters: number;
  duration_seconds: number;
}

export const SyncWorker = {
  queueDriveForSync: (payload: DrivePayload) => {
    // 1. Save to MMKV queue
    const queueStr = storage.getString('sync_queue');
    const queue: DrivePayload[] = queueStr ? JSON.parse(queueStr) : [];
    queue.push(payload);
    storage.set('sync_queue', JSON.stringify(queue));
    
    // 2. Try to sync immediately
    SyncWorker.syncNow();
  },

  syncNow: async () => {
    const queueStr = storage.getString('sync_queue');
    if (!queueStr) return;

    const queue: DrivePayload[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    const remainingQueue: DrivePayload[] = [];

    for (const drive of queue) {
      try {
        // 1. Simplify polyline using Douglas-Peucker (epsilon = 5 meters)
        let optimizedPoints = simplifyPolyline(drive.points, 5);

        // 2. Obfuscate start/end for privacy (Optional: user setting dependent)
        if (optimizedPoints.length > 2) {
           optimizedPoints[0] = { ...optimizedPoints[0], ...obfuscateLocation(optimizedPoints[0].latitude, optimizedPoints[0].longitude, 300) };
           optimizedPoints[optimizedPoints.length - 1] = { ...optimizedPoints[optimizedPoints.length - 1], ...obfuscateLocation(optimizedPoints[optimizedPoints.length - 1].latitude, optimizedPoints[optimizedPoints.length - 1].longitude, 300) };
        }

        // Convert to GeoJSON LineString
        const route_line = {
          type: "LineString",
          coordinates: optimizedPoints.map(p => [p.longitude, p.latitude])
        };

        // Calculate summary for Edge Function
        let totalG = 0;
        let totalVerticalG = 0;
        drive.points.forEach(p => {
          totalG += Math.sqrt((p as any).accel_x**2 + (p as any).accel_y**2) || 0;
          totalVerticalG += Math.abs(((p as any).accel_z || 1) - 1.0);
        });

        const summary = {
          avgG: drive.points.length > 0 ? totalG / drive.points.length : 0,
          stdDevSpeed: 2.5, // Mocked for now
          avgVerticalG: drive.points.length > 0 ? totalVerticalG / drive.points.length : 0,
        };

        // 3. Upsert to Supabase Drives table
        const { error: insertError } = await supabase.from('drives').upsert({
          id: drive.drive_id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'processing',
          started_at: new Date(drive.start_time).toISOString(),
          ended_at: new Date(drive.end_time).toISOString(),
          distance_m: drive.distance_meters,
          duration_s: drive.duration_seconds,
          // PostGIS handles GeoJSON cast
          // route_line: route_line as any
        });

        if (insertError) throw insertError;

        // 4. Invoke Edge Function
        const { error: fnError } = await supabase.functions.invoke('process-drive', {
          body: { drive_id: drive.drive_id, telemetry_summary: summary }
        });

        if (fnError) throw fnError;

        console.log(`Synced drive: ${drive.drive_id}`);

      } catch (err) {
        console.error(`Failed to sync drive ${drive.drive_id}:`, err);
        // Put back in queue
        remainingQueue.push(drive);
      }
    }

    // Update queue with remaining failed items
    storage.set('sync_queue', JSON.stringify(remainingQueue));
  }
};
