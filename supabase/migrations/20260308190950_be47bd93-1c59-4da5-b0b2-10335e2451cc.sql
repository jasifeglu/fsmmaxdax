
-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and coordinator can manage customers" ON public.customers FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator')
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  issue TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_name TEXT DEFAULT '',
  sla_hours INT DEFAULT 24,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tickets" ON public.tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin and coordinator can manage tickets" ON public.tickets FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator')
);
CREATE POLICY "Technicians can update assigned tickets" ON public.tickets FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid()
);

-- Inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'General',
  warehouse_stock INT NOT NULL DEFAULT 0,
  van_stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 5,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OK',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage inventory" ON public.inventory FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- Travel Expenses table
CREATE TABLE public.travel_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  expense_type TEXT NOT NULL DEFAULT 'fuel',
  description TEXT DEFAULT '',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  distance_km DECIMAL(10,2) DEFAULT 0,
  receipt_url TEXT DEFAULT '',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.travel_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses" ON public.travel_expenses FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own expenses" ON public.travel_expenses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can view all expenses" ON public.travel_expenses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can manage all expenses" ON public.travel_expenses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Selfie Check-ins table
CREATE TABLE public.selfie_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  checkin_type TEXT NOT NULL DEFAULT 'check_in',
  selfie_url TEXT DEFAULT '',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.selfie_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON public.selfie_checkins FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own checkins" ON public.selfie_checkins FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin can view all checkins" ON public.selfie_checkins FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin and coordinator can view all checkins" ON public.selfie_checkins FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'coordinator'));

-- App Settings table (admin toggles)
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
