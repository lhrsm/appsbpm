DROP FUNCTION IF EXISTS public.get_my_portal_identity();

CREATE OR REPLACE FUNCTION public.get_my_portal_identity()
 RETURNS TABLE(
    resolved boolean,
    auth_user_id uuid,
    link_id uuid,
    associate_id uuid,
    dependent_id uuid,
    profile_type text,
    association_status text,
    link_status text,
    access_level text,
    reason_code text
 )
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT 
        CASE 
            WHEN eal.id IS NOT NULL AND eal.status = 'active' AND (eal.person_type = 'dependent' OR a.status = 'regular') THEN true
            ELSE false
        END as resolved,
        u.id as auth_user_id,
        eal.id as link_id,
        eal.associado_id as associate_id,
        eal.dependente_id as dependent_id,
        eal.person_type as profile_type,
        a.status::text as association_status,
        eal.status as link_status,
        CASE 
            WHEN eal.status != 'active' THEN 'blocked'
            WHEN eal.person_type = 'dependent' THEN 'full'
            WHEN a.status = 'regular' THEN 'full'
            WHEN a.status IN ('inativo', 'aguardando_reativacao') THEN 'read_only'
            WHEN a.status IN ('suspenso', 'falecido') THEN 'blocked'
            ELSE 'read_only'
        END as access_level,
        CASE
            WHEN eal.id IS NULL THEN 'PROFILE_LINK_MISSING'
            WHEN eal.associado_id IS NULL AND eal.person_type = 'associate' THEN 'ASSOCIATE_NOT_FOUND'
            WHEN eal.status = 'active' AND (eal.person_type = 'dependent' OR a.status = 'regular') THEN 'READY'
            ELSE 'IDENTITY_INCONSISTENCY'
        END as reason_code
    FROM auth.users u
    LEFT JOIN public.external_account_links eal ON u.id = eal.user_id
    LEFT JOIN public.associados a ON eal.associado_id = a.id
    WHERE u.id = auth.uid();
$function$;

GRANT EXECUTE ON FUNCTION public.get_my_portal_identity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_portal_identity() TO service_role;
