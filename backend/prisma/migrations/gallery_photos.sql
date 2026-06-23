-- =============================================
-- GALLERY_PHOTOS TABLE
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Create the gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read gallery photos (public gallery)
CREATE POLICY "Public read access for gallery photos"
  ON gallery_photos
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert gallery photos (admin only via service key)
CREATE POLICY "Authenticated insert for gallery photos"
  ON gallery_photos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update gallery photos
CREATE POLICY "Authenticated update for gallery photos"
  ON gallery_photos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete gallery photos
CREATE POLICY "Authenticated delete for gallery photos"
  ON gallery_photos
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for ordering
CREATE INDEX idx_gallery_photos_created_at ON gallery_photos (created_at DESC);

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Run this separately or create via Supabase Dashboard > Storage > New Bucket

-- Create the 'gallery' bucket (public)
-- Via Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: "gallery"
-- 4. Toggle "Public" to ON
-- 5. Click "Create bucket"

-- Storage policies (run in SQL Editor):
-- Allow public read access to gallery bucket
CREATE POLICY "Public read access for gallery storage"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');

-- Allow authenticated users to upload to gallery bucket
CREATE POLICY "Authenticated upload for gallery storage"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete from gallery bucket
CREATE POLICY "Authenticated delete for gallery storage"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
