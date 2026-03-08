CREATE TABLE public.password_reset_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text NOT NULL DEFAULT '',
  target_user_id uuid NOT NULL,
  target_user_name text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT 'reset',
  reason text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage password reset logs"
  ON public.password_reset_logs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));