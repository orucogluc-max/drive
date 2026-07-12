import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// @ts-ignore
import { storage } from '../lib/mmkv';
import { LocationService } from '../services/LocationService';
import { TelemetryPoint, getDistance } from '../utils/geoUtils';
import { SyncWorker } from '../services/SyncWorker';

type DriveStateStatus = 'IDLE' | 'STARTING' | 'RECORDING' | 'PAUSED' | 'COMPLETED';

interface DriveState {
  status: DriveStateStatus;
  currentDriveId: string | null;
  startTime: number | null;
  durationSeconds: number;
  distanceMeters: number;
  telemetryPoints: TelemetryPoint[];
  
  // Actions
  startDrive: () => Promise<void>;
  pauseDrive: () => void;
  resumeDrive: () => void;
  stopDrive: () => Promise<void>;
  addTelemetry: (point: TelemetryPoint) => void;
  resetDrive: () => void;
}

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

export const useDriveStore = create<DriveState>()(
  persist(
    (set, get) => ({
      status: 'IDLE',
      currentDriveId: null,
      startTime: null,
      durationSeconds: 0,
      distanceMeters: 0,
      telemetryPoints: [],

      startDrive: async () => {
        set({ 
          status: 'STARTING', 
          currentDriveId: 'temp-' + Date.now(),
          startTime: Date.now(),
          telemetryPoints: [],
          distanceMeters: 0,
          durationSeconds: 0
        });
        await LocationService.startBackgroundUpdates();
        set({ status: 'RECORDING' });
      },
      
      pauseDrive: () => {
        // We might want to stop GPS updates here to save battery, but for now just change state
        set({ status: 'PAUSED' });
      },
      
      resumeDrive: () => set({ status: 'RECORDING' }),
      
      stopDrive: async () => {
        const state = get();
        await LocationService.stopBackgroundUpdates();

        const durationSeconds = state.startTime
          ? Math.max(0, Math.floor((Date.now() - state.startTime) / 1000))
          : 0;

        set({ status: 'COMPLETED', durationSeconds });

        if (state.currentDriveId && state.startTime) {
          SyncWorker.queueDriveForSync({
            drive_id: state.currentDriveId,
            points: state.telemetryPoints,
            start_time: state.startTime,
            end_time: Date.now(),
            distance_meters: state.distanceMeters,
            duration_seconds: durationSeconds,
          });
        }
      },

      addTelemetry: (point) => set((state) => {
        const lastPoint = state.telemetryPoints[state.telemetryPoints.length - 1];
        const incrementalDistance = lastPoint ? getDistance(lastPoint, point) : 0;
        return {
          telemetryPoints: [...state.telemetryPoints, point],
          distanceMeters: state.distanceMeters + incrementalDistance,
        };
      }),

      resetDrive: () => set({
        status: 'IDLE',
        currentDriveId: null,
        startTime: null,
        durationSeconds: 0,
        distanceMeters: 0,
        telemetryPoints: []
      })
    }),
    {
      name: 'drive-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
