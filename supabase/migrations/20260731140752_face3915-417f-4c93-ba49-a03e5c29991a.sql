DO $$
DECLARE
  f record;
  keep_auth text[] := ARRAY[
    'has_role','perfil_ativo','pode_gerenciar_usuarios','tem_permissao','is_interno',
    'is_previdencia_admin','detectar_inconsistencias','pat_gerar_lista_inventario',
    'registrar_acesso_interno','pat_consulta_qr','pat_registrar_ocorrencia'
  ];
  keep_anon text[] := ARRAY['pat_consulta_qr','pat_registrar_ocorrencia'];
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    IF f.proname = ANY (keep_auth) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
    END IF;
    IF f.proname = ANY (keep_anon) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', f.sig);
    END IF;
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;