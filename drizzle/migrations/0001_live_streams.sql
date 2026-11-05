CREATE TABLE public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  hashtags text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'camera',
  status text NOT NULL DEFAULT 'live',
  comments_enabled boolean NOT NULL DEFAULT true,
  slow_mode_seconds integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_streams TO authenticated;
GRANT ALL ON public.live_streams TO service_role;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lives viewable" ON public.live_streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Host creates live" ON public.live_streams FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "Host updates live" ON public.live_streams FOR UPDATE TO authenticated USING (host_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Host deletes live" ON public.live_streams FOR DELETE TO authenticated USING (host_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.live_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stream_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.live_bans TO authenticated;
GRANT ALL ON public.live_bans TO service_role;
ALTER TABLE public.live_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bans visible to host and banned" ON public.live_bans FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.live_streams s WHERE s.id = stream_id AND s.host_id = auth.uid()));
CREATE POLICY "Host bans" ON public.live_bans FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.live_streams s WHERE s.id = stream_id AND s.host_id = auth.uid()));
CREATE POLICY "Host unbans" ON public.live_bans FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.live_streams s WHERE s.id = stream_id AND s.host_id = auth.uid()));

CREATE TABLE public.live_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'comment',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.live_comments TO authenticated;
GRANT ALL ON public.live_comments TO service_role;
ALTER TABLE public.live_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable" ON public.live_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users comment as themselves" ON public.live_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Host deletes comments" ON public.live_comments FOR DELETE TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.live_streams s WHERE s.id = stream_id AND s.host_id = auth.uid()));

-- Server-side enforcement of bans, comment restriction and slow mode
CREATE OR REPLACE FUNCTION public.enforce_live_comment_rules()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.live_streams%ROWTYPE; last_at timestamptz;
BEGIN
  SELECT * INTO s FROM public.live_streams WHERE id = NEW.stream_id;
  IF NOT FOUND OR s.status <> 'live' THEN RAISE EXCEPTION 'Esta live não está ativa'; END IF;
  IF NEW.user_id = s.host_id THEN RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.live_bans WHERE stream_id = NEW.stream_id AND user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'Você foi removido desta live'; END IF;
  IF NEW.kind = 'comment' THEN
    IF NOT s.comments_enabled THEN RAISE EXCEPTION 'Comentários desativados pelo criador'; END IF;
    IF s.slow_mode_seconds > 0 THEN
      SELECT max(created_at) INTO last_at FROM public.live_comments
        WHERE stream_id = NEW.stream_id AND user_id = NEW.user_id AND kind = 'comment';
      IF last_at IS NOT NULL AND now() - last_at < make_interval(secs => s.slow_mode_seconds) THEN
        RAISE EXCEPTION 'Aguarde % segundos entre comentários', s.slow_mode_seconds; END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER live_comment_rules BEFORE INSERT ON public.live_comments FOR EACH ROW EXECUTE FUNCTION public.enforce_live_comment_rules();

CREATE OR REPLACE FUNCTION public.like_live(_stream_id uuid)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.live_streams SET likes = likes + 1 WHERE id = _stream_id AND status = 'live' RETURNING likes;
$$;
REVOKE ALL ON FUNCTION public.like_live(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.like_live(uuid) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_bans;