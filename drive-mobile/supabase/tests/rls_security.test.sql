-- RLS security regression tests for Phase 2 (Security Hardening).
--
-- NOT executed as part of this PR's automated verification: no local
-- Postgres/Supabase instance was available in the development environment
-- (Docker daemon could not be started; see PR description). This file is
-- written to be genuinely runnable, not just documentation - every check
-- either passes silently or RAISEs a clear EXCEPTION naming the failed
-- scenario, so a non-zero/error exit from psql means a real regression.
--
-- How to run once Docker is available:
--   supabase start
--   supabase db reset            -- applies all migrations incl. the
--                                 -- security_hardening one, plus seed.sql
--   psql "$(supabase status -o json | jq -r '.DB_URL')" -f supabase/tests/rls_security.test.sql
--
-- Pattern used throughout: Supabase's PostgREST layer derives auth.uid()
-- from the request JWT's `sub` claim via `request.jwt.claims`. Setting that
-- GUC directly plus `SET ROLE authenticated` is the standard way to
-- exercise RLS policies as a specific user from a plain psql session,
-- without needing a running GoTrue/PostgREST stack.

BEGIN;

-- ============================================================
-- Fixtures: three users, minimal drives to exercise visibility rules.
-- ============================================================

DO $$
DECLARE
  user_a UUID := '00000000-0000-0000-0000-00000000000a';
  user_b UUID := '00000000-0000-0000-0000-00000000000b';
  user_c_follower UUID := '00000000-0000-0000-0000-00000000000c';
BEGIN
  -- auth.users rows (minimal - RLS only needs these to exist for the FK).
  INSERT INTO auth.users (id, email) VALUES
    (user_a, 'user-a@test.local'),
    (user_b, 'user-b@test.local'),
    (user_c_follower, 'user-c@test.local')
  ON CONFLICT (id) DO NOTHING;

  -- Bypass RLS for fixture setup (superuser/service context in this block).
  INSERT INTO profiles (id, username, display_name, profile_visibility) VALUES
    (user_a, 'test_user_a', 'User A', 'public'),
    (user_b, 'test_user_b', 'User B', 'public'),
    (user_c_follower, 'test_user_c', 'User C Follower', 'public')
  ON CONFLICT (id) DO NOTHING;

  -- C follows B, so C can see B's followers-visible drives.
  INSERT INTO follows (follower_id, following_id) VALUES (user_c_follower, user_b)
  ON CONFLICT DO NOTHING;

  -- B's drives: one private, one followers-visible-and-completed.
  INSERT INTO drives (id, user_id, status, started_at, visibility) VALUES
    ('10000000-0000-0000-0000-000000000001', user_b, 'completed', now(), 'private'),
    ('10000000-0000-0000-0000-000000000002', user_b, 'completed', now(), 'followers')
  ON CONFLICT (id) DO NOTHING;

  -- A badge to try to self-award.
  INSERT INTO badges (id, name, description, category) VALUES
    ('20000000-0000-0000-0000-000000000001', 'Test Badge', 'for RLS tests', 'milestone')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================
-- Test 1: User A cannot create a notification for User B.
-- ============================================================
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
BEGIN
  BEGIN
    INSERT INTO notifications (recipient_id, sender_id, type, message)
    VALUES ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a', 'system', 'forged');
    RAISE EXCEPTION 'SECURITY REGRESSION: User A was able to create a notification for User B';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: notifications INSERT correctly denied for non-owner recipient';
  END;
END $$;

RESET ROLE;

-- ============================================================
-- Test 2: User A cannot assign a badge to themselves or User B.
-- ============================================================
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
BEGIN
  BEGIN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES ('00000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'SECURITY REGRESSION: User A was able to self-award a badge directly';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: user_badges INSERT correctly denied for self-assignment';
  END;

  BEGIN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES ('00000000-0000-0000-0000-00000000000b', '20000000-0000-0000-0000-000000000001');
    RAISE EXCEPTION 'SECURITY REGRESSION: User A was able to award a badge to User B';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: user_badges INSERT correctly denied for cross-user assignment';
  END;
END $$;

RESET ROLE;

-- ============================================================
-- Test 3: User A cannot read User B's private drive.
-- ============================================================
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
DECLARE
  found_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO found_count FROM drives WHERE id = '10000000-0000-0000-0000-000000000001';
  IF found_count > 0 THEN
    RAISE EXCEPTION 'SECURITY REGRESSION: User A could read User B''s private drive';
  END IF;
  RAISE NOTICE 'PASS: private drive correctly invisible to a non-owner';
END $$;

RESET ROLE;

-- ============================================================
-- Test 4: A follower CAN read a followers-visible completed drive.
-- ============================================================
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}';
SET ROLE authenticated;

DO $$
DECLARE
  found_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO found_count FROM drives WHERE id = '10000000-0000-0000-0000-000000000002';
  IF found_count = 0 THEN
    RAISE EXCEPTION 'REGRESSION: a follower could NOT read a followers-visible completed drive they should be able to see';
  END IF;
  RAISE NOTICE 'PASS: follower correctly can read a followers-visible completed drive';
END $$;

RESET ROLE;

-- ============================================================
-- Test 5: A non-follower CANNOT read that same followers-visible drive.
-- ============================================================
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
DECLARE
  found_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO found_count FROM drives WHERE id = '10000000-0000-0000-0000-000000000002';
  IF found_count > 0 THEN
    RAISE EXCEPTION 'SECURITY REGRESSION: a non-follower could read a followers-visible drive';
  END IF;
  RAISE NOTICE 'PASS: non-follower correctly cannot read a followers-visible drive';
END $$;

RESET ROLE;

-- ============================================================
-- Test 6: Ownership fields cannot be reassigned through UPDATE.
-- ============================================================

-- 6a. drives.user_id (already correct pre-existing WITH CHECK via drives_all_own)
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
SET ROLE authenticated;

DO $$
BEGIN
  BEGIN
    UPDATE drives SET user_id = '00000000-0000-0000-0000-00000000000a'
    WHERE id = '10000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'SECURITY REGRESSION: drives.user_id was reassignable via UPDATE';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: drives.user_id cannot be reassigned via UPDATE';
  END;
END $$;

RESET ROLE;

-- 6b. notifications.recipient_id (fixed in this migration)
DO $$
BEGIN
  -- Fixture: a notification that would only exist via the service role in
  -- production, inserted here directly for the purpose of the test.
  INSERT INTO notifications (id, recipient_id, type, message)
  VALUES ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'system', 'seed')
  ON CONFLICT (id) DO NOTHING;
END $$;

SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
BEGIN
  BEGIN
    UPDATE notifications SET recipient_id = '00000000-0000-0000-0000-00000000000b'
    WHERE id = '30000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'SECURITY REGRESSION: notifications.recipient_id was reassignable via UPDATE';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: notifications.recipient_id cannot be reassigned via UPDATE';
  END;
END $$;

RESET ROLE;

-- 6c. avatars storage.objects path cannot be moved into another user's folder
SET request.jwt.claims TO '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
SET ROLE authenticated;

DO $$
BEGIN
  INSERT INTO storage.objects (bucket_id, name, owner)
  VALUES ('avatars', '00000000-0000-0000-0000-00000000000a/avatar.jpg', '00000000-0000-0000-0000-00000000000a'::text)
  ON CONFLICT DO NOTHING;

  BEGIN
    UPDATE storage.objects SET name = '00000000-0000-0000-0000-00000000000b/avatar.jpg'
    WHERE bucket_id = 'avatars' AND name = '00000000-0000-0000-0000-00000000000a/avatar.jpg';
    RAISE EXCEPTION 'SECURITY REGRESSION: an avatar could be moved into another user''s folder via UPDATE';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: avatar object path cannot be reassigned to another user''s folder';
  END;
END $$;

RESET ROLE;

ROLLBACK; -- never commit test fixtures
