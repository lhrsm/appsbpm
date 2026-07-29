REVOKE EXECUTE ON FUNCTION public.meu_historico_acessos(uuid, uuid, integer) FROM anon, authenticated;

DROP POLICY IF EXISTS "Public can view own by associado" ON public.consentimentos;
REVOKE SELECT ON public.consentimentos FROM anon;
GRANT INSERT ON public.consentimentos TO anon;
GRANT SELECT, INSERT ON public.consentimentos TO authenticated;
GRANT ALL ON public.consentimentos TO service_role;
GRANT ALL ON public.solicitacoes_privacidade TO service_role;