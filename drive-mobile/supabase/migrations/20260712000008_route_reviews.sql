CREATE TABLE route_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id        UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drive_id        UUID REFERENCES drives(id) ON DELETE SET NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT CHECK (length(review_text) <= 1000),
  road_quality    SMALLINT CHECK (road_quality BETWEEN 1 AND 5),
  scenery_rating  SMALLINT CHECK (scenery_rating BETWEEN 1 AND 5),
  traffic_level   TEXT CHECK (traffic_level IN ('empty', 'light', 'moderate', 'heavy')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (route_id, user_id)
);

CREATE INDEX idx_route_reviews_route ON route_reviews(route_id);
CREATE INDEX idx_route_reviews_user ON route_reviews(user_id);

CREATE TRIGGER set_route_reviews_updated_at BEFORE UPDATE ON route_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE route_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON route_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON route_reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_update_own" ON route_reviews FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_delete_own" ON route_reviews FOR DELETE USING (user_id = auth.uid());
