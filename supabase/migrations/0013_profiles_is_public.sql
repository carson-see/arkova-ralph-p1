-- =============================================================================
-- Migration: 0013_profiles_is_public.sql
-- Description: Add is_public column to profiles for vault visibility control
-- Priority: P3-S2
-- =============================================================================

-- Add is_public column to profiles
ALTER TABLE profiles
ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Add index for public profiles (for future public profile lookup)
CREATE INDEX idx_profiles_is_public ON profiles(is_public) WHERE is_public = true;

-- Update RLS policy to allow users to update their own is_public field
-- (Note: The existing RLS policies from 0008_rls_profiles.sql should already
-- allow users to update their own profile. This is just documentation.)

-- Comment
COMMENT ON COLUMN profiles.is_public IS 'Whether the user vault is publicly viewable. Default false (private).';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- DROP INDEX IF EXISTS idx_profiles_is_public;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS is_public;
