-- Badges Table (Gamification dictionary)
CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  icon_url        TEXT,
  category        TEXT NOT NULL CHECK (category IN ('milestone', 'exploration', 'performance', 'social')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Badges (Many-to-Many)
CREATE TABLE user_badges (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  drive_id        UUID REFERENCES drives(id) ON DELETE SET NULL, -- Optional: Which drive earned this?
  PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Saved Routes
CREATE TABLE saved_routes (
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  route_id        UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);

CREATE INDEX idx_saved_routes_user ON saved_routes(user_id);

-- Notifications
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('follow', 'reaction', 'comment', 'badge_earned', 'system')),
  entity_id       UUID, -- e.g., the drive_id or badge_id
  message         TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE is_read = FALSE;

-- RLS Policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_all" ON badges FOR SELECT USING (true);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_select_all" ON user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_insert_system" ON user_badges FOR INSERT WITH CHECK (true); -- Usually restricted to service role in prod

ALTER TABLE saved_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_routes_select_own" ON saved_routes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "saved_routes_insert_own" ON saved_routes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_routes_delete_own" ON saved_routes FOR DELETE USING (user_id = auth.uid());

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "notifications_insert_all" ON notifications FOR INSERT WITH CHECK (true); -- Anyone can trigger a notification

-- Pre-seed some default badges
INSERT INTO badges (name, description, category, icon_url) VALUES 
('First Drive', 'Completed your very first drive on the platform.', 'milestone', '🏆'),
('Night Rider', 'Completed a drive between midnight and 5 AM.', 'exploration', '🌙'),
('100KM Club', 'Driven a total of 100 kilometers.', 'milestone', '💯'),
('Mountain Goat', 'Completed a challenging mountain touge route.', 'exploration', '⛰️');
