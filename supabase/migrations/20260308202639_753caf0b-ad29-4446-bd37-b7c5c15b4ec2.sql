
-- Product Catalog table
CREATE TABLE public.product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  hsn_sac_code text DEFAULT '',
  service_price numeric NOT NULL DEFAULT 0,
  warranty_months integer NOT NULL DEFAULT 12,
  spare_parts text DEFAULT '',
  description text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage product catalog" ON public.product_catalog FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view product catalog" ON public.product_catalog FOR SELECT TO authenticated USING (true);

-- Distance charge rules table
CREATE TABLE public.distance_charge_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_km numeric NOT NULL DEFAULT 0,
  max_km numeric NOT NULL DEFAULT 10,
  base_fee numeric NOT NULL DEFAULT 0,
  per_km_rate numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.distance_charge_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage distance rules" ON public.distance_charge_rules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated can view distance rules" ON public.distance_charge_rules FOR SELECT TO authenticated USING (true);

-- Insert default distance tiers
INSERT INTO public.distance_charge_rules (name, min_km, max_km, base_fee, per_km_rate) VALUES
  ('Base Zone (0-10 km)', 0, 10, 200, 0),
  ('Standard Zone (10-30 km)', 10, 30, 200, 15),
  ('Premium Zone (30+ km)', 30, 9999, 200, 25);

-- Technician skills/expertise table
CREATE TABLE public.technician_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_category text NOT NULL DEFAULT '',
  proficiency_level text NOT NULL DEFAULT 'intermediate',
  home_latitude numeric DEFAULT NULL,
  home_longitude numeric DEFAULT NULL,
  home_address text DEFAULT '',
  max_daily_jobs integer NOT NULL DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.technician_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage technician skills" ON public.technician_skills FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own skills" ON public.technician_skills FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Coordinator can view all skills" ON public.technician_skills FOR SELECT TO authenticated USING (has_role(auth.uid(), 'coordinator'::app_role));

-- Add product and location fields to tickets
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.product_catalog(id) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_latitude numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_longitude numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS customer_address text DEFAULT '',
  ADD COLUMN IF NOT EXISTS distance_km numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS distance_charge numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_charge numeric DEFAULT 0;
