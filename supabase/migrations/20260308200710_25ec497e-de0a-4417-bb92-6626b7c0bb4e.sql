
-- Invoices table for GST-compliant billing
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_address text DEFAULT '',
  customer_phone text DEFAULT '',
  customer_gstin text DEFAULT '',
  place_of_supply text NOT NULL DEFAULT '',
  is_interstate boolean NOT NULL DEFAULT false,
  subtotal numeric NOT NULL DEFAULT 0,
  cgst_total numeric NOT NULL DEFAULT 0,
  sgst_total numeric NOT NULL DEFAULT 0,
  igst_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  amount_in_words text DEFAULT '',
  payment_mode text NOT NULL DEFAULT 'Cash',
  payment_status text NOT NULL DEFAULT 'Pending',
  transaction_reference text DEFAULT '',
  notes text DEFAULT '',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL DEFAULT '',
  hsn_sac_code text DEFAULT '',
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  taxable_value numeric NOT NULL DEFAULT 0,
  cgst_rate numeric NOT NULL DEFAULT 0,
  sgst_rate numeric NOT NULL DEFAULT 0,
  igst_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  inventory_id uuid REFERENCES public.inventory(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage invoices" ON public.invoices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view invoices" ON public.invoices
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage invoice items" ON public.invoice_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view invoice items" ON public.invoice_items
  FOR SELECT USING (true);
