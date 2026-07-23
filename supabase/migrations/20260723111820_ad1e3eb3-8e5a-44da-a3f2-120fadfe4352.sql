
CREATE TABLE public.resposta_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resposta_templates TO authenticated;
GRANT ALL ON public.resposta_templates TO service_role;

ALTER TABLE public.resposta_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam templates"
  ON public.resposta_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

CREATE TRIGGER update_resposta_templates_updated_at
  BEFORE UPDATE ON public.resposta_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.resposta_templates (categoria, titulo, conteudo) VALUES
  ('segunda_via_carteirinha', 'Carteirinha disponível no app', 'Olá! Sua 2ª via de carteirinha já está disponível para visualização e impressão diretamente no aplicativo, na aba "Carteirinha Digital". Qualquer dúvida, estamos à disposição.'),
  ('alteracao_cadastral', 'Alteração cadastral concluída', 'Olá! Sua solicitação de alteração cadastral foi processada com sucesso. As novas informações já estão refletidas em seu perfil.'),
  ('duvida', 'Encaminhamento ao setor responsável', 'Olá! Recebemos sua dúvida e a encaminhamos ao setor responsável. Em breve entraremos em contato com o retorno.'),
  ('financeiro', 'Boleto/2ª via de mensalidade', 'Olá! A 2ª via da sua mensalidade já está disponível no menu "Financeiro" do aplicativo. Caso precise de auxílio, fale conosco pelo WhatsApp da Previdência: (71) 98549-6972.'),
  ('atendimento_medico', 'Autorização em análise', 'Olá! Sua solicitação de atendimento está em análise pela equipe de Assistência à Saúde. Retornaremos em até 48h úteis.'),
  ('reclamacao', 'Reclamação registrada', 'Olá! Sua reclamação foi devidamente registrada e será apurada pela nossa ouvidoria. Agradecemos o feedback — ele é essencial para melhorarmos nossos serviços.'),
  ('sugestao', 'Agradecimento por sugestão', 'Olá! Muito obrigado pela sua sugestão. Ela foi encaminhada à diretoria e será avaliada nas próximas reuniões de melhoria contínua.');
