# Individual Vault Dashboard (Priority 3)

## Overview

Priority 3 implements the Individual user dashboard ("Vault") with visibility controls and affiliations display.

## Components

### VaultPage (`src/pages/VaultPage.tsx`)

Main dashboard page for INDIVIDUAL users. Features:
- Welcome message with user name
- "Secure Document" action button
- Records list (empty state for now)
- Sidebar with settings and stats

### VisibilityToggle (`src/components/vault/VisibilityToggle.tsx`)

Profile visibility control (placeholder).

**Note:** The `is_public` field needs to be added to the profiles table in a future migration. Currently displays as "Coming soon" with toggle disabled.

**Future Implementation:**
1. Add migration: `ALTER TABLE profiles ADD COLUMN is_public boolean DEFAULT false;`
2. Update database.types.ts
3. Implement optimistic UI toggle with database sync

### Affiliations (`src/components/vault/Affiliations.tsx`)

Placeholder for future organization affiliations feature.

Displays empty state explaining that organizations will appear here when they verify user credentials.

## Layout

### Dashboard Grid

```
┌─────────────────────────────────────────────────────────┐
│ Header: Dashboard + "Secure Document" button            │
├─────────────────────────────────────┬───────────────────┤
│                                     │                   │
│   Main Section                      │  Sidebar          │
│   - Records list                    │  - Visibility     │
│   - Empty state when no records     │  - Affiliations   │
│                                     │  - Stats          │
│                                     │                   │
└─────────────────────────────────────┴───────────────────┘
```

### Responsive Behavior

- Desktop (>1024px): Two-column grid
- Mobile (<1024px): Single column, sidebar below main

## Styles Added

New CSS additions in `src/styles/main.css`:
- Page header styles
- Dashboard grid layout
- Section cards
- Empty states
- Visibility toggle
- Affiliations section
- Stats card

## Route

| Path | Component | Guard |
|------|-----------|-------|
| `/vault` | VaultPage | ProtectedRoute (INDIVIDUAL) |

## Future Enhancements

1. **Visibility Toggle**: Implement once `is_public` field is added to schema
2. **Affiliations**: Display organizations when credential sharing is implemented
3. **Records List**: Replace empty state with actual anchor list (P4)
4. **Stats**: Display real anchor counts
5. **Search/Filter**: Add record search and filtering

## Technical Debt

- `is_public` field needs to be added to profiles table
- Visibility toggle currently disabled pending schema update

---

*Last updated: 2026-01-30 by Kai*
*Status: P3 Implementation Complete (with noted TODOs)*
