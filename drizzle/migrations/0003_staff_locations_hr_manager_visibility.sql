-- Align staff_locations visibility with staff_attendance (HR sees all, managers see their team)
DROP POLICY IF EXISTS "View locations" ON public.staff_locations;
CREATE POLICY "View locations" ON public.staff_locations
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'coordinator')
    OR public.has_role(auth.uid(), 'hr')
    OR public.is_manager_of(auth.uid(), user_id)
  );