DROP POLICY IF EXISTS "público lê notificações" ON public.notificacoes;
DROP POLICY IF EXISTS "público marca como lida" ON public.notificacoes;
DROP POLICY IF EXISTS "público insere notificações" ON public.notificacoes;
REVOKE ALL ON public.notificacoes FROM anon;
GRANT SELECT ON public.notificacoes TO authenticated;
GRANT ALL ON public.notificacoes TO service_role;
CREATE POLICY "admins leem notificações" ON public.notificacoes
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins criam notificações" ON public.notificacoes
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public read documentos bucket" ON storage.objects;
CREATE POLICY "Admins read documentos bucket" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documentos' AND (has_role(auth.uid(), 'admin'::app_role) OR is_previdencia_admin(auth.uid())));

DROP POLICY IF EXISTS "Anyone can read dependentes attachments" ON storage.objects;
CREATE POLICY "Admins read dependentes attachments" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'dependentes-anexos' AND (has_role(auth.uid(), 'admin'::app_role) OR is_previdencia_admin(auth.uid())));

DROP POLICY IF EXISTS "Anyone can read indicacoes attachments" ON storage.objects;
CREATE POLICY "Admins read indicacoes attachments" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'indicacoes-anexos' AND (has_role(auth.uid(), 'admin'::app_role) OR is_previdencia_admin(auth.uid())));

DROP POLICY IF EXISTS "Anyone can delete profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update profile photos" ON storage.objects;
CREATE POLICY "Admins manage profile photos update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage profile photos delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'profile-photos' AND has_role(auth.uid(), 'admin'::app_role));