import { useDriveStore } from '../src/store/useDriveStore';
import { LocationService } from '../src/services/LocationService';
import { SyncWorker } from '../src/services/SyncWorker';

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
});
