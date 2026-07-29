
CREATE TYPE public.fin_natureza AS ENUM ('receita', 'despesa');
CREATE TYPE public.fin_status AS ENUM ('rascunho','pendente','aprovado','pago','cancelado','estornado');
CREATE TYPE public.fin_conta_tipo AS ENUM ('corrente','poupanca','investimento','aplicacao');

CREATE TABLE public.fin_contas_bancarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  banco text,
  agencia text,
  conta text,
  tipo fin_conta_tipo NOT NULL DEFAULT 'corrente',
  saldo_inicial numeric(14,2) NOT NULL DEFAULT 0,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_contas_bancarias TO authenticated;
GRANT ALL ON public.fin_contas_bancarias TO service_role;
ALTER TABLE public.fin_contas_bancarias ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_caixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  responsavel text,
  saldo_inicial numeric(14,2) NOT NULL DEFAULT 0,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_caixas TO authenticated;
GRANT ALL ON public.fin_caixas TO service_role;
ALTER TABLE public.fin_caixas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_centros_custo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_centros_custo TO authenticated;
GRANT ALL ON public.fin_centros_custo TO service_role;
ALTER TABLE public.fin_centros_custo ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  natureza fin_natureza NOT NULL,
  parent_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_categorias TO authenticated;
GRANT ALL ON public.fin_categorias TO service_role;
ALTER TABLE public.fin_categorias ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  documento text,
  email text,
  telefone text,
  banco text,
  agencia text,
  conta text,
  chave_pix text,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_fornecedores TO authenticated;
GRANT ALL ON public.fin_fornecedores TO service_role;
ALTER TABLE public.fin_fornecedores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  natureza fin_natureza NOT NULL,
  status fin_status NOT NULL DEFAULT 'pendente',
  descricao text NOT NULL,
  valor numeric(14,2) NOT NULL CHECK (valor > 0),
  competencia date NOT NULL DEFAULT (date_trunc('month', now())::date),
  vencimento date NOT NULL,
  pago_em date,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  centro_custo_id uuid REFERENCES public.fin_centros_custo(id) ON DELETE SET NULL,
  conta_id uuid REFERENCES public.fin_contas_bancarias(id) ON DELETE SET NULL,
  caixa_id uuid REFERENCES public.fin_caixas(id) ON DELETE SET NULL,
  fornecedor_id uuid REFERENCES public.fin_fornecedores(id) ON DELETE SET NULL,
  associado_id uuid REFERENCES public.associados(id) ON DELETE SET NULL,
  forma_pagamento text,
  documento text,
  observacoes text,
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorrente boolean NOT NULL DEFAULT false,
  recorrencia_grupo uuid,
  estorno_de uuid REFERENCES public.fin_lancamentos(id) ON DELETE SET NULL,
  justificativa text,
  criado_por uuid,
  criado_por_email text,
  aprovado_por uuid,
  aprovado_em timestamptz,
  demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_lanc_venc ON public.fin_lancamentos (vencimento);
CREATE INDEX idx_fin_lanc_status ON public.fin_lancamentos (status);
CREATE INDEX idx_fin_lanc_natureza ON public.fin_lancamentos (natureza);
CREATE INDEX idx_fin_lanc_competencia ON public.fin_lancamentos (competencia);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_lancamentos TO authenticated;
GRANT ALL ON public.fin_lancamentos TO service_role;
ALTER TABLE public.fin_lancamentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.fin_lancamento_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id uuid NOT NULL REFERENCES public.fin_lancamentos(id) ON DELETE CASCADE,
  acao text NOT NULL,
  status_anterior fin_status,
  status_novo fin_status,
  valor_anterior numeric(14,2),
  valor_novo numeric(14,2),
  justificativa text,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ator_user_id uuid,
  ator_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_hist_lanc ON public.fin_lancamento_historico (lancamento_id, created_at DESC);
GRANT SELECT, INSERT ON public.fin_lancamento_historico TO authenticated;
GRANT ALL ON public.fin_lancamento_historico TO service_role;
ALTER TABLE public.fin_lancamento_historico ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_fin_contas_upd BEFORE UPDATE ON public.fin_contas_bancarias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_caixas_upd BEFORE UPDATE ON public.fin_caixas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_cc_upd BEFORE UPDATE ON public.fin_centros_custo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_cat_upd BEFORE UPDATE ON public.fin_categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_forn_upd BEFORE UPDATE ON public.fin_fornecedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fin_lanc_upd BEFORE UPDATE ON public.fin_lancamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.fin_bloquear_exclusao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.status IN ('aprovado','pago','estornado','cancelado') THEN
    RAISE EXCEPTION 'Lançamentos aprovados, pagos, cancelados ou estornados não podem ser excluídos. Utilize cancelamento ou estorno.';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER trg_fin_lanc_del BEFORE DELETE ON public.fin_lancamentos FOR EACH ROW EXECUTE FUNCTION public.fin_bloquear_exclusao();

CREATE OR REPLACE FUNCTION public.fin_registrar_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.fin_lancamento_historico (lancamento_id, acao, status_novo, valor_novo, ator_user_id, ator_email, detalhes)
    VALUES (NEW.id, 'criado', NEW.status, NEW.valor, auth.uid(), NEW.criado_por_email,
            jsonb_build_object('natureza', NEW.natureza, 'descricao', NEW.descricao));
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.fin_lancamento_historico (lancamento_id, acao, status_anterior, status_novo, justificativa, ator_user_id)
    VALUES (NEW.id, 'status_alterado', OLD.status, NEW.status, NEW.justificativa, auth.uid());
  END IF;

  IF NEW.valor IS DISTINCT FROM OLD.valor THEN
    INSERT INTO public.fin_lancamento_historico (lancamento_id, acao, valor_anterior, valor_novo, justificativa, ator_user_id)
    VALUES (NEW.id, 'valor_alterado', OLD.valor, NEW.valor, NEW.justificativa, auth.uid());
  END IF;

  IF (NEW.descricao IS DISTINCT FROM OLD.descricao)
     OR (NEW.vencimento IS DISTINCT FROM OLD.vencimento)
     OR (NEW.categoria_id IS DISTINCT FROM OLD.categoria_id)
     OR (NEW.centro_custo_id IS DISTINCT FROM OLD.centro_custo_id) THEN
    INSERT INTO public.fin_lancamento_historico (lancamento_id, acao, ator_user_id, detalhes)
    VALUES (NEW.id, 'editado', auth.uid(), jsonb_build_object(
      'descricao_de', OLD.descricao, 'descricao_para', NEW.descricao,
      'vencimento_de', OLD.vencimento, 'vencimento_para', NEW.vencimento));
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_fin_lanc_hist AFTER INSERT OR UPDATE ON public.fin_lancamentos FOR EACH ROW EXECUTE FUNCTION public.fin_registrar_historico();

CREATE POLICY "fin_contas_select" ON public.fin_contas_bancarias FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_contas_insert" ON public.fin_contas_bancarias FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_contas_update" ON public.fin_contas_bancarias FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_contas_delete" ON public.fin_contas_bancarias FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_caixas_select" ON public.fin_caixas FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_caixas_insert" ON public.fin_caixas FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_caixas_update" ON public.fin_caixas FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_caixas_delete" ON public.fin_caixas FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_cc_select" ON public.fin_centros_custo FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_cc_insert" ON public.fin_centros_custo FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_cc_update" ON public.fin_centros_custo FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_cc_delete" ON public.fin_centros_custo FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_cat_select" ON public.fin_categorias FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_cat_insert" ON public.fin_categorias FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_cat_update" ON public.fin_categorias FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','configurar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','configurar'));
CREATE POLICY "fin_cat_delete" ON public.fin_categorias FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_forn_select" ON public.fin_fornecedores FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_forn_insert" ON public.fin_fornecedores FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','criar'));
CREATE POLICY "fin_forn_update" ON public.fin_fornecedores FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','editar'));
CREATE POLICY "fin_forn_delete" ON public.fin_fornecedores FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_lanc_select" ON public.fin_lancamentos FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_lanc_insert" ON public.fin_lancamentos FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','criar'));
CREATE POLICY "fin_lanc_update" ON public.fin_lancamentos FOR UPDATE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','editar')) WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','editar'));
CREATE POLICY "fin_lanc_delete" ON public.fin_lancamentos FOR DELETE TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','excluir'));

CREATE POLICY "fin_hist_select" ON public.fin_lancamento_historico FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_hist_insert" ON public.fin_lancamento_historico FOR INSERT TO authenticated WITH CHECK (public.tem_permissao(auth.uid(),'financeiro','visualizar'));

INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
SELECT p.codigo, 'financeiro', '*', a.acao
FROM public.perfis p
CROSS JOIN (VALUES ('visualizar'::perm_acao),('criar'::perm_acao),('editar'::perm_acao),('aprovar'::perm_acao),('exportar'::perm_acao),('configurar'::perm_acao),('excluir'::perm_acao)) AS a(acao)
WHERE p.codigo IN ('superadmin','gestor_financeiro')
ON CONFLICT DO NOTHING;

CREATE POLICY "fin_anexos_select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'financeiro-anexos' AND public.tem_permissao(auth.uid(),'financeiro','visualizar'));
CREATE POLICY "fin_anexos_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'financeiro-anexos' AND public.tem_permissao(auth.uid(),'financeiro','criar'));
CREATE POLICY "fin_anexos_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'financeiro-anexos' AND public.tem_permissao(auth.uid(),'financeiro','excluir'));
