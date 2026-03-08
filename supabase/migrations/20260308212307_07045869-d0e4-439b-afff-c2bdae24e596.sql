
-- Fix 1: Storage policies - scope to user's own folder
DROP POLICY IF EXISTS "Authenticated users can view uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

CREATE POLICY "Users can view own uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin can view all uploads"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'uploads' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'coordinator')));

CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Fix 2: Restrict app_settings SELECT to admin only
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.app_settings;
CREATE POLICY "Admin can view settings"
  ON public.app_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Fix purchase_requests policies to target authenticated role only
DROP POLICY IF EXISTS "Admin can manage purchase requests" ON public.purchase_requests;
DROP POLICY IF EXISTS "Users can create purchase requests" ON public.purchase_requests;

CREATE POLICY "Admin can manage purchase requests"
  ON public.purchase_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create purchase requests"
  ON public.purchase_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());
