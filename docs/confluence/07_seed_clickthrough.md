# Seed Data & Click-Through Guide

## Overview

Ralph includes seed data for local development and testing. This guide explains the demo data and how to use it for click-through testing.

## Quick Start

```bash
# Start Supabase locally
supabase start

# Reset database (applies migrations + seed)
supabase db reset

# Verify seed data
supabase db execute --file scripts/verify-seed.sql
```

## Demo Users

| Email | Password | Role | Organization |
|-------|----------|------|--------------|
| `admin_demo@arkova.local` | `demo_password_123` | ORG_ADMIN | Arkova |
| `user_demo@arkova.local` | `demo_password_123` | INDIVIDUAL | None |
| `beta_admin@betacorp.local` | `demo_password_123` | ORG_ADMIN | Beta Corp |

## Demo Organizations

| ID | Name | Domain | Status |
|----|------|--------|--------|
| `11111111-...` | Arkova Technologies Inc. | arkova.local | VERIFIED |
| `22222222-...` | Beta Corp LLC | betacorp.local | UNVERIFIED |

## Demo Anchors

### Admin Demo (Arkova)

| Filename | Status | Legal Hold |
|----------|--------|------------|
| contract_2024.pdf | SECURED | No |
| invoice_jan.pdf | PENDING | No |
| old_agreement.pdf | REVOKED | No |
| legal_hold_document.pdf | SECURED | **Yes** |

### User Demo (Individual)

| Filename | Status | Legal Hold |
|----------|--------|------------|
| personal_doc.pdf | SECURED | No |
| photo_proof.png | PENDING | No |

### Beta Admin (Beta Corp)

| Filename | Status |
|----------|--------|
| beta_contract.pdf | PENDING |

## Click-Through Scenarios

### Scenario 1: Individual User Flow

1. Sign in as `user_demo@arkova.local`
2. View anchor list → Should see only personal_doc.pdf and photo_proof.png
3. Attempt to view Arkova anchors → Should be blocked (RLS)
4. Create new anchor → Should work with PENDING status
5. Attempt to create SECURED anchor → Should fail

### Scenario 2: Organization Admin Flow

1. Sign in as `admin_demo@arkova.local`
2. View anchor list → Should see all 4 Arkova anchors
3. View organization details → Should see Arkova info
4. Attempt to view Beta Corp anchors → Should be blocked (RLS)
5. Update organization display name → Should work

### Scenario 3: Cross-Tenant Isolation

1. Sign in as `admin_demo@arkova.local`
2. Query organizations → Should only see Arkova
3. Sign out, sign in as `beta_admin@betacorp.local`
4. Query organizations → Should only see Beta Corp
5. Verify no cross-tenant data leakage

### Scenario 4: Legal Hold

1. Using service_role, query `legal_hold_document.pdf` anchor
2. Attempt soft delete → Should fail (legal_hold constraint)
3. Remove legal hold (service_role)
4. Attempt soft delete → Should succeed

### Scenario 5: Role Immutability

1. Sign in as `user_demo@arkova.local`
2. Attempt to change role to ORG_ADMIN → Should fail
3. Using service_role, attempt to change role → Should fail (trigger)

### Scenario 6: Audit Event Isolation

1. Sign in as `user_demo@arkova.local`
2. Query audit_events → Should only see own events
3. Cannot see admin_demo's events

## Verification Queries

Run these queries to verify seed data:

```sql
-- Organizations
SELECT id, display_name, verification_status FROM organizations;

-- Profiles
SELECT id, email, role, org_id FROM profiles;

-- Anchors summary
SELECT
  p.email,
  a.filename,
  a.status,
  a.legal_hold,
  o.display_name as org
FROM anchors a
JOIN profiles p ON a.user_id = p.id
LEFT JOIN organizations o ON a.org_id = o.id
ORDER BY p.email, a.filename;

-- Audit events
SELECT event_type, actor_email, target_type, created_at
FROM audit_events
ORDER BY created_at;
```

## Reset Procedure

To reset the database to a clean state:

```bash
# Full reset (drops and recreates)
supabase db reset

# This will:
# 1. Drop all tables
# 2. Run all migrations in order
# 3. Run seed.sql
```

## Extending Seed Data

To add more seed data:

1. Edit `supabase/seed.sql`
2. Follow existing patterns
3. Use consistent UUIDs (for reproducibility)
4. Run `supabase db reset` to apply

## Troubleshooting

### Auth Issues

If demo users can't authenticate:

```bash
# Check auth.users table
supabase db execute -c "SELECT id, email FROM auth.users;"

# Verify password hash (should be bcrypt)
supabase db execute -c "SELECT encrypted_password FROM auth.users LIMIT 1;"
```

### Missing Seed Data

```bash
# Check if seed ran
supabase db execute -c "SELECT COUNT(*) FROM organizations;"

# If 0, seed may have failed - check logs
supabase db reset --debug
```

### RLS Blocking Queries

```bash
# Use service_role to bypass RLS for debugging
export PGPASSWORD=postgres
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT * FROM anchors;"
```
