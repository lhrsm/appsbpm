-- ===== Enums =====
DO $$ BEGIN
  CREATE TYPE public.rh_status_solicitacao AS ENUM ('solicitado','aprovado','reprovado','cancelado','concluido');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.rh_tipo_frequencia AS ENUM ('normal','falta','falta_abonada','ferias','afastamento','feriado','folga','hora_extra');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.rh_tipo_afastamento AS ENUM ('atestado_medico','licenca_maternidade','licenca_paternidade','acidente_trabalho','licenca_nao_remunerada','suspensao','outro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== Jornadas =====
CREATE TABLE public.rh_jornadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  carga_semanal numeric(5,2),
  hora_entrada time,
  hora_saida time,
  intervalo_minutos integer DEFAULT 60,
  dias_semana integer[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_jornadas TO authenticated;
GRANT ALL ON public.rh_jornadas TO service_role;
ALTER TABLE public.rh_jornadas ENABLE ROW LEVEL SECURITY;

-- ===== Frequência =====
CREATE TABLE public.rh_frequencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  data date NOT NULL,
  hora_entrada time,
  hora_saida time,
  horas_trabalhadas numeric(5,2),
  tipo public.rh_tipo_frequencia NOT NULL DEFAULT 'normal',
  abonado boolean NOT NULL DEFAULT false,
  justificativa text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (colaborador_id, data)
);
CREATE INDEX idx_rh_frequencia_colab_data ON public.rh_frequencia (colaborador_id, data DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_frequencia TO authenticated;
GRANT ALL ON public.rh_frequencia TO service_role;
ALTER TABLE public.rh_frequencia ENABLE ROW LEVEL SECURITY;

-- ===== Férias =====
CREATE TABLE public.rh_ferias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  periodo_aquisitivo_inicio date,
  periodo_aquisitivo_fim date,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  dias integer,
  abono_pecuniario boolean NOT NULL DEFAULT false,
  dias_abono integer DEFAULT 0,
  status public.rh_status_solicitacao NOT NULL DEFAULT 'solicitado',
  observacoes text,
  justificativa text,
  solicitado_por uuid,
  aprovado_por uuid,
  aprovado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rh_ferias_colab ON public.rh_ferias (colaborador_id, data_inicio DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_ferias TO authenticated;
GRANT ALL ON public.rh_ferias TO service_role;
ALTER TABLE public.rh_ferias ENABLE ROW LEVEL SECURITY;

-- ===== Afastamentos =====
CREATE TABLE public.rh_afastamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  tipo public.rh_tipo_afastamento NOT NULL DEFAULT 'outro',
  data_inicio date NOT NULL,
  data_fim date,
  dias integer,
  possui_atestado boolean NOT NULL DEFAULT false,
  documento_path text,
  status public.rh_status_solicitacao NOT NULL DEFAULT 'solicitado',
  observacoes text,
  registrado_por uuid,
  aprovado_por uuid,
  aprovado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rh_afastamentos_colab ON public.rh_afastamentos (colaborador_id, data_inicio DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_afastamentos TO authenticated;
GRANT ALL ON public.rh_afastamentos TO service_role;
ALTER TABLE public.rh_afastamentos ENABLE ROW LEVEL SECURITY;

-- ===== Benefícios =====
CREATE TABLE public.rh_beneficios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text,
  descricao text,
  valor_padrao numeric(12,2),
  desconto_colaborador numeric(12,2),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_beneficios TO authenticated;
GRANT ALL ON public.rh_beneficios TO service_role;
ALTER TABLE public.rh_beneficios ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rh_beneficio_concessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  beneficio_id uuid NOT NULL REFERENCES public.rh_beneficios(id) ON DELETE RESTRICT,
  valor numeric(12,2),
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_fim date,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rh_concessoes_colab ON public.rh_beneficio_concessoes (colaborador_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_beneficio_concessoes TO authenticated;
GRANT ALL ON public.rh_beneficio_concessoes TO service_role;
ALTER TABLE public.rh_beneficio_concessoes ENABLE ROW LEVEL SECURITY;

-- ===== Solicitações =====
CREATE TABLE public.rh_solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descricao text,
  status public.rh_status_solicitacao NOT NULL DEFAULT 'solicitado',
  resposta text,
  solicitado_por uuid,
  respondido_por uuid,
  respondido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rh_solicitacoes_status ON public.rh_solicitacoes (status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_solicitacoes TO authenticated;
GRANT ALL ON public.rh_solicitacoes TO service_role;
ALTER TABLE public.rh_solicitacoes ENABLE ROW LEVEL SECURITY;

-- ===== Políticas RLS (módulo rh) =====
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rh_jornadas','rh_frequencia','rh_ferias','rh_afastamentos','rh_beneficios','rh_beneficio_concessoes','rh_solicitacoes'] LOOP
    EXECUTE format($f$
      CREATE POLICY "rh_select_%1$s" ON public.%1$I FOR SELECT TO authenticated
        USING (public.tem_permissao(auth.uid(), 'rh', 'visualizar'));
      CREATE POLICY "rh_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (public.tem_permissao(auth.uid(), 'rh', 'criar'));
      CREATE POLICY "rh_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated
        USING (public.tem_permissao(auth.uid(), 'rh', 'editar'))
        WITH CHECK (public.tem_permissao(auth.uid(), 'rh', 'editar'));
      CREATE POLICY "rh_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated
        USING (public.tem_permissao(auth.uid(), 'rh', 'excluir'));
    $f$, t);
  END LOOP;
END $$;

-- ===== Bloqueio de auto-aprovação =====
CREATE OR REPLACE FUNCTION public.rh_bloquear_autoaprovacao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _colab_user uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;

  SELECT c.user_id INTO _colab_user
  FROM public.rh_colaboradores c WHERE c.id = NEW.colaborador_id;

  IF _colab_user IS NOT NULL AND _colab_user = auth.uid()
     AND NEW.status IN ('aprovado','reprovado')
     AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    RAISE EXCEPTION 'Um colaborador não pode aprovar ou reprovar a própria solicitação';
  END IF;

  IF NEW.status IN ('aprovado','reprovado')
     AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status)
     AND NOT public.tem_permissao(auth.uid(), 'rh', 'aprovar') THEN
    RAISE EXCEPTION 'Sem permissão para aprovar ou reprovar registros de RH';
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER trg_rh_ferias_aprovacao BEFORE INSERT OR UPDATE ON public.rh_ferias
  FOR EACH ROW EXECUTE FUNCTION public.rh_bloquear_autoaprovacao();
CREATE TRIGGER trg_rh_afastamentos_aprovacao BEFORE INSERT OR UPDATE ON public.rh_afastamentos
  FOR EACH ROW EXECUTE FUNCTION public.rh_bloquear_autoaprovacao();
CREATE TRIGGER trg_rh_solicitacoes_aprovacao BEFORE INSERT OR UPDATE ON public.rh_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION public.rh_bloquear_autoaprovacao();

-- ===== updated_at + histórico =====
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rh_jornadas','rh_frequencia','rh_ferias','rh_afastamentos','rh_beneficios','rh_beneficio_concessoes','rh_solicitacoes'] LOOP
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_hist AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.rh_registrar_historico();', t);
  END LOOP;
END $$;