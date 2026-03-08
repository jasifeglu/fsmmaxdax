
-- Storage bucket for uploads (selfies, receipts)
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can view uploads" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
