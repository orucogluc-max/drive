import { useDriveStore } from '../src/store/useDriveStore';
import { LocationService } from '../src/services/LocationService';
import { SyncWorker } from '../src/services/SyncWorker';
import { MIN_MOVING_SPEED_MS } from '../src/utils/geoUtils';

// Mock the services
jest.mock('../src/services/LocationService', () => ({
  LocationService: {
    startBackgroundUpdates: jest.fn(),
    stopBackgroundUpdates: jest.fn(),
  }
}));

jest.mock('../src/services/SyncWorker', () => ({
  SyncWorker: {
    queueDriveForSync: jest.fn(),
  }
}));

describe('useDriveStore', () => {
  beforeEach(() => {
    useDriveStore.getState().resetDrive();
    jest.clearAllMocks();
  });

  it('starts a drive and triggers location service', async () => {
    const store = useDriveStore.getState();
    expect(store.status).toBe('IDLE');

    await store.startDrive();

    const updatedStore = useDriveStore.getState();
    expect(updatedStore.status).toBe('RECORDING');
    expect(updatedStore.currentDriveId).not.toBeNull();
    expect(LocationService.startBackgroundUpdates).toHaveBeenCalledTimes(1);
  });

  it('stops a drive and queues it for sync', async () => {
    const store = useDriveStore.getState();
    await store.startDrive();

    // Add a point to simulate driving
    useDriveStore.getState().addTelemetry({ latitude: 0, longitude: 0, timestamp: 0, speed_ms: 10, accuracy: 5, heading: 0 });

    await useDriveStore.getState().stopDrive();

    const finalStore = useDriveStore.getState();
    expect(finalStore.status).toBe('COMPLETED');
    expect(LocationService.stopBackgroundUpdates).toHaveBeenCalledTimes(1);
    expect(SyncWorker.queueDriveForSync).toHaveBeenCalledTimes(1);
  });

  describe('distance accumulation', () => {
    it('accumulates real haversine distance between two moving points', async () => {
      await useDriveStore.getState().startDrive();

      useDriveStore.getState().addTelemetry({
        latitude: 37.7749, longitude: -122.4194, timestamp: 0, speed_ms: 10, accuracy: 5, heading: 0,
      });
      useDriveStore.getState().addTelemetry({
        latitude: 37.7759, longitude: -122.4194, timestamp: 1000, speed_ms: 10, accuracy: 5, heading: 0,
      });

      // ~111m between these two points; assert generously to avoid coupling
      // the test to the exact haversine constant.
      expect(useDriveStore.getState().distanceMeters).toBeGreaterThan(50);
    });

    it('ignores GPS jitter while stationary (speed below MIN_MOVING_SPEED_MS)', async () => {
      await useDriveStore.getState().startDrive();

      useDriveStore.getState().addTelemetry({
        latitude: 37.7749, longitude: -122.4194, timestamp: 0, speed_ms: 0, accuracy: 5, heading: 0,
      });
      // Small position drift (~a few meters) typical of a parked GPS fix,
      // but the device reports it isn't moving.
      useDriveStore.getState().addTelemetry({
        latitude: 37.77491, longitude: -122.41941, timestamp: 1000, speed_ms: MIN_MOVING_SPEED_MS - 0.1, accuracy: 5, heading: 0,
      });

      expect(useDriveStore.getState().distanceMeters).toBe(0);
    });

    it('resumes accumulating once reported speed crosses the moving threshold again', async () => {
      await useDriveStore.getState().startDrive();

      useDriveStore.getState().addTelemetry({
        latitude: 37.7749, longitude: -122.4194, timestamp: 0, speed_ms: 0, accuracy: 5, heading: 0,
      });
      useDriveStore.getState().addTelemetry({
        latitude: 37.77491, longitude: -122.41941, timestamp: 1000, speed_ms: 0, accuracy: 5, heading: 0,
      });
      const distanceWhileParked = useDriveStore.getState().distanceMeters;

      useDriveStore.getState().addTelemetry({
        latitude: 37.7759, longitude: -122.4194, timestamp: 2000, speed_ms: 10, accuracy: 5, heading: 0,
      });

      expect(distanceWhileParked).toBe(0);
      expect(useDriveStore.getState().distanceMeters).toBeGreaterThan(50);
    });
  });

  describe('duration accumulation', () => {
    const REAL_DATE_NOW = Date.now;

    afterEach(() => {
      Date.now = REAL_DATE_NOW;
    });

    it('computes active duration as elapsed wall-clock time when never paused', async () => {
      let now = 1_000_000;
      Date.now = jest.fn(() => now);

      await useDriveStore.getState().startDrive();
      now += 30_000; // 30s later
      await useDriveStore.getState().stopDrive();

      expect(useDriveStore.getState().durationSeconds).toBe(30);
    });

    it('excludes paused wall-clock time from the persisted duration', async () => {
      let now = 1_000_000;
      Date.now = jest.fn(() => now);

      await useDriveStore.getState().startDrive();
      now += 10_000; // 10s active

      useDriveStore.getState().pauseDrive();
      now += 5_000; // 5s paused — must NOT count toward duration

      useDriveStore.getState().resumeDrive();
      now += 5_000; // 5s active

      await useDriveStore.getState().stopDrive();

      // 10s + 5s active = 15s active recording time; the 5s pause is excluded.
      expect(useDriveStore.getState().durationSeconds).toBe(15);
    });

    it('sends the same duration to SyncWorker that gets persisted locally', async () => {
      let now = 1_000_000;
      Date.now = jest.fn(() => now);

      await useDriveStore.getState().startDrive();
      now += 20_000;
      await useDriveStore.getState().stopDrive();

      expect(SyncWorker.queueDriveForSync).toHaveBeenCalledWith(
        expect.objectContaining({ duration_seconds: 20 })
      );
    });

    it('pauseDrive is a no-op when not currently recording', async () => {
      useDriveStore.getState().pauseDrive();
      expect(useDriveStore.getState().status).toBe('IDLE');
    });
  });
});
