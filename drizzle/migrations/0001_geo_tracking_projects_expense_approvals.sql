ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reporting_manager_id uuid;

CREATE OR REPLACE FUNCTION public.is_manager_of(_manager uuid, _staff uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _staff AND reporting_manager_id = _manager)
$$;

CREATE POLICY "Managers view team profiles" ON public.profiles FOR SELECT TO authenticated
USING (reporting_manager_id = auth.uid() OR public.has_role(auth.uid(),'hr'));
CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  location text,
  latitude numeric,
  longitude numeric,
  status text NOT NULL DEFAULT 'active',
  zoho_project_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Attendance sessions
CREATE TABLE public.staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  check_in_lat numeric, check_in_lng numeric,
  check_out_lat numeric, check_out_lng numeric,
  notes text,
  zoho_synced boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.staff_attendance TO authenticated;
GRANT ALL ON public.staff_attendance TO service_role;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own attendance select" ON public.staff_attendance FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hr') OR public.has_role(auth.uid(),'coordinator') OR public.is_manager_of(auth.uid(), user_id));
CREATE POLICY "Own attendance insert" ON public.staff_attendance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own attendance update" ON public.staff_attendance FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Live location points
CREATE TABLE public.staff_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  attendance_id uuid REFERENCES public.staff_attendance(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  accuracy numeric,
  speed numeric,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staff_locations_user_time ON public.staff_locations(user_id, recorded_at DESC);
GRANT SELECT, INSERT ON public.staff_locations TO authenticated;
GRANT ALL ON public.staff_locations TO service_role;
ALTER TABLE public.staff_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View locations" ON public.staff_locations FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coordinator') OR public.is_manager_of(auth.uid(), user_id));
CREATE POLICY "Insert own location" ON public.staff_locations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_attendance;

-- Expense approvals
ALTER TABLE public.travel_expenses
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS expense_basis text NOT NULL DEFAULT 'service',
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS manager_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS manager_by uuid,
  ADD COLUMN IF NOT EXISTS manager_at timestamptz,
  ADD COLUMN IF NOT EXISTS manager_note text,
  ADD COLUMN IF NOT EXISTS hr_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS hr_by uuid,
  ADD COLUMN IF NOT EXISTS hr_at timestamptz,
  ADD COLUMN IF NOT EXISTS hr_note text,
  ADD COLUMN IF NOT EXISTS approved_amount numeric,
  ADD COLUMN IF NOT EXISTS admin_note text;

CREATE POLICY "Managers view team expenses" ON public.travel_expenses FOR SELECT TO authenticated
USING (public.is_manager_of(auth.uid(), user_id) OR public.has_role(auth.uid(),'hr'));
CREATE POLICY "Managers update team expenses" ON public.travel_expenses FOR UPDATE TO authenticated
USING (public.is_manager_of(auth.uid(), user_id) OR public.has_role(auth.uid(),'hr'));
CREATE POLICY "Users update own pending expenses" ON public.travel_expenses FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND manager_status = 'pending') WITH CHECK (user_id = auth.uid() AND manager_status = 'pending');

-- Keep approval fields honest: only the right role can change each stage
CREATE OR REPLACE FUNCTION public.guard_expense_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); is_admin boolean := public.has_role(uid,'admin');
BEGIN
  IF uid IS NULL OR is_admin THEN RETURN NEW; END IF;
  IF NEW.manager_status IS DISTINCT FROM OLD.manager_status AND NOT public.is_manager_of(uid, OLD.user_id) THEN
    RAISE EXCEPTION 'Only the reporting manager can change manager approval';
  END IF;
  IF NEW.hr_status IS DISTINCT FROM OLD.hr_status THEN
    IF NOT public.has_role(uid,'hr') THEN RAISE EXCEPTION 'Only HR can change HR approval'; END IF;
    IF OLD.manager_status <> 'approved' THEN RAISE EXCEPTION 'Manager approval required first'; END IF;
  END IF;
  IF (NEW.approved_amount IS DISTINCT FROM OLD.approved_amount OR NEW.admin_note IS DISTINCT FROM OLD.admin_note) THEN
    RAISE EXCEPTION 'Only admin can change approved amount';
  END IF;
  IF OLD.user_id <> uid AND (NEW.amount IS DISTINCT FROM OLD.amount OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Not allowed to change amount';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_expense_approval BEFORE UPDATE ON public.travel_expenses
FOR EACH ROW EXECUTE FUNCTION public.guard_expense_approval();

CREATE OR REPLACE FUNCTION public.sync_expense_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.manager_status = 'rejected' OR NEW.hr_status = 'rejected' THEN NEW.status := 'rejected';
  ELSIF NEW.manager_status = 'approved' AND NEW.hr_status = 'approved' THEN NEW.status := 'approved';
  ELSE NEW.status := 'pending'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_sync_expense_status BEFORE INSERT OR UPDATE ON public.travel_expenses
FOR EACH ROW EXECUTE FUNCTION public.sync_expense_status();