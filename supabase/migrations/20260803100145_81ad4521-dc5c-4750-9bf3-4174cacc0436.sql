-- RLS for new tables
ALTER TABLE public.cams_postos_graduacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cams_unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CAMS tables are viewable by authenticated"
  ON public.cams_postos_graduacoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "CAMS units are viewable by authenticated"
  ON public.cams_unidades FOR SELECT
  TO authenticated
  USING (true);

-- Fix linter warnings about public execute on security definer functions
-- Revoke from PUBLIC (anon and authenticated) to ensure only service_role or specific owner can execute if not explicitly granted
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
