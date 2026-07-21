
-- Allow anyone (anon and authenticated) to upload attachments for indicações
CREATE POLICY "Anyone can upload indicacoes attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'indicacoes-anexos');

-- Allow reading uploaded files (needed for admins later via signed URLs; keep private-friendly)
CREATE POLICY "Anyone can read indicacoes attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'indicacoes-anexos');
