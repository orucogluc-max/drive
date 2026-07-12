CREATE TABLE drives (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'completed', 'failed', 'deleted')),
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ,
  duration_s        INTEGER,
  distance_m        DOUBLE PRECISION,
  start_location    geography(Point, 4326),
  end_location      geography(Point, 4326),
  route_line        geography(LineString, 4326),
  start_address     TEXT,
  end_address       TEXT,
  elevation_gain_m  DOUBLE PRECISION,
  elevation_loss_m  DOUBLE PRECISION,
  max_elevation_m   DOUBLE PRECISION,
  min_elevation_m   DOUBLE PRECISION,
  avg_speed_kmh     DOUBLE PRECISION,
  max_speed_kmh     DOUBLE PRECISION,
  score_smoothness  DOUBLE PRECISION CHECK (score_smoothness BETWEEN 0 AND 100),
  score_consistency DOUBLE PRECISION CHECK (score_consistency BETWEEN 0 AND 100),
  score_comfort     DOUBLE PRECISION CHECK (score_comfort BETWEEN 0 AND 100),
  score_completion  DOUBLE PRECISION CHECK (score_completion BETWEEN 0 AND 100),
  score_efficiency  DOUBLE PRECISION CHECK (score_efficiency BETWEEN 0 AND 100),
  score_overall     DOUBLE PRECISION CHECK (score_overall BETWEEN 0 AND 100),
  gps_quality       TEXT CHECK (gps_quality IN ('excellent', 'good', 'fair', 'poor')),
  sensor_quality    TEXT CHECK (sensor_quality IN ('excellent', 'good', 'fair', 'poor')),
  data_confidence   DOUBLE PRECISION CHECK (data_confidence BETWEEN 0 AND 1),
  telemetry_count   INTEGER NOT NULL DEFAULT 0,
  title             TEXT CHECK (length(title) <= 100),
  description       TEXT CHECK (length(description) <= 1000),
  visibility        TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  reaction_count    INTEGER NOT NULL DEFAULT 0,
  comment_count     INTEGER NOT NULL DEFAULT 0,
  weather_condition TEXT,
  temperature_c     DOUBLE PRECISION,
  route_id          UUID REFERENCES routes(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drives_user ON drives(user_id);
CREATE INDEX idx_drives_vehicle ON drives(vehicle_id);
CREATE INDEX idx_drives_status ON drives(status);
CREATE INDEX idx_drives_started_at ON drives(started_at DESC);
CREATE INDEX idx_drives_visibility_user ON drives(visibility, user_id);
CREATE INDEX idx_drives_route ON drives(route_id);
CREATE INDEX idx_drives_start_location ON drives USING GIST(start_location);
CREATE INDEX idx_drives_route_line ON drives USING GIST(route_line);

CREATE TRIGGER set_drives_updated_at BEFORE UPDATE ON drives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drives_all_own" ON drives FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "drives_select_public" ON drives FOR SELECT USING (visibility = 'public' AND status = 'completed');
CREATE POLICY "drives_select_followers" ON drives FOR SELECT USING (visibility = 'followers' AND status = 'completed' AND EXISTS (SELECT 1 FROM follows WHERE follows.following_id = drives.user_id AND follows.follower_id = auth.uid()));
