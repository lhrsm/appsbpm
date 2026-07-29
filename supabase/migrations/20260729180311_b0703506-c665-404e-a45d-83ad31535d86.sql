-- ===== ENUMs =====
CREATE TYPE public.rh_folha_tipo AS ENUM ('mensal','decimo_terceiro','ferias','rescisao','complementar');
CREATE TYPE public.rh_folha_status AS ENUM ('rascunho','em_calculo','conferida','fechada','paga','cancelada');
CREATE TYPE public.rh_verba_tipo AS ENUM ('provento','desconto','informativa');

-- ===== Verbas / rubricas =====
CREATE TABLE public.rh_verbas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  tipo public.rh_verba_tipo NOT NULL DEFAULT 'provento',
  descricao text,
  incide_inss boolean NOT NULL DEFAULT false,
  incide_fgts boolean NOT NULL DEFAULT false,
  incide_irrf boolean NOT NULL DEFAULT false,
  automatica boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_verbas TO authenticated;
GRANT ALL ON public.rh_verbas TO service_role;
ALTER TABLE public.rh_verbas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rh_verbas_select" ON public.rh_verbas FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh', 'visualizar'));
CREATE POLICY "rh_verbas_insert" ON public.rh_verbas FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'configurar'));
CREATE POLICY "rh_verbas_update" ON public.rh_verbas FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'configurar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'configurar'));
CREATE POLICY "rh_verbas_delete" ON public.rh_verbas FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'configurar'));

-- ===== Folhas (competências) =====
CREATE TABLE public.rh_folhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia date NOT NULL,
  tipo public.rh_folha_tipo NOT NULL DEFAULT 'mensal',
  descricao text,
  periodo_inicio date,
  periodo_fim date,
  data_pagamento date,
  status public.rh_folha_status NOT NULL DEFAULT 'rascunho',
  total_proventos numeric(14,2) NOT NULL DEFAULT 0,
  total_descontos numeric(14,2) NOT NULL DEFAULT 0,
  total_liquido numeric(14,2) NOT NULL DEFAULT 0,
  observacoes text,
  fechada_em timestamptz,
  fechada_por uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competencia, tipo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_folhas TO authenticated;
GRANT ALL ON public.rh_folhas TO service_role;
ALTER TABLE public.rh_folhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rh_folhas_select" ON public.rh_folhas FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'visualizar'));
CREATE POLICY "rh_folhas_insert" ON public.rh_folhas FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'criar'));
CREATE POLICY "rh_folhas_update" ON public.rh_folhas FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'));
CREATE POLICY "rh_folhas_delete" ON public.rh_folhas FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'excluir'));

-- ===== Itens da folha (por colaborador) =====
CREATE TABLE public.rh_folha_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folha_id uuid NOT NULL REFERENCES public.rh_folhas(id) ON DELETE CASCADE,
  colaborador_id uuid NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE RESTRICT,
  vinculo_id uuid REFERENCES public.rh_vinculos(id) ON DELETE SET NULL,
  salario_base numeric(14,2) NOT NULL DEFAULT 0,
  total_proventos numeric(14,2) NOT NULL DEFAULT 0,
  total_descontos numeric(14,2) NOT NULL DEFAULT 0,
  total_liquido numeric(14,2) NOT NULL DEFAULT 0,
  base_inss numeric(14,2) NOT NULL DEFAULT 0,
  base_fgts numeric(14,2) NOT NULL DEFAULT 0,
  base_irrf numeric(14,2) NOT NULL DEFAULT 0,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (folha_id, colaborador_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_folha_itens TO authenticated;
GRANT ALL ON public.rh_folha_itens TO service_role;
ALTER TABLE public.rh_folha_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rh_folha_itens_select" ON public.rh_folha_itens FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'visualizar'));
CREATE POLICY "rh_folha_itens_insert" ON public.rh_folha_itens FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'criar'));
CREATE POLICY "rh_folha_itens_update" ON public.rh_folha_itens FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'));
CREATE POLICY "rh_folha_itens_delete" ON public.rh_folha_itens FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'excluir'));

-- ===== Lançamentos =====
CREATE TABLE public.rh_folha_lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.rh_folha_itens(id) ON DELETE CASCADE,
  verba_id uuid NOT NULL REFERENCES public.rh_verbas(id) ON DELETE RESTRICT,
  referencia text,
  valor numeric(14,2) NOT NULL DEFAULT 0,
  origem text NOT NULL DEFAULT 'manual',
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rh_folha_lancamentos TO authenticated;
GRANT ALL ON public.rh_folha_lancamentos TO service_role;
ALTER TABLE public.rh_folha_lancamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rh_folha_lanc_select" ON public.rh_folha_lancamentos FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'visualizar'));
CREATE POLICY "rh_folha_lanc_insert" ON public.rh_folha_lancamentos FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'criar'));
CREATE POLICY "rh_folha_lanc_update" ON public.rh_folha_lancamentos FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'rh_sensivel', 'editar'));
CREATE POLICY "rh_folha_lanc_delete" ON public.rh_folha_lancamentos FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'rh_sensivel', 'excluir'));

-- ===== Índices =====
CREATE INDEX idx_rh_folha_itens_folha ON public.rh_folha_itens(folha_id);
CREATE INDEX idx_rh_folha_itens_colab ON public.rh_folha_itens(colaborador_id);
CREATE INDEX idx_rh_folha_lanc_item ON public.rh_folha_lancamentos(item_id);

-- ===== Bloqueios de integridade =====
CREATE OR REPLACE FUNCTION public.rh_folha_bloquear_alteracao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _status public.rh_folha_status;
BEGIN
  IF TG_TABLE_NAME = 'rh_folhas' THEN
    IF TG_OP = 'DELETE' THEN
      IF OLD.status IN ('fechada','paga') THEN
        RAISE EXCEPTION 'Folhas fechadas ou pagas não podem ser excluídas. Utilize o cancelamento com justificativa.';
      END IF;
      RETURN OLD;
    END IF;
    IF OLD.status IN ('fechada','paga') AND NEW.status = OLD.status THEN
      RAISE EXCEPTION 'Folha fechada ou paga não pode ser alterada.';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'rh_folha_itens' THEN
    SELECT f.status INTO _status FROM public.rh_folhas f
      WHERE f.id = COALESCE(NEW.folha_id, OLD.folha_id);
  ELSE
    SELECT f.status INTO _status FROM public.rh_folhas f
      JOIN public.rh_folha_itens i ON i.folha_id = f.id
      WHERE i.id = COALESCE(NEW.item_id, OLD.item_id);
  END IF;

  IF _status IN ('fechada','paga','cancelada') THEN
    RAISE EXCEPTION 'A folha desta competência está fechada e não aceita novos lançamentos ou alterações.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_rh_folhas_bloqueio
  BEFORE UPDATE OR DELETE ON public.rh_folhas
  FOR EACH ROW EXECUTE FUNCTION public.rh_folha_bloquear_alteracao();
CREATE TRIGGER trg_rh_folha_itens_bloqueio
  BEFORE INSERT OR UPDATE OR DELETE ON public.rh_folha_itens
  FOR EACH ROW EXECUTE FUNCTION public.rh_folha_bloquear_alteracao();
CREATE TRIGGER trg_rh_folha_lanc_bloqueio
  BEFORE INSERT OR UPDATE OR DELETE ON public.rh_folha_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.rh_folha_bloquear_alteracao();

-- ===== Recalcular totais =====
CREATE OR REPLACE FUNCTION public.rh_folha_recalcular()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _item uuid; _folha uuid;
BEGIN
  _item := COALESCE(NEW.item_id, OLD.item_id);

  UPDATE public.rh_folha_itens i SET
    total_proventos = COALESCE(p.prov, 0),
    total_descontos = COALESCE(p.desc_, 0),
    total_liquido = COALESCE(p.prov, 0) - COALESCE(p.desc_, 0),
    base_inss = COALESCE(p.inss, 0),
    base_fgts = COALESCE(p.fgts, 0),
    base_irrf = COALESCE(p.irrf, 0),
    updated_at = now()
  FROM (
    SELECT
      sum(CASE WHEN v.tipo = 'provento' THEN l.valor ELSE 0 END) AS prov,
      sum(CASE WHEN v.tipo = 'desconto' THEN l.valor ELSE 0 END) AS desc_,
      sum(CASE WHEN v.incide_inss THEN l.valor ELSE 0 END) AS inss,
      sum(CASE WHEN v.incide_fgts THEN l.valor ELSE 0 END) AS fgts,
      sum(CASE WHEN v.incide_irrf THEN l.valor ELSE 0 END) AS irrf
    FROM public.rh_folha_lancamentos l
    JOIN public.rh_verbas v ON v.id = l.verba_id
    WHERE l.item_id = _item
  ) p
  WHERE i.id = _item
  RETURNING i.folha_id INTO _folha;

  IF _folha IS NOT NULL THEN
    UPDATE public.rh_folhas f SET
      total_proventos = COALESCE(t.prov, 0),
      total_descontos = COALESCE(t.desc_, 0),
      total_liquido = COALESCE(t.liq, 0),
      updated_at = now()
    FROM (
      SELECT sum(total_proventos) prov, sum(total_descontos) desc_, sum(total_liquido) liq
      FROM public.rh_folha_itens WHERE folha_id = _folha
    ) t
    WHERE f.id = _folha;
  END IF;

  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_rh_folha_recalcular
  AFTER INSERT OR UPDATE OR DELETE ON public.rh_folha_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.rh_folha_recalcular();

-- ===== updated_at e histórico =====
CREATE TRIGGER trg_rh_verbas_updated BEFORE UPDATE ON public.rh_verbas
  FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();
CREATE TRIGGER trg_rh_folhas_updated BEFORE UPDATE ON public.rh_folhas
  FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();
CREATE TRIGGER trg_rh_folha_itens_updated BEFORE UPDATE ON public.rh_folha_itens
  FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();
CREATE TRIGGER trg_rh_folha_lanc_updated BEFORE UPDATE ON public.rh_folha_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.rh_set_updated_at();

CREATE TRIGGER trg_rh_folhas_hist AFTER INSERT OR UPDATE OR DELETE ON public.rh_folhas
  FOR EACH ROW EXECUTE FUNCTION public.rh_registrar_historico();
CREATE TRIGGER trg_rh_folha_itens_hist AFTER INSERT OR UPDATE OR DELETE ON public.rh_folha_itens
  FOR EACH ROW EXECUTE FUNCTION public.rh_registrar_historico();

-- ===== Catálogo inicial de verbas =====
INSERT INTO public.rh_verbas (codigo, nome, tipo, incide_inss, incide_fgts, incide_irrf, automatica) VALUES
  ('001','Salário base','provento', true, true, true, true),
  ('002','Horas extras','provento', true, true, true, false),
  ('003','Adicional noturno','provento', true, true, true, false),
  ('004','Gratificação','provento', true, true, true, false),
  ('005','Férias','provento', true, true, true, false),
  ('006','13º salário','provento', true, true, true, false),
  ('101','INSS','desconto', false, false, false, true),
  ('102','IRRF','desconto', false, false, false, true),
  ('103','Vale-transporte','desconto', false, false, false, false),
  ('104','Plano de saúde','desconto', false, false, false, false),
  ('105','Faltas e atrasos','desconto', false, false, false, false),
  ('106','Adiantamento','desconto', false, false, false, false),
  ('201','FGTS (informativo)','informativa', false, false, false, true);