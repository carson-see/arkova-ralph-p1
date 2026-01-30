-- =============================================================================
-- Migration: 0014_fix_onboarding_function.sql
-- Description: Fix column name mismatches in update_profile_onboarding function
-- Priority: Critical bug fix (CRIT-001, CRIT-002)
-- =============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_profile_onboarding(user_role, text, text, text);

-- Recreate with correct column names
CREATE OR REPLACE FUNCTION public.update_profile_onboarding(
  p_role user_role,
  p_org_legal_name text DEFAULT NULL,
  p_org_display_name text DEFAULT NULL,
  p_org_domain text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_current_role user_role;
  v_org_id uuid;
  v_requires_review boolean := false;
  v_review_reason text;
  v_result jsonb;
BEGIN
  -- Get current user from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current role (check if already set)
  SELECT role INTO v_current_role
  FROM profiles
  WHERE id = v_user_id;

  IF v_current_role IS NOT NULL THEN
    RAISE EXCEPTION 'Role already set. Role is immutable.';
  END IF;

  -- Validate role parameter
  IF p_role NOT IN ('INDIVIDUAL', 'ORG_ADMIN') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- Handle ORG_ADMIN specific logic
  IF p_role = 'ORG_ADMIN' THEN
    -- Validate org parameters
    IF p_org_legal_name IS NULL OR p_org_legal_name = '' THEN
      RAISE EXCEPTION 'Organization legal name is required for ORG_ADMIN';
    END IF;
    
    IF p_org_display_name IS NULL OR p_org_display_name = '' THEN
      RAISE EXCEPTION 'Organization display name is required for ORG_ADMIN';
    END IF;

    -- Check for public email domain (requires manual review)
    IF p_org_domain IS NOT NULL AND p_org_domain IN (
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ) THEN
      v_requires_review := true;
      v_review_reason := 'Public email domain: ' || p_org_domain;
    END IF;

    -- Create organization
    INSERT INTO organizations (legal_name, display_name, domain, verification_status)
    VALUES (p_org_legal_name, p_org_display_name, p_org_domain, 'UNVERIFIED')
    RETURNING id INTO v_org_id;

    -- Emit audit event for org creation (using correct column names)
    INSERT INTO audit_events (actor_id, event_type, event_category, target_type, target_id, org_id)
    VALUES (v_user_id, 'ORG_CREATED', 'ORG', 'organizations', v_org_id, v_org_id);
  END IF;

  -- Update profile with role and org linkage
  -- Note: Removed onboarding_completed_at as it doesn't exist in profiles table
  UPDATE profiles
  SET 
    role = p_role,
    role_set_at = now(),
    org_id = v_org_id,
    requires_manual_review = v_requires_review,
    manual_review_reason = v_review_reason,
    updated_at = now()
  WHERE id = v_user_id;

  -- Emit audit event for role set (using correct column names)
  INSERT INTO audit_events (actor_id, event_type, event_category, target_type, target_id, org_id)
  VALUES (v_user_id, 'ROLE_SET', 'USER', 'profiles', v_user_id, v_org_id);

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'role', p_role,
    'org_id', v_org_id,
    'requires_manual_review', v_requires_review
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_onboarding(user_role, text, text, text) TO authenticated;

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- To rollback, restore the original function from 0012_onboarding_function.sql
