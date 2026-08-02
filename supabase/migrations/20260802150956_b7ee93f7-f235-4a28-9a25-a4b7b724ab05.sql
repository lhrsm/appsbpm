-- Índices de desempenho para as listagens mais acessadas do portal (Fase 12)
CREATE INDEX IF NOT EXISTS idx_notificacoes_associado_data
  ON public.notificacoes (associado_id, created_at DESC) WHERE dependente_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_notificacoes_dependente_data
  ON public.notificacoes (dependente_id, created_at DESC) WHERE dependente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_solicitacoes_associado_data
  ON public.solicitacoes (associado_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_dependente_data
  ON public.solicitacoes (dependente_id, created_at DESC) WHERE dependente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documentos_associado_publicado
  ON public.documentos_associado (associado_id, publicado_em DESC) WHERE ativo;

CREATE INDEX IF NOT EXISTS idx_acessos_log_associado_data
  ON public.acessos_log (associado_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acessos_log_dependente_data
  ON public.acessos_log (dependente_id, created_at DESC) WHERE dependente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mensalidades_associado_venc
  ON public.mensalidades (associado_id, vencimento DESC);

CREATE INDEX IF NOT EXISTS idx_dependentes_associado
  ON public.dependentes (associado_id);

CREATE INDEX IF NOT EXISTS idx_eventos_ativos_inicio
  ON public.eventos (data_inicio) WHERE ativo;

CREATE INDEX IF NOT EXISTS idx_clinicas_ativas_cidade
  ON public.clinicas_parceiros (cidade) WHERE ativo;