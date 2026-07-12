-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('vehicle-photos', 'vehicle-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('drive-thumbnails', 'drive-thumbnails', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- Avatars policies
CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Vehicle photos policies
CREATE POLICY "vehicle_photos_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-photos');
CREATE POLICY "vehicle_photos_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vehicle_photos_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vehicle_photos_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Drive thumbnails policies
CREATE POLICY "drive_thumbs_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'drive-thumbnails');
CREATE POLICY "drive_thumbs_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'drive-thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Receipts policies (private)
CREATE POLICY "receipts_select_own" ON storage.objects FOR SELECT USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "receipts_insert_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "receipts_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
