-- Migration: Journey Storytelling & Media Expansion (Sprint 10)

-- 1. Add Storytelling Columns to 'drives' (Journeys)
ALTER TABLE drives ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE drives ADD COLUMN road_type TEXT CHECK (road_type IN ('coastal', 'mountain', 'urban', 'highway', 'canyon', 'forest', 'mixed'));
ALTER TABLE drives ADD COLUMN purpose TEXT CHECK (purpose IN ('coffee_run', 'weekend_escape', 'night_drive', 'track_day', 'road_trip', 'commute', 'testing', 'other'));
ALTER TABLE drives ADD COLUMN favorite_moment TEXT CHECK (length(favorite_moment) <= 1000);
ALTER TABLE drives ADD COLUMN advice TEXT CHECK (length(advice) <= 1000);
ALTER TABLE drives ADD COLUMN quality_score INTEGER NOT NULL DEFAULT 0;

-- 2. Media Gallery Table
CREATE TABLE drive_media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id        UUID NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url       TEXT NOT NULL,
  caption         TEXT CHECK (length(caption) <= 300),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_cover        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drive_media_drive ON drive_media(drive_id);
CREATE INDEX idx_drive_media_user ON drive_media(user_id);

ALTER TABLE drive_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drive_media_select_public" ON drive_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM drives WHERE drives.id = drive_media.drive_id AND drives.visibility = 'public')
);
CREATE POLICY "drive_media_select_own" ON drive_media FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "drive_media_insert_own" ON drive_media FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "drive_media_update_own" ON drive_media FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "drive_media_delete_own" ON drive_media FOR DELETE USING (user_id = auth.uid());

-- Function to calculate quality score locally via trigger
CREATE OR REPLACE FUNCTION update_drive_quality_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
  media_count INTEGER := 0;
BEGIN
  -- Check title
  IF NEW.title IS NOT NULL AND length(NEW.title) > 3 THEN
    score := score + 20;
  END IF;
  
  -- Check description/story
  IF NEW.description IS NOT NULL AND length(NEW.description) > 10 THEN
    score := score + 20;
  END IF;
  
  -- Check tags
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Check vehicle
  IF NEW.vehicle_id IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Check storytelling fields
  IF NEW.favorite_moment IS NOT NULL OR NEW.advice IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- The rest (25 points) comes from photo_count and interactions, handled elsewhere or dynamically.
  -- We just set the base here.
  NEW.quality_score = score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quality_score
  BEFORE INSERT OR UPDATE OF title, description, tags, vehicle_id, favorite_moment, advice
  ON drives
  FOR EACH ROW
  EXECUTE FUNCTION update_drive_quality_score();
