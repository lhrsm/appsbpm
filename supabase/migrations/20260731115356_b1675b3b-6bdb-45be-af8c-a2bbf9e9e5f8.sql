-- =========================================================
-- ACESSO EXTERNO DO PORTAL (associados/dependentes)
-- Estruturas novas e isoladas. Nada existente é alterado.
-- ROLLBACK (executar na ordem):
--   DROP TABLE IF EXISTS public.terms_acceptances;
--   DROP TABLE IF EXISTS public.external_auth_audit_logs;
--   DROP TABLE IF EXISTS public.external_email_verification_codes;
--   DROP TABLE IF EXISTS public.external_account_links;
--   DROP TABLE IF EXISTS public.external_identity_validation_sessions;
--   DROP TABLE IF EXISTS public.external_identity_mock_records;
--   DROP TYPE IF EXISTS public.ext_person_type;
--   DROP TYPE IF EXISTS public.ext_validation_status;
-- =========================================================

CREATE TYPE public.ext_person_type AS ENUM ('associate', 'dependent');
CREATE TYPE public.ext_validation_status AS ENUM (
  'matched','not_matched','inactive','blocked','deceased',
  'already_linked','duplicate_record','unavailable','manual_review_required'
);

-- ---------- Base fictícia (ambiente de demonstração) ----------
CREATE TABLE public.external_identity_mock_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_person_id text NOT NULL UNIQUE,
  person_type public.ext_person_type NOT NULL,
  cpf_reference text NOT NULL,
  birth_date date NOT NULL,
  registration_number text,
  full_name text NOT NULL,
  mother_name text,
  status public.ext_validation_status NOT NULL DEFAULT 'matched',
  is_active boolean NOT NULL DEFAULT true,
  already_registered boolean NOT NULL DEFAULT false,
  observacao text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_mock_cpf ON public.external_identity_mock_records (cpf_reference) WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_identity_mock_records TO authenticated;
GRANT ALL ON public.external_identity_mock_records TO service_role;
ALTER TABLE public.external_identity_mock_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock_select" ON public.external_identity_mock_records FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));
CREATE POLICY "mock_insert" ON public.external_identity_mock_records FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'integracoes', 'criar'));
CREATE POLICY "mock_update" ON public.external_identity_mock_records FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'editar'));
CREATE POLICY "mock_delete" ON public.external_identity_mock_records FOR DELETE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'excluir'));

CREATE TRIGGER trg_mock_updated BEFORE UPDATE ON public.external_identity_mock_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Sessões de validação ----------
CREATE TABLE public.external_identity_validation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'mock',
  external_person_id text,
  person_type public.ext_person_type,
  status text NOT NULL DEFAULT 'pending',
  validation_token_hash text,
  email text,
  expires_at timestamptz NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  verified_at timestamptz,
  consumed_at timestamptz,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.external_identity_validation_sessions TO authenticated;
GRANT ALL ON public.external_identity_validation_sessions TO service_role;
ALTER TABLE public.external_identity_validation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "val_sessions_admin_select" ON public.external_identity_validation_sessions FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));

CREATE TRIGGER trg_val_sessions_updated BEFORE UPDATE ON public.external_identity_validation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Códigos de verificação de e-mail ----------
CREATE TABLE public.external_email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_session_id uuid NOT NULL REFERENCES public.external_identity_validation_sessions(id) ON DELETE CASCADE,
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  resend_count integer NOT NULL DEFAULT 0,
  verified_at timestamptz,
  consumed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  debug_code text,
  ip_hash text,
  user_agent_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.external_email_verification_codes TO authenticated;
GRANT ALL ON public.external_email_verification_codes TO service_role;
ALTER TABLE public.external_email_verification_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "codes_admin_select" ON public.external_email_verification_codes FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));

-- ---------- Vínculo conta <-> identidade institucional ----------
CREATE TABLE public.external_account_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  external_person_id text NOT NULL UNIQUE,
  person_type public.ext_person_type NOT NULL,
  cpf_reference text NOT NULL UNIQUE,
  registration_number text,
  email text NOT NULL,
  source_provider text NOT NULL DEFAULT 'mock',
  associado_id uuid,
  dependente_id uuid,
  status text NOT NULL DEFAULT 'active',
  linked_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.external_account_links TO authenticated;
GRANT ALL ON public.external_account_links TO service_role;
ALTER TABLE public.external_account_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "links_owner_select" ON public.external_account_links FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));

CREATE TRIGGER trg_links_updated BEFORE UPDATE ON public.external_account_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Auditoria do acesso externo ----------
CREATE TABLE public.external_auth_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  validation_session_id uuid,
  result text,
  provider text,
  metadata_safe jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ext_audit_created ON public.external_auth_audit_logs (created_at DESC);
GRANT SELECT ON public.external_auth_audit_logs TO authenticated;
GRANT ALL ON public.external_auth_audit_logs TO service_role;
ALTER TABLE public.external_auth_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ext_audit_admin_select" ON public.external_auth_audit_logs FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'auditoria', 'visualizar')
      OR public.tem_permissao(auth.uid(), 'integracoes', 'visualizar'));

-- ---------- Aceites de termos ----------
CREATE TABLE public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  external_person_id text,
  terms_version text NOT NULL,
  privacy_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'portal_primeiro_acesso',
  metadata_safe jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.terms_acceptances TO authenticated;
GRANT ALL ON public.terms_acceptances TO service_role;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms_select" ON public.terms_acceptances FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.tem_permissao(auth.uid(), 'auditoria', 'visualizar'));