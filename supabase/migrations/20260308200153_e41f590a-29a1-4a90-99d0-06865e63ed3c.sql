
-- Inventory transactions: tracks all stock movements (issuance, usage, return, adjustment)
CREATE TABLE public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL DEFAULT 'issuance', -- issuance, usage, return, adjustment, damaged
  quantity integer NOT NULL DEFAULT 0,
  from_location text NOT NULL DEFAULT 'warehouse', -- warehouse, van
  to_location text NOT NULL DEFAULT 'van', -- van, warehouse, customer
  user_id uuid NOT NULL, -- technician involved
  performed_by uuid NOT NULL, -- admin/manager who performed
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Purchase requests for low stock
CREATE TABLE public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
  requested_quantity integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT 'low_stock',
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected, ordered
  requested_by uuid NOT NULL,
  approved_by uuid,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Inventory transactions policies
CREATE POLICY "Admin can manage all transactions" ON public.inventory_transactions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view transactions" ON public.inventory_transactions
  FOR SELECT USING (true);

CREATE POLICY "Technicians can insert usage transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid() AND transaction_type IN ('usage', 'return'));

-- Purchase requests policies
CREATE POLICY "Admin can manage purchase requests" ON public.purchase_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view purchase requests" ON public.purchase_requests
  FOR SELECT USING (true);

CREATE POLICY "Users can create purchase requests" ON public.purchase_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());
