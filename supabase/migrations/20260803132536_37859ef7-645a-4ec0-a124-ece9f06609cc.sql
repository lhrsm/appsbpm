
-- 1. Reparar o vínculo do Carlos Antonio no external_account_links
UPDATE public.external_account_links
SET 
    user_id = 'dc21aede-f18c-4e1b-9b44-285dec1f572e',
    associado_id = '712146d5-9f54-4619-976c-9c9cf015f46c',
    status = 'active',
    person_type = 'associate',
    cpf_reference = '06192793549',
    registration_number = '300642010',
    updated_at = now(),
    last_repair_at = now(),
    repair_notes = 'Reparo manual: Sincronização definitiva de vínculo (Carlos Antonio)'
WHERE email = 'louishrsm@outlook.com' OR cpf_reference = '06192793549';

-- 2. Garantir que o associado está como 'regular'
UPDATE public.associados
SET status = 'regular'
WHERE id = '712146d5-9f54-4619-976c-9c9cf015f46c';

-- 3. Limpar sessões antigas
DELETE FROM public.portal_sessions WHERE user_id = 'dc21aede-f18c-4e1b-9b44-285dec1f572e';

-- 4. Marcar registro mock como registrado
UPDATE public.external_identity_mock_records
SET already_registered = true, is_active = true
WHERE cpf_reference = '06192793549';
