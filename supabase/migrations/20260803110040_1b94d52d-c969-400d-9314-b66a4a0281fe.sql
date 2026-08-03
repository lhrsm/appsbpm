
CREATE POLICY "associados_self_select" ON public.associados
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT associado_id FROM public.external_account_links WHERE user_id = auth.uid()
  )
);

CREATE POLICY "dependentes_self_select" ON public.dependentes
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT dependente_id FROM public.external_account_links WHERE user_id = auth.uid()
  )
);

GRANT SELECT ON public.associados TO authenticated;
GRANT SELECT ON public.dependentes TO authenticated;
GRANT SELECT ON public.external_account_links TO authenticated;
