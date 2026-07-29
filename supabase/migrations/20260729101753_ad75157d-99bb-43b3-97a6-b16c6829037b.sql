ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS perfil text,
  ADD COLUMN IF NOT EXISTS modulo text,
  ADD COLUMN IF NOT EXISTS criticidade text NOT NULL DEFAULT 'baixa',
  ADD COLUMN IF NOT EXISTS justificativa text,
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'portal_admin',
  ADD COLUMN IF NOT EXISTS operacao_id uuid,
  ADD COLUMN IF NOT EXISTS valor_anterior jsonb,
  ADD COLUMN IF NOT EXISTS valor_posterior jsonb;

CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON public.audit_logs (modulo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_criticidade ON public.audit_logs (criticidade);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operacao ON public.audit_logs (operacao_id);

-- Sanitiza dados sensíveis e preenche contexto automaticamente
CREATE OR REPLACE FUNCTION public.audit_logs_preparar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _k text;
  _sensivel text[] := ARRAY['password','senha','token','access_token','refresh_token','secret','api_key','apikey','authorization','service_role','chave','credencial','jwt'];
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := COALESCE(NEW.user_id, auth.uid());
    NEW.perfil := COALESCE(NEW.perfil, public.perfil_ativo(auth.uid()));
  END IF;

  IF NEW.criticidade NOT IN ('baixa','media','alta','critica') THEN
    NEW.criticidade := 'baixa';
  END IF;

  IF NEW.details IS NOT NULL AND jsonb_typeof(NEW.details) = 'object' THEN
    FOREACH _k IN ARRAY (SELECT COALESCE(array_agg(key), ARRAY[]::text[]) FROM jsonb_object_keys(NEW.details) key) LOOP
      IF EXISTS (SELECT 1 FROM unnest(_sensivel) s WHERE lower(_k) LIKE '%' || s || '%') THEN
        NEW.details := NEW.details - _k;
      END IF;
    END LOOP;
  END IF;

  IF NEW.valor_anterior IS NOT NULL AND jsonb_typeof(NEW.valor_anterior) = 'object' THEN
    FOREACH _k IN ARRAY (SELECT COALESCE(array_agg(key), ARRAY[]::text[]) FROM jsonb_object_keys(NEW.valor_anterior) key) LOOP
      IF EXISTS (SELECT 1 FROM unnest(_sensivel) s WHERE lower(_k) LIKE '%' || s || '%') THEN
        NEW.valor_anterior := NEW.valor_anterior - _k;
      END IF;
    END LOOP;
  END IF;

  IF NEW.valor_posterior IS NOT NULL AND jsonb_typeof(NEW.valor_posterior) = 'object' THEN
    FOREACH _k IN ARRAY (SELECT COALESCE(array_agg(key), ARRAY[]::text[]) FROM jsonb_object_keys(NEW.valor_posterior) key) LOOP
      IF EXISTS (SELECT 1 FROM unnest(_sensivel) s WHERE lower(_k) LIKE '%' || s || '%') THEN
        NEW.valor_posterior := NEW.valor_posterior - _k;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_preparar ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_preparar
BEFORE INSERT ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.audit_logs_preparar();

-- Logs imutáveis
CREATE OR REPLACE FUNCTION public.audit_logs_imutavel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'Registros de auditoria são imutáveis e não podem ser alterados ou removidos';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_imutavel ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_imutavel
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.audit_logs_imutavel();

REVOKE UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM authenticated, anon;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Auditoria visivel para autorizados"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.tem_permissao(auth.uid(), 'auditoria', 'visualizar'));

CREATE POLICY "Usuarios autenticados registram auditoria"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());