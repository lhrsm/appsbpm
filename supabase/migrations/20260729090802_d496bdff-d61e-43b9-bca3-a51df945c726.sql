-- 1) Chave institucional única
CREATE TABLE IF NOT EXISTS public.registro_identidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade text NOT NULL CHECK (entidade IN ('associado','dependente')),
  registro_id uuid,
  identificador_institucional text,
  matricula text,
  cpf text,
  codigo_associado text,
  codigo_externo text,
  titular_identificador text,
  titular_registro_id uuid,
  connector_id uuid REFERENCES public.integration_connectors(id) ON DELETE SET NULL,
  origem text NOT NULL DEFAULT 'manual',
  ultima_sincronizacao timestamptz,
  situacao_sync text NOT NULL DEFAULT 'nunca_sincronizado',
  alterado_manualmente boolean NOT NULL DEFAULT false,
  alterado_manualmente_em timestamptz,
  divergencia_pendente boolean NOT NULL DEFAULT false,
  validado boolean NOT NULL DEFAULT false,
  validado_por uuid,
  validado_em timestamptz,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entidade, registro_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS registro_identidades_ident_uidx
  ON public.registro_identidades (identificador_institucional)
  WHERE identificador_institucional IS NOT NULL;
CREATE INDEX IF NOT EXISTS registro_identidades_matricula_idx ON public.registro_identidades (matricula);
CREATE INDEX IF NOT EXISTS registro_identidades_cpf_idx ON public.registro_identidades (cpf);
CREATE INDEX IF NOT EXISTS registro_identidades_externo_idx ON public.registro_identidades (codigo_externo);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.registro_identidades TO authenticated;
GRANT ALL ON public.registro_identidades TO service_role;
ALTER TABLE public.registro_identidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "identidades_select" ON public.registro_identidades FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));
CREATE POLICY "identidades_insert" ON public.registro_identidades FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'integracoes', 'criar'));
CREATE POLICY "identidades_update" ON public.registro_identidades FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'integracoes', 'editar'));
CREATE POLICY "identidades_delete" ON public.registro_identidades FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'excluir'));

CREATE TRIGGER trg_registro_identidades_updated
  BEFORE UPDATE ON public.registro_identidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Ampliação da central de inconsistências
ALTER TABLE public.data_conflicts
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'divergencia_campo',
  ADD COLUMN IF NOT EXISTS severidade text NOT NULL DEFAULT 'media',
  ADD COLUMN IF NOT EXISTS origem_sistema text,
  ADD COLUMN IF NOT EXISTS registro_id_a uuid,
  ADD COLUMN IF NOT EXISTS registro_id_b uuid,
  ADD COLUMN IF NOT EXISTS detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS valor_escolhido text,
  ADD COLUMN IF NOT EXISTS observacao text,
  ADD COLUMN IF NOT EXISTS ignorar_ate timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS data_conflicts_status_idx ON public.data_conflicts (status);
CREATE INDEX IF NOT EXISTS data_conflicts_tipo_idx ON public.data_conflicts (tipo);
CREATE UNIQUE INDEX IF NOT EXISTS data_conflicts_dedupe_uidx
  ON public.data_conflicts (entidade, tipo, coalesce(chave,''), campo)
  WHERE status = 'aberto';

CREATE TRIGGER trg_data_conflicts_updated
  BEFORE UPDATE ON public.data_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Histórico de decisões (append-only)
CREATE TABLE IF NOT EXISTS public.data_conflict_decisoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_id uuid NOT NULL REFERENCES public.data_conflicts(id) ON DELETE CASCADE,
  acao text NOT NULL,
  valor_escolhido text,
  observacao text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ator_user_id uuid,
  ator_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.data_conflict_decisoes TO authenticated;
GRANT ALL ON public.data_conflict_decisoes TO service_role;
ALTER TABLE public.data_conflict_decisoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decisoes_select" ON public.data_conflict_decisoes FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'visualizar')
      OR public.tem_permissao(auth.uid(), 'auditoria', 'visualizar'));
CREATE POLICY "decisoes_insert" ON public.data_conflict_decisoes FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'integracoes', 'editar') AND ator_user_id = auth.uid());

-- 4) Rotina de detecção de inconsistências
CREATE OR REPLACE FUNCTION public.detectar_inconsistencias()
RETURNS TABLE(tipo text, criadas integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _n integer;
BEGIN
  IF NOT public.tem_permissao(auth.uid(), 'integracoes', 'visualizar') THEN
    RAISE EXCEPTION 'Sem permissão para executar a verificação de inconsistências';
  END IF;

  -- CPF duplicado (associados)
  WITH d AS (
    SELECT lower(regexp_replace(cpf,'\D','','g')) AS k, count(*) c, string_agg(nome || ' (' || matricula || ')', ' | ') nomes
    FROM public.associados WHERE cpf IS NOT NULL AND cpf <> ''
    GROUP BY 1 HAVING count(*) > 1
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, valor_novo, detalhes)
    SELECT 'associado', 'cpf_duplicado', 'alta', d.k, 'cpf', d.nomes, NULL,
           jsonb_build_object('ocorrencias', d.c)
    FROM d
    ON CONFLICT DO NOTHING
    RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'cpf_duplicado'; criadas := _n; RETURN NEXT;

  -- Matrícula duplicada
  WITH d AS (
    SELECT lower(trim(matricula)) AS k, count(*) c, string_agg(nome, ' | ') nomes
    FROM public.associados WHERE matricula IS NOT NULL AND matricula <> ''
    GROUP BY 1 HAVING count(*) > 1
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, detalhes)
    SELECT 'associado', 'matricula_duplicada', 'alta', d.k, 'matricula', d.nomes, jsonb_build_object('ocorrencias', d.c)
    FROM d ON CONFLICT DO NOTHING RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'matricula_duplicada'; criadas := _n; RETURN NEXT;

  -- CPF duplicado entre dependentes e associados
  WITH d AS (
    SELECT lower(regexp_replace(dep.cpf,'\D','','g')) AS k, dep.id, dep.nome
    FROM public.dependentes dep
    WHERE dep.cpf IS NOT NULL AND dep.cpf <> ''
      AND EXISTS (SELECT 1 FROM public.associados a
                  WHERE lower(regexp_replace(a.cpf,'\D','','g')) = lower(regexp_replace(dep.cpf,'\D','','g')))
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, registro_id_a, detalhes)
    SELECT 'dependente', 'cpf_duplicado', 'alta', d.k, 'cpf', d.nome, d.id, '{}'::jsonb
    FROM d ON CONFLICT DO NOTHING RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'cpf_duplicado_dependente'; criadas := _n; RETURN NEXT;

  -- Dependente sem titular
  WITH d AS (
    SELECT dep.id, dep.nome FROM public.dependentes dep
    LEFT JOIN public.associados a ON a.id = dep.associado_id
    WHERE a.id IS NULL
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, registro_id_a)
    SELECT 'dependente', 'dependente_sem_titular', 'alta', d.id::text, 'associado_id', d.nome, d.id
    FROM d ON CONFLICT DO NOTHING RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'dependente_sem_titular'; criadas := _n; RETURN NEXT;

  -- Associado sem vínculo institucional (sem chave institucional registrada)
  WITH d AS (
    SELECT a.id, a.nome FROM public.associados a
    LEFT JOIN public.registro_identidades ri
      ON ri.entidade = 'associado' AND ri.registro_id = a.id
    WHERE ri.id IS NULL
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, registro_id_a)
    SELECT 'associado', 'associado_sem_vinculo', 'media', d.id::text, 'identificador_institucional', d.nome, d.id
    FROM d ON CONFLICT DO NOTHING RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'associado_sem_vinculo'; criadas := _n; RETURN NEXT;

  -- Cadastro incompleto
  WITH d AS (
    SELECT a.id, a.nome,
      array_to_string(array_remove(ARRAY[
        CASE WHEN a.cpf IS NULL OR a.cpf = '' THEN 'cpf' END,
        CASE WHEN a.data_nascimento IS NULL THEN 'data_nascimento' END,
        CASE WHEN a.patente IS NULL OR a.patente = '' THEN 'patente' END,
        CASE WHEN a.email IS NULL OR a.email = '' THEN 'email' END
      ], NULL), ', ') AS faltando
    FROM public.associados a
  ), ins AS (
    INSERT INTO public.data_conflicts (entidade, tipo, severidade, chave, campo, valor_atual, registro_id_a, detalhes)
    SELECT 'associado', 'cadastro_incompleto', 'baixa', d.id::text, 'campos_obrigatorios', d.nome, d.id,
           jsonb_build_object('faltando', d.faltando)
    FROM d WHERE d.faltando <> '' ON CONFLICT DO NOTHING RETURNING 1
  ) SELECT count(*) INTO _n FROM ins;
  tipo := 'cadastro_incompleto'; criadas := _n; RETURN NEXT;

  -- Sinaliza divergência pendente nas identidades
  UPDATE public.registro_identidades ri
     SET divergencia_pendente = EXISTS (
       SELECT 1 FROM public.data_conflicts c
       WHERE c.status = 'aberto' AND c.registro_id_a = ri.registro_id
     );

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.detectar_inconsistencias() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.detectar_inconsistencias() TO authenticated;