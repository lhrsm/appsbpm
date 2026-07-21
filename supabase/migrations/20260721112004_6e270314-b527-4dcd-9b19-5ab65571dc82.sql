
CREATE POLICY "Anyone can upload dependentes attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dependentes-anexos');

CREATE POLICY "Anyone can read dependentes attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'dependentes-anexos');
