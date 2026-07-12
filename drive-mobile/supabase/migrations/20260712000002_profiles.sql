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
