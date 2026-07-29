
-- ENUMS
CREATE TYPE public.ctb_conta_tipo AS ENUM ('ativo','passivo','patrimonio_liquido','receita','despesa','resultado','compensacao');
CREATE TYPE public.ctb_natureza AS ENUM ('devedora','credora');
CREATE TYPE public.ctb_situacao_periodo AS ENUM ('aberto','em_fechamento','fechado','reaberto');
CREATE TYPE public.ctb_lote_status AS ENUM ('rascunho','simulado','conferido','efetivado','cancelado');
CREATE TYPE public.ctb_lanc_status AS ENUM ('rascunho','simulado','efetivado','estornado','cancelado');
CREATE TYPE public.ctb_origem AS ENUM ('manual','financeiro_receita','financeiro_despesa','financeiro_pagamento','financeiro_recebimento','patrimonio_aquisicao','patrimonio_depreciacao','patrimonio_baixa','importacao','integracao');

-- EXERCICIOS
CREATE TABLE public.ctb_exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL UNIQUE,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  situacao public.ctb_situacao_periodo NOT NULL DEFAULT 'aberto',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_exercicios TO authenticated;
GRANT ALL ON public.ctb_exercicios TO service_role;
ALTER TABLE public.ctb_exercicios ENABLE ROW LEVEL SECURITY;

-- PERIODOS
CREATE TABLE public.ctb_periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio_id uuid NOT NULL REFERENCES public.ctb_exercicios(id) ON DELETE CASCADE,
  competencia date NOT NULL,
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  situacao public.ctb_situacao_periodo NOT NULL DEFAULT 'aberto',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercicio_id, competencia)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_periodos TO authenticated;
GRANT ALL ON public.ctb_periodos TO service_role;
ALTER TABLE public.ctb_periodos ENABLE ROW LEVEL SECURITY;

-- PLANO DE CONTAS
CREATE TABLE public.ctb_plano_contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  tipo public.ctb_conta_tipo NOT NULL,
  natureza public.ctb_natureza NOT NULL,
  nivel integer NOT NULL DEFAULT 1,
  parent_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE RESTRICT,
  aceita_lancamento boolean NOT NULL DEFAULT false,
  ativa boolean NOT NULL DEFAULT true,
  vigencia_inicio date,
  vigencia_fim date,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ctb_contas_parent ON public.ctb_plano_contas (parent_id);
CREATE INDEX idx_ctb_contas_codigo ON public.ctb_plano_contas (codigo);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_plano_contas TO authenticated;
GRANT ALL ON public.ctb_plano_contas TO service_role;
ALTER TABLE public.ctb_plano_contas ENABLE ROW LEVEL SECURITY;

-- LOTES
CREATE TABLE public.ctb_lotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text,
  descricao text NOT NULL,
  competencia date NOT NULL,
  periodo_id uuid REFERENCES public.ctb_periodos(id) ON DELETE SET NULL,
  origem public.ctb_origem NOT NULL DEFAULT 'manual',
  status public.ctb_lote_status NOT NULL DEFAULT 'rascunho',
  simulacao boolean NOT NULL DEFAULT true,
  observacoes text,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_lotes TO authenticated;
GRANT ALL ON public.ctb_lotes TO service_role;
ALTER TABLE public.ctb_lotes ENABLE ROW LEVEL SECURITY;

-- LANCAMENTOS
CREATE TABLE public.ctb_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  competencia date NOT NULL,
  periodo_id uuid REFERENCES public.ctb_periodos(id) ON DELETE SET NULL,
  historico text NOT NULL,
  documento text,
  conta_debito_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE RESTRICT,
  conta_credito_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE RESTRICT,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  centro_custo_id uuid REFERENCES public.fin_centros_custo(id) ON DELETE SET NULL,
  origem public.ctb_origem NOT NULL DEFAULT 'manual',
  origem_referencia text,
  lote_id uuid REFERENCES public.ctb_lotes(id) ON DELETE SET NULL,
  status public.ctb_lanc_status NOT NULL DEFAULT 'rascunho',
  simulacao boolean NOT NULL DEFAULT true,
  estorno_de uuid REFERENCES public.ctb_lancamentos(id) ON DELETE SET NULL,
  justificativa text,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ctb_lanc_competencia ON public.ctb_lancamentos (competencia);
CREATE INDEX idx_ctb_lanc_status ON public.ctb_lancamentos (status);
CREATE INDEX idx_ctb_lanc_lote ON public.ctb_lancamentos (lote_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_lancamentos TO authenticated;
GRANT ALL ON public.ctb_lancamentos TO service_role;
ALTER TABLE public.ctb_lancamentos ENABLE ROW LEVEL SECURITY;

-- HISTORICO (append-only)
CREATE TABLE public.ctb_lancamento_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id uuid NOT NULL REFERENCES public.ctb_lancamentos(id) ON DELETE CASCADE,
  acao text NOT NULL,
  status_anterior public.ctb_lanc_status,
  status_novo public.ctb_lanc_status,
  valor_anterior numeric(14,2),
  valor_novo numeric(14,2),
  justificativa text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ator_user_id uuid,
  ator_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ctb_lancamento_historico TO authenticated;
GRANT ALL ON public.ctb_lancamento_historico TO service_role;
ALTER TABLE public.ctb_lancamento_historico ENABLE ROW LEVEL SECURITY;

-- CONCILIACOES
CREATE TABLE public.ctb_conciliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid REFERENCES public.ctb_periodos(id) ON DELETE SET NULL,
  conta_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE SET NULL,
  referencia text,
  saldo_contabil numeric(14,2) NOT NULL DEFAULT 0,
  saldo_externo numeric(14,2) NOT NULL DEFAULT 0,
  diferenca numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  observacoes text,
  conciliado_por uuid,
  conciliado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_conciliacoes TO authenticated;
GRANT ALL ON public.ctb_conciliacoes TO service_role;
ALTER TABLE public.ctb_conciliacoes ENABLE ROW LEVEL SECURITY;

-- FECHAMENTOS
CREATE TABLE public.ctb_fechamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL REFERENCES public.ctb_periodos(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'mensal',
  situacao public.ctb_situacao_periodo NOT NULL DEFAULT 'em_fechamento',
  observacoes text,
  responsavel_user_id uuid,
  responsavel_email text,
  fechado_em timestamptz,
  reaberto_em timestamptz,
  reaberto_justificativa text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_fechamentos TO authenticated;
GRANT ALL ON public.ctb_fechamentos TO service_role;
ALTER TABLE public.ctb_fechamentos ENABLE ROW LEVEL SECURITY;

-- MAPEAMENTOS DE INTEGRACAO
CREATE TABLE public.ctb_integracao_mapeamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento public.ctb_origem NOT NULL,
  descricao text NOT NULL,
  conta_debito_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE SET NULL,
  conta_credito_id uuid REFERENCES public.ctb_plano_contas(id) ON DELETE SET NULL,
  historico_padrao text,
  condicoes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ativo boolean NOT NULL DEFAULT false,
  validado boolean NOT NULL DEFAULT false,
  validado_por uuid,
  validado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_integracao_mapeamentos TO authenticated;
GRANT ALL ON public.ctb_integracao_mapeamentos TO service_role;
ALTER TABLE public.ctb_integracao_mapeamentos ENABLE ROW LEVEL SECURITY;

-- CONFIG
CREATE TABLE public.ctb_config (
  chave text PRIMARY KEY,
  valor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ctb_config TO authenticated;
GRANT ALL ON public.ctb_config TO service_role;
ALTER TABLE public.ctb_config ENABLE ROW LEVEL SECURITY;

-- TRIGGERS updated_at
CREATE TRIGGER trg_ctb_exerc_upd BEFORE UPDATE ON public.ctb_exercicios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_per_upd BEFORE UPDATE ON public.ctb_periodos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_pc_upd BEFORE UPDATE ON public.ctb_plano_contas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_lote_upd BEFORE UPDATE ON public.ctb_lotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_lanc_upd BEFORE UPDATE ON public.ctb_lancamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_conc_upd BEFORE UPDATE ON public.ctb_conciliacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_fech_upd BEFORE UPDATE ON public.ctb_fechamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ctb_map_upd BEFORE UPDATE ON public.ctb_integracao_mapeamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HISTORICO AUTOMATICO
CREATE OR REPLACE FUNCTION public.ctb_registrar_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ctb_lancamento_historico (lancamento_id, acao, status_novo, valor_novo, ator_user_id, ator_email, detalhes)
    VALUES (NEW.id, 'criado', NEW.status, NEW.valor, auth.uid(), NEW.criado_por_email,
            jsonb_build_object('origem', NEW.origem, 'historico', NEW.historico, 'simulacao', NEW.simulacao));
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.ctb_lancamento_historico (lancamento_id, acao, status_anterior, status_novo, justificativa, ator_user_id)
    VALUES (NEW.id, 'status_alterado', OLD.status, NEW.status, NEW.justificativa, auth.uid());
  END IF;
  IF NEW.valor IS DISTINCT FROM OLD.valor THEN
    INSERT INTO public.ctb_lancamento_historico (lancamento_id, acao, valor_anterior, valor_novo, justificativa, ator_user_id)
    VALUES (NEW.id, 'valor_alterado', OLD.valor, NEW.valor, NEW.justificativa, auth.uid());
  END IF;
  IF (NEW.historico IS DISTINCT FROM OLD.historico)
     OR (NEW.conta_debito_id IS DISTINCT FROM OLD.conta_debito_id)
     OR (NEW.conta_credito_id IS DISTINCT FROM OLD.conta_credito_id)
     OR (NEW.competencia IS DISTINCT FROM OLD.competencia) THEN
    INSERT INTO public.ctb_lancamento_historico (lancamento_id, acao, ator_user_id, detalhes)
    VALUES (NEW.id, 'editado', auth.uid(), jsonb_build_object(
      'historico_de', OLD.historico, 'historico_para', NEW.historico,
      'competencia_de', OLD.competencia, 'competencia_para', NEW.competencia));
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_ctb_lanc_hist AFTER INSERT OR UPDATE ON public.ctb_lancamentos FOR EACH ROW EXECUTE FUNCTION public.ctb_registrar_historico();

-- BLOQUEIO DE EXCLUSAO
CREATE OR REPLACE FUNCTION public.ctb_bloquear_exclusao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.status IN ('efetivado','estornado') THEN
    RAISE EXCEPTION 'Lançamentos efetivados ou estornados não podem ser excluídos. Utilize o estorno com justificativa.';
  END IF;
  RETURN OLD;
END; $$;
CREATE TRIGGER trg_ctb_lanc_del BEFORE DELETE ON public.ctb_lancamentos FOR EACH ROW EXECUTE FUNCTION public.ctb_bloquear_exclusao();

-- POLICIES
CREATE POLICY "ctb_exerc_select" ON public.ctb_exercicios FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_exerc_insert" ON public.ctb_exercicios FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_exerc_update" ON public.ctb_exercicios FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_exerc_delete" ON public.ctb_exercicios FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_per_select" ON public.ctb_periodos FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_per_insert" ON public.ctb_periodos FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_per_update" ON public.ctb_periodos FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_per_delete" ON public.ctb_periodos FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_pc_select" ON public.ctb_plano_contas FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_pc_insert" ON public.ctb_plano_contas FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_pc_update" ON public.ctb_plano_contas FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_pc_delete" ON public.ctb_plano_contas FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_lote_select" ON public.ctb_lotes FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_lote_insert" ON public.ctb_lotes FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_lote_update" ON public.ctb_lotes FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_lote_delete" ON public.ctb_lotes FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_lanc_select" ON public.ctb_lancamentos FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_lanc_insert" ON public.ctb_lancamentos FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_lanc_update" ON public.ctb_lancamentos FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_lanc_delete" ON public.ctb_lancamentos FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_hist_select" ON public.ctb_lancamento_historico FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_hist_insert" ON public.ctb_lancamento_historico FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));

CREATE POLICY "ctb_conc_select" ON public.ctb_conciliacoes FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_conc_insert" ON public.ctb_conciliacoes FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_conc_update" ON public.ctb_conciliacoes FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','editar'));
CREATE POLICY "ctb_conc_delete" ON public.ctb_conciliacoes FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_fech_select" ON public.ctb_fechamentos FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_fech_insert" ON public.ctb_fechamentos FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','criar'));
CREATE POLICY "ctb_fech_update" ON public.ctb_fechamentos FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','aprovar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','aprovar'));
CREATE POLICY "ctb_fech_delete" ON public.ctb_fechamentos FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','excluir'));

CREATE POLICY "ctb_map_select" ON public.ctb_integracao_mapeamentos FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_map_insert" ON public.ctb_integracao_mapeamentos FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','configurar'));
CREATE POLICY "ctb_map_update" ON public.ctb_integracao_mapeamentos FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','configurar'));
CREATE POLICY "ctb_map_delete" ON public.ctb_integracao_mapeamentos FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','configurar'));

CREATE POLICY "ctb_cfg_select" ON public.ctb_config FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','visualizar'));
CREATE POLICY "ctb_cfg_insert" ON public.ctb_config FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','configurar'));
CREATE POLICY "ctb_cfg_update" ON public.ctb_config FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'contabilidade','configurar'));
CREATE POLICY "ctb_cfg_delete" ON public.ctb_config FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'contabilidade','configurar'));

-- SEEDS
INSERT INTO public.ctb_config (chave, valor) VALUES
  ('contabilizacao_automatica','false'),
  ('modo_simulacao','true'),
  ('mapeamento_validado','false')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO public.ctb_integracao_mapeamentos (evento, descricao, historico_padrao) VALUES
  ('financeiro_receita','Receitas registradas no Financeiro','Reconhecimento de receita'),
  ('financeiro_despesa','Despesas registradas no Financeiro','Reconhecimento de despesa'),
  ('financeiro_pagamento','Pagamentos liquidados','Liquidação de pagamento'),
  ('financeiro_recebimento','Recebimentos liquidados','Liquidação de recebimento'),
  ('patrimonio_aquisicao','Aquisições patrimoniais','Aquisição de bem patrimonial'),
  ('patrimonio_depreciacao','Depreciação de bens','Depreciação do período'),
  ('patrimonio_baixa','Baixas patrimoniais','Baixa de bem patrimonial')
ON CONFLICT DO NOTHING;

INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
SELECT p.codigo, 'contabilidade', '*', a.acao
FROM public.perfis p
CROSS JOIN (SELECT unnest(ARRAY['visualizar','criar','editar','excluir','aprovar','exportar','configurar']::perm_acao[]) AS acao) a
WHERE p.codigo IN ('superadmin')
ON CONFLICT DO NOTHING;
