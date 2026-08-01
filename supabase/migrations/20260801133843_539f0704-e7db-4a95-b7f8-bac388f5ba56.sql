-- Catálogo de postos e graduações
CREATE TABLE public.association_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  permite_complemento boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.association_ranks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.association_ranks TO authenticated;
GRANT ALL ON public.association_ranks TO service_role;
ALTER TABLE public.association_ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ranks_leitura_publica" ON public.association_ranks FOR SELECT USING (ativo);
CREATE POLICY "ranks_gerenciar" ON public.association_ranks FOR ALL TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'configurar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'associados', 'configurar'));

INSERT INTO public.association_ranks (nome, ordem, permite_complemento) VALUES
  ('Soldado', 10, false), ('Cabo', 20, false), ('Sargento', 30, false),
  ('Subtenente', 40, false), ('Aspirante', 50, false), ('Tenente', 60, false),
  ('Capitão', 70, false), ('Major', 80, false), ('Tenente-coronel', 90, false),
  ('Coronel', 100, false), ('Outro', 999, true);

-- Sequência de protocolo
CREATE SEQUENCE public.association_protocol_seq;
GRANT USAGE ON SEQUENCE public.association_protocol_seq TO service_role;

CREATE TABLE public.association_pre_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol text NOT NULL UNIQUE,
  full_name text NOT NULL,
  cpf_reference text NOT NULL,
  registration_number text,
  rank_id uuid REFERENCES public.association_ranks(id),
  rank_other text,
  functional_status text NOT NULL DEFAULT 'ativo',
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp_phone text,
  consent_accepted boolean NOT NULL DEFAULT false,
  privacy_version text,
  terms_version text,
  status text NOT NULL DEFAULT 'recebido',
  assigned_to uuid,
  observacoes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX idx_assoc_pre_status ON public.association_pre_registrations (status);
CREATE UNIQUE INDEX idx_assoc_pre_cpf_aberto ON public.association_pre_registrations (cpf_reference)
  WHERE deleted_at IS NULL AND status NOT IN ('cancelado','rejeitado','concluido');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.association_pre_registrations TO authenticated;
GRANT ALL ON public.association_pre_registrations TO service_role;
ALTER TABLE public.association_pre_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pre_reg_ver" ON public.association_pre_registrations FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'visualizar'));
CREATE POLICY "pre_reg_editar" ON public.association_pre_registrations FOR UPDATE TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'associados', 'editar'));
CREATE POLICY "pre_reg_criar" ON public.association_pre_registrations FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'associados', 'criar'));

CREATE OR REPLACE FUNCTION public.association_gerar_protocolo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'ASSOC-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.association_protocol_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_assoc_protocolo BEFORE INSERT ON public.association_pre_registrations
  FOR EACH ROW EXECUTE FUNCTION public.association_gerar_protocolo();
CREATE TRIGGER trg_assoc_updated BEFORE UPDATE ON public.association_pre_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.association_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_registration_id uuid REFERENCES public.association_pre_registrations(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.association_status_history TO authenticated;
GRANT ALL ON public.association_status_history TO service_role;
ALTER TABLE public.association_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assoc_hist_ver" ON public.association_status_history FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'visualizar'));
CREATE POLICY "assoc_hist_criar" ON public.association_status_history FOR INSERT TO authenticated
  WITH CHECK (public.tem_permissao(auth.uid(), 'associados', 'editar'));

CREATE OR REPLACE FUNCTION public.association_registrar_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.association_status_history (pre_registration_id, new_status, changed_by, reason)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Pré-cadastro recebido');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.association_status_history (pre_registration_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_assoc_status AFTER INSERT OR UPDATE ON public.association_pre_registrations
  FOR EACH ROW EXECUTE FUNCTION public.association_registrar_status();

CREATE TABLE public.association_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_registration_id uuid NOT NULL REFERENCES public.association_pre_registrations(id) ON DELETE CASCADE,
  contact_type text NOT NULL DEFAULT 'telefone',
  contact_at timestamptz NOT NULL DEFAULT now(),
  performed_by uuid,
  result text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.association_contacts TO authenticated;
GRANT ALL ON public.association_contacts TO service_role;
ALTER TABLE public.association_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assoc_contatos_ver" ON public.association_contacts FOR SELECT TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'visualizar'));
CREATE POLICY "assoc_contatos_gerenciar" ON public.association_contacts FOR ALL TO authenticated
  USING (public.tem_permissao(auth.uid(), 'associados', 'editar'))
  WITH CHECK (public.tem_permissao(auth.uid(), 'associados', 'editar'));