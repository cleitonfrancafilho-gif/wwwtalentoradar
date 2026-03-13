
-- Messages table for real-time chat
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL,
  participant_2 uuid NOT NULL,
  accepted boolean NOT NULL DEFAULT false,
  pinned_by_1 boolean DEFAULT false,
  pinned_by_2 boolean DEFAULT false,
  muted_by_1 boolean DEFAULT false,
  muted_by_2 boolean DEFAULT false,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Favorites table (clubs/scouts favoriting athletes)
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, athlete_id)
);

-- Recruitment events
CREATE TABLE public.recruitment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  sport text NOT NULL,
  position text,
  min_height_cm numeric,
  max_age integer,
  location text,
  event_date timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Event applications
CREATE TABLE public.event_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.recruitment_events(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL,
  video_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, athlete_id)
);

-- Athlete evaluations (scout ratings)
CREATE TABLE public.athlete_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  dribble integer CHECK (dribble BETWEEN 1 AND 10),
  tactics integer CHECK (tactics BETWEEN 1 AND 10),
  speed integer CHECK (speed BETWEEN 1 AND 10),
  stamina integer CHECK (stamina BETWEEN 1 AND 10),
  strength integer CHECK (strength BETWEEN 1 AND 10),
  technique integer CHECK (technique BETWEEN 1 AND 10),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Community votes
CREATE TABLE public.community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid NOT NULL,
  athlete_id uuid NOT NULL,
  week_start date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(voter_id, athlete_id, week_start)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Messages: participants can read/write
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Conversations
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete favorites" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Athletes can see who favorited them" ON public.favorites FOR SELECT TO authenticated USING (athlete_id = auth.uid());

-- Recruitment events: public read, creator manages
CREATE POLICY "Anyone can view events" ON public.recruitment_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Creators can manage events" ON public.recruitment_events FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update events" ON public.recruitment_events FOR UPDATE TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete events" ON public.recruitment_events FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- Event applications
CREATE POLICY "Athletes can apply" ON public.event_applications FOR INSERT TO authenticated WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "Athletes can view own apps" ON public.event_applications FOR SELECT TO authenticated USING (athlete_id = auth.uid());
CREATE POLICY "Event creators can view apps" ON public.event_applications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.recruitment_events re WHERE re.id = event_id AND re.creator_id = auth.uid())
);
CREATE POLICY "Event creators can update apps" ON public.event_applications FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.recruitment_events re WHERE re.id = event_id AND re.creator_id = auth.uid())
);

-- Evaluations
CREATE POLICY "Evaluators can create" ON public.athlete_evaluations FOR INSERT TO authenticated WITH CHECK (evaluator_id = auth.uid());
CREATE POLICY "Evaluators can view own" ON public.athlete_evaluations FOR SELECT TO authenticated USING (evaluator_id = auth.uid() OR athlete_id = auth.uid());

-- Votes
CREATE POLICY "Users can vote" ON public.community_votes FOR INSERT TO authenticated WITH CHECK (voter_id = auth.uid());
CREATE POLICY "Anyone can view votes" ON public.community_votes FOR SELECT TO authenticated USING (true);

-- Admin policies for all new tables
CREATE POLICY "Admins manage messages" ON public.messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage conversations" ON public.conversations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage favorites" ON public.favorites FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.recruitment_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage applications" ON public.event_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage evaluations" ON public.athlete_evaluations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage votes" ON public.community_votes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Add delete policy for profiles (needed for admin account deletion)
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
