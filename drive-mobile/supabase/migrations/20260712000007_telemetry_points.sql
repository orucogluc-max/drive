CREATE TABLE telemetry_points (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  timestamp       TIMESTAMPTZ NOT NULL,
  location        geography(Point, 4326) NOT NULL,
  altitude_m      DOUBLE PRECISION,
  speed_ms        DOUBLE PRECISION,
  heading         DOUBLE PRECISION,
  horizontal_accuracy_m DOUBLE PRECISION,
  vertical_accuracy_m   DOUBLE PRECISION,
  accel_x         REAL,
  accel_y         REAL,
  accel_z         REAL,
  gyro_x          REAL,
  gyro_y          REAL,
  gyro_z          REAL,
  lateral_g       REAL,
  longitudinal_g  REAL,
  sequence_num    INTEGER NOT NULL,
  UNIQUE (drive_id, sequence_num)
);

CREATE INDEX idx_telemetry_drive ON telemetry_points(drive_id);
CREATE INDEX idx_telemetry_drive_seq ON telemetry_points(drive_id, sequence_num);
CREATE INDEX idx_telemetry_timestamp ON telemetry_points(timestamp);

ALTER TABLE telemetry_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "telemetry_insert_own" ON telemetry_points FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM drives WHERE drives.id = telemetry_points.drive_id AND drives.user_id = auth.uid()));
CREATE POLICY "telemetry_select_own" ON telemetry_points FOR SELECT USING (EXISTS (SELECT 1 FROM drives WHERE drives.id = telemetry_points.drive_id AND drives.user_id = auth.uid()));
CREATE POLICY "telemetry_select_public" ON telemetry_points FOR SELECT USING (EXISTS (SELECT 1 FROM drives WHERE drives.id = telemetry_points.drive_id AND drives.visibility = 'public' AND drives.status = 'completed'));
