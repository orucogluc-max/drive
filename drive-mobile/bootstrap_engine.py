import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

files = {
    "src/utils/scoreEngine.ts": """
// SPRINT 2: Drive Score Engine
// Bu algoritma, hiz yerine surus kalitesini olcer.

interface TelemetryPoint {
  speed_ms: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
}

export function calculateDriveScore(telemetry: TelemetryPoint[]) {
  if (telemetry.length < 10) {
    return {
      smoothness: 0,
      consistency: 0,
      comfort: 0,
      efficiency: 0,
      overall: 0,
    };
  }

  let totalGForce = 0;
  let totalVerticalG = 0;
  let speedVariance = 0;
  let totalSpeed = 0;

  telemetry.forEach(point => {
    // Akicilik (Smoothness) icin yatay G kuvvetleri (fren/hizlanma/viraj)
    const horizontalG = Math.sqrt(point.accel_x ** 2 + point.accel_y ** 2);
    totalGForce += horizontalG;

    // Konfor icin dikey (Z ekseni) G kuvveti sarsintilari (1g = normal yercekimi)
    const verticalG = Math.abs(point.accel_z - 1.0);
    totalVerticalG += verticalG;

    totalSpeed += point.speed_ms;
  });

  const avgSpeed = totalSpeed / telemetry.length;

  telemetry.forEach(point => {
    speedVariance += Math.pow(point.speed_ms - avgSpeed, 2);
  });
  const stdDevSpeed = Math.sqrt(speedVariance / telemetry.length);

  // Smoothness (Akicilik): G kuvveti ne kadar azsa o kadar iyi. Maksimum kabul edilebilir ortalama G = 0.3g
  const avgG = totalGForce / telemetry.length;
  let smoothness = 100 - (avgG / 0.3) * 100;
  smoothness = Math.max(0, Math.min(100, smoothness));

  // Comfort (Konfor): Dikey sarsintilar ne kadar azsa o kadar iyi.
  const avgVerticalG = totalVerticalG / telemetry.length;
  let comfort = 100 - (avgVerticalG / 0.15) * 100;
  comfort = Math.max(0, Math.min(100, comfort));

  // Consistency (Tutarlilik): Hiz standart sapmasi ne kadar dusukse o kadar kararli bir surus.
  // Varsayim: 5 m/s'lik bir sapma normaldir, ustu cezalandirilir.
  let consistency = 100 - (stdDevSpeed / 5) * 50;
  consistency = Math.max(0, Math.min(100, consistency));

  // Efficiency: Sabit hiz ve az G kuvveti kombini.
  const efficiency = (smoothness + consistency) / 2;

  // Overall Score (Genel Puan)
  const overall = (smoothness * 0.35) + (consistency * 0.25) + (comfort * 0.25) + (efficiency * 0.15);

  return {
    smoothness: Math.round(smoothness),
    consistency: Math.round(consistency),
    comfort: Math.round(comfort),
    efficiency: Math.round(efficiency),
    overall: Math.round(overall),
  };
}
""",
    "src/store/useDriveStore.ts": """
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../lib/mmkv';

type DriveStateStatus = 'IDLE' | 'STARTING' | 'RECORDING' | 'PAUSED' | 'COMPLETED';

interface DriveState {
  status: DriveStateStatus;
  currentDriveId: string | null;
  startTime: number | null;
  durationSeconds: number;
  distanceMeters: number;
  telemetryPoints: any[];
  
  // Actions
  startDrive: () => void;
  pauseDrive: () => void;
  resumeDrive: () => void;
  stopDrive: () => void;
  addTelemetry: (point: any) => void;
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

      startDrive: () => set({ 
        status: 'STARTING', 
        currentDriveId: 'temp-' + Date.now(),
        startTime: Date.now(),
        telemetryPoints: [],
        distanceMeters: 0,
        durationSeconds: 0
      }),
      
      pauseDrive: () => set({ status: 'PAUSED' }),
      
      resumeDrive: () => set({ status: 'RECORDING' }),
      
      stopDrive: () => set({ status: 'COMPLETED' }),

      addTelemetry: (point) => set((state) => ({
        telemetryPoints: [...state.telemetryPoints, point]
      })),

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
"""
}

for name, content in files.items():
    write_file(name, content)
