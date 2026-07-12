import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// @ts-ignore
import { storage } from '../lib/mmkv';
import { LocationService } from '../services/LocationService';
import { TelemetryPoint, getDistance, MIN_MOVING_SPEED_MS } from '../utils/geoUtils';
import { SyncWorker } from '../services/SyncWorker';

type DriveStateStatus = 'IDLE' | 'STARTING' | 'RECORDING' | 'PAUSED' | 'COMPLETED';

interface DriveState {
  status: DriveStateStatus;
  currentDriveId: string | null;
  startTime: number | null;
  // ACTIVE RECORDING TIME in seconds: wall-clock elapsed between start and
  // stop, minus any paused intervals (totalPausedMs). This is what gets
  // persisted as drives.duration_s. It is NOT total elapsed wall-clock time
  // whenever a pause occurred — those are only equal when the drive was
  // never paused, which today is every drive, since pauseDrive/resumeDrive
  // are not yet wired to any UI control.
  durationSeconds: number;
  distanceMeters: number;
  telemetryPoints: TelemetryPoint[];
  // Timestamp (Date.now()) the drive most recently entered PAUSED, or null
  // when not currently paused. Used with totalPausedMs to exclude paused
  // wall-clock time from durationSeconds.
  pausedAt: number | null;
  // Sum of all completed (resumed) paused intervals in this drive, in ms.
  totalPausedMs: number;

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
      pausedAt: null,
      totalPausedMs: 0,

      startDrive: async () => {
        set({
          status: 'STARTING',
          currentDriveId: 'temp-' + Date.now(),
          startTime: Date.now(),
          telemetryPoints: [],
          distanceMeters: 0,
          durationSeconds: 0,
          pausedAt: null,
          totalPausedMs: 0,
        });
        await LocationService.startBackgroundUpdates();
        set({ status: 'RECORDING' });
      },

      pauseDrive: () => {
        const state = get();
        if (state.status !== 'RECORDING') return;
        // LocationService keeps delivering background updates while paused;
        // they're dropped by LocationService's own `status === 'RECORDING'`
        // gate, so telemetry/distance naturally stop accumulating here too.
        set({ status: 'PAUSED', pausedAt: Date.now() });
      },

      resumeDrive: () => {
        const state = get();
        if (state.status !== 'PAUSED') return;
        const elapsedPausedMs = state.pausedAt ? Date.now() - state.pausedAt : 0;
        set({
          status: 'RECORDING',
          pausedAt: null,
          totalPausedMs: state.totalPausedMs + elapsedPausedMs,
        });
      },

      stopDrive: async () => {
        const state = get();
        await LocationService.stopBackgroundUpdates();

        // Settle a still-open paused interval defensively (stopDrive is only
        // reachable from RECORDING via the current UI, but this keeps the
        // math correct if a stop-while-paused path is ever added).
        const openPauseMs = state.status === 'PAUSED' && state.pausedAt
          ? Date.now() - state.pausedAt
          : 0;
        const totalPausedMs = state.totalPausedMs + openPauseMs;

        // Active recording time = wall-clock elapsed since start, minus all
        // paused intervals. See the durationSeconds doc comment above.
        const durationSeconds = state.startTime
          ? Math.max(0, Math.floor((Date.now() - state.startTime - totalPausedMs) / 1000))
          : 0;

        set({ status: 'COMPLETED', durationSeconds, pausedAt: null, totalPausedMs });

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
        // Only accumulate distance while the device reports it's actually
        // moving. Below MIN_MOVING_SPEED_MS, a nonzero position delta between
        // consecutive fixes is GPS jitter (e.g. a parked car), not travel —
        // counting it would silently inflate distance on every stationary
        // stretch of a drive (traffic lights, parking, red lights).
        const isMoving = point.speed_ms >= MIN_MOVING_SPEED_MS;
        const incrementalDistance = lastPoint && isMoving ? getDistance(lastPoint, point) : 0;
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
        telemetryPoints: [],
        pausedAt: null,
        totalPausedMs: 0,
      })
    }),
    {
      name: 'drive-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
