
-- Fix overly permissive notification insert policy
DROP POLICY "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id IS NOT NULL);
