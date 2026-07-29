CREATE OR REPLACE FUNCTION public.registrar_acesso_interno()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  UPDATE public.usuarios_internos
     SET ultimo_acesso = now()
   WHERE user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_acesso_interno() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_acesso_interno() TO authenticated;