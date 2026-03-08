
-- 1. Devices / Assets table
CREATE TABLE IF NOT EXISTS public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  device_name text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  serial_number text DEFAULT '',
  eid text DEFAULT '',
  installation_date date,
  warranty_status text NOT NULL DEFAULT 'Unknown',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_devices_serial ON public.devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_eid ON public.devices(eid);
CREATE INDEX IF NOT EXISTS idx_devices_customer ON public.devices(customer_id);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- 2. Vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  service_categories text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and coordinator can manage vendors" ON public.vendors FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Technicians can view vendors" ON public.vendors FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'technician'));

-- 3. Add columns to tickets
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vendor_ticket_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vendor_srn text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vendor_registration_date date,
  ADD COLUMN IF NOT EXISTS pickup_date date,
  ADD COLUMN IF NOT EXISTS sent_to_vendor_date date,
  ADD COLUMN IF NOT EXISTS vendor_expected_completion date,
  ADD COLUMN IF NOT EXISTS vendor_completion_date date,
  ADD COLUMN IF NOT EXISTS product_returned_date date,
  ADD COLUMN IF NOT EXISTS vendor_service_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vendor_invoice_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_invoice_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_margin_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS additional_service_charge numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_customer_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delay_reason text DEFAULT '',
  ADD COLUMN IF NOT EXISTS delay_category text DEFAULT '',
  ADD COLUMN IF NOT EXISTS complaint_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_explanation text DEFAULT '',
  ADD COLUMN IF NOT EXISTS technician_observations text DEFAULT '';

-- 4. Now create devices RLS (after device_id exists on tickets)
CREATE POLICY "Admin and coordinator can manage devices" ON public.devices FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Technicians can view assigned devices" ON public.devices FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator') OR
    id IN (SELECT t.device_id FROM public.tickets t WHERE t.assigned_to = auth.uid() AND t.device_id IS NOT NULL));

-- 5. Ticket technicians
CREATE TABLE IF NOT EXISTS public.ticket_technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'Lead',
  assignment_type text NOT NULL DEFAULT 'sequential',
  checkin_time timestamptz,
  checkout_time timestamptz,
  work_performed text DEFAULT '',
  notes text DEFAULT '',
  photos text[] DEFAULT '{}',
  customer_signature_url text DEFAULT '',
  sequence_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and coordinator can manage ticket technicians" ON public.ticket_technicians FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Technicians can view own assignments" ON public.ticket_technicians FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Technicians can update own assignments" ON public.ticket_technicians FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 6. Ticket timeline
CREATE TABLE IF NOT EXISTS public.ticket_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT 'note',
  description text NOT NULL DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and coordinator can manage timeline" ON public.ticket_timeline FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator'));

CREATE POLICY "Technicians can view timeline for assigned tickets" ON public.ticket_timeline FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'coordinator') OR
    ticket_id IN (SELECT t.id FROM public.tickets t WHERE t.assigned_to = auth.uid()));

CREATE POLICY "Technicians can add timeline entries" ON public.ticket_timeline FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
