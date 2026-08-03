-- Reforçando os GRANTs que parecem não ter persistido corretamente no ambiente sandbox_exec
GRANT SELECT, INSERT, UPDATE, DELETE ON public.associados TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dependentes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios_internos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfil_permissoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuario_permissoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.previdencia_admins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cams_postos_graduacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cams_unidades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;

GRANT ALL ON public.associados TO service_role;
GRANT ALL ON public.dependentes TO service_role;
GRANT ALL ON public.usuarios_internos TO service_role;
GRANT ALL ON public.perfil_permissoes TO service_role;
GRANT ALL ON public.perfis TO service_role;
GRANT ALL ON public.usuario_permissoes TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.previdencia_admins TO service_role;
GRANT ALL ON public.cams_postos_graduacoes TO service_role;
GRANT ALL ON public.cams_unidades TO service_role;
GRANT ALL ON public.audit_logs TO service_role;
