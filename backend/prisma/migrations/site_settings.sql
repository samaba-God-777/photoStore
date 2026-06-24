-- =============================================
-- SITE_SETTINGS TABLE
-- Run this SQL in your Supabase SQL Editor
-- =============================================

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings (e.g. the "about" section image)
CREATE POLICY "Public read access for site settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Writes go through the backend using the service_role key, so no
-- INSERT/UPDATE policy for anon/authenticated roles is needed.
