-- ==========================================================
-- MÓDULO RECURSOS HUMANOS - FASE 1 (estrutura base)
-- ==========================================================

DO $$ BEGIN CREATE TYPE public.rh_situacao_colaborador AS ENUM ('ativo','afastado','ferias','desligado','suspenso'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.rh_tipo_vinculo AS ENUM ('clt','estagio','aprendiz','temporario','terceirizado','prestador','estatutario','cedido'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.rh_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text,
  nome text NOT NULL,
  cnpj text,
  endereco text,
  cidade text,
  uf text,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_unidades TO authenticated;
GRANT ALL ON public.rh_unidades TO service_role;
ALTER TABLE public.rh_unidades ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES public.rh_unidades(id) ON DELETE RESTRICT,
  setor_pai_id uuid REFERENCES public.rh_setores(id) ON DELETE RESTRICT,
  codigo text,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_setores TO authenticated;
GRANT ALL ON public.rh_setores TO service_role;
ALTER TABLE public.rh_setores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text,
  nome text NOT NULL,
  cbo text,
  descricao text,
  faixa_salarial_min numeric(14,2),
  faixa_salarial_max numeric(14,2),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_cargos TO authenticated;
GRANT ALL ON public.rh_cargos TO service_role;
ALTER TABLE public.rh_cargos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_colaboradores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_funcional text NOT NULL UNIQUE,
  nome text NOT NULL,
  nome_social text,
  cpf text UNIQUE,
  rg text,
  data_nascimento date,
  sexo text,
  estado_civil text,
  email text,
  telefone text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  foto_url text,
  situacao public.rh_situacao_colaborador NOT NULL DEFAULT 'ativo',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_colaboradores TO authenticated;
GRANT ALL ON public.rh_colaboradores TO service_role;
ALTER TABLE public.rh_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_vinculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE RESTRICT,
  tipo public.rh_tipo_vinculo NOT NULL DEFAULT 'clt',
  cargo_id uuid REFERENCES public.rh_cargos(id) ON DELETE RESTRICT,
  setor_id uuid REFERENCES public.rh_setores(id) ON DELETE RESTRICT,
  unidade_id uuid REFERENCES public.rh_unidades(id) ON DELETE RESTRICT,
  gestor_id uuid REFERENCES public.rh_colaboradores(id) ON DELETE SET NULL,
  data_admissao date NOT NULL,
  data_desligamento date,
  motivo_desligamento text,
  jornada_semanal numeric(5,2),
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_vinculos TO authenticated;
GRANT ALL ON public.rh_vinculos TO service_role;
ALTER TABLE public.rh_vinculos ENABLE ROW LEVEL SECURITY;
CREATE INDEX rh_vinculos_colab_idx ON public.rh_vinculos(colaborador_id);

CREATE TABLE public.rh_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descricao text,
  arquivo_path text NOT NULL,
  validade date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_documentos TO authenticated;
GRANT ALL ON public.rh_documentos TO service_role;
ALTER TABLE public.rh_documentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_dados_bancarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  banco text,
  agencia text,
  conta text,
  tipo_conta text,
  chave_pix text,
  titular text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_dados_bancarios TO authenticated;
GRANT ALL ON public.rh_dados_bancarios TO service_role;
ALTER TABLE public.rh_dados_bancarios ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_remuneracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vinculo_id uuid NOT NULL REFERENCES public.rh_vinculos(id) ON DELETE CASCADE,
  salario_base numeric(14,2) NOT NULL,
  vigencia_inicio date NOT NULL,
  vigencia_fim date,
  motivo text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_remuneracoes TO authenticated;
GRANT ALL ON public.rh_remuneracoes TO service_role;
ALTER TABLE public.rh_remuneracoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela text NOT NULL,
  registro_id uuid,
  operacao text NOT NULL,
  valor_anterior jsonb,
  valor_novo jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rh_historico TO authenticated;
GRANT ALL ON public.rh_historico TO service_role;
ALTER TABLE public.rh_historico ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- POLÍTICAS
-- ==========================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rh_unidades','rh_setores','rh_cargos','rh_colaboradores','rh_vinculos','rh_documentos'] LOOP
    EXECUTE format($f$
      CREATE POLICY "%1$s_select" ON public.%1$I FOR SELECT TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh','visualizar'));
      CREATE POLICY "%1$s_insert" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (public.tem_permissao(auth.uid(),'rh','criar'));
      CREATE POLICY "%1$s_update" ON public.%1$I FOR UPDATE TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh','editar'))
        WITH CHECK (public.tem_permissao(auth.uid(),'rh','editar'));
      CREATE POLICY "%1$s_delete" ON public.%1$I FOR DELETE TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh','excluir'));
    $f$, t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['rh_dados_bancarios','rh_remuneracoes'] LOOP
    EXECUTE format($f$
      CREATE POLICY "%1$s_select" ON public.%1$I FOR SELECT TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh_sensivel','visualizar'));
      CREATE POLICY "%1$s_insert" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (public.tem_permissao(auth.uid(),'rh_sensivel','criar'));
      CREATE POLICY "%1$s_update" ON public.%1$I FOR UPDATE TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh_sensivel','editar'))
        WITH CHECK (public.tem_permissao(auth.uid(),'rh_sensivel','editar'));
      CREATE POLICY "%1$s_delete" ON public.%1$I FOR DELETE TO authenticated
        USING (public.tem_permissao(auth.uid(),'rh_sensivel','excluir'));
    $f$, t);
  END LOOP;
END $$;

CREATE POLICY "rh_historico_select" ON public.rh_historico FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(),'rh','visualizar'));

-- ==========================================================
-- TRIGGERS
-- ==========================================================
CREATE OR REPLACE FUNCTION public.rh_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.rh_registrar_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_old jsonb; v_new jsonb;
BEGIN
  IF TG_OP <> 'INSERT' THEN v_old := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN v_new := to_jsonb(NEW); END IF;
  IF TG_TABLE_NAME = 'rh_dados_bancarios' THEN
    v_old := jsonb_strip_nulls(jsonb_build_object('id', v_old->'id', 'colaborador_id', v_old->'colaborador_id'));
    v_new := jsonb_strip_nulls(jsonb_build_object('id', v_new->'id', 'colaborador_id', v_new->'colaborador_id'));
  END IF;
  INSERT INTO public.rh_historico(tabela, registro_id, operacao, valor_anterior, valor_novo, user_id)
  VALUES (TG_TABLE_NAME, COALESCE((v_new->>'id')::uuid, (v_old->>'id')::uuid), TG_OP, v_old, v_new, auth.uid());
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE OR REPLACE FUNCTION public.rh_historico_imutavel()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Histórico de RH é imutável'; END $$;

CREATE TRIGGER rh_historico_no_update BEFORE UPDATE OR DELETE ON public.rh_historico
  FOR EACH ROW EXECUTE FUNCTION public.rh_historico_imutavel();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rh_unidades','rh_setores','rh_cargos','rh_colaboradores','rh_vinculos','rh_documentos','rh_dados_bancarios','rh_remuneracoes'] LOOP
    EXECUTE format('CREATE TRIGGER %1$s_updated BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();', t);
    EXECUTE format('CREATE TRIGGER %1$s_hist AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.rh_registrar_historico();', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.rh_bloquear_exclusao_colaborador()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.rh_vinculos WHERE colaborador_id = OLD.id) THEN
    RAISE EXCEPTION 'Colaborador possui histórico funcional. Utilize o desligamento.';
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER rh_colab_bloqueio_delete BEFORE DELETE ON public.rh_colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.rh_bloquear_exclusao_colaborador();

-- ---------- Storage privado (bucket rh-documentos já criado) ----------
CREATE POLICY "rh_docs_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'rh-documentos' AND public.tem_permissao(auth.uid(),'rh','visualizar'));
CREATE POLICY "rh_docs_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'rh-documentos' AND public.tem_permissao(auth.uid(),'rh','criar'));
CREATE POLICY "rh_docs_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'rh-documentos' AND public.tem_permissao(auth.uid(),'rh','editar'))
  WITH CHECK (bucket_id = 'rh-documentos' AND public.tem_permissao(auth.uid(),'rh','editar'));
CREATE POLICY "rh_docs_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'rh-documentos' AND public.tem_permissao(auth.uid(),'rh','excluir'));