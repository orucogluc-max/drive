-- Minimal, faithful bootstrap of the pieces of Supabase's environment that
-- rls_security.test.sql actually depends on, so those RLS tests can run
-- against a plain local PostgreSQL install with no Docker and no full
-- Supabase stack (no GoTrue/PostgREST/Storage service required) - useful
-- whenever `supabase start` isn't available (e.g. Docker Desktop not
-- installed/running).
--
-- This does NOT replace `supabase start` + `supabase db reset` for full
-- integration testing (no PostGIS, no real Auth/Storage service, tables
-- here are trimmed to only what the RLS tests touch). It exists so the
-- core question - "do these exact RLS policies behave correctly?" - can
-- still be answered with a real PostgreSQL row-security engine when the
-- full stack isn't available.
--
-- Usage (any local PostgreSQL 14+):
--   createdb drive_rls_test
--   psql -d drive_rls_test -f supabase/tests/bootstrap_local_pg.sql
--   psql -d drive_rls_test -f supabase/tests/rls_security.test.sql
--
-- Every CREATE POLICY below is copy-pasted verbatim from the real
-- migrations (base migrations + 20260713000001_security_hardening.sql),
-- not reimplemented - if a policy changes there, this file needs the
-- matching update or the two will silently drift apart.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- auth schema stand-in ----------------------------------------------
-- Mirrors Supabase's real approach: auth.uid() reads the `sub` claim out of
-- the `request.jwt.claims` GUC, which is exactly what rls_security.test.sql
-- sets via `SET request.jwt.claims TO '...'` before each `SET ROLE authenticated`.
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT
);

CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT (NULLIF(current_setting('request.jwt.claims', true), '')::json->>'sub')::uuid;
$$ LANGUAGE sql STABLE;

-- ---- storage schema stand-in --------------------------------------------
-- Minimal shape matching what the avatars/vehicle-photos RLS policies
-- actually reference (bucket_id, name via storage.foldername()).
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id TEXT,
  name TEXT,
  owner TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[] AS $$
  SELECT CASE
    WHEN array_length(regexp_split_to_array(name, '/'), 1) > 1
    THEN (regexp_split_to_array(name, '/'))[1 : array_length(regexp_split_to_array(name, '/'), 1) - 1]
    ELSE ARRAY[]::text[]
  END;
$$ LANGUAGE sql IMMUTABLE;

-- ---- application tables (trimmed: no PostGIS geography columns - not
-- needed by any of the 6 required test scenarios, and PostGIS isn't
-- assumed to be installed on a plain local Postgres) ----------------------

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT NOT NULL,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private'))
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (profile_visibility = 'public');
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid());

CREATE TABLE follows (
  follower_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
-- Phase 2 hardened version (not the original fully-public policy):
CREATE POLICY "follows_select_own" ON follows FOR SELECT
  USING (follower_id = auth.uid() OR following_id = auth.uid());
CREATE POLICY "follows_select_public" ON follows FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles pf WHERE pf.id = follows.follower_id AND pf.profile_visibility != 'private')
    AND EXISTS (SELECT 1 FROM profiles pg WHERE pg.id = follows.following_id AND pg.profile_visibility != 'private')
  );
CREATE POLICY "follows_insert_own" ON follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "follows_delete_own" ON follows FOR DELETE USING (follower_id = auth.uid());

CREATE TABLE drives (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'recording',
  started_at        TIMESTAMPTZ NOT NULL,
  visibility        TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private'))
);
ALTER TABLE drives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drives_all_own" ON drives FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "drives_select_public" ON drives FOR SELECT USING (visibility = 'public' AND status = 'completed');
CREATE POLICY "drives_select_followers" ON drives FOR SELECT USING (visibility = 'followers' AND status = 'completed' AND EXISTS (SELECT 1 FROM follows WHERE follows.following_id = drives.user_id AND follows.follower_id = auth.uid()));

CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL
);
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_all" ON badges FOR SELECT USING (true);

CREATE TABLE user_badges (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  drive_id        UUID REFERENCES drives(id) ON DELETE SET NULL,
  PRIMARY KEY (user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_select_all" ON user_badges FOR SELECT USING (true);
-- Phase 2: the open "WITH CHECK (true)" INSERT policy is gone. No INSERT
-- policy at all for authenticated/anon = default deny.

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  entity_id       UUID,
  message         TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (recipient_id = auth.uid());
-- Phase 2 hardened UPDATE (was USING-only):
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
-- Phase 2: the open "WITH CHECK (true)" INSERT policy is gone. No INSERT
-- policy at all for authenticated/anon = default deny.

-- Phase 2 hardened storage policies (avatars bucket only, needed for test 6c).
-- All three are the real, unchanged/hardened policies from the migrations -
-- SELECT and INSERT are required too, not just UPDATE: without a SELECT
-- policy the row is invisible to the authenticated role at all, which
-- means the UPDATE's own USING clause never gets a candidate row to
-- evaluate WITH CHECK against, silently updating zero rows instead of
-- correctly raising a policy violation - the exact bug this comment is
-- warning about cost real debugging time to track down.
CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ---- roles ---------------------------------------------------------------
-- Supabase's real Postgres roles; RLS policies referencing auth.uid() only
-- matter once we're running as `authenticated`, not the table owner.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public, auth, storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON storage.objects TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
