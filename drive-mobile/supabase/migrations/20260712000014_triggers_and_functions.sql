-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    'user_' || substr(NEW.id::text, 1, 8),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Driver')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Drive reaction count trigger
CREATE OR REPLACE FUNCTION update_drive_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drives SET reaction_count = reaction_count + 1 WHERE id = NEW.drive_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drives SET reaction_count = reaction_count - 1 WHERE id = OLD.drive_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON drive_reactions
  FOR EACH ROW EXECUTE FUNCTION update_drive_reaction_count();

-- Drive comment count trigger
CREATE OR REPLACE FUNCTION update_drive_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drives SET comment_count = comment_count + 1 WHERE id = NEW.drive_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drives SET comment_count = comment_count - 1 WHERE id = OLD.drive_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_drive_comment_count();

-- Route review stats trigger
CREATE OR REPLACE FUNCTION update_route_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_route_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_route_id := OLD.route_id;
  ELSE
    target_route_id := NEW.route_id;
  END IF;

  UPDATE routes SET
    review_count = (SELECT COUNT(*) FROM route_reviews WHERE route_id = target_route_id),
    avg_rating = (SELECT AVG(rating)::DOUBLE PRECISION FROM route_reviews WHERE route_id = target_route_id)
  WHERE id = target_route_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_route_review_change
  AFTER INSERT OR UPDATE OR DELETE ON route_reviews
  FOR EACH ROW EXECUTE FUNCTION update_route_review_stats();

-- Club member count trigger
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clubs SET member_count = member_count + 1 WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clubs SET member_count = member_count - 1 WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_club_member_change
  AFTER INSERT OR DELETE ON club_members
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();
