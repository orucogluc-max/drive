import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useDriveStore } from '../store/useDriveStore';
import { filterTelemetry, TelemetryPoint } from '../utils/geoUtils';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

// 1. Define the task in the global scope
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const store = useDriveStore.getState();
    
    if (store.status === 'RECORDING') {
      const lastPoint = store.telemetryPoints.length > 0 
        ? store.telemetryPoints[store.telemetryPoints.length - 1] 
        : null;

      locations.forEach(loc => {
        const point: TelemetryPoint = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
          speed_ms: loc.coords.speed || 0,
          accuracy: loc.coords.accuracy || 100,
          heading: loc.coords.heading || 0,
        };

        // 2. Apply filtering (Outlier & Accuracy Rejection)
        if (filterTelemetry(point, lastPoint)) {
          store.addTelemetry(point);
        } else {
          console.warn('Rejected outlier or low accuracy GPS point:', point);
        }
      });
    }
  }
});

// 3. Service methods to start/stop
export const LocationService = {
  startBackgroundUpdates: async () => {
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

    if (fgStatus === 'granted' && bgStatus === 'granted') {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
          foregroundService: {
            notificationTitle: "DRIVE is recording",
            notificationBody: "Your drive telemetry is being recorded in the background.",
            notificationColor: "#f97316",
          },
          showsBackgroundLocationIndicator: true,
          pausesUpdatesAutomatically: false, // Don't let OS aggressively pause us
        });
      }
    } else {
      console.error('Location permissions not granted for background tracking');
    }
  },

  stopBackgroundUpdates: async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  }
};
