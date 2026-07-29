-- =========================================================
-- 1. Tipos
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.perm_acao AS ENUM ('visualizar','criar','editar','excluir','aprovar','exportar','configurar');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 2. Tabelas
-- =========================================================
CREATE TABLE public.perfis (
  codigo text PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  nivel integer NOT NULL DEFAULT 50,
  interno boolean NOT NULL DEFAULT true,
  gerencia_usuarios boolean NOT NULL DEFAULT false,
  somente_leitura boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.perfis TO authenticated;
GRANT ALL ON public.perfis TO service_role;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.perfil_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_codigo text NOT NULL REFERENCES public.perfis(codigo) ON DELETE CASCADE,
  modulo text NOT NULL,
  pagina text NOT NULL DEFAULT '*',
  acao public.perm_acao NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (perfil_codigo, modulo, pagina, acao)
);
GRANT SELECT ON public.perfil_permissoes TO authenticated;
GRANT ALL ON public.perfil_permissoes TO service_role;
ALTER TABLE public.perfil_permissoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.usuarios_internos (
  user_id uuid PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  setor text,
  perfil_codigo text NOT NULL REFERENCES public.perfis(codigo),
  ativo boolean NOT NULL DEFAULT true,
  ultimo_acesso timestamptz,
  observacoes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios_internos TO authenticated;
GRANT ALL ON public.usuarios_internos TO service_role;
ALTER TABLE public.usuarios_internos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.usuario_permissoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.usuarios_internos(user_id) ON DELETE CASCADE,
  modulo text NOT NULL,
  pagina text NOT NULL DEFAULT '*',
  acao public.perm_acao NOT NULL,
  concedido boolean NOT NULL DEFAULT true,
  concedido_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, modulo, pagina, acao)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuario_permissoes TO authenticated;
GRANT ALL ON public.usuario_permissoes TO service_role;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.acessos_permissoes_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alvo_user_id uuid,
  ator_user_id uuid,
  acao text NOT NULL,
  detalhes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.acessos_permissoes_log TO authenticated;
GRANT ALL ON public.acessos_permissoes_log TO service_role;
ALTER TABLE public.acessos_permissoes_log ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 3. Funções (SECURITY DEFINER, sem recursão de RLS)
-- =========================================================
CREATE OR REPLACE FUNCTION public.perfil_ativo(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT u.perfil_codigo FROM public.usuarios_internos u
      WHERE u.user_id = _user_id AND u.ativo),
    (SELECT 'superadmin' FROM public.user_roles r
      WHERE r.user_id = _user_id AND r.role = 'admin' LIMIT 1),
    (SELECT 'gestor_previdencia' FROM public.previdencia_admins p
      WHERE p.user_id = _user_id LIMIT 1)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_interno(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis p
    WHERE p.codigo = public.perfil_ativo(_user_id) AND p.interno
  )
$$;

CREATE OR REPLACE FUNCTION public.pode_gerenciar_usuarios(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis p
    WHERE p.codigo = public.perfil_ativo(_user_id) AND p.gerencia_usuarios
  )
$$;

CREATE OR REPLACE FUNCTION public.tem_permissao(_user_id uuid, _modulo text, _acao public.perm_acao, _pagina text DEFAULT '*')
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _perfil text;
  _override boolean;
BEGIN
  _perfil := public.perfil_ativo(_user_id);
  IF _perfil IS NULL THEN RETURN false; END IF;

  SELECT up.concedido INTO _override
  FROM public.usuario_permissoes up
  WHERE up.user_id = _user_id
    AND up.modulo = _modulo
    AND up.acao = _acao
    AND up.pagina IN (_pagina, '*')
  ORDER BY (up.pagina = _pagina) DESC
  LIMIT 1;

  IF _override IS NOT NULL THEN RETURN _override; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.perfil_permissoes pp
    WHERE pp.perfil_codigo = _perfil
      AND pp.modulo IN (_modulo, '*')
      AND pp.acao = _acao
      AND pp.pagina IN (_pagina, '*')
  );
END;
$$;

-- =========================================================
-- 4. Triggers: anti auto-escalação + histórico
-- =========================================================
CREATE OR REPLACE FUNCTION public.bloquear_autoalteracao_acesso()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  IF TG_TABLE_NAME = 'usuarios_internos' THEN
    IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid()
       AND (NEW.perfil_codigo IS DISTINCT FROM OLD.perfil_codigo OR NEW.ativo IS DISTINCT FROM OLD.ativo) THEN
      RAISE EXCEPTION 'Um usuário não pode alterar o próprio nível de acesso';
    END IF;
    IF TG_OP = 'DELETE' AND OLD.user_id = auth.uid() THEN
      RAISE EXCEPTION 'Um usuário não pode remover o próprio acesso';
    END IF;
  ELSE
    IF COALESCE(NEW.user_id, OLD.user_id) = auth.uid() THEN
      RAISE EXCEPTION 'Um usuário não pode alterar as próprias permissões';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_usuarios_internos_autoalteracao
  BEFORE UPDATE OR DELETE ON public.usuarios_internos
  FOR EACH ROW EXECUTE FUNCTION public.bloquear_autoalteracao_acesso();

CREATE TRIGGER trg_usuario_permissoes_autoalteracao
  BEFORE INSERT OR UPDATE OR DELETE ON public.usuario_permissoes
  FOR EACH ROW EXECUTE FUNCTION public.bloquear_autoalteracao_acesso();

CREATE OR REPLACE FUNCTION public.registrar_log_acesso()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'usuarios_internos' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
      VALUES (NEW.user_id, auth.uid(), 'usuario_criado',
        jsonb_build_object('perfil', NEW.perfil_codigo, 'setor', NEW.setor, 'ativo', NEW.ativo, 'email', NEW.email));
    ELSIF TG_OP = 'UPDATE' THEN
      IF NEW.perfil_codigo IS DISTINCT FROM OLD.perfil_codigo THEN
        INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
        VALUES (NEW.user_id, auth.uid(), 'perfil_alterado',
          jsonb_build_object('de', OLD.perfil_codigo, 'para', NEW.perfil_codigo));
      END IF;
      IF NEW.ativo IS DISTINCT FROM OLD.ativo THEN
        INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
        VALUES (NEW.user_id, auth.uid(), CASE WHEN NEW.ativo THEN 'usuario_ativado' ELSE 'usuario_inativado' END, '{}'::jsonb);
      END IF;
      IF NEW.setor IS DISTINCT FROM OLD.setor THEN
        INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
        VALUES (NEW.user_id, auth.uid(), 'setor_alterado',
          jsonb_build_object('de', OLD.setor, 'para', NEW.setor));
      END IF;
    ELSE
      INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
      VALUES (OLD.user_id, auth.uid(), 'usuario_removido', jsonb_build_object('perfil', OLD.perfil_codigo));
    END IF;
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
    VALUES (OLD.user_id, auth.uid(), 'permissao_removida',
      jsonb_build_object('modulo', OLD.modulo, 'pagina', OLD.pagina, 'acao', OLD.acao, 'concedido', OLD.concedido));
    RETURN OLD;
  END IF;

  INSERT INTO public.acessos_permissoes_log (alvo_user_id, ator_user_id, acao, detalhes)
  VALUES (NEW.user_id, auth.uid(), CASE WHEN NEW.concedido THEN 'permissao_concedida' ELSE 'permissao_bloqueada' END,
    jsonb_build_object('modulo', NEW.modulo, 'pagina', NEW.pagina, 'acao', NEW.acao));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_internos_log
  AFTER INSERT OR UPDATE OR DELETE ON public.usuarios_internos
  FOR EACH ROW EXECUTE FUNCTION public.registrar_log_acesso();

CREATE TRIGGER trg_usuario_permissoes_log
  AFTER INSERT OR UPDATE OR DELETE ON public.usuario_permissoes
  FOR EACH ROW EXECUTE FUNCTION public.registrar_log_acesso();

CREATE TRIGGER trg_perfis_updated_at BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_usuarios_internos_updated_at BEFORE UPDATE ON public.usuarios_internos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 5. Políticas RLS
-- =========================================================
CREATE POLICY "Internos leem perfis" ON public.perfis
  FOR SELECT TO authenticated USING (public.is_interno(auth.uid()));
CREATE POLICY "Gestores de usuarios gerenciam perfis" ON public.perfis
  FOR ALL TO authenticated
  USING (public.pode_gerenciar_usuarios(auth.uid()))
  WITH CHECK (public.pode_gerenciar_usuarios(auth.uid()));

CREATE POLICY "Internos leem permissoes de perfil" ON public.perfil_permissoes
  FOR SELECT TO authenticated USING (public.is_interno(auth.uid()));
CREATE POLICY "Gestores gerenciam permissoes de perfil" ON public.perfil_permissoes
  FOR ALL TO authenticated
  USING (public.pode_gerenciar_usuarios(auth.uid()))
  WITH CHECK (public.pode_gerenciar_usuarios(auth.uid()));

CREATE POLICY "Internos leem usuarios internos" ON public.usuarios_internos
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_interno(auth.uid()));
CREATE POLICY "Gestores criam usuarios internos" ON public.usuarios_internos
  FOR INSERT TO authenticated WITH CHECK (public.pode_gerenciar_usuarios(auth.uid()));
CREATE POLICY "Gestores editam usuarios internos" ON public.usuarios_internos
  FOR UPDATE TO authenticated
  USING (public.pode_gerenciar_usuarios(auth.uid()))
  WITH CHECK (public.pode_gerenciar_usuarios(auth.uid()));
CREATE POLICY "Gestores removem usuarios internos" ON public.usuarios_internos
  FOR DELETE TO authenticated USING (public.pode_gerenciar_usuarios(auth.uid()));

CREATE POLICY "Internos leem permissoes especificas" ON public.usuario_permissoes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_interno(auth.uid()));
CREATE POLICY "Gestores gerenciam permissoes especificas" ON public.usuario_permissoes
  FOR ALL TO authenticated
  USING (public.pode_gerenciar_usuarios(auth.uid()) AND user_id <> auth.uid())
  WITH CHECK (public.pode_gerenciar_usuarios(auth.uid()) AND user_id <> auth.uid());

CREATE POLICY "Internos leem historico de acesso" ON public.acessos_permissoes_log
  FOR SELECT TO authenticated USING (public.is_interno(auth.uid()));

-- =========================================================
-- 6. Seed de perfis
-- =========================================================
INSERT INTO public.perfis (codigo, nome, descricao, nivel, interno, gerencia_usuarios, somente_leitura) VALUES
 ('superadmin','Superadministrador','Acesso irrestrito a todos os módulos, permissões e configurações.',100,true,true,false),
 ('admin_institucional','Administrador institucional','Gestão completa dos módulos institucionais e de usuários.',90,true,true,false),
 ('gestor_previdencia','Gestor da Previdência','Gestão do módulo de Previdência, associados, dependentes, pecúlio e informes.',70,true,false,false),
 ('gestor_saude','Gestor da Assistência à Saúde','Gestão do módulo de Saúde, rede credenciada, limites e carências.',70,true,false,false),
 ('gestor_financeiro','Gestor Financeiro','Gestão do módulo Financeiro, mensalidades e relatórios financeiros.',70,true,false,false),
 ('gestor_patrimonial','Gestor Patrimonial','Cadastro e movimentação de bens patrimoniais.',70,true,false,false),
 ('gestor_contabil','Gestor Contábil','Gestão contábil e fechamentos, com consulta ao financeiro.',70,true,false,false),
 ('operador','Operador','Operação do dia a dia: atendimento, cadastros e documentos.',40,true,false,false),
 ('auditor','Auditor','Consulta e exportação de todos os registros autorizados, sem alteração.',60,true,false,true),
 ('leitura','Usuário somente leitura','Apenas visualização dos módulos autorizados.',20,true,false,true),
 ('associado','Associado','Perfil externo do titular no portal do associado.',10,false,false,false),
 ('dependente','Dependente','Perfil externo do dependente no portal.',10,false,false,false);

-- =========================================================
-- 7. Seed de permissões por perfil
-- =========================================================
-- Superadmin e administrador institucional: curinga em tudo
INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
SELECT p.codigo, '*', '*', a.acao
FROM (VALUES ('superadmin'),('admin_institucional')) AS p(codigo)
CROSS JOIN (SELECT unnest(enum_range(NULL::public.perm_acao)) AS acao) a;

-- Auditor e somente leitura
INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
VALUES ('auditor','*','*','visualizar'), ('auditor','*','*','exportar'), ('leitura','*','*','visualizar');

-- Gestores setoriais
INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
SELECT g.perfil, m.modulo, '*', a.acao::public.perm_acao
FROM (VALUES
  ('gestor_previdencia', ARRAY['previdencia','associados','dependentes','peculio','informes','documentos','solicitacoes','comunicados'], ARRAY['visualizar','criar','editar','aprovar','exportar']),
  ('gestor_saude',       ARRAY['saude','clinicas','carencias','limites','avaliacoes','solicitacoes','documentos'],                        ARRAY['visualizar','criar','editar','aprovar','exportar']),
  ('gestor_financeiro',  ARRAY['financeiro','relatorios','importacoes'],                                                                   ARRAY['visualizar','criar','editar','aprovar','exportar']),
  ('gestor_patrimonial', ARRAY['patrimonio'],                                                                                              ARRAY['visualizar','criar','editar','excluir','exportar']),
  ('gestor_patrimonial', ARRAY['relatorios'],                                                                                              ARRAY['visualizar','exportar']),
  ('gestor_contabil',    ARRAY['contabilidade','relatorios'],                                                                              ARRAY['visualizar','criar','editar','aprovar','exportar']),
  ('gestor_contabil',    ARRAY['financeiro'],                                                                                              ARRAY['visualizar','exportar']),
  ('operador',           ARRAY['associados','dependentes','solicitacoes','documentos','comunicados','eventos','faq'],                      ARRAY['visualizar','criar','editar'])
) AS g(perfil, modulos, acoes)
CROSS JOIN LATERAL unnest(g.modulos) AS m(modulo)
CROSS JOIN LATERAL unnest(g.acoes) AS a(acao)
ON CONFLICT DO NOTHING;

-- Auditoria explícita para o auditor
INSERT INTO public.perfil_permissoes (perfil_codigo, modulo, pagina, acao)
VALUES ('auditor','auditoria','*','visualizar') ON CONFLICT DO NOTHING;

-- =========================================================
-- 8. Migração dos acessos existentes (compatibilidade)
-- =========================================================
INSERT INTO public.usuarios_internos (user_id, nome, email, setor, perfil_codigo, ativo)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email,'@',1)), u.email, 'Diretoria', 'superadmin', true
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.usuarios_internos (user_id, nome, email, setor, perfil_codigo, ativo)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email,'@',1)), u.email, 'Previdência', 'gestor_previdencia', true
FROM auth.users u
JOIN public.previdencia_admins p ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;