-- profiles: hide sensitive columns from other users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by signed-in users" ON public.profiles FOR SELECT TO authenticated
USING (banned = false OR id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (id, full_name, avatar_url, profile_type, bio, sport, position, dominant_foot, height_cm, weight_kg, wingspan_cm, professional_link, area_of_operation, anonymous_mode, created_at, updated_at, representation_status, country, state, city, latitude, longitude, banned) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.get_my_profile() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE(id uuid, full_name text, email text, profile_type public.profile_type, created_at timestamptz, banned boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.email, p.profile_type, p.created_at, p.banned FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin') ORDER BY p.created_at DESC LIMIT 100
$$;
REVOKE ALL ON FUNCTION public.admin_list_profiles() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

-- other tables: replace USING (true) with real predicates
DROP POLICY IF EXISTS "Club history viewable by everyone" ON public.club_history;
CREATE POLICY "Club history viewable by signed-in users" ON public.club_history FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Posts viewable by authenticated" ON public.posts;
CREATE POLICY "Posts viewable by signed-in users" ON public.posts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Comments viewable" ON public.live_comments;
CREATE POLICY "Comments viewable by non-banned" ON public.live_comments FOR SELECT TO authenticated
USING (NOT EXISTS (SELECT 1 FROM public.live_bans b WHERE b.stream_id = live_comments.stream_id AND b.user_id = auth.uid()));

DROP POLICY IF EXISTS "Lives viewable" ON public.live_streams;
CREATE POLICY "Lives viewable by signed-in users" ON public.live_streams FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can view votes" ON public.community_votes;
CREATE POLICY "Votes viewable by signed-in users" ON public.community_votes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);