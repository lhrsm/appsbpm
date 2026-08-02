-- ============================================================
-- FASE 10 — Conta, Segurança, 2FA, Privacidade e LGPD
-- Rollback: DROP TABLE em ordem inversa (ver docs/ARQUITETURA.md)
-- ============================================================

-- ---------- Configurações de segurança ----------
CREATE TABLE public.user_security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  link_id uuid REFERENCES public.external_account_links(id) ON DELETE CASCADE,
  mfa_required boolean NOT NULL DEFAULT false,
  mfa_enabled boolean NOT NULL DEFAULT false,
  preferred_mfa_method text NOT NULL DEFAULT 'totp',
  totp_secret_enc text,
  totp_pending_enc text,
  totp_pending_expires_at timestamptz,
  trusted_device_policy text NOT NULL DEFAULT '15d',
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  recovery_codes_generated_at timestamptz,
  sessions_reviewed_at timestamptz,
  last_password_change_at timestamptz,
  security_level text NOT NULL DEFAULT 'basico',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_security_settings TO authenticated;
GRANT ALL ON public.user_security_settings TO service_role;
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seg_settings_owner_select" ON public.user_security_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT (totp_secret_enc, totp_pending_enc) ON public.user_security_settings FROM authenticated;
CREATE TRIGGER trg_seg_settings_updated BEFORE UPDATE ON public.user_security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Dispositivos confiáveis ----------
CREATE TABLE public.user_trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_token_hash text NOT NULL,
  device_name text,
  browser text,
  operating_system text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trusted_devices_user ON public.user_trusted_devices(user_id, revoked_at);
CREATE UNIQUE INDEX idx_trusted_devices_hash ON public.user_trusted_devices(device_token_hash);
GRANT SELECT ON public.user_trusted_devices TO authenticated;
GRANT ALL ON public.user_trusted_devices TO service_role;
ALTER TABLE public.user_trusted_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trusted_devices_owner_select" ON public.user_trusted_devices
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT (device_token_hash) ON public.user_trusted_devices FROM authenticated;

-- ---------- Eventos de segurança ----------
CREATE TABLE public.user_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  result text NOT NULL DEFAULT 'success',
  device_summary text,
  location_summary text,
  ip_hash text,
  metadata_safe jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_security_events_user ON public.user_security_events(user_id, created_at DESC);
GRANT SELECT ON public.user_security_events TO authenticated;
GRANT ALL ON public.user_security_events TO service_role;
ALTER TABLE public.user_security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "security_events_owner_select" ON public.user_security_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT (ip_hash) ON public.user_security_events FROM authenticated;

-- ---------- Sessões do portal ----------
CREATE TABLE public.portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token_hash text NOT NULL,
  device_name text,
  browser text,
  operating_system text,
  location_summary text,
  trusted_device_id uuid REFERENCES public.user_trusted_devices(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_portal_sessions_user ON public.portal_sessions(user_id, revoked_at);
CREATE UNIQUE INDEX idx_portal_sessions_hash ON public.portal_sessions(session_token_hash);
GRANT SELECT ON public.portal_sessions TO authenticated;
GRANT ALL ON public.portal_sessions TO service_role;
ALTER TABLE public.portal_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_sessions_owner_select" ON public.portal_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE SELECT (session_token_hash) ON public.portal_sessions FROM authenticated;

-- ---------- Códigos de recuperação do 2FA ----------
CREATE TABLE public.mfa_recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_hash text NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recovery_codes_user ON public.mfa_recovery_codes(user_id, used_at, revoked_at);
GRANT ALL ON public.mfa_recovery_codes TO service_role;
ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
-- Sem policy para authenticated: hashes só são manipulados pelo backend seguro.

-- ---------- Consentimentos de privacidade ----------
CREATE TABLE public.privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  consent_type text NOT NULL,
  purpose text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'granted',
  granted_at timestamptz,
  revoked_at timestamptz,
  source text NOT NULL DEFAULT 'portal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_privacy_consents_user ON public.privacy_consents(user_id, consent_type, created_at DESC);
GRANT SELECT ON public.privacy_consents TO authenticated;
GRANT ALL ON public.privacy_consents TO service_role;
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "privacy_consents_owner_select" ON public.privacy_consents
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER trg_privacy_consents_updated BEFORE UPDATE ON public.privacy_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Solicitações LGPD ----------
CREATE SEQUENCE IF NOT EXISTS public.privacy_request_seq;

CREATE TABLE public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol text UNIQUE,
  user_id uuid NOT NULL,
  requester_type text NOT NULL DEFAULT 'associate',
  request_type text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'recebida',
  assigned_to uuid,
  internal_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_privacy_requests_user ON public.privacy_requests(user_id, created_at DESC);
GRANT SELECT ON public.privacy_requests TO authenticated;
GRANT ALL ON public.privacy_requests TO service_role;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "privacy_requests_owner_select" ON public.privacy_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "privacy_requests_admin_select" ON public.privacy_requests
  FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(), 'lgpd', 'visualizar'));
CREATE POLICY "privacy_requests_admin_update" ON public.privacy_requests
  FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'lgpd', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'lgpd', 'editar'));
REVOKE SELECT (internal_notes) ON public.privacy_requests FROM authenticated;
CREATE TRIGGER trg_privacy_requests_updated BEFORE UPDATE ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.privacy_gerar_protocolo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'LGPD-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.privacy_request_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_privacy_requests_protocolo BEFORE INSERT ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.privacy_gerar_protocolo();

CREATE TABLE public.privacy_request_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.privacy_requests(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid,
  notes_safe text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_privacy_history_request ON public.privacy_request_history(request_id, created_at);
GRANT SELECT ON public.privacy_request_history TO authenticated;
GRANT ALL ON public.privacy_request_history TO service_role;
ALTER TABLE public.privacy_request_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "privacy_history_owner_select" ON public.privacy_request_history
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.privacy_requests r
            WHERE r.id = request_id
              AND (r.user_id = auth.uid() OR public.tem_permissao(auth.uid(), 'lgpd', 'visualizar')))
  );

CREATE OR REPLACE FUNCTION public.privacy_registrar_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.privacy_request_history (request_id, new_status, changed_by, notes_safe)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Solicitação recebida pelo portal');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.privacy_request_history (request_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_privacy_requests_status AFTER INSERT OR UPDATE ON public.privacy_requests
  FOR EACH ROW EXECUTE FUNCTION public.privacy_registrar_status();

-- ---------- Exportação de dados pessoais ----------
CREATE TABLE public.personal_data_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_id uuid REFERENCES public.privacy_requests(id) ON DELETE SET NULL,
  file_path text,
  format text NOT NULL DEFAULT 'json',
  status text NOT NULL DEFAULT 'processando',
  expires_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_data_exports_user ON public.personal_data_exports(user_id, created_at DESC);
GRANT SELECT ON public.personal_data_exports TO authenticated;
GRANT ALL ON public.personal_data_exports TO service_role;
ALTER TABLE public.personal_data_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "data_exports_owner_select" ON public.personal_data_exports
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ---------- Recuperação administrativa de acesso ----------
CREATE SEQUENCE IF NOT EXISTS public.account_recovery_seq;

CREATE TABLE public.account_recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol text UNIQUE,
  user_id uuid,
  cpf_reference text,
  contact_email text,
  recovery_type text NOT NULL,
  status text NOT NULL DEFAULT 'recebida',
  assigned_to uuid,
  reason text,
  internal_notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_account_recovery_status ON public.account_recovery_requests(status, created_at DESC);
GRANT SELECT ON public.account_recovery_requests TO authenticated;
GRANT ALL ON public.account_recovery_requests TO service_role;
ALTER TABLE public.account_recovery_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account_recovery_admin_select" ON public.account_recovery_requests
  FOR SELECT TO authenticated USING (public.tem_permissao(auth.uid(), 'seguranca', 'visualizar'));
CREATE POLICY "account_recovery_admin_update" ON public.account_recovery_requests
  FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'seguranca', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'seguranca', 'editar'));
CREATE TRIGGER trg_account_recovery_updated BEFORE UPDATE ON public.account_recovery_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.account_recovery_gerar_protocolo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'REC-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.account_recovery_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_account_recovery_protocolo BEFORE INSERT ON public.account_recovery_requests
  FOR EACH ROW EXECUTE FUNCTION public.account_recovery_gerar_protocolo();