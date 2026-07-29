DROP POLICY IF EXISTS "public insert push tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "public update own token" ON public.push_tokens;
REVOKE ALL ON public.push_tokens FROM anon;
GRANT SELECT ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;