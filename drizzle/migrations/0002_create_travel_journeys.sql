CREATE TABLE public.travel_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attendance_id uuid REFERENCES public.staff_attendance(id),
  project_id uuid REFERENCES public.projects(id),
  ticket_id uuid REFERENCES public.tickets(id),
  return_of_journey_id uuid REFERENCES public.travel_journeys(id),
  journey_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('planned','active','completed','interrupted','needs_review','cancelled')),
  origin_lat numeric, origin_lng numeric, origin_address text,
  dest_lat numeric, dest_lng numeric, dest_address text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  gps_distance_m numeric NOT NULL DEFAULT 0,
  road_distance_m numeric,
  odometer_start numeric, odometer_end numeric,
  distance_source text, distance_quality text,
  approved_distance_m numeric,
  reimbursement_eligible boolean NOT NULL DEFAULT true,
  business_purpose text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_travel_journeys_user_started ON public.travel_journeys (user_id, started_at DESC);
CREATE INDEX idx_travel_journeys_status ON public.travel_journeys (status);
CREATE INDEX idx_travel_journeys_project ON public.travel_journeys (project_id);
CREATE INDEX idx_travel_journeys_ticket ON public.travel_journeys (ticket_id);
-- Business rule: at most one ACTIVE journey per user (planned/return journeys included)
CREATE UNIQUE INDEX uq_one_active_journey_per_user ON public.travel_journeys (user_id) WHERE status = 'active';

ALTER TABLE public.travel_journeys ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.travel_journeys TO authenticated;
GRANT ALL ON public.travel_journeys TO service_role;

CREATE POLICY "Staff view own or authorized journeys"
ON public.travel_journeys FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordinator')
  OR public.has_role(auth.uid(), 'hr')
  OR public.is_manager_of(auth.uid(), user_id)
);

CREATE POLICY "Staff start own journeys"
ON public.travel_journeys FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff or admin update journeys"
ON public.travel_journeys FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

COMMENT ON COLUMN public.travel_journeys.approved_distance_m IS 'Mileage review: reimbursement distance accepted by admin/manager; NULL until reviewed';

-- Journey breadcrumb points reuse the existing staff_locations table
ALTER TABLE public.staff_locations ADD COLUMN IF NOT EXISTS journey_id uuid REFERENCES public.travel_journeys(id);
CREATE INDEX IF NOT EXISTS idx_staff_locations_journey ON public.staff_locations (journey_id, recorded_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_journeys;