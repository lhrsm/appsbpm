
ALTER TABLE public.associados ADD COLUMN IF NOT EXISTS assinatura_url text;
ALTER TABLE public.dependentes ADD COLUMN IF NOT EXISTS assinatura_url text;
