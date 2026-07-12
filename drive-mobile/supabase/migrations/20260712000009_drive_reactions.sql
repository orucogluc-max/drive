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
