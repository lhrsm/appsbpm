-- 1. Garantir campos de auditoria de reparo
ALTER TABLE public.external_account_links ADD COLUMN IF NOT EXISTS repair_notes text;
ALTER TABLE public.external_account_links ADD COLUMN IF NOT EXISTS last_repair_at timestamp with time zone;

-- 2. Criar a função de reparo com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.repair_portal_identity()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_link_id uuid;
    v_cpf_ref text;
    v_assoc_id uuid;
    v_dep_id uuid;
    v_person_type text;
    v_assoc_status text;
    v_found_assoc RECORD;
    v_found_dep RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'reason_code', 'SESSION_MISSING', 'message', 'Usuário não autenticado');
    END IF;

    SELECT id, cpf_reference, associado_id, dependente_id, person_type
    INTO v_link_id, v_cpf_ref, v_assoc_id, v_dep_id, v_person_type
    FROM public.external_account_links
    WHERE user_id = v_user_id;

    IF v_link_id IS NULL THEN
        SELECT id, cpf_reference, associado_id, dependente_id, person_type
        INTO v_link_id, v_cpf_ref, v_assoc_id, v_dep_id, v_person_type
        FROM public.external_account_links
        WHERE email = (SELECT email FROM auth.users WHERE id = v_user_id)
        LIMIT 1;
        
        IF v_link_id IS NOT NULL THEN
            UPDATE public.external_account_links SET user_id = v_user_id WHERE id = v_link_id;
        ELSE
            RETURN json_build_object('success', false, 'reason_code', 'PROFILE_LINK_MISSING', 'message', 'Vínculo institucional não encontrado');
        END IF;
    END IF;

    IF v_assoc_id IS NULL AND v_dep_id IS NULL THEN
        SELECT id, status INTO v_found_assoc FROM public.associados WHERE cpf = v_cpf_ref OR cpf = regexp_replace(v_cpf_ref, '(\d{3})(\d{3})(\d{3})(\d{2})', '\1.\2.\3-\4') LIMIT 1;
        
        IF v_found_assoc.id IS NOT NULL THEN
            v_assoc_id := v_found_assoc.id;
            v_assoc_status := v_found_assoc.status;
            
            IF v_person_type = 'dependent' THEN
                SELECT id, status INTO v_found_dep FROM public.dependentes WHERE (cpf = v_cpf_ref OR cpf = regexp_replace(v_cpf_ref, '(\d{3})(\d{3})(\d{3})(\d{2})', '\1.\2.\3-\4')) AND associado_id = v_assoc_id LIMIT 1;
                IF v_found_dep.id IS NOT NULL THEN
                    v_dep_id := v_found_dep.id;
                END IF;
            END IF;
            
            UPDATE public.external_account_links 
            SET associado_id = v_assoc_id, 
                dependente_id = v_dep_id,
                last_repair_at = now(),
                repair_notes = 'Reparo automático via repair_portal_identity'
            WHERE id = v_link_id;
        ELSE
            RETURN json_build_object('success', false, 'reason_code', 'ASSOCIATE_NOT_FOUND', 'message', 'Cadastro institucional não localizado pelo CPF');
        END IF;
    END IF;

    IF v_assoc_status IS NULL THEN
        SELECT status INTO v_assoc_status FROM public.associados WHERE id = v_assoc_id;
    END IF;

    RETURN json_build_object(
        'success', true, 
        'reason_code', 'READY', 
        'data', json_build_object(
            'link_id', v_link_id,
            'associado_id', v_assoc_id,
            'dependente_id', v_dep_id,
            'person_type', v_person_type,
            'association_status', v_assoc_status
        )
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.repair_portal_identity() TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.external_account_links TO authenticated;