DROP POLICY IF EXISTS "Anyone can register consent" ON public.consentimentos;
CREATE POLICY "Registro de consentimento validado"
  ON public.consentimentos FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(tipo, '')) BETWEEN 2 AND 60
    AND char_length(coalesce(versao, '')) BETWEEN 1 AND 40
    AND char_length(coalesce(user_agent, '')) <= 400
  );

DROP POLICY IF EXISTS "Anyone can create privacy request" ON public.solicitacoes_privacidade;
CREATE POLICY "Solicitacao de privacidade validada"
  ON public.solicitacoes_privacidade FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(tipo, '')) BETWEEN 2 AND 60
    AND char_length(coalesce(descricao, '')) BETWEEN 5 AND 4000
    AND coalesce(status, 'pendente') = 'pendente'
    AND resposta IS NULL
    AND char_length(coalesce(solicitante_nome, '')) <= 160
    AND char_length(coalesce(solicitante_email, '')) <= 200
    AND char_length(coalesce(solicitante_documento, '')) <= 40
  );

DROP POLICY IF EXISTS "anyone_can_insert_events" ON public.analytics_events;
CREATE POLICY "analytics_insert_validado"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(coalesce(event, '')) BETWEEN 1 AND 80
    AND char_length(coalesce(path, '')) <= 300
    AND char_length(coalesce(user_agent, '')) <= 400
    AND pg_column_size(coalesce(meta, '{}'::jsonb)) <= 4000
  );