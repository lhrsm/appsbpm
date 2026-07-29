-- Remove políticas totalmente permissivas de leitura pública
DROP POLICY IF EXISTS "Associados podem ver seus próprios dados" ON public.associados;
DROP POLICY IF EXISTS "Ver dependentes do associado" ON public.dependentes;
DROP POLICY IF EXISTS "Ver limites do associado" ON public.limites;
DROP POLICY IF EXISTS "Ver histórico do associado" ON public.historico_limite;
DROP POLICY IF EXISTS "Ver informes do associado" ON public.informes_rendimentos;
DROP POLICY IF EXISTS "Ver carências do associado" ON public.carencias;
DROP POLICY IF EXISTS "Public read mensalidades" ON public.mensalidades;
DROP POLICY IF EXISTS "Public read documentos" ON public.documentos_associado;
DROP POLICY IF EXISTS "Anyone can view solicitacoes" ON public.solicitacoes;
DROP POLICY IF EXISTS "Anyone can create solicitacoes" ON public.solicitacoes;
DROP POLICY IF EXISTS "Qualquer um pode registrar acesso" ON public.acessos_log;

-- Revoga acesso anônimo via Data API nessas tabelas
REVOKE ALL ON public.associados FROM anon;
REVOKE ALL ON public.dependentes FROM anon;
REVOKE ALL ON public.limites FROM anon;
REVOKE ALL ON public.historico_limite FROM anon;
REVOKE ALL ON public.informes_rendimentos FROM anon;
REVOKE ALL ON public.carencias FROM anon;
REVOKE ALL ON public.mensalidades FROM anon;
REVOKE ALL ON public.documentos_associado FROM anon;
REVOKE ALL ON public.solicitacoes FROM anon;
REVOKE ALL ON public.acessos_log FROM anon;

-- Garante que administradores autenticados e as funções de servidor continuem funcionando
GRANT SELECT, INSERT, UPDATE, DELETE ON public.associados TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dependentes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.limites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico_limite TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.informes_rendimentos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carencias TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensalidades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_associado TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes TO authenticated;
GRANT SELECT ON public.acessos_log TO authenticated;

GRANT ALL ON public.associados TO service_role;
GRANT ALL ON public.dependentes TO service_role;
GRANT ALL ON public.limites TO service_role;
GRANT ALL ON public.historico_limite TO service_role;
GRANT ALL ON public.informes_rendimentos TO service_role;
GRANT ALL ON public.carencias TO service_role;
GRANT ALL ON public.mensalidades TO service_role;
GRANT ALL ON public.documentos_associado TO service_role;
GRANT ALL ON public.solicitacoes TO service_role;
GRANT ALL ON public.acessos_log TO service_role;