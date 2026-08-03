
-- Criar a RPC de diagnóstico solicitada
CREATE OR REPLACE FUNCTION public.get_my_portal_identity()
RETURNS TABLE (
    auth_id uuid,
    link_id uuid,
    associado_id uuid,
    dependente_id uuid,
    cpf_ref text,
    link_status text,
    person_type text,
    associado_nome text,
    associado_status text
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        u.id as auth_id,
        eal.id as link_id,
        eal.associado_id,
        eal.dependente_id,
        eal.cpf_reference as cpf_ref,
        eal.status as link_status,
        eal.person_type,
        a.nome as associado_nome,
        a.status as associado_status
    FROM auth.users u
    LEFT JOIN public.external_account_links eal ON u.id = eal.user_id
    LEFT JOIN public.associados a ON eal.associado_id = a.id
    WHERE u.id = auth.uid();
$$;

-- Garantir privilégios de execução e leitura necessária
GRANT EXECUTE ON FUNCTION public.get_my_portal_identity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.repair_portal_identity() TO authenticated;
GRANT SELECT ON public.external_account_links TO authenticated;
GRANT SELECT ON public.associados TO authenticated;
GRANT SELECT ON public.dependentes TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
