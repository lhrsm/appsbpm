
DO $$
DECLARE
    rec RECORD;
    v_norm_cpf TEXT;
    v_norm_mat TEXT;
BEGIN
    -- Associados
    FOR rec IN SELECT id, cpf, matricula FROM public.associados LOOP
        v_norm_cpf := NULL;
        IF rec.cpf IS NOT NULL THEN
            v_norm_cpf := LPAD(regexp_replace(rec.cpf, '[^0-9]', '', 'g'), 11, '0');
        END IF;

        v_norm_mat := NULL;
        IF rec.matricula IS NOT NULL THEN
            v_norm_mat := LPAD(regexp_replace(rec.matricula, '[^0-9]', '', 'g'), 9, '0');
        END IF;

        UPDATE public.associados 
        SET cpf = COALESCE(v_norm_cpf, cpf), 
            matricula = COALESCE(v_norm_mat, matricula)
        WHERE id = rec.id;
    END LOOP;

    -- Dependentes
    FOR rec IN SELECT id, cpf FROM public.dependentes LOOP
        IF rec.cpf IS NOT NULL THEN
            v_norm_cpf := LPAD(regexp_replace(rec.cpf, '[^0-9]', '', 'g'), 11, '0');
            UPDATE public.dependentes SET cpf = v_norm_cpf WHERE id = rec.id;
        END IF;
    END LOOP;

    -- Mock records
    FOR rec IN SELECT id, cpf_reference, registration_number FROM public.external_identity_mock_records LOOP
        v_norm_cpf := NULL;
        IF rec.cpf_reference IS NOT NULL THEN
            v_norm_cpf := LPAD(regexp_replace(rec.cpf_reference, '[^0-9]', '', 'g'), 11, '0');
        END IF;
        
        v_norm_mat := NULL;
        IF rec.registration_number IS NOT NULL THEN
            v_norm_mat := LPAD(regexp_replace(rec.registration_number, '[^0-9]', '', 'g'), 9, '0');
        END IF;

        UPDATE public.external_identity_mock_records 
        SET cpf_reference = COALESCE(v_norm_cpf, cpf_reference), 
            registration_number = COALESCE(v_norm_mat, registration_number)
        WHERE id = rec.id;
    END LOOP;

    -- Cleanup redundant columns
    ALTER TABLE public.associados DROP COLUMN IF EXISTS ativo;
    ALTER TABLE public.dependentes DROP COLUMN IF EXISTS ativo;
END $$;
