-- Fix current data mappings
UPDATE public.external_account_links 
SET associado_id = 'b89448b3-b063-4f5e-8f58-5ed7b6d8b15b' 
WHERE cpf_reference = '12345678901' AND associado_id IS NULL;

UPDATE public.external_account_links 
SET associado_id = 'b89448b3-b063-4f5e-8f58-5ed7b6d8b15b', 
    dependente_id = '0e519ba7-289b-4ba5-8a6b-1282b3264d4c' 
WHERE cpf_reference = '98765432100' AND dependente_id IS NULL;

UPDATE public.external_account_links 
SET associado_id = 'b89448b3-b063-4f5e-8f58-5ed7b6d8b15b', 
    dependente_id = '15cb2370-56a4-4d19-a615-e1cb9cabd59b' 
WHERE cpf_reference = '11122233344' AND dependente_id IS NULL;

-- Ensure grants for management
GRANT UPDATE ON public.external_account_links TO authenticated;
GRANT ALL ON public.external_account_links TO service_role;