-- Training check-ins table for streak tracking
CREATE TABLE public.training_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_date)
);

ALTER TABLE public.training_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.training_checkins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.training_checkins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins" ON public.training_checkins
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Club history timeline
CREATE TABLE public.club_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_name text NOT NULL,
  period_start text NOT NULL,
  period_end text,
  achievements text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.club_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club history viewable by everyone" ON public.club_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage own club history" ON public.club_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own club history" ON public.club_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own club history" ON public.club_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add representation_status and wingspan to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS representation_status text DEFAULT 'livre';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wingspan_cm numeric;