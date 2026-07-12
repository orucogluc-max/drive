-- 1. Club Events
CREATE TABLE club_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  creator_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL CHECK (length(title) BETWEEN 5 AND 100),
  description     TEXT CHECK (length(description) <= 1000),
  event_date      TIMESTAMPTZ NOT NULL,
  meeting_point   geography(Point, 4326),
  meeting_address TEXT,
  route_id        UUID REFERENCES routes(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_club_events_club ON club_events(club_id);
CREATE INDEX idx_club_events_date ON club_events(event_date);
CREATE TRIGGER set_club_events_updated_at BEFORE UPDATE ON club_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE club_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "club_events_select" ON club_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_events.club_id AND clubs.is_public = TRUE)
  OR EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_events.club_id AND cm.user_id = auth.uid())
);
CREATE POLICY "club_events_insert_admin" ON club_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_events.club_id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin'))
);

-- Add event tracking to drives
ALTER TABLE drives ADD COLUMN event_id UUID REFERENCES club_events(id) ON DELETE SET NULL;
CREATE INDEX idx_drives_event ON drives(event_id);

-- 2. Drive Insights (Deterministik kural motoru çıktıları)
CREATE TABLE drive_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id         TEXT NOT NULL,
  metric_name     TEXT NOT NULL,
  message         TEXT NOT NULL,
  importance      TEXT NOT NULL DEFAULT 'info' CHECK (importance IN ('info', 'success', 'warning')),
  confidence      DOUBLE PRECISION CHECK (confidence BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drive_insights_drive ON drive_insights(drive_id);
CREATE INDEX idx_drive_insights_user ON drive_insights(user_id);

ALTER TABLE drive_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drive_insights_select_own" ON drive_insights FOR SELECT USING (user_id = auth.uid());
-- Only edge functions should write to drive_insights, so we leave insert/update protected via service role.

-- 3. Profile Stats (Cache for dashboard aggregations)
ALTER TABLE profiles ADD COLUMN weekly_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN monthly_stats JSONB DEFAULT '{}'::jsonb;

-- 4. Vehicle Maintenance Log
CREATE TABLE vehicle_maintenance_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type    TEXT NOT NULL,
  service_date    DATE NOT NULL,
  odometer_km     INTEGER NOT NULL,
  cost            DOUBLE PRECISION,
  notes           TEXT,
  next_service_date DATE,
  next_service_km INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_maintenance_vehicle ON vehicle_maintenance_logs(vehicle_id);

CREATE TRIGGER set_vehicle_maint_updated_at BEFORE UPDATE ON vehicle_maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE vehicle_maintenance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_maint_select_own" ON vehicle_maintenance_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "vehicle_maint_insert_own" ON vehicle_maintenance_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "vehicle_maint_update_own" ON vehicle_maintenance_logs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "vehicle_maint_delete_own" ON vehicle_maintenance_logs FOR DELETE USING (user_id = auth.uid());
