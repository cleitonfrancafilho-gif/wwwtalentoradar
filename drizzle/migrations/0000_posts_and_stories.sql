CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_url text NOT NULL,
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  mentions text[] DEFAULT '{}',
  music text,
  filter text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX posts_created_idx ON public.posts (created_at DESC);

CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'photo',
  effect text,
  music_name text,
  music_artist text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
GRANT SELECT, INSERT, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active stories viewable" ON public.stories FOR SELECT TO authenticated USING (expires_at > now());
CREATE POLICY "Users create own stories" ON public.stories FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own stories" ON public.stories FOR DELETE TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE INDEX stories_expires_idx ON public.stories (expires_at);

CREATE EXTENSION IF NOT EXISTS pg_cron;