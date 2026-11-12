CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows visible to signed-in" ON public.follows FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users follow as themselves" ON public.follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid() AND following_id <> auth.uid());
CREATE POLICY "Users unfollow own" ON public.follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.profile_views TO authenticated;
GRANT ALL ON public.profile_views TO service_role;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner sees own views" ON public.profile_views FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Users record own views" ON public.profile_views FOR INSERT TO authenticated WITH CHECK (viewer_id = auth.uid() AND profile_id <> auth.uid());

CREATE TABLE public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'Intermediário',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  xp integer NOT NULL DEFAULT 100,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_challenges TO authenticated;
GRANT ALL ON public.weekly_challenges TO service_role;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges visible to signed-in" ON public.weekly_challenges FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage challenges" ON public.weekly_challenges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.weekly_winner_announcements (
  week_start date PRIMARY KEY,
  athlete_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.weekly_winner_announcements TO service_role;
ALTER TABLE public.weekly_winner_announcements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'video';

CREATE OR REPLACE FUNCTION public._display_name(_id uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(NULLIF(full_name, ''), 'Alguém') FROM public.profiles WHERE id = _id
$$;
REVOKE ALL ON FUNCTION public._display_name(uuid) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public._notify(_user uuid, _type text, _title text, _body text, _url text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, body, action_url) VALUES (_user, _type, _title, _body, _url)
$$;
REVOKE ALL ON FUNCTION public._notify(uuid, text, text, text, text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.notify_on_follow() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._notify(NEW.following_id, 'follow', 'Novo seguidor', COALESCE(public._display_name(NEW.follower_id),'Alguém') || ' começou a seguir você', '/perfil/' || NEW.follower_id);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

CREATE OR REPLACE FUNCTION public.notify_on_profile_view() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.profile_views WHERE viewer_id = NEW.viewer_id AND profile_id = NEW.profile_id AND created_at > now() - interval '24 hours') = 1 THEN
    PERFORM public._notify(NEW.profile_id, 'view', 'Visualizaram seu perfil', COALESCE(public._display_name(NEW.viewer_id),'Alguém') || ' viu seu perfil', '/perfil/' || NEW.viewer_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_profile_view AFTER INSERT ON public.profile_views FOR EACH ROW EXECUTE FUNCTION public.notify_on_profile_view();

CREATE OR REPLACE FUNCTION public.notify_on_vote() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._notify(NEW.athlete_id, 'like', 'Você recebeu um voto!', COALESCE(public._display_name(NEW.voter_id),'Alguém') || ' votou em você no Voto da Galera', '/voto-galeria');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_vote AFTER INSERT ON public.community_votes FOR EACH ROW EXECUTE FUNCTION public.notify_on_vote();

CREATE OR REPLACE FUNCTION public.notify_on_conversation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _from uuid; _to uuid;
BEGIN
  IF NEW.participant_1 = auth.uid() THEN _from := NEW.participant_1; _to := NEW.participant_2;
  ELSE _from := NEW.participant_2; _to := NEW.participant_1; END IF;
  IF NOT NEW.accepted THEN
    PERFORM public._notify(_to, 'comment', 'Pedido de conversa', COALESCE(public._display_name(_from),'Alguém') || ' quer conversar com você', '/chat');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_conversation AFTER INSERT ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.notify_on_conversation();

CREATE OR REPLACE FUNCTION public.notify_on_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public._notify(NEW.receiver_id, 'comment', 'Nova mensagem', COALESCE(public._display_name(NEW.sender_id),'Alguém') || ': ' || CASE WHEN NEW.type = 'text' THEN left(NEW.content, 80) ELSE '🎤 Mensagem de voz' END, '/chat');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

CREATE OR REPLACE FUNCTION public.notify_on_post() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  SELECT f.follower_id, 'event', 'Nova publicação', COALESCE(public._display_name(NEW.user_id),'Alguém') || ' publicou ' || CASE WHEN NEW.media_type = 'image' THEN 'uma foto' ELSE 'um vídeo' END, '/perfil/' || NEW.user_id
  FROM public.follows f WHERE f.following_id = NEW.user_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_post AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.notify_on_post();

CREATE OR REPLACE FUNCTION public.notify_on_live() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  SELECT f.follower_id, 'event', '🔴 Ao vivo agora', COALESCE(public._display_name(NEW.host_id),'Alguém') || ' iniciou uma live: ' || NEW.title, '/live'
  FROM public.follows f WHERE f.following_id = NEW.host_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_live AFTER INSERT ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.notify_on_live();

CREATE OR REPLACE FUNCTION public.notify_on_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  SELECT p.id, 'recruitment', 'Nova peneira: ' || NEW.title, COALESCE(NEW.location, 'Local a definir') || COALESCE(' • ' || to_char(NEW.event_date AT TIME ZONE 'America/Sao_Paulo', 'DD/MM HH24:MI'), ''), '/recrutamento'
  FROM public.profiles p
  WHERE p.profile_type = 'atleta' AND p.banned = false AND p.id <> NEW.creator_id
    AND (p.sport IS NULL OR lower(p.sport) = lower(NEW.sport));
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_event AFTER INSERT ON public.recruitment_events FOR EACH ROW EXECUTE FUNCTION public.notify_on_event();

CREATE OR REPLACE FUNCTION public.notify_on_challenge() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, action_url)
  SELECT p.id, 'achievement', '🏆 Novo Desafio da Semana', NEW.title || ' • +' || NEW.xp || ' XP', '/evolucao'
  FROM public.profiles p WHERE p.banned = false;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_notify_challenge AFTER INSERT ON public.weekly_challenges FOR EACH ROW EXECUTE FUNCTION public.notify_on_challenge();

-- Called by the app on load: weekly winner announcement + daily recommendation
CREATE OR REPLACE FUNCTION public.run_notification_jobs() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _week date := (date_trunc('week', now())::date - 7); _winner uuid; _rec uuid;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.weekly_winner_announcements WHERE week_start = _week) THEN
    SELECT athlete_id INTO _winner FROM public.community_votes WHERE week_start = _week
      GROUP BY athlete_id ORDER BY count(*) DESC LIMIT 1;
    INSERT INTO public.weekly_winner_announcements (week_start, athlete_id) VALUES (_week, _winner) ON CONFLICT DO NOTHING;
    IF FOUND AND _winner IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, body, action_url)
      SELECT p.id, 'top5', '🥇 Vencedor do Voto da Galera', COALESCE(public._display_name(_winner),'Um atleta') || ' foi o mais votado da semana!', '/perfil/' || _winner
      FROM public.profiles p WHERE p.banned = false;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = auth.uid() AND type = 'recommendation' AND created_at > now() - interval '24 hours') THEN
    SELECT p.id INTO _rec FROM public.profiles p
    WHERE p.id <> auth.uid() AND p.banned = false
      AND NOT EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = auth.uid() AND f.following_id = p.id)
    ORDER BY (p.sport = (SELECT sport FROM public.profiles WHERE id = auth.uid())) DESC NULLS LAST, random() LIMIT 1;
    IF _rec IS NOT NULL THEN
      PERFORM public._notify(auth.uid(), 'recommendation', '✨ Recomendado para você', 'Conheça ' || COALESCE(public._display_name(_rec),'um novo talento') || ' — talvez você queira seguir', '/perfil/' || _rec);
    END IF;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.run_notification_jobs() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.run_notification_jobs() TO authenticated;