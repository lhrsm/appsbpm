-- Adicionar coluna para URL da logo nas clínicas
ALTER TABLE public.clinicas_parceiros
ADD COLUMN logo_url TEXT;