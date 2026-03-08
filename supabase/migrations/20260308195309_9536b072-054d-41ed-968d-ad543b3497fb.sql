
-- Incentive rules configured by admin
CREATE TABLE public.incentive_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'performance_bonus',
  description text DEFAULT '',
  metric text NOT NULL DEFAULT 'completed_tickets',
  target_value numeric NOT NULL DEFAULT 0,
  reward_value numeric NOT NULL DEFAULT 0,
  reward_unit text NOT NULL DEFAULT 'fixed',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Monthly technician incentive records
CREATE TABLE public.technician_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month text NOT NULL,
  completed_tickets integer NOT NULL DEFAULT 0,
  first_fix_rate numeric NOT NULL DEFAULT 0,
  avg_rating numeric NOT NULL DEFAULT 0,
  avg_completion_hours numeric NOT NULL DEFAULT 0,
  revenue_generated numeric NOT NULL DEFAULT 0,
  on_time_rate numeric NOT NULL DEFAULT 0,
  performance_score numeric NOT NULL DEFAULT 0,
  performance_bonus numeric NOT NULL DEFAULT 0,
  revenue_commission numeric NOT NULL DEFAULT 0,
  quality_bonus numeric NOT NULL DEFAULT 0,
  speed_bonus numeric NOT NULL DEFAULT 0,
  attendance_bonus numeric NOT NULL DEFAULT 0,
  total_incentive numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);

-- RLS
ALTER TABLE public.incentive_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_incentives ENABLE ROW LEVEL SECURITY;

-- Incentive rules: admin manages, all authenticated can view
CREATE POLICY "Admin can manage incentive rules" ON public.incentive_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view incentive rules" ON public.incentive_rules FOR SELECT TO authenticated USING (true);

-- Technician incentives: admin manages all, techs view own
CREATE POLICY "Admin can manage all incentives" ON public.technician_incentives FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own incentives" ON public.technician_incentives FOR SELECT TO authenticated USING (user_id = auth.uid());
