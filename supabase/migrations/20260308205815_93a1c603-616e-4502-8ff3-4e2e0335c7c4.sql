
-- Fix invoices policies: drop public-targeting policies and recreate for authenticated
DROP POLICY IF EXISTS "Authenticated can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admin can manage invoices" ON public.invoices;

CREATE POLICY "Admin can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (true);

-- Fix invoice_items policies
DROP POLICY IF EXISTS "Authenticated can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admin can manage invoice items" ON public.invoice_items;

CREATE POLICY "Admin can manage invoice items" ON public.invoice_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view invoice items" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (true);

-- Fix inventory_transactions policies
DROP POLICY IF EXISTS "Admin can manage all transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Authenticated can view transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Technicians can insert usage transactions" ON public.inventory_transactions;

CREATE POLICY "Admin can manage all transactions" ON public.inventory_transactions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view transactions" ON public.inventory_transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Technicians can insert usage transactions" ON public.inventory_transactions
  FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()) AND (transaction_type = ANY (ARRAY['usage'::text, 'return'::text])));

-- Fix other tables that may have public role issues
-- app_settings
DROP POLICY IF EXISTS "Admin can manage settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.app_settings;

CREATE POLICY "Admin can manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view settings" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);

-- customers
DROP POLICY IF EXISTS "Admin and coordinator can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;

CREATE POLICY "Admin and coordinator can manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Technicians can view assigned customers" ON public.customers
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
    OR id IN (SELECT customer_id FROM public.tickets WHERE assigned_to = auth.uid() AND customer_id IS NOT NULL)
  );

-- tickets
DROP POLICY IF EXISTS "Admin and coordinator can manage tickets" ON public.tickets;
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Technicians can update assigned tickets" ON public.tickets;

CREATE POLICY "Admin and coordinator can manage tickets" ON public.tickets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

CREATE POLICY "Authenticated can view tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Technicians can update assigned tickets" ON public.tickets
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid());

-- distance_charge_rules
DROP POLICY IF EXISTS "Admin can manage distance rules" ON public.distance_charge_rules;
DROP POLICY IF EXISTS "Authenticated can view distance rules" ON public.distance_charge_rules;

CREATE POLICY "Admin can manage distance rules" ON public.distance_charge_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view distance rules" ON public.distance_charge_rules
  FOR SELECT TO authenticated
  USING (true);

-- incentive_rules
DROP POLICY IF EXISTS "Admin can manage incentive rules" ON public.incentive_rules;
DROP POLICY IF EXISTS "Authenticated can view incentive rules" ON public.incentive_rules;

CREATE POLICY "Admin can manage incentive rules" ON public.incentive_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view incentive rules" ON public.incentive_rules
  FOR SELECT TO authenticated
  USING (true);

-- inventory
DROP POLICY IF EXISTS "Admin can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory;

CREATE POLICY "Admin can manage inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view inventory" ON public.inventory
  FOR SELECT TO authenticated
  USING (true);

-- product_catalog
DROP POLICY IF EXISTS "Admin can manage product catalog" ON public.product_catalog;
DROP POLICY IF EXISTS "Authenticated can view product catalog" ON public.product_catalog;

CREATE POLICY "Admin can manage product catalog" ON public.product_catalog
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view product catalog" ON public.product_catalog
  FOR SELECT TO authenticated
  USING (true);

-- Make uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'uploads';
