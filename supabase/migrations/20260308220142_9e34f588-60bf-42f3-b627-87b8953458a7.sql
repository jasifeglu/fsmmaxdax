-- FIX 1: Allow admin and coordinator to read all profiles (needed for dashboards, dispatch, staff lists)
CREATE POLICY "Admin and coordinator can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'coordinator'::app_role));

-- FIX 2: Allow admin to delete notifications (cleanup)
CREATE POLICY "Admin can delete notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR user_id = auth.uid());

-- FIX 3: Allow admin to manage all audit logs (delete old logs)
CREATE POLICY "Admin can manage audit logs"
  ON public.audit_logs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));