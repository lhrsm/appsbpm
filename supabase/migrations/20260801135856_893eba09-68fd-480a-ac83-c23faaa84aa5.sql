CREATE TABLE public.external_identity_quiz_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_session_id uuid NOT NULL REFERENCES public.external_identity_validation_sessions(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  chave text NOT NULL,
  pergunta text NOT NULL,
  opcoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  resposta_hash text NOT NULL,
  respondido_em timestamptz,
  correto boolean,
  tentativas integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (validation_session_id, ordem)
);

GRANT ALL ON public.external_identity_quiz_challenges TO service_role;

ALTER TABLE public.external_identity_quiz_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente serviço interno acessa desafios"
ON public.external_identity_quiz_challenges
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE INDEX idx_quiz_challenges_sessao ON public.external_identity_quiz_challenges (validation_session_id, ordem);

CREATE TRIGGER trg_quiz_challenges_updated_at
BEFORE UPDATE ON public.external_identity_quiz_challenges
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();