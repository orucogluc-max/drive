CREATE TABLE vehicle_modifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN ('engine', 'exhaust', 'suspension', 'brakes', 'wheels_tires', 'exterior', 'interior', 'electronics', 'other')),
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  brand           TEXT,
  description     TEXT CHECK (length(description) <= 500),
  hp_delta        INTEGER,
  weight_delta_kg INTEGER,
  installed_at    DATE,
  installed_km    INTEGER,
  cost            DECIMAL(10,2),
  currency        CHAR(3) DEFAULT 'TRY',
  photo_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mods_vehicle ON vehicle_modifications(vehicle_id);
CREATE INDEX idx_mods_category ON vehicle_modifications(category);

ALTER TABLE vehicle_modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mods_select_accessible" ON vehicle_modifications FOR SELECT USING (EXISTS (SELECT 1 FROM vehicles v JOIN profiles p ON p.id = v.owner_id WHERE v.id = vehicle_modifications.vehicle_id AND (v.owner_id = auth.uid() OR p.profile_visibility = 'public')));
CREATE POLICY "mods_insert_owner" ON vehicle_modifications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_modifications.vehicle_id AND vehicles.owner_id = auth.uid()));
CREATE POLICY "mods_update_owner" ON vehicle_modifications FOR UPDATE USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_modifications.vehicle_id AND vehicles.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_modifications.vehicle_id AND vehicles.owner_id = auth.uid()));
CREATE POLICY "mods_delete_owner" ON vehicle_modifications FOR DELETE USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_modifications.vehicle_id AND vehicles.owner_id = auth.uid()));
