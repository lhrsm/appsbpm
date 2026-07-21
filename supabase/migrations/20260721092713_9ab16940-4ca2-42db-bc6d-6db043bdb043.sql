
CREATE TABLE public.indicacoes_premiadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_matricula TEXT NOT NULL,
  associado_nome TEXT NOT NULL,
  associado_email TEXT,
  indicado_nome TEXT NOT NULL,
  indicado_cpf TEXT,
  indicado_telefone TEXT NOT NULL,
  indicado_email TEXT,
  indicado_cidade TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  email_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.indicacoes_premiadas TO authenticated;
GRANT ALL ON public.indicacoes_premiadas TO service_role;

ALTER TABLE public.indicacoes_premiadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todas indicacoes"
ON public.indicacoes_premiadas FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar indicacoes"
ON public.indicacoes_premiadas FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem excluir indicacoes"
ON public.indicacoes_premiadas FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_indicacoes_premiadas_updated_at
BEFORE UPDATE ON public.indicacoes_premiadas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
