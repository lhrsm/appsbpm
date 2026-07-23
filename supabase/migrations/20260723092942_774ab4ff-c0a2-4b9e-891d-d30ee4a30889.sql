
CREATE TABLE public.acessos_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  associado_id uuid REFERENCES public.associados(id) ON DELETE SET NULL,
  dependente_id uuid REFERENCES public.dependentes(id) ON DELETE SET NULL,
  tipo_usuario text NOT NULL CHECK (tipo_usuario IN ('titular','dependente')),
  metodo_login text CHECK (metodo_login IN ('matricula','cpf')),
  ip text,
  user_agent text,
  sucesso boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_acessos_log_associado ON public.acessos_log(associado_id, created_at DESC);
CREATE INDEX idx_acessos_log_dependente ON public.acessos_log(dependente_id, created_at DESC);

GRANT SELECT, INSERT ON public.acessos_log TO anon;
GRANT SELECT, INSERT ON public.acessos_log TO authenticated;
GRANT ALL ON public.acessos_log TO service_role;

ALTER TABLE public.acessos_log ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode registrar um acesso (login é público por matrícula/CPF)
CREATE POLICY "Qualquer um pode registrar acesso"
  ON public.acessos_log FOR INSERT
  WITH CHECK (true);

-- Somente admins veem tudo
CREATE POLICY "Admins veem todos os acessos"
  ON public.acessos_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Função para o próprio usuário consultar seu histórico via associado_id
CREATE OR REPLACE FUNCTION public.meu_historico_acessos(
  _associado_id uuid,
  _dependente_id uuid DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  tipo_usuario text,
  metodo_login text,
  ip text,
  user_agent text,
  sucesso boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tipo_usuario, metodo_login, ip, user_agent, sucesso, created_at
  FROM public.acessos_log
  WHERE associado_id = _associado_id
    AND (_dependente_id IS NULL OR dependente_id = _dependente_id)
  ORDER BY created_at DESC
  LIMIT LEAST(COALESCE(_limit, 20), 100);
$$;

GRANT EXECUTE ON FUNCTION public.meu_historico_acessos(uuid, uuid, int) TO anon, authenticated;
