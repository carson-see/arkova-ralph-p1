# Architecture Overview

## Purpose

Ralph is a document anchoring system that creates cryptographic fingerprints of documents and secures them on-chain for tamper-evident timestamping. This document describes the system architecture and core components.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | lucide-react |
| Backend | Supabase (PostgreSQL + Auth) |
| Validation | Zod |

## Core Concepts

### Fingerprint-Only Storage

Ralph does NOT store document content. Only the SHA-256 fingerprint (hash) of a document is stored. This ensures:
- Privacy: Document contents never leave the user's device
- Scalability: No large blob storage required
- Compliance: No sensitive data stored server-side

### Tenant Isolation

All data access is enforced at the database level through Row Level Security (RLS). The application code does not implement access control - this is handled entirely by PostgreSQL policies.

### UTC Timestamps

All server-side timestamps are stored as `timestamptz` (timestamp with timezone) and treated as UTC. This ensures consistent, auditable timestamps across timezones.

## Directory Structure

```
ralph/
├── src/
│   ├── components/         # Application components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utilities, validators, copy
│   ├── types/             # TypeScript types
│   │   └── database.types.ts  # Generated from Supabase
│   └── ...
├── supabase/
│   ├── config.toml        # Supabase local config
│   ├── migrations/        # SQL migrations (0001_*.sql, ...)
│   └── seed.sql           # Demo/test seed data
├── tests/
│   ├── rls/               # RLS integration tests
│   └── e2e/               # End-to-end tests
├── scripts/               # Build and lint scripts
└── docs/
    └── confluence/        # Documentation (this folder)
```

## Security Model

See [03_security_rls.md](./03_security_rls.md) for detailed security documentation.

Key principles:
1. **RLS Mandatory**: All tables have Row Level Security enabled
2. **Least Privilege**: Public grants revoked; access via policies only
3. **Role Immutability**: User roles cannot be changed after initial assignment
4. **Audit Trail**: All sensitive actions logged to append-only audit_events table

## Database Schema

See [02_data_model.md](./02_data_model.md) for the complete data model.

Core tables:
- `organizations` - Tenant organizations
- `profiles` - User profiles (linked to auth.users)
- `anchors` - Document fingerprint records
- `audit_events` - Immutable audit log

## Local Development

```bash
# Start Supabase locally
supabase start

# Reset database (runs migrations + seed)
supabase db reset

# Generate TypeScript types
npm run gen:types

# Run tests
npm test
```

## Related Documentation

- [02_data_model.md](./02_data_model.md) - Database schema details
- [03_security_rls.md](./03_security_rls.md) - RLS policies and security
- [04_audit_events.md](./04_audit_events.md) - Audit logging
- [05_retention_legal_hold.md](./05_retention_legal_hold.md) - Data retention
- [06_on_chain_policy.md](./06_on_chain_policy.md) - On-chain content policy
- [07_seed_clickthrough.md](./07_seed_clickthrough.md) - Seed data guide
