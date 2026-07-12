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
