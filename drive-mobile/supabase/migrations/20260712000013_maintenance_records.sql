CREATE TABLE maintenance_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('oil_change', 'tire_change', 'brake_service', 'filter_change', 'battery', 'inspection', 'repair', 'recall', 'other')),
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  description     TEXT CHECK (length(description) <= 500),
  performed_at    DATE NOT NULL,
  odometer_km     INTEGER,
  cost            DECIMAL(10,2),
  currency        CHAR(3) DEFAULT 'TRY',
  next_service_km INTEGER,
  next_service_date DATE,
  shop_name       TEXT,
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance_records(performed_at DESC);
CREATE INDEX idx_maintenance_next ON maintenance_records(next_service_date) WHERE next_service_date IS NOT NULL;

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_manage_owner" ON maintenance_records FOR ALL USING (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = maintenance_records.vehicle_id AND vehicles.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = maintenance_records.vehicle_id AND vehicles.owner_id = auth.uid()));
CREATE POLICY "maintenance_select_accessible" ON maintenance_records FOR SELECT USING (EXISTS (SELECT 1 FROM vehicles v JOIN profiles p ON p.id = v.owner_id WHERE v.id = maintenance_records.vehicle_id AND (v.owner_id = auth.uid() OR p.profile_visibility = 'public')));
