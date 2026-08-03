-- Corrigindo grants para as tabelas do sistema de associados e permissões
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

DROP POLICY IF EXISTS "Admins gerenciam associados" ON public.associados;

CREATE POLICY "associados_select_admin" ON public.associados
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.is_previdencia_admin(auth.uid()) OR
    public.tem_permissao(auth.uid(), 'associados', 'visualizar')
  );

CREATE POLICY "associados_insert_admin" ON public.associados
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.tem_permissao(auth.uid(), 'associados', 'criar')
  );

CREATE POLICY "associados_update_admin" ON public.associados
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.is_previdencia_admin(auth.uid()) OR
    public.tem_permissao(auth.uid(), 'associados', 'editar')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.is_previdencia_admin(auth.uid()) OR
    public.tem_permissao(auth.uid(), 'associados', 'editar')
  );

CREATE POLICY "associados_delete_admin" ON public.associados
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.tem_permissao(auth.uid(), 'associados', 'excluir')
  );
