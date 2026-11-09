ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete live comments" ON public.live_comments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update lives" ON public.live_streams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.protect_banned_flag() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.banned IS DISTINCT FROM OLD.banned AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.banned := OLD.banned;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_protect_banned BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_banned_flag();