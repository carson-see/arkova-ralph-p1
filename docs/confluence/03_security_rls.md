# Security & Row Level Security (RLS)

## Security Principles

1. **RLS Mandatory** - All tables have Row Level Security enabled and forced
2. **Least Privilege** - Public grants revoked; access only via authenticated role
3. **Role Immutability** - User roles cannot be changed after initial assignment
4. **Tenant Isolation** - Organizations isolated at database level
5. **Append-Only Audit** - Audit events cannot be modified or deleted

## RLS Configuration

All tables have:
```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <table> FORCE ROW LEVEL SECURITY;
```

`FORCE ROW LEVEL SECURITY` ensures RLS applies even to table owners.

## Access Control by Table

### profiles

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `profiles_select_own` | `auth.uid() = id` |
| UPDATE | `profiles_update_own` | `auth.uid() = id` (privileged fields protected) |
| INSERT | None | System/admin only |
| DELETE | None | Not allowed |

**Privileged Fields (protected by trigger):**
- `org_id` - Organization assignment
- `role` - User role (also immutable)
- `requires_manual_review` - Admin flag
- `manual_review_*` - Admin review fields

### organizations

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `organizations_select_own` | `id = get_user_org_id()` |
| UPDATE | `organizations_update_admin` | `id = get_user_org_id() AND is_org_admin()` |
| INSERT | None | System/admin only |
| DELETE | None | Not allowed |

**Helper Functions:**
- `get_user_org_id()` - Returns current user's org_id
- `is_org_admin()` - Returns true if user has ORG_ADMIN role

### anchors

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `anchors_select_own` | `user_id = auth.uid()` |
| SELECT | `anchors_select_org` | `org_id = get_user_org_id() AND is_org_admin()` |
| INSERT | `anchors_insert_own` | `user_id = auth.uid() AND status = 'PENDING'` |
| UPDATE | `anchors_update_own` | `user_id = auth.uid()` (protected fields) |
| DELETE | None | Soft delete only |

**Protected Fields (via trigger):**
- `user_id` - Cannot change owner
- `status` - Cannot set to SECURED directly
- `chain_*` - System managed
- `legal_hold` - Admin managed

### audit_events

| Operation | Policy | Condition |
|-----------|--------|-----------|
| SELECT | `audit_events_select_own` | `actor_id = auth.uid()` |
| INSERT | `audit_events_insert_own` | `actor_id IS NULL OR actor_id = auth.uid()` |
| UPDATE | None | Blocked by trigger |
| DELETE | None | Blocked by trigger |

## Role Immutability

Once a user's role is set (not NULL), it cannot be changed:

```sql
CREATE OR REPLACE FUNCTION check_role_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS NOT NULL AND (NEW.role IS NULL OR NEW.role != OLD.role) THEN
    RAISE EXCEPTION 'Role cannot be changed once set. Current role: %', OLD.role;
  END IF;
  IF OLD.role IS NULL AND NEW.role IS NOT NULL THEN
    NEW.role_set_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

This prevents privilege escalation and maintains audit integrity.

## Service Role

The `service_role` bypasses RLS for administrative operations:

- Used for seeding data
- Used for system operations (e.g., setting anchor to SECURED)
- **NEVER expose service role key to client**

## Grant Summary

```sql
-- Public access revoked
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;

-- Authenticated role grants (access controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON anchors TO authenticated;
GRANT SELECT, INSERT ON audit_events TO authenticated;

-- Service role (bypasses RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

## Secrets Handling

1. **Never commit secrets** - .env files gitignored
2. **Use .env.example** - Placeholder values only
3. **CI blocks secrets** - TruffleHog and Gitleaks scanning
4. **Service key isolation** - Only used server-side

## Testing RLS

RLS tests in `tests/rls/rls.test.ts` verify:

1. Users can only read own profile
2. Users can only see own/org anchors
3. Users cannot modify privileged fields
4. Audit events are immutable
5. Cross-tenant access is blocked

Run tests:
```bash
npm run test:rls
```
