-- =============================================================================
-- Migration: 0016_revoke_anchor.sql
-- Description: RPC function for org admins to revoke anchors
-- Priority: P5-S2
-- =============================================================================

-- =============================================================================
-- CONSTRAINT: Status transition to REVOKED
-- =============================================================================

/**
 * Add check constraint to enforce valid status transitions to REVOKED.
 * Only PENDING or SECURED anchors can be revoked.
 * 
 * Note: We use a trigger since CHECK constraints cannot reference OLD values.
 */
CREATE OR REPLACE FUNCTION validate_revoke_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate when status changes to REVOKED
  IF NEW.status = 'REVOKED' AND OLD.status != 'REVOKED' THEN
    -- Can only revoke PENDING or SECURED anchors
    IF OLD.status NOT IN ('PENDING', 'SECURED') THEN
      RAISE EXCEPTION 'Cannot revoke anchor with status %. Only PENDING or SECURED anchors can be revoked.',
        OLD.status
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_anchor_revoke
  BEFORE UPDATE ON anchors
  FOR EACH ROW
  WHEN (NEW.status = 'REVOKED')
  EXECUTE FUNCTION validate_revoke_transition();

-- =============================================================================
-- RPC FUNCTION: revoke_anchor
-- =============================================================================

/**
 * revoke_anchor
 *
 * Allows ORG_ADMIN users to revoke anchors belonging to their organization.
 *
 * Security:
 * - Caller must be authenticated
 * - Caller must have ORG_ADMIN role
 * - Anchor must belong to caller's organization
 * - Anchor must be in PENDING or SECURED status
 *
 * Side effects:
 * - Updates anchor status to REVOKED
 * - Emits ANCHOR_REVOKED audit event
 *
 * @param p_anchor_id UUID of the anchor to revoke
 * @returns JSONB with success status and revoked anchor details
 */
CREATE OR REPLACE FUNCTION public.revoke_anchor(p_anchor_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role text;
  v_user_org_id uuid;
  v_anchor_org_id uuid;
  v_anchor_status text;
  v_anchor_filename text;
  v_result jsonb;
BEGIN
  -- Get current user from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Get caller's role and org_id
  SELECT role, org_id INTO v_user_role, v_user_org_id
  FROM profiles
  WHERE id = v_user_id;

  -- Verify caller is ORG_ADMIN
  IF v_user_role != 'ORG_ADMIN' THEN
    RAISE EXCEPTION 'Only organization administrators can revoke anchors'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Get anchor details
  SELECT org_id, status, filename INTO v_anchor_org_id, v_anchor_status, v_anchor_filename
  FROM anchors
  WHERE id = p_anchor_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Anchor not found'
      USING ERRCODE = 'no_data_found';
  END IF;

  -- Verify anchor belongs to caller's organization
  IF v_anchor_org_id IS NULL OR v_anchor_org_id != v_user_org_id THEN
    RAISE EXCEPTION 'Anchor does not belong to your organization'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Verify anchor is in revocable status
  IF v_anchor_status NOT IN ('PENDING', 'SECURED') THEN
    RAISE EXCEPTION 'Cannot revoke anchor with status %. Only PENDING or SECURED anchors can be revoked.',
      v_anchor_status
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Update anchor status to REVOKED
  UPDATE anchors
  SET 
    status = 'REVOKED',
    updated_at = now()
  WHERE id = p_anchor_id;

  -- Emit audit event
  INSERT INTO audit_events (
    actor_id,
    event_type,
    event_category,
    target_type,
    target_id,
    org_id,
    details
  ) VALUES (
    v_user_id,
    'ANCHOR_REVOKED',
    'ANCHOR',
    'anchor',
    p_anchor_id,
    v_user_org_id,
    format('Anchor "%s" revoked by org admin. Previous status: %s', v_anchor_filename, v_anchor_status)
  );

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'anchor_id', p_anchor_id,
    'previous_status', v_anchor_status,
    'new_status', 'REVOKED'
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.revoke_anchor(uuid) TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.revoke_anchor(uuid) IS 
  'Allows ORG_ADMIN users to revoke anchors belonging to their organization';

-- =============================================================================
-- ROLLBACK
-- =============================================================================
-- DROP FUNCTION IF EXISTS public.revoke_anchor(uuid);
-- DROP TRIGGER IF EXISTS validate_anchor_revoke ON anchors;
-- DROP FUNCTION IF EXISTS validate_revoke_transition();
