CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make            TEXT NOT NULL CHECK (length(make) BETWEEN 1 AND 50),
  model           TEXT NOT NULL CHECK (length(model) BETWEEN 1 AND 80),
  year            INTEGER NOT NULL CHECK (year BETWEEN 1886 AND 2030),
  trim_level      TEXT,
  color           TEXT,
  license_plate   TEXT,
  vin             TEXT,
  engine_type     TEXT CHECK (engine_type IN ('gasoline', 'diesel', 'hybrid', 'electric', 'hydrogen', 'other')),
  horsepower      INTEGER,
  torque_nm       INTEGER,
  transmission    TEXT CHECK (transmission IN ('manual', 'automatic', 'dct', 'cvt', 'other')),
  drivetrain      TEXT CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
  curb_weight_kg  INTEGER,
  photo_url       TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  total_drives    INTEGER NOT NULL DEFAULT 0,
  total_distance_m DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);

CREATE TRIGGER set_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_select_own" ON vehicles FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "vehicles_select_public" ON vehicles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = vehicles.owner_id AND profiles.profile_visibility = 'public'));
CREATE POLICY "vehicles_insert_own" ON vehicles FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "vehicles_update_own" ON vehicles FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "vehicles_delete_own" ON vehicles FOR DELETE USING (owner_id = auth.uid());
