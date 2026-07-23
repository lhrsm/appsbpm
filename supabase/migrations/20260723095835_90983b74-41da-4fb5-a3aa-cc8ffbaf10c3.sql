
CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id uuid REFERENCES public.associados(id) ON DELETE CASCADE,
  dependente_id uuid REFERENCES public.dependentes(id) ON DELETE CASCADE,
  user_id uuid,
  token text NOT NULL UNIQUE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated, anon;
GRANT ALL ON public.push_tokens TO service_role;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert push tokens" ON public.push_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update own token" ON public.push_tokens FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admins view push tokens" ON public.push_tokens FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
