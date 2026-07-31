DROP POLICY IF EXISTS "Bootstrap primeiro admin" ON public.user_roles;

DROP POLICY IF EXISTS "Qualquer autenticado insere avaliação" ON public.avaliacoes_parceiros;
CREATE POLICY "Autenticados inserem avaliação válida"
  ON public.avaliacoes_parceiros FOR INSERT TO authenticated
  WITH CHECK (
    associado_id IS NOT NULL
    AND clinica_id IS NOT NULL
    AND nota BETWEEN 1 AND 5
    AND aprovado = false
    AND moderado_por IS NULL
    AND char_length(coalesce(autor_nome, '')) BETWEEN 2 AND 120
    AND char_length(coalesce(comentario, '')) <= 2000
    AND EXISTS (SELECT 1 FROM public.associados a WHERE a.id = associado_id)
  );

DROP POLICY IF EXISTS "Autenticados criam próprios rsvps" ON public.evento_rsvps;
CREATE POLICY "Autenticados criam rsvps validos"
  ON public.evento_rsvps FOR INSERT TO authenticated
  WITH CHECK (
    evento_id IS NOT NULL
    AND associado_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.associados a WHERE a.id = associado_id)
    AND (dependente_id IS NULL OR EXISTS (
      SELECT 1 FROM public.dependentes d WHERE d.id = dependente_id AND d.associado_id = evento_rsvps.associado_id
    ))
    AND char_length(coalesce(nome, '')) <= 160
    AND char_length(coalesce(observacoes, '')) <= 1000
  );

DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;