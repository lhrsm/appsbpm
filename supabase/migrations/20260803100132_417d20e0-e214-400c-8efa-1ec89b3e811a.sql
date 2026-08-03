-- ==========================================
-- FASE 16: INTEGRAÇÃO CAMS - SCHEMA REFINEMENT
-- ==========================================

-- 1. Tabelas de Domínio (Lookups)
CREATE TABLE public.cams_postos_graduacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigla VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  hierarquia INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cams_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigla VARCHAR(50) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50), -- Batalhão, Companhia, etc.
  cidade VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enums de Situação
CREATE TYPE public.cams_situacao_funcional AS ENUM ('ativo', 'reserva', 'reformado', 'civil');
CREATE TYPE public.cams_situacao_associativa AS ENUM ('regular', 'suspenso', 'excluido', 'falecido', 'licenciado');

-- 3. Extensão da Tabela de Associados
ALTER TABLE public.associados 
  ADD COLUMN IF NOT EXISTS situacao_funcional public.cams_situacao_funcional DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS situacao_associativa public.cams_situacao_associativa DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS posto_graduacao_id UUID REFERENCES public.cams_postos_graduacoes(id),
  ADD COLUMN IF NOT EXISTS unidade_id UUID REFERENCES public.cams_unidades(id),
  ADD COLUMN IF NOT EXISTS sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
  ADD COLUMN IF NOT EXISTS rg_militar VARCHAR(20),
  ADD COLUMN IF NOT EXISTS rg_civil VARCHAR(20),
  ADD COLUMN IF NOT EXISTS orgao_emissor VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nome_pai VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nome_mae VARCHAR(255),
  ADD COLUMN IF NOT EXISTS naturalidade VARCHAR(100),
  ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(50),
  ADD COLUMN IF NOT EXISTS numero_residencia VARCHAR(20),
  ADD COLUMN IF NOT EXISTS complemento_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bairro_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cidade_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS estado_residencia CHAR(2),
  ADD COLUMN IF NOT EXISTS cep_residencia VARCHAR(10),
  ADD COLUMN IF NOT EXISTS cams_last_sync TIMESTAMPTZ;

-- 4. Extensão da Tabela de Dependentes
ALTER TABLE public.dependentes
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS numero_residencia VARCHAR(20),
  ADD COLUMN IF NOT EXISTS complemento_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bairro_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cidade_residencia VARCHAR(100),
  ADD COLUMN IF NOT EXISTS estado_residencia CHAR(2),
  ADD COLUMN IF NOT EXISTS cep_residencia VARCHAR(10),
  ADD COLUMN IF NOT EXISTS utiliza_endereco_titular BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS cams_last_sync TIMESTAMPTZ;

-- 5. Grants
GRANT SELECT ON public.cams_postos_graduacoes TO authenticated;
GRANT SELECT ON public.cams_unidades TO authenticated;
GRANT ALL ON public.cams_postos_graduacoes TO service_role;
GRANT ALL ON public.cams_unidades TO service_role;

-- 6. Populando dados base (Postos/Graduacoes)
INSERT INTO public.cams_postos_graduacoes (sigla, nome, hierarquia) VALUES
('CEL', 'Coronel', 1),
('TC', 'Tenente-Coronel', 2),
('MAJ', 'Major', 3),
('CAP', 'Capitão', 4),
('1TEN', '1º Tenente', 5),
('ASP', 'Aspirante', 6),
('SUBTEN', 'Subtenente', 7),
('1SGT', '1º Sargento', 8),
('2SGT', '2º Sargento', 9),
('3SGT', '3º Sargento', 10),
('CB', 'Cabo', 11),
('SD', 'Soldado', 12)
ON CONFLICT (sigla) DO NOTHING;
