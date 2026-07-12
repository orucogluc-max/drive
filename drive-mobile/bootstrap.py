import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {full_path}")

migrations = {
    "20260712000001_extensions.sql": """
CREATE EXTENSION IF NOT EXISTS postgis;
""",
    "20260712000002_profiles.sql": """
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  display_name    TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 50),
  avatar_url      TEXT,
  bio             TEXT CHECK (length(bio) <= 300),
  total_drives    INTEGER NOT NULL DEFAULT 0,
  total_distance_m DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_duration_s INTEGER NOT NULL DEFAULT 0,
  avg_drive_score DOUBLE PRECISION,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
  drive_default_visibility TEXT NOT NULL DEFAULT 'public' CHECK (drive_default_visibility IN ('public', 'followers', 'private')),
  show_exact_start_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (profile_visibility = 'public');
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
""",
    "20260712000003_vehicles.sql": """
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
""",
    "20260712000004_follows.sql": """
CREATE TABLE follows (
  follower_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select_all" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (follower_id = auth.uid());
""",
    "20260712000005_routes.sql": """
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
""",
    "20260712000006_drives.sql": """
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
""",
    "20260712000007_telemetry_points.sql": """
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
""",
    "20260712000008_route_reviews.sql": """
CREATE TABLE route_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id        UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drive_id        UUID REFERENCES drives(id) ON DELETE SET NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT CHECK (length(review_text) <= 1000),
  road_quality    SMALLINT CHECK (road_quality BETWEEN 1 AND 5),
  scenery_rating  SMALLINT CHECK (scenery_rating BETWEEN 1 AND 5),
  traffic_level   TEXT CHECK (traffic_level IN ('empty', 'light', 'moderate', 'heavy')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (route_id, user_id)
);

CREATE INDEX idx_route_reviews_route ON route_reviews(route_id);
CREATE INDEX idx_route_reviews_user ON route_reviews(user_id);

CREATE TRIGGER set_route_reviews_updated_at BEFORE UPDATE ON route_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE route_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON route_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON route_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_update_own" ON route_reviews FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_delete_own" ON route_reviews FOR DELETE USING (user_id = auth.uid());
""",
    "20260712000009_drive_reactions.sql": """
CREATE TABLE drive_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('fire', 'smooth', 'scenic', 'impressive', 'respect')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drive_id, user_id)
);

CREATE INDEX idx_reactions_drive ON drive_reactions(drive_id);
CREATE INDEX idx_reactions_user ON drive_reactions(user_id);

ALTER TABLE drive_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_select_accessible" ON drive_reactions FOR SELECT USING (EXISTS (SELECT 1 FROM drives WHERE drives.id = drive_reactions.drive_id AND (drives.visibility = 'public' OR drives.user_id = auth.uid())));
CREATE POLICY "reactions_insert_own" ON drive_reactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reactions_delete_own" ON drive_reactions FOR DELETE USING (user_id = auth.uid());
""",
    "20260712000010_comments.sql": """
CREATE TABLE comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1000),
  is_edited       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_drive ON comments(drive_id, created_at);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE TRIGGER set_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_accessible" ON comments FOR SELECT USING (EXISTS (SELECT 1 FROM drives WHERE drives.id = comments.drive_id AND (drives.visibility = 'public' OR drives.user_id = auth.uid())));
CREATE POLICY "comments_insert_own" ON comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (user_id = auth.uid());
""",
    "20260712000011_clubs.sql": """
CREATE TABLE clubs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 50),
  description     TEXT CHECK (length(description) <= 500),
  avatar_url      TEXT,
  member_count    INTEGER NOT NULL DEFAULT 1,
  is_public       BOOLEAN NOT NULL DEFAULT TRUE,
  region          TEXT,
  country_code    CHAR(2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clubs_creator ON clubs(creator_id);
CREATE INDEX idx_clubs_public ON clubs(is_public) WHERE is_public = TRUE;

CREATE TRIGGER set_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE club_members (
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);

CREATE INDEX idx_club_members_user ON club_members(user_id);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs_select_public" ON clubs FOR SELECT USING (is_public = TRUE);
CREATE POLICY "clubs_select_member" ON clubs FOR SELECT USING (EXISTS (SELECT 1 FROM club_members WHERE club_members.club_id = clubs.id AND club_members.user_id = auth.uid()));
CREATE POLICY "clubs_manage_creator" ON clubs FOR ALL USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

CREATE POLICY "club_members_select" ON club_members FOR SELECT USING (EXISTS (SELECT 1 FROM clubs WHERE clubs.id = club_members.club_id AND clubs.is_public = TRUE) OR user_id = auth.uid() OR EXISTS (SELECT 1 FROM club_members cm WHERE cm.club_id = club_members.club_id AND cm.user_id = auth.uid()));
CREATE POLICY "club_members_insert_own" ON club_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "club_members_delete_own" ON club_members FOR DELETE USING (user_id = auth.uid());
""",
    "20260712000012_vehicle_modifications.sql": """
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
""",
    "20260712000013_maintenance_records.sql": """
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
""",
    "20260712000014_triggers_and_functions.sql": """
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Driver')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Drive reaction count trigger
CREATE OR REPLACE FUNCTION update_drive_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drives SET reaction_count = reaction_count + 1 WHERE id = NEW.drive_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drives SET reaction_count = reaction_count - 1 WHERE id = OLD.drive_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON drive_reactions
  FOR EACH ROW EXECUTE FUNCTION update_drive_reaction_count();

-- Drive comment count trigger
CREATE OR REPLACE FUNCTION update_drive_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drives SET comment_count = comment_count + 1 WHERE id = NEW.drive_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drives SET comment_count = comment_count - 1 WHERE id = OLD.drive_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_drive_comment_count();

-- Route review stats trigger
CREATE OR REPLACE FUNCTION update_route_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_route_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_route_id := OLD.route_id;
  ELSE
    target_route_id := NEW.route_id;
  END IF;

  UPDATE routes SET
    review_count = (SELECT COUNT(*) FROM route_reviews WHERE route_id = target_route_id),
    avg_rating = (SELECT AVG(rating)::DOUBLE PRECISION FROM route_reviews WHERE route_id = target_route_id)
  WHERE id = target_route_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_route_review_change
  AFTER INSERT OR UPDATE OR DELETE ON route_reviews
  FOR EACH ROW EXECUTE FUNCTION update_route_review_stats();

-- Club member count trigger
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clubs SET member_count = member_count - 1 WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_club_member_change
  AFTER INSERT OR DELETE ON club_members
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();
""",
    "20260712000015_storage_buckets.sql": """
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('vehicle-photos', 'vehicle-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('drive-thumbnails', 'drive-thumbnails', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- Avatars policies
CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Vehicle photos policies
CREATE POLICY "vehicle_photos_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-photos');
CREATE POLICY "vehicle_photos_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vehicle_photos_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vehicle_photos_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Drive thumbnails policies
CREATE POLICY "drive_thumbs_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'drive-thumbnails');
CREATE POLICY "drive_thumbs_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'drive-thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Receipts policies (private)
CREATE POLICY "receipts_select_own" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "receipts_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "receipts_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
"""
}

for name, content in migrations.items():
    write_file(f"supabase/migrations/{name}", content)

src_files = {
    "src/theme/colors.ts": """
export const colors = {
  brand: '#F97316',
  brandLight: '#FB923C',
  brandDark: '#EA580C',
  brandMuted: 'rgba(249, 115, 22, 0.15)',
  brandSubtle: 'rgba(249, 115, 22, 0.08)',
  background: '#0F0F11',
  backgroundElevated: '#18181B',
  backgroundCard: '#1C1C20',
  backgroundInput: '#27272A',
  foreground: '#FAFAFA',
  foregroundSecondary: '#A1A1AA',
  foregroundMuted: '#71717A',
  foregroundDisabled: '#52525B',
  border: '#27272A',
  borderLight: '#3F3F46',
  borderFocus: '#F97316',
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  warning: '#EAB308',
  warningMuted: 'rgba(234, 179, 8, 0.15)',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoMuted: 'rgba(59, 130, 246, 0.15)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;
export type ColorKey = keyof typeof colors;
""",
    "src/theme/typography.ts": """
import { Platform } from 'react-native';
export const fontFamilies = {
  sans: Platform.select({ ios: 'Inter', android: 'Inter', default: 'Inter' }),
  mono: Platform.select({ ios: 'JetBrainsMono', android: 'JetBrainsMono', default: 'JetBrainsMono' }),
} as const;
export const fontSizes = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 22, '3xl': 28, '4xl': 34, '5xl': 42, display: 64, hud: 96,
} as const;
export const fontWeights = {
  regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const,
};
export const lineHeights = { tight: 1.1, normal: 1.4, relaxed: 1.6 } as const;
export const letterSpacings = {
  tighter: -0.5, tight: -0.25, normal: 0, wide: 0.5, wider: 1.0, widest: 2.0, mono: 0.5,
} as const;
""",
    "src/theme/spacing.ts": """
export const spacing = {
  '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10, '3': 12, '4': 16, '5': 20, '6': 24, '7': 28, '8': 32, '10': 40, '12': 48, '16': 64, '20': 80, '24': 96,
} as const;
export const borderRadius = {
  none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 20, '3xl': 24, full: 9999,
} as const;
export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  brand: { shadowColor: '#F97316', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
} as const;
""",
    "src/theme/index.ts": """
export { colors } from './colors';
export type { ColorKey } from './colors';
export { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';
export { spacing, borderRadius, shadows } from './spacing';
""",
    "src/lib/supabase.ts": """
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
""",
    "src/constants/app.ts": """
export const APP_NAME = 'DRIVE';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'Telemetry for Drivers';
""",
    "src/screens/HomeScreen.tsx": """
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>ACTIVITY FEED</Text>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Takip ettiğin sürücülerin aktiviteleri burada görünecek.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontFamily: fontFamilies.sans, fontSize: fontSizes.md, color: colors.foregroundMuted, textAlign: 'center' },
});
""",
    "src/screens/ExploreScreen.tsx": """
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>ROUTES</Text>
      <Text style={styles.title}>Explore</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
});
""",
    "src/screens/RecordScreen.tsx": """
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function RecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>DRIVE</Text>
      <Text style={styles.title}>Record</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
});
""",
    "src/screens/ProfileScreen.tsx": """
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>DRIVER IDENTITY</Text>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
});
""",
    "src/screens/GarageScreen.tsx": """
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamilies, fontSizes } from '../theme';
export function GarageScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>FLEET</Text>
      <Text style={styles.title}>Garage</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: { fontFamily: fontFamilies.mono, fontSize: fontSizes.xs, color: colors.brand, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fontFamilies.sans, fontSize: fontSizes['3xl'], color: colors.foreground, fontWeight: '600', marginBottom: 8 },
});
""",
    "src/navigation/TabNavigator.tsx": """
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { GarageScreen } from '../screens/GarageScreen';
import { colors, fontFamilies, fontSizes } from '../theme';

const Tab = createBottomTabNavigator();

function RecordButton() {
  return (
    <View style={styles.recordButton}>
      <View style={styles.recordButtonInner} />
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <RecordButton />,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Garage" component={GarageScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundElevated,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabBarLabel: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
});
""",
    "App.tsx": """
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from './src/navigation/TabNavigator';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.brand,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.foreground,
    border: colors.border,
    notification: colors.brand,
  },
  fonts: {
    regular: { fontFamily: 'Inter', fontWeight: '400' as const },
    medium: { fontFamily: 'Inter', fontWeight: '500' as const },
    bold: { fontFamily: 'Inter', fontWeight: '700' as const },
    heavy: { fontFamily: 'Inter', fontWeight: '800' as const },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <TabNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
""",
    ".env": """
EXPO_PUBLIC_SUPABASE_URL=https://vptvsroxeqmzbmukufxg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdHZzcm94ZXFtemJtdWt1ZnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjE0MzQsImV4cCI6MjA5OTQzNzQzNH0.rUk6Zd_HKYwCUb_KSw5u8NJVNM6cexQSYwnHbx64BQY
"""
}

for name, content in src_files.items():
    write_file(name, content)
