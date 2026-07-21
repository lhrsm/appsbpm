
-- Table for scoped (limited) admins
CREATE TABLE IF NOT EXISTS public.previdencia_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.previdencia_admins TO authenticated;
GRANT ALL ON public.previdencia_admins TO service_role;

ALTER TABLE public.previdencia_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own previdencia flag"
ON public.previdencia_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage previdencia_admins"
ON public.previdencia_admins FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper function
CREATE OR REPLACE FUNCTION public.is_previdencia_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.previdencia_admins WHERE user_id = _user_id)
$$;

-- Update existing policies to allow scoped admin as well
DROP POLICY IF EXISTS "Admins gerenciam associados" ON public.associados;
CREATE POLICY "Admins gerenciam associados" ON public.associados
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins gerenciam dependentes" ON public.dependentes;
CREATE POLICY "Admins gerenciam dependentes" ON public.dependentes
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins gerenciam informes" ON public.informes_rendimentos;
CREATE POLICY "Admins gerenciam informes" ON public.informes_rendimentos
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage peculio_solicitacoes" ON public.peculio_solicitacoes;
CREATE POLICY "Admins manage peculio_solicitacoes" ON public.peculio_solicitacoes
FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_previdencia_admin(auth.uid()));

-- Auto-grant scoped role on signup / email confirmation for the specific email
CREATE OR REPLACE FUNCTION public.grant_previdencia_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND lower(NEW.email) = 'previdencia@sbpmbahia.com.br' THEN
    INSERT INTO public.previdencia_admins (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_prev ON auth.users;
CREATE TRIGGER on_auth_user_created_prev
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_previdencia_on_signup();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_prev ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_prev
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_previdencia_on_signup();

-- If the user already exists, grant now
INSERT INTO public.previdencia_admins (user_id)
SELECT id FROM auth.users WHERE lower(email) = 'previdencia@sbpmbahia.com.br'
ON CONFLICT (user_id) DO NOTHING;
