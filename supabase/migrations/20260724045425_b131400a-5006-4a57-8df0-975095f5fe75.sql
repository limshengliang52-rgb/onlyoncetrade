
-- Explicit RLS policies on storage.objects to satisfy scanner and confirm
-- that anon/authenticated cannot directly access the private `ea-files` bucket.
-- File delivery happens only via server-side signed URLs (service_role bypasses RLS).

DROP POLICY IF EXISTS "ea_files_no_select_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ea_files_no_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ea_files_no_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ea_files_no_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "ea_files_no_select_anon" ON storage.objects;

CREATE POLICY "ea_files_no_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id <> 'ea-files');

CREATE POLICY "ea_files_no_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id <> 'ea-files');

CREATE POLICY "ea_files_no_update_authenticated"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id <> 'ea-files')
  WITH CHECK (bucket_id <> 'ea-files');

CREATE POLICY "ea_files_no_delete_authenticated"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id <> 'ea-files');

CREATE POLICY "ea_files_no_select_anon"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id <> 'ea-files');
