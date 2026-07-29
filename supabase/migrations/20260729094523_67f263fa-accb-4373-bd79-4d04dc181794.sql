-- ============ ENUMS ============
CREATE TYPE public.pat_status AS ENUM ('em_uso','disponivel','em_manutencao','emprestado','em_transferencia','inservivel','baixado','extraviado');
CREATE TYPE public.pat_conservacao AS ENUM ('novo','otimo','bom','regular','ruim','inservivel');
CREATE TYPE public.pat_mov_tipo AS ENUM ('transferencia','emprestimo','devolucao','cessao','manutencao','retorno_manutencao','outro');
CREATE TYPE public.pat_aprovacao AS ENUM ('pendente','aprovado','reprovado');
CREATE TYPE public.pat_inv_status AS ENUM ('planejado','em_andamento','encerrado','cancelado');
CREATE TYPE public.pat_item_status AS ENUM ('esperado','localizado','nao_localizado','divergente','nao_cadastrado');

-- ============ CATEGORIAS ============
CREATE TABLE public.pat_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  vida_util_meses integer,
  taxa_depreciacao numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_categorias TO authenticated;
GRANT ALL ON public.pat_categorias TO service_role;
ALTER TABLE public.pat_categorias ENABLE ROW LEVEL SECURITY;

-- ============ UNIDADES ============
CREATE TABLE public.pat_unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  codigo text,
  endereco text,
  cidade text,
  estado text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_unidades TO authenticated;
GRANT ALL ON public.pat_unidades TO service_role;
ALTER TABLE public.pat_unidades ENABLE ROW LEVEL SECURITY;

-- ============ SETORES ============
CREATE TABLE public.pat_setores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  nome text NOT NULL,
  codigo text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_setores TO authenticated;
GRANT ALL ON public.pat_setores TO service_role;
ALTER TABLE public.pat_setores ENABLE ROW LEVEL SECURITY;

-- ============ RESPONSAVEIS ============
CREATE TABLE public.pat_responsaveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  matricula text,
  cargo text,
  email text,
  telefone text,
  unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  setor_id uuid REFERENCES public.pat_setores(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_responsaveis TO authenticated;
GRANT ALL ON public.pat_responsaveis TO service_role;
ALTER TABLE public.pat_responsaveis ENABLE ROW LEVEL SECURITY;

-- ============ BENS ============
CREATE TABLE public.pat_bens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_patrimonial text NOT NULL,
  codigo_interno text,
  descricao text NOT NULL,
  categoria_id uuid REFERENCES public.pat_categorias(id) ON DELETE SET NULL,
  marca text,
  modelo text,
  numero_serie text,
  data_aquisicao date,
  valor numeric NOT NULL DEFAULT 0,
  fornecedor_id uuid REFERENCES public.fin_fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome text,
  nota_fiscal text,
  localizacao text,
  unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  setor_id uuid REFERENCES public.pat_setores(id) ON DELETE SET NULL,
  responsavel_id uuid REFERENCES public.pat_responsaveis(id) ON DELETE SET NULL,
  estado_conservacao pat_conservacao NOT NULL DEFAULT 'bom',
  vida_util_meses integer,
  taxa_depreciacao numeric NOT NULL DEFAULT 0,
  status pat_status NOT NULL DEFAULT 'em_uso',
  observacoes text,
  fotos jsonb NOT NULL DEFAULT '[]'::jsonb,
  documentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  qr_token uuid NOT NULL DEFAULT gen_random_uuid(),
  demo boolean NOT NULL DEFAULT false,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX pat_bens_numero_uk ON public.pat_bens (lower(trim(numero_patrimonial)));
CREATE UNIQUE INDEX pat_bens_qr_uk ON public.pat_bens (qr_token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_bens TO authenticated;
GRANT ALL ON public.pat_bens TO service_role;
ALTER TABLE public.pat_bens ENABLE ROW LEVEL SECURITY;

-- ============ HISTORICO (append-only) ============
CREATE TABLE public.pat_bem_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid NOT NULL REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  acao text NOT NULL,
  status_anterior pat_status,
  status_novo pat_status,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ator_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.pat_bem_historico TO authenticated;
GRANT ALL ON public.pat_bem_historico TO service_role;
ALTER TABLE public.pat_bem_historico ENABLE ROW LEVEL SECURITY;

-- ============ MOVIMENTACOES ============
CREATE TABLE public.pat_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid NOT NULL REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  tipo pat_mov_tipo NOT NULL DEFAULT 'transferencia',
  origem_unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  origem_setor_id uuid REFERENCES public.pat_setores(id) ON DELETE SET NULL,
  origem_local text,
  destino_unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  destino_setor_id uuid REFERENCES public.pat_setores(id) ON DELETE SET NULL,
  destino_local text,
  responsavel_anterior_id uuid REFERENCES public.pat_responsaveis(id) ON DELETE SET NULL,
  responsavel_novo_id uuid REFERENCES public.pat_responsaveis(id) ON DELETE SET NULL,
  data_movimentacao date NOT NULL DEFAULT current_date,
  motivo text NOT NULL,
  observacoes text,
  aprovacao pat_aprovacao NOT NULL DEFAULT 'pendente',
  aprovado_por uuid,
  aprovado_em timestamptz,
  termo_gerado boolean NOT NULL DEFAULT false,
  termo_path text,
  evidencias jsonb NOT NULL DEFAULT '[]'::jsonb,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_movimentacoes TO authenticated;
GRANT ALL ON public.pat_movimentacoes TO service_role;
ALTER TABLE public.pat_movimentacoes ENABLE ROW LEVEL SECURITY;

-- ============ MANUTENCOES ============
CREATE TABLE public.pat_manutencoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid NOT NULL REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'corretiva',
  descricao text NOT NULL,
  fornecedor_nome text,
  custo numeric NOT NULL DEFAULT 0,
  data_abertura date NOT NULL DEFAULT current_date,
  data_prevista date,
  data_conclusao date,
  status text NOT NULL DEFAULT 'aberta',
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  observacoes text,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_manutencoes TO authenticated;
GRANT ALL ON public.pat_manutencoes TO service_role;
ALTER TABLE public.pat_manutencoes ENABLE ROW LEVEL SECURITY;

-- ============ TERMOS ============
CREATE TABLE public.pat_termos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  movimentacao_id uuid REFERENCES public.pat_movimentacoes(id) ON DELETE SET NULL,
  responsavel_id uuid REFERENCES public.pat_responsaveis(id) ON DELETE SET NULL,
  numero text,
  tipo text NOT NULL DEFAULT 'responsabilidade',
  conteudo text,
  arquivo_path text,
  assinado boolean NOT NULL DEFAULT false,
  assinado_em timestamptz,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_termos TO authenticated;
GRANT ALL ON public.pat_termos TO service_role;
ALTER TABLE public.pat_termos ENABLE ROW LEVEL SECURITY;

-- ============ BAIXAS ============
CREATE TABLE public.pat_baixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid NOT NULL REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  motivo text NOT NULL,
  justificativa text NOT NULL,
  valor_residual numeric NOT NULL DEFAULT 0,
  data_baixa date NOT NULL DEFAULT current_date,
  documentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  aprovacao pat_aprovacao NOT NULL DEFAULT 'pendente',
  aprovado_por uuid,
  aprovado_em timestamptz,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_baixas TO authenticated;
GRANT ALL ON public.pat_baixas TO service_role;
ALTER TABLE public.pat_baixas ENABLE ROW LEVEL SECURITY;

-- ============ INVENTARIOS ============
CREATE TABLE public.pat_inventarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  unidade_id uuid REFERENCES public.pat_unidades(id) ON DELETE SET NULL,
  setor_id uuid REFERENCES public.pat_setores(id) ON DELETE SET NULL,
  status pat_inv_status NOT NULL DEFAULT 'planejado',
  data_inicio date NOT NULL DEFAULT current_date,
  data_fim date,
  observacoes text,
  criado_por uuid,
  criado_por_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_inventarios TO authenticated;
GRANT ALL ON public.pat_inventarios TO service_role;
ALTER TABLE public.pat_inventarios ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pat_inventario_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventario_id uuid NOT NULL REFERENCES public.pat_inventarios(id) ON DELETE CASCADE,
  bem_id uuid REFERENCES public.pat_bens(id) ON DELETE SET NULL,
  descricao_avulsa text,
  numero_avulso text,
  status pat_item_status NOT NULL DEFAULT 'esperado',
  divergencia text,
  conferido_em timestamptz,
  conferido_por uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_inventario_itens TO authenticated;
GRANT ALL ON public.pat_inventario_itens TO service_role;
ALTER TABLE public.pat_inventario_itens ENABLE ROW LEVEL SECURITY;

-- ============ OCORRENCIAS (via QR) ============
CREATE TABLE public.pat_ocorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bem_id uuid NOT NULL REFERENCES public.pat_bens(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'outro',
  descricao text NOT NULL,
  informante_nome text,
  informante_contato text,
  origem text NOT NULL DEFAULT 'qrcode',
  status text NOT NULL DEFAULT 'aberta',
  resposta text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pat_ocorrencias TO authenticated;
GRANT ALL ON public.pat_ocorrencias TO service_role;
ALTER TABLE public.pat_ocorrencias ENABLE ROW LEVEL SECURITY;

-- ============ CONFIGURACOES ============
CREATE TABLE public.pat_config (
  chave text PRIMARY KEY,
  valor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pat_config TO authenticated;
GRANT ALL ON public.pat_config TO service_role;
ALTER TABLE public.pat_config ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pat_categorias','pat_unidades','pat_setores','pat_responsaveis','pat_bens',
                           'pat_movimentacoes','pat_manutencoes','pat_termos','pat_baixas',
                           'pat_inventarios','pat_inventario_itens','pat_config'] LOOP
    EXECUTE format($f$
      CREATE POLICY "pat_select_%1$s" ON public.%1$I FOR SELECT TO authenticated
        USING (public.tem_permissao(auth.uid(), 'patrimonio', 'visualizar'));
      CREATE POLICY "pat_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated
        WITH CHECK (public.tem_permissao(auth.uid(), 'patrimonio', 'criar'));
      CREATE POLICY "pat_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated
        USING (public.tem_permissao(auth.uid(), 'patrimonio', 'editar'))
        WITH CHECK (public.tem_permissao(auth.uid(), 'patrimonio', 'editar'));
      CREATE POLICY "pat_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated
        USING (public.tem_permissao(auth.uid(), 'patrimonio', 'excluir'));
    $f$, t);
  END LOOP;
END $$;

CREATE POLICY "pat_hist_select" ON public.pat_bem_historico FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'patrimonio', 'visualizar'));
CREATE POLICY "pat_hist_insert" ON public.pat_bem_historico FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'patrimonio', 'visualizar'));

CREATE POLICY "pat_oc_select" ON public.pat_ocorrencias FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'patrimonio', 'visualizar'));
CREATE POLICY "pat_oc_insert" ON public.pat_ocorrencias FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'patrimonio', 'criar'));
CREATE POLICY "pat_oc_update" ON public.pat_ocorrencias FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'patrimonio', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'patrimonio', 'editar'));

-- ============ TRIGGERS ============
CREATE TRIGGER pat_bens_updated BEFORE UPDATE ON public.pat_bens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_mov_updated BEFORE UPDATE ON public.pat_movimentacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_manut_updated BEFORE UPDATE ON public.pat_manutencoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_baixas_updated BEFORE UPDATE ON public.pat_baixas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_inv_updated BEFORE UPDATE ON public.pat_inventarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_termos_updated BEFORE UPDATE ON public.pat_termos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_cat_updated BEFORE UPDATE ON public.pat_categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_uni_updated BEFORE UPDATE ON public.pat_unidades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_set_updated BEFORE UPDATE ON public.pat_setores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_resp_updated BEFORE UPDATE ON public.pat_responsaveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pat_oc_updated BEFORE UPDATE ON public.pat_ocorrencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- histórico automático do bem
CREATE OR REPLACE FUNCTION public.pat_registrar_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.pat_bem_historico (bem_id, acao, status_novo, ator_user_id, detalhes)
    VALUES (NEW.id, 'cadastrado', NEW.status, auth.uid(),
      jsonb_build_object('numero_patrimonial', NEW.numero_patrimonial, 'descricao', NEW.descricao));
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.pat_bem_historico (bem_id, acao, status_anterior, status_novo, ator_user_id)
    VALUES (NEW.id, 'status_alterado', OLD.status, NEW.status, auth.uid());
  END IF;
  IF NEW.responsavel_id IS DISTINCT FROM OLD.responsavel_id THEN
    INSERT INTO public.pat_bem_historico (bem_id, acao, ator_user_id, detalhes)
    VALUES (NEW.id, 'responsavel_alterado', auth.uid(),
      jsonb_build_object('de', OLD.responsavel_id, 'para', NEW.responsavel_id));
  END IF;
  IF (NEW.unidade_id IS DISTINCT FROM OLD.unidade_id)
     OR (NEW.setor_id IS DISTINCT FROM OLD.setor_id)
     OR (NEW.localizacao IS DISTINCT FROM OLD.localizacao) THEN
    INSERT INTO public.pat_bem_historico (bem_id, acao, ator_user_id, detalhes)
    VALUES (NEW.id, 'localizacao_alterada', auth.uid(),
      jsonb_build_object('local_de', OLD.localizacao, 'local_para', NEW.localizacao));
  END IF;
  IF (NEW.estado_conservacao IS DISTINCT FROM OLD.estado_conservacao) THEN
    INSERT INTO public.pat_bem_historico (bem_id, acao, ator_user_id, detalhes)
    VALUES (NEW.id, 'conservacao_alterada', auth.uid(),
      jsonb_build_object('de', OLD.estado_conservacao, 'para', NEW.estado_conservacao));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER pat_bens_historico
AFTER INSERT OR UPDATE ON public.pat_bens
FOR EACH ROW EXECUTE FUNCTION public.pat_registrar_historico();

-- bloqueia exclusão de bens com histórico/movimentações
CREATE OR REPLACE FUNCTION public.pat_bloquear_exclusao_bem()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.pat_movimentacoes m WHERE m.bem_id = OLD.id)
     OR EXISTS (SELECT 1 FROM public.pat_baixas b WHERE b.bem_id = OLD.id)
     OR EXISTS (SELECT 1 FROM public.pat_manutencoes mn WHERE mn.bem_id = OLD.id)
     OR EXISTS (SELECT 1 FROM public.pat_inventario_itens i WHERE i.bem_id = OLD.id)
     OR (SELECT count(*) FROM public.pat_bem_historico h WHERE h.bem_id = OLD.id) > 1
     OR OLD.status = 'baixado' THEN
    RAISE EXCEPTION 'Bens com histórico não podem ser excluídos. Utilize a baixa patrimonial com justificativa e aprovação.';
  END IF;
  RETURN OLD;
END; $$;

CREATE TRIGGER pat_bens_bloqueio_exclusao
BEFORE DELETE ON public.pat_bens
FOR EACH ROW EXECUTE FUNCTION public.pat_bloquear_exclusao_bem();

-- aplica movimentação aprovada ao bem
CREATE OR REPLACE FUNCTION public.pat_aplicar_movimentacao()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.aprovacao = 'aprovado' AND OLD.aprovacao IS DISTINCT FROM 'aprovado' THEN
    UPDATE public.pat_bens SET
      unidade_id = COALESCE(NEW.destino_unidade_id, unidade_id),
      setor_id = COALESCE(NEW.destino_setor_id, setor_id),
      localizacao = COALESCE(NEW.destino_local, localizacao),
      responsavel_id = COALESCE(NEW.responsavel_novo_id, responsavel_id),
      status = CASE NEW.tipo
        WHEN 'emprestimo' THEN 'emprestado'::pat_status
        WHEN 'manutencao' THEN 'em_manutencao'::pat_status
        WHEN 'devolucao' THEN 'em_uso'::pat_status
        WHEN 'retorno_manutencao' THEN 'em_uso'::pat_status
        ELSE status END
    WHERE id = NEW.bem_id;

    INSERT INTO public.pat_bem_historico (bem_id, acao, ator_user_id, detalhes)
    VALUES (NEW.bem_id, 'movimentacao_aprovada', auth.uid(),
      jsonb_build_object('tipo', NEW.tipo, 'motivo', NEW.motivo, 'movimentacao_id', NEW.id));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER pat_mov_aplicar
AFTER UPDATE ON public.pat_movimentacoes
FOR EACH ROW EXECUTE FUNCTION public.pat_aplicar_movimentacao();

-- aplica baixa aprovada ao bem
CREATE OR REPLACE FUNCTION public.pat_aplicar_baixa()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.aprovacao = 'aprovado' AND OLD.aprovacao IS DISTINCT FROM 'aprovado' THEN
    UPDATE public.pat_bens SET status = 'baixado' WHERE id = NEW.bem_id;
    INSERT INTO public.pat_bem_historico (bem_id, acao, ator_user_id, detalhes)
    VALUES (NEW.bem_id, 'baixa_aprovada', auth.uid(),
      jsonb_build_object('motivo', NEW.motivo, 'justificativa', NEW.justificativa, 'baixa_id', NEW.id));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER pat_baixa_aplicar
AFTER UPDATE ON public.pat_baixas
FOR EACH ROW EXECUTE FUNCTION public.pat_aplicar_baixa();

-- ============ CONSULTA PUBLICA VIA QR CODE ============
CREATE OR REPLACE FUNCTION public.pat_consulta_qr(_token uuid)
RETURNS TABLE(
  numero_patrimonial text, descricao text, categoria text, marca text, modelo text,
  status pat_status, estado_conservacao pat_conservacao,
  unidade text, setor text, localizacao text, responsavel text,
  historico jsonb, permite_ocorrencia boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.numero_patrimonial, b.descricao, c.nome, b.marca, b.modelo,
         b.status, b.estado_conservacao,
         u.nome, s.nome, b.localizacao, r.nome,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object('acao', h.acao, 'data', h.created_at) ORDER BY h.created_at DESC)
           FROM (SELECT * FROM public.pat_bem_historico hh
                 WHERE hh.bem_id = b.id ORDER BY hh.created_at DESC LIMIT 10) h
         ), '[]'::jsonb),
         COALESCE((SELECT valor = 'true' FROM public.pat_config WHERE chave = 'qr_permite_ocorrencia'), true)
  FROM public.pat_bens b
  LEFT JOIN public.pat_categorias c ON c.id = b.categoria_id
  LEFT JOIN public.pat_unidades u ON u.id = b.unidade_id
  LEFT JOIN public.pat_setores s ON s.id = b.setor_id
  LEFT JOIN public.pat_responsaveis r ON r.id = b.responsavel_id
  WHERE b.qr_token = _token;
$$;
GRANT EXECUTE ON FUNCTION public.pat_consulta_qr(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.pat_registrar_ocorrencia(
  _token uuid, _descricao text, _tipo text DEFAULT 'outro',
  _nome text DEFAULT NULL, _contato text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _bem uuid; _id uuid; _permite boolean;
BEGIN
  SELECT COALESCE((SELECT valor = 'true' FROM public.pat_config WHERE chave = 'qr_permite_ocorrencia'), true)
    INTO _permite;
  IF NOT _permite THEN RAISE EXCEPTION 'Registro de ocorrências desativado'; END IF;

  SELECT id INTO _bem FROM public.pat_bens WHERE qr_token = _token;
  IF _bem IS NULL THEN RAISE EXCEPTION 'Bem não encontrado'; END IF;
  IF _descricao IS NULL OR length(trim(_descricao)) < 10 OR length(_descricao) > 2000 THEN
    RAISE EXCEPTION 'Descreva a ocorrência com 10 a 2000 caracteres';
  END IF;

  INSERT INTO public.pat_ocorrencias (bem_id, tipo, descricao, informante_nome, informante_contato)
  VALUES (_bem, COALESCE(left(_tipo, 40), 'outro'), trim(_descricao),
          left(NULLIF(trim(COALESCE(_nome, '')), ''), 120),
          left(NULLIF(trim(COALESCE(_contato, '')), ''), 120))
  RETURNING id INTO _id;

  INSERT INTO public.pat_bem_historico (bem_id, acao, detalhes)
  VALUES (_bem, 'ocorrencia_registrada', jsonb_build_object('ocorrencia_id', _id, 'tipo', _tipo));
  RETURN _id;
END; $$;
GRANT EXECUTE ON FUNCTION public.pat_registrar_ocorrencia(uuid, text, text, text, text) TO anon, authenticated;

-- gera lista esperada do inventário
CREATE OR REPLACE FUNCTION public.pat_gerar_lista_inventario(_inventario_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n integer; _inv record;
BEGIN
  IF NOT public.tem_permissao(auth.uid(), 'patrimonio', 'criar') THEN
    RAISE EXCEPTION 'Sem permissão para gerar a lista do inventário';
  END IF;
  SELECT * INTO _inv FROM public.pat_inventarios WHERE id = _inventario_id;
  IF _inv IS NULL THEN RAISE EXCEPTION 'Inventário não encontrado'; END IF;

  INSERT INTO public.pat_inventario_itens (inventario_id, bem_id, status)
  SELECT _inventario_id, b.id, 'esperado'
  FROM public.pat_bens b
  WHERE b.status <> 'baixado'
    AND (_inv.unidade_id IS NULL OR b.unidade_id = _inv.unidade_id)
    AND (_inv.setor_id IS NULL OR b.setor_id = _inv.setor_id)
    AND NOT EXISTS (SELECT 1 FROM public.pat_inventario_itens i
                    WHERE i.inventario_id = _inventario_id AND i.bem_id = b.id);
  GET DIAGNOSTICS _n = ROW_COUNT;

  UPDATE public.pat_inventarios SET status = 'em_andamento' WHERE id = _inventario_id AND status = 'planejado';
  RETURN _n;
END; $$;
GRANT EXECUTE ON FUNCTION public.pat_gerar_lista_inventario(uuid) TO authenticated;

-- permissões padrão do módulo para perfis internos
INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
SELECT p.codigo, 'patrimonio', '*', a.acao
FROM public.perfis p
CROSS JOIN (SELECT unnest(ARRAY['visualizar','criar','editar','excluir','aprovar','exportar','configurar']::perm_acao[]) AS acao) a
WHERE p.codigo IN ('superadmin','admin')
ON CONFLICT DO NOTHING;