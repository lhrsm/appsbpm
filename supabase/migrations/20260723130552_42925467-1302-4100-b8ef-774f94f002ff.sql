
CREATE TABLE IF NOT EXISTS public.sistema_config (
  chave text PRIMARY KEY,
  valor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sistema_config TO anon, authenticated;
GRANT ALL ON public.sistema_config TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.sistema_config TO authenticated;

ALTER TABLE public.sistema_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sistema_config_read_all" ON public.sistema_config
  FOR SELECT USING (true);

CREATE POLICY "sistema_config_admin_write" ON public.sistema_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_sistema_config_updated
  BEFORE UPDATE ON public.sistema_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sistema_config (chave, valor) VALUES ('assinatura_presidente_url', NULL)
  ON CONFLICT (chave) DO NOTHING;
INSERT INTO public.sistema_config (chave, valor) VALUES ('nome_presidente', NULL)
  ON CONFLICT (chave) DO NOTHING;
