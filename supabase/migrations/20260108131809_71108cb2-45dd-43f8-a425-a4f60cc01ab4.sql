-- Criar enum para tipo de dependente
CREATE TYPE public.tipo_dependente AS ENUM ('conjuge', 'filho', 'pai_mae', 'outro');

-- Criar enum para status de carência
CREATE TYPE public.status_carencia AS ENUM ('liberado', 'em_carencia');

-- Tabela de Associados (Titulares)
CREATE TABLE public.associados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  data_nascimento DATE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  foto_url TEXT,
  data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Dependentes
CREATE TABLE public.dependentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  data_nascimento DATE,
  tipo tipo_dependente NOT NULL DEFAULT 'outro',
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Limites
CREATE TABLE public.limites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  limite_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  limite_utilizado DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_renovacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Histórico de Utilização do Limite
CREATE TABLE public.historico_limite (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  data_utilizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Carências de Exames
CREATE TABLE public.carencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  procedimento VARCHAR(255) NOT NULL,
  status status_carencia NOT NULL DEFAULT 'em_carencia',
  data_liberacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Clínicas e Parceiros Conveniados
CREATE TABLE public.clinicas_parceiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  especialidade VARCHAR(100),
  cidade VARCHAR(100) NOT NULL,
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  horario_funcionamento TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Informes de Rendimentos
CREATE TABLE public.informes_rendimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  associado_id UUID NOT NULL REFERENCES public.associados(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  arquivo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security em todas as tabelas
ALTER TABLE public.associados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_limite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informes_rendimentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para associados (leitura pública para login por matrícula)
CREATE POLICY "Associados podem ver seus próprios dados" 
ON public.associados 
FOR SELECT 
USING (true);

-- Políticas RLS para dependentes
CREATE POLICY "Ver dependentes do associado" 
ON public.dependentes 
FOR SELECT 
USING (true);

-- Políticas RLS para limites
CREATE POLICY "Ver limites do associado" 
ON public.limites 
FOR SELECT 
USING (true);

-- Políticas RLS para histórico de limite
CREATE POLICY "Ver histórico do associado" 
ON public.historico_limite 
FOR SELECT 
USING (true);

-- Políticas RLS para carências
CREATE POLICY "Ver carências do associado" 
ON public.carencias 
FOR SELECT 
USING (true);

-- Políticas RLS para clínicas (leitura pública)
CREATE POLICY "Clinicas são públicas" 
ON public.clinicas_parceiros 
FOR SELECT 
USING (true);

-- Políticas RLS para informes
CREATE POLICY "Ver informes do associado" 
ON public.informes_rendimentos 
FOR SELECT 
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_associados_updated_at
BEFORE UPDATE ON public.associados
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dependentes_updated_at
BEFORE UPDATE ON public.dependentes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_limites_updated_at
BEFORE UPDATE ON public.limites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carencias_updated_at
BEFORE UPDATE ON public.carencias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinicas_updated_at
BEFORE UPDATE ON public.clinicas_parceiros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();