
-- 1. app_role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Admin write policies
CREATE POLICY "Admins gerenciam associados" ON public.associados FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam dependentes" ON public.dependentes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam limites" ON public.limites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam historico" ON public.historico_limite FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam carencias" ON public.carencias FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam clinicas" ON public.clinicas_parceiros FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins gerenciam informes" ON public.informes_rendimentos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Storage policies for informes bucket
CREATE POLICY "Admins veem informes" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'informes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload informes" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'informes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update informes" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'informes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete informes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'informes' AND public.has_role(auth.uid(), 'admin'));

-- 5. Update triggers
CREATE TRIGGER trg_associados_updated BEFORE UPDATE ON public.associados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dependentes_updated BEFORE UPDATE ON public.dependentes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_limites_updated BEFORE UPDATE ON public.limites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_carencias_updated BEFORE UPDATE ON public.carencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_clinicas_updated BEFORE UPDATE ON public.clinicas_parceiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
