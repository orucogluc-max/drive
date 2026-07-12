-- Migration: Collections and Journey Interactions (Sprint 8)

-- 1. Collections Table
CREATE TABLE collections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 100),
  description       TEXT CHECK (length(description) <= 1000),
  cover_image_url   TEXT,
  visibility        TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  view_count        INTEGER NOT NULL DEFAULT 0,
  save_count        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_visibility ON collections(visibility);

CREATE TRIGGER set_collections_updated_at 
  BEFORE UPDATE ON collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_select_public" ON collections FOR SELECT USING (visibility = 'public');
CREATE POLICY "collections_select_own" ON collections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "collections_insert_own" ON collections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "collections_update_own" ON collections FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "collections_delete_own" ON collections FOR DELETE USING (user_id = auth.uid());


-- 2. Collection Items (Journeys within a collection)
CREATE TABLE collection_items (
  collection_id   UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, drive_id)
);

CREATE INDEX idx_collection_items_drive ON collection_items(drive_id);

ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection_items_select_public" ON collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.visibility = 'public')
);
CREATE POLICY "collection_items_select_own" ON collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);
CREATE POLICY "collection_items_insert_own" ON collection_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);
CREATE POLICY "collection_items_delete_own" ON collection_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid())
);


-- 3. Journey Interactions
CREATE TABLE journey_interactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drive_id          UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  interaction_type  TEXT NOT NULL CHECK (interaction_type IN ('want_to_drive', 'inspired_me', 'wishlist', 'like')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, drive_id, interaction_type)
);

CREATE INDEX idx_journey_interactions_drive ON journey_interactions(drive_id);
CREATE INDEX idx_journey_interactions_user ON journey_interactions(user_id);

ALTER TABLE journey_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_interactions_select_all" ON journey_interactions FOR SELECT USING (true);
CREATE POLICY "journey_interactions_insert_own" ON journey_interactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "journey_interactions_delete_own" ON journey_interactions FOR DELETE USING (user_id = auth.uid());

-- Trigger to update drive interaction counts (optional enhancement, but keeping it simple for now)
