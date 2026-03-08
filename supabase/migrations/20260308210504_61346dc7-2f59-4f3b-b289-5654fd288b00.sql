
-- 1. TICKETS: technicians only see assigned tickets
DROP POLICY IF EXISTS "Authenticated can view tickets" ON public.tickets;

CREATE POLICY "Role-scoped ticket access" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
    OR assigned_to = auth.uid()
  );

-- 2. INVOICES: only admin/coordinator can view
DROP POLICY IF EXISTS "Authenticated can view invoices" ON public.invoices;

CREATE POLICY "Admin and coordinator can view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
  );

-- 3. INVOICE_ITEMS: only admin/coordinator can view
DROP POLICY IF EXISTS "Authenticated can view invoice items" ON public.invoice_items;

CREATE POLICY "Admin and coordinator can view invoice items" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
  );

-- 4. INVENTORY_TRANSACTIONS: only admin/coordinator can view
DROP POLICY IF EXISTS "Authenticated can view transactions" ON public.inventory_transactions;

CREATE POLICY "Admin and coordinator can view transactions" ON public.inventory_transactions
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
    OR user_id = auth.uid()
  );

-- 5. PURCHASE_REQUESTS: only admin or requester can view
DROP POLICY IF EXISTS "Authenticated can view purchase requests" ON public.purchase_requests;

CREATE POLICY "Scoped purchase request access" ON public.purchase_requests
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR requested_by = auth.uid()
  );

-- 6. INCENTIVE_RULES: admin only (technicians don't need to see reward structure)
DROP POLICY IF EXISTS "Authenticated can view incentive rules" ON public.incentive_rules;

CREATE POLICY "Admin can view incentive rules" ON public.incentive_rules
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. TECHNICIAN_INCENTIVES: already scoped (admin ALL + user own), no change needed

-- 8. INVENTORY: only admin/coordinator
DROP POLICY IF EXISTS "Authenticated can view inventory" ON public.inventory;

CREATE POLICY "Admin and coordinator can view inventory" ON public.inventory
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'coordinator'::app_role)
  );

-- 9. PRODUCT_CATALOG: keep viewable by all authenticated (needed for ticket creation)
-- No change needed

-- 10. DISTANCE_CHARGE_RULES: keep viewable (needed for billing calculations)
-- No change needed
