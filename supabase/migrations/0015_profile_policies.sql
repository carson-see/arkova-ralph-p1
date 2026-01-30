-- =============================================================================
-- Migration: 0015_profile_policies.sql
-- Description: Add missing RLS policies for profiles
-- Priority: Critical bug fixes (CRIT-003, CRIT-004)
-- =============================================================================

-- =============================================================================
-- CRIT-003: Allow authenticated users to INSERT their own profile
-- =============================================================================
-- This is needed for new user signup flow when auth trigger doesn't exist
-- Users can only create a profile with their own auth.uid()

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY profiles_insert_own ON profiles IS 
  'Users can create their own profile during signup (CRIT-003 fix)';

-- =============================================================================
-- CRIT-004: Allow reading public profiles
-- =============================================================================
-- Enables the public vault verification feature (P4)
-- Users can see their own profile OR any public profile

-- First, drop the existing select policy to replace it
DROP POLICY IF EXISTS profiles_select_own ON profiles;

-- Create new policy that allows viewing own profile OR public profiles
CREATE POLICY profiles_select_own_or_public ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR is_public = true
  );

COMMENT ON POLICY profiles_select_own_or_public ON profiles IS 
  'Users can read their own profile or any public profile (CRIT-004 fix)';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- DROP POLICY IF EXISTS profiles_insert_own ON profiles;
-- DROP POLICY IF EXISTS profiles_select_own_or_public ON profiles;
-- CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
