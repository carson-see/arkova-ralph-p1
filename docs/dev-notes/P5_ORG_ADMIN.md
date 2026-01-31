# P5: Organization Administration

## Overview

Phase 5 implements organization administration features including member management,
invitation system, and org-level data export.

## Stories

### P5-S4: Member Invite (FE/BE)

**Status:** ✅ Implemented (MVP)

**Description:** Invite members by email list with mock success for MVP.

#### Components

##### `InviteMemberModal` (`src/components/org/InviteMemberModal.tsx`)

Modal dialog for inviting members to an organization.

**Features:**
- Single email or comma-separated list input
- Live email validation feedback
- Success/error results display
- "Invite More" flow for continued invitations

**Props:**
```typescript
interface InviteMemberModalProps {
  orgId: string;                           // Organization ID for tenant isolation
  trigger?: React.ReactNode;               // Custom trigger button (optional)
  onInviteComplete?: (results) => void;    // Callback after invites sent
}
```

**Usage:**
```tsx
import { InviteMemberModal } from '@/components/org/InviteMemberModal';

// Basic usage (default trigger button)
<InviteMemberModal orgId={org.id} />

// Custom trigger
<InviteMemberModal
  orgId={org.id}
  trigger={<Button>Custom Invite Button</Button>}
  onInviteComplete={(results) => console.log(results)}
/>
```

##### `memberInvite` Service (`src/lib/memberInvite.ts`)

Backend service for member invitation logic.

**Functions:**

```typescript
// Parse email string into array (handles comma, semicolon, newline separators)
parseEmailList(input: string): string[]

// Validate single email
isValidEmail(email: string): boolean

// Validate array of emails
validateEmails(emails: string[]): { valid: string[], invalid: string[] }

// Send invitations (MVP: mock success)
inviteMembers(emails: string[], orgId?: string): Promise<InviteMembersResponse>
```

**Response Types:**
```typescript
interface InviteResult {
  email: string;
  status: 'success' | 'invalid' | 'error';
  message: string;
}

interface InviteMembersResponse {
  success: boolean;
  results: InviteResult[];
  summary: {
    total: number;
    successful: number;
    invalid: number;
    errors: number;
  };
}
```

#### Acceptance Criteria

- [x] If user exists: can be linked (mocked for MVP)
- [x] If user doesn't exist: mock success
- [x] Does not violate tenant isolation (orgId scoping)
- [x] Email validation (single and batch)
- [x] Success/error feedback in UI

#### MVP Limitations

The current implementation is **mocked for MVP**:

1. **No database persistence** - Invites are not stored
2. **No email sending** - Invitations are simulated
3. **No user lookup** - Doesn't check if user exists in system

#### Future Implementation

When implementing the full feature:

1. **Create `pending_invites` table:**
   ```sql
   CREATE TABLE pending_invites (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID NOT NULL REFERENCES organizations(id),
     email TEXT NOT NULL,
     invited_by UUID NOT NULL REFERENCES auth.users(id),
     status TEXT NOT NULL DEFAULT 'PENDING',
     token UUID DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ DEFAULT now(),
     expires_at TIMESTAMPTZ DEFAULT now() + interval '7 days',
     accepted_at TIMESTAMPTZ,
     
     CONSTRAINT unique_pending_invite UNIQUE(org_id, email)
   );
   ```

2. **RLS Policies:**
   - ORG_ADMIN can create/view invites for their org
   - Invited users can accept invites
   - Token validation for acceptance

3. **Email Integration:**
   - Send invite emails via Supabase Edge Functions
   - Include unique token for acceptance link

4. **User Linking:**
   - Check if email exists in `profiles`
   - If exists: Create pending membership request
   - If not: Send signup invite email

## Integration Points

### OrgDashboardPage

The invite button is integrated into the organization info card:

```tsx
// src/pages/org/OrgDashboardPage.tsx
<OrgInfoCard org={org} />  // Contains InviteMemberModal
```

### Tenant Isolation

All invite operations must respect tenant isolation:
- `orgId` is passed to all invite functions
- Future DB operations will filter by `org_id`
- Users can only invite to their own organization

## Testing

### Manual Testing Checklist

1. [ ] Open invite modal from org dashboard
2. [ ] Enter single valid email → shows "1 valid email"
3. [ ] Enter multiple emails (comma-separated) → shows count
4. [ ] Enter invalid email → shows validation error
5. [ ] Submit valid emails → shows success results
6. [ ] Click "Invite More" → resets form for new invites
7. [ ] Click "Done" → closes modal

### Unit Tests (Future)

```typescript
// src/lib/__tests__/memberInvite.test.ts
describe('memberInvite', () => {
  describe('parseEmailList', () => {
    it('parses comma-separated emails');
    it('handles semicolon separators');
    it('removes duplicates');
    it('normalizes to lowercase');
  });

  describe('validateEmails', () => {
    it('validates correct email format');
    it('rejects invalid emails');
  });

  describe('inviteMembers', () => {
    it('returns success for valid emails');
    it('returns invalid status for bad emails');
  });
});
```

---

### P5-S2: Revoke Anchor (BE/FE)

**Status:** ✅ Implemented

**Description:** Allow org admins to set anchor status to REVOKED.

#### Database Migration

**File:** `supabase/migrations/0016_revoke_anchor.sql`

##### RPC Function: `revoke_anchor(p_anchor_id uuid)`

Server-side function for revoking anchors with full authorization checks.

**Security:**
- Caller must be authenticated
- Caller must have ORG_ADMIN role
- Anchor must belong to caller's organization
- Anchor must be in PENDING or SECURED status

**Side effects:**
- Updates anchor status to REVOKED
- Emits ANCHOR_REVOKED audit event with details

**Usage:**
```typescript
const { data, error } = await supabase.rpc('revoke_anchor', {
  p_anchor_id: anchorId,
});

// Returns: { success: true, anchor_id, previous_status, new_status }
```

**Error cases:**
- `insufficient_privilege`: Not authenticated, not ORG_ADMIN, or anchor not in caller's org
- `no_data_found`: Anchor doesn't exist or is soft-deleted
- `invalid_parameter_value`: Anchor status cannot be revoked (already REVOKED)

##### Trigger: `validate_anchor_revoke`

Enforces status transition rules at the database level:
- Only PENDING or SECURED anchors can transition to REVOKED
- Prevents invalid status transitions even from service_role

#### Components

##### `RevokeAnchorDialog` (`src/components/anchor/RevokeAnchorDialog.tsx`)

Confirmation dialog for revoking an anchor.

**Features:**
- AlertDialog for destructive action confirmation
- Clear warning about irreversibility
- Shows anchor filename and current status
- Loading state during revocation
- Error handling with display

**Props:**
```typescript
interface RevokeAnchorDialogProps {
  open: boolean;                                    // Dialog open state
  onClose: () => void;                              // Close handler
  anchor: Pick<Anchor, 'id' | 'filename' | 'status'>; // Anchor to revoke
  onRevoked?: () => void;                           // Success callback
}
```

**Usage:**
```tsx
import { RevokeAnchorDialog } from '@/components/anchor/RevokeAnchorDialog';

const [revokeTarget, setRevokeTarget] = useState<Anchor | null>(null);

<RevokeAnchorDialog
  open={!!revokeTarget}
  onClose={() => setRevokeTarget(null)}
  anchor={revokeTarget}
  onRevoked={() => {
    refetchAnchors();
  }}
/>
```

##### `AlertDialog` UI Component (`src/components/ui/alert-dialog.tsx`)

shadcn/ui AlertDialog component built on Radix UI primitives.
Used for destructive/important confirmations.

#### Integration

##### OrgDashboardPage

Revoke button added to anchor rows in the organization records list:
- Only visible for PENDING or SECURED anchors
- Styled with red/destructive colors
- Opens RevokeAnchorDialog on click
- Refreshes list after successful revocation

#### Audit Trail

When an anchor is revoked, an audit event is created:

```sql
INSERT INTO audit_events (
  actor_id,           -- User who revoked
  event_type,         -- 'ANCHOR_REVOKED'
  event_category,     -- 'ANCHOR'
  target_type,        -- 'anchor'
  target_id,          -- UUID of revoked anchor
  org_id,             -- Organization ID
  details             -- 'Anchor "filename" revoked by org admin. Previous status: SECURED'
)
```

#### Acceptance Criteria

- [x] Only ORG_ADMIN for the org can revoke
- [x] Status transition enforced at DB level (trigger)
- [x] Audit event emitted with ANCHOR_REVOKED action
- [x] Confirmation dialog before revocation
- [x] Loading and error states in UI
- [x] List refreshes after successful revocation

#### Testing

##### Manual Testing Checklist

1. [ ] As ORG_ADMIN, navigate to org dashboard
2. [ ] See revoke button (Ban icon) on PENDING/SECURED anchors
3. [ ] No revoke button on already REVOKED anchors
4. [ ] Click revoke → confirmation dialog appears
5. [ ] Dialog shows anchor filename and warning
6. [ ] Click Cancel → dialog closes, no change
7. [ ] Click Revoke → loading state shown
8. [ ] Success → dialog closes, anchor status updates in list
9. [ ] Check audit_events table for ANCHOR_REVOKED event

##### Edge Cases

- Revoking already revoked anchor (should show error)
- Network failure during revocation (error displayed)
- Concurrent revocation attempts (DB handles)

---

## Related Stories

- P5-S1: Org settings page (display_name, domain)
- **P5-S2: Revoke anchor (this story)**
- P5-S3: CSV/JSON export for org anchors
- P5-S4: Member invite
