-- =============================================
-- GOOGLE SIGN-IN: password opcional + googleId
-- Run this SQL in your Supabase SQL Editor
-- =============================================

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE;
