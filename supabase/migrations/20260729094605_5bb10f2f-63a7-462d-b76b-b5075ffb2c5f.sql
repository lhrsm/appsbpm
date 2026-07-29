CREATE POLICY "pat_anexos_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patrimonio-anexos' AND public.tem_permissao(auth.uid(), 'patrimonio', 'visualizar'));
CREATE POLICY "pat_anexos_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'patrimonio-anexos' AND public.tem_permissao(auth.uid(), 'patrimonio', 'criar'));
CREATE POLICY "pat_anexos_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'patrimonio-anexos' AND public.tem_permissao(auth.uid(), 'patrimonio', 'editar'))
  WITH CHECK (bucket_id = 'patrimonio-anexos' AND public.tem_permissao(auth.uid(), 'patrimonio', 'editar'));
CREATE POLICY "pat_anexos_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'patrimonio-anexos' AND public.tem_permissao(auth.uid(), 'patrimonio', 'excluir'));