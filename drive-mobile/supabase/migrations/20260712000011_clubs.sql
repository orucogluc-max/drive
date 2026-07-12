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
