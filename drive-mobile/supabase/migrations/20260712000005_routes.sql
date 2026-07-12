CREATE TABLE routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  description     TEXT CHECK (length(description) <= 2000),
  route_line      geography(LineString, 4326) NOT NULL,
  start_point     geography(Point, 4326) NOT NULL,
  distance_m      DOUBLE PRECISION NOT NULL,
  elevation_gain_m DOUBLE PRECISION,
  difficulty      TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert')),
  road_type       TEXT CHECK (road_type IN ('highway', 'country', 'mountain', 'coastal', 'urban', 'mixed')),
  surface_type    TEXT CHECK (surface_type IN ('asphalt', 'gravel', 'mixed')),
  avg_rating      DOUBLE PRECISION,
  review_count    INTEGER NOT NULL DEFAULT 0,
  drive_count     INTEGER NOT NULL DEFAULT 0,
  save_count      INTEGER NOT NULL DEFAULT 0,
  region          TEXT,
  country_code    CHAR(2),
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  visibility      TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_routes_creator ON routes(creator_id);
CREATE INDEX idx_routes_start_point ON routes USING GIST(start_point);
CREATE INDEX idx_routes_route_line ON routes USING GIST(route_line);
CREATE INDEX idx_routes_difficulty ON routes(difficulty);
CREATE INDEX idx_routes_road_type ON routes(road_type);
CREATE INDEX idx_routes_rating ON routes(avg_rating DESC NULLS LAST);
CREATE INDEX idx_routes_region ON routes(country_code, region);

CREATE TRIGGER set_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_select_public" ON routes FOR SELECT USING (visibility = 'public');
CREATE POLICY "routes_select_own" ON routes FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "routes_insert_own" ON routes FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "routes_update_own" ON routes FOR UPDATE USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "routes_delete_own" ON routes FOR DELETE USING (creator_id = auth.uid());
