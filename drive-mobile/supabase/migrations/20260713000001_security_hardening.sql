-- Security Hardening (Phase 2)
--
-- Fixes, in order:
--   1. notifications: remove the open INSERT policy; add WITH CHECK to UPDATE.
--   2. user_badges: remove the open INSERT policy.
--   3. storage.objects (avatars, vehicle-photos): add missing WITH CHECK on UPDATE.
--   4. vehicle_maintenance_logs: add missing WITH CHECK on UPDATE, including
--      re-verifying vehicle_id ownership (not just user_id), so a row can't
--      be silently reattached to someone else's vehicle.
--   5. follows: replace the fully-public SELECT policy with one that
--      respects profile_visibility = 'private' on either side of the edge.
--
-- Tables NOT changed here were reviewed and already correct, or have no
-- UPDATE policy at all (default-deny) with nothing to add a WITH CHECK to.
-- See the PR description for the full per-table review.

-- ============================================================
-- 1. notifications
-- ============================================================

-- Was: WITH CHECK (true) — any authenticated user could create a
-- notification for any recipient with an arbitrary sender_id/message.
-- Notifications must only ever be written by a trusted server-side path
-- (the gamification Edge Function, using its service-role client, which
-- bypasses RLS entirely). Removing this policy leaves no INSERT policy for
-- the authenticated/anon roles, which means default-deny for them.
DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;

-- Was: USING only, no WITH CHECK — a user could flip recipient_id to
-- someone else's id while "marking as read" in the same statement.
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- notifications_select_own (recipient_id = auth.uid()) is unchanged and
-- already correct.

-- ============================================================
-- 2. user_badges
-- ============================================================

-- Was: WITH CHECK (true) — any user could award themselves (or anyone)
-- arbitrary badges. Badge assignment must only happen through the
-- gamification-engine Edge Function's service-role client. Removing this
-- policy leaves no INSERT policy for the authenticated/anon roles.
DROP POLICY IF EXISTS "user_badges_insert_system" ON user_badges;

-- user_badges_select_all (USING (true)) is unchanged — reading which
-- badges a user has earned is intentionally public (it's a showcase
-- feature), only *assigning* them needed to be locked down.

-- ============================================================
-- 3. storage.objects — avatars, vehicle-photos UPDATE
-- ============================================================

-- Both were USING-only: a user could update a file they own and, in the
-- same statement, rewrite its path/name to point into a different user's
-- folder within the same bucket (WITH CHECK is what re-validates the *new*
-- row on UPDATE; USING alone only validates which existing rows you're
-- allowed to touch).
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "vehicle_photos_update_own" ON storage.objects;
CREATE POLICY "vehicle_photos_update_own" ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- 4. vehicle_maintenance_logs
-- ============================================================

-- Was: USING only. Without WITH CHECK, a user could update a maintenance
-- log they own and reassign its vehicle_id to a vehicle they do NOT own,
-- attaching fraudulent maintenance history to someone else's car. The new
-- WITH CHECK re-verifies both user_id and vehicle_id ownership on the
-- resulting row.
DROP POLICY IF EXISTS "vehicle_maint_update_own" ON vehicle_maintenance_logs;
CREATE POLICY "vehicle_maint_update_own" ON vehicle_maintenance_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
  );

-- ============================================================
-- 5. follows — privacy-consistent read policy
-- ============================================================
--
-- Product decision (documented here, not just in the PR description, so
-- it travels with the schema): a follow edge is publicly readable only
-- when BOTH the follower and the followed profile are non-private. If
-- either party has profile_visibility = 'private', the edge is visible
-- only to the two people directly involved in it (each can always see
-- their own follows/followers). This keeps the default (both public)
-- case working exactly as before — the vast majority of profiles — while
-- actually respecting a 'private' profile_visibility setting instead of
-- leaking the social graph around it regardless of that setting.

DROP POLICY IF EXISTS "follows_select_all" ON follows;

CREATE POLICY "follows_select_own" ON follows FOR SELECT
  USING (follower_id = auth.uid() OR following_id = auth.uid());

CREATE POLICY "follows_select_public" ON follows FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles pf WHERE pf.id = follows.follower_id AND pf.profile_visibility != 'private')
    AND EXISTS (SELECT 1 FROM profiles pg WHERE pg.id = follows.following_id AND pg.profile_visibility != 'private')
  );

-- follows_insert_own / follows_delete_own are unchanged and already correct
-- (both scoped to follower_id = auth.uid()).
