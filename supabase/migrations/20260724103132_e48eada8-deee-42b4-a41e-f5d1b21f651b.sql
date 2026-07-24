
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  path TEXT,
  associado_id UUID,
  meta JSONB,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_path ON public.analytics_events(path);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_events"
ON public.analytics_events FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "admins_read_events"
ON public.analytics_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));
