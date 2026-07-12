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
