
-- Allow bootstrap: first user can insert themselves as admin if no admin exists yet
CREATE POLICY "Bootstrap primeiro admin"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  );

-- Existing admins can manage roles
CREATE POLICY "Admins gerenciam roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
