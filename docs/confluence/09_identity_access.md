# Identity & Access (Priority 2)

## Overview

Priority 2 implements the authentication and authorization layer for Ralph. This includes user sign-in/sign-up, session management, role selection, and organization onboarding.

## Architecture

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /auth     │────▶│  Sign In/Up │────▶│  Supabase   │
│   (public)  │     │   Form      │     │    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│   Route     │◀────│   Profile   │
│   (vault/   │     │   Guards    │     │   Check     │
│    org)     │     └─────────────┘     └─────────────┘
└─────────────┘
```

### Route Guards

| Path | Guard | Redirects To |
|------|-------|--------------|
| `/auth` | PublicRoute | Dashboard if authenticated |
| `/onboarding/role` | ProtectedRoute | Auth if not signed in |
| `/onboarding/org` | ProtectedRoute (ORG_ADMIN) | Vault if INDIVIDUAL |
| `/vault` | ProtectedRoute (INDIVIDUAL) | Org if ORG_ADMIN |
| `/org` | ProtectedRoute (ORG_ADMIN) | Vault if INDIVIDUAL |
| `/org/pending-review` | None | Shown when requires_manual_review=true |

### Session Management

Sessions are managed by Supabase Auth with:
- Local storage persistence
- Auto token refresh
- OAuth callback handling

The `useAuth` hook provides:
```typescript
const { 
  user,           // Current user or null
  session,        // Current session or null
  loading,        // Auth state loading
  signIn,         // Email/password sign-in
  signUp,         // Email/password sign-up
  signOut,        // Sign out
  signInWithGoogle // OAuth sign-in
} = useAuth();
```

## Components

### AuthForm (`src/components/auth/AuthForm.tsx`)

Handles sign-in and sign-up with:
- Email/password authentication
- Google OAuth
- Zod validation
- Non-enumerating error messages

### RoleSelection (`src/components/auth/RoleSelection.tsx`)

One-time role selection during onboarding:
- INDIVIDUAL: Personal account
- ORG_ADMIN: Organization administrator

Role is immutable once set (enforced by database trigger).

### OrgOnboarding (`src/components/auth/OrgOnboarding.tsx`)

KYB-lite form for ORG_ADMIN users:
- Legal name (required)
- Display name (required)
- Domain (optional, with public domain warning)

### ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)

Route guard component that:
- Checks authentication state
- Verifies role requirements
- Redirects based on profile state

### DashboardLayout (`src/components/layout/DashboardLayout.tsx`)

Main layout wrapper with:
- Sidebar navigation
- Header with user info
- Sign-out functionality

## Hooks

### useAuth (`src/hooks/useAuth.ts`)

Authentication state and methods:
- Subscribes to auth state changes
- Provides sign-in/sign-up/sign-out methods
- Handles OAuth flows

### useProfile (`src/hooks/useProfile.ts`)

Profile data management:
- Fetches profile on auth change
- Provides profile update method
- Handles loading/error states

## Routing

Uses hash-based routing for simplicity:
- No server configuration required
- Works with static hosting
- Routes defined in `src/main.tsx`

### Route Map

| Hash | Component | Description |
|------|-----------|-------------|
| `#/` or `#/auth` | AuthPage | Sign-in/sign-up |
| `#/onboarding/role` | RoleSelectionPage | Role selection |
| `#/onboarding/org` | OrgOnboardingPage | Org setup |
| `#/org/pending-review` | PendingReviewPage | Pending review |
| `#/vault` | VaultPage | Individual dashboard |
| `#/org` | OrgDashboardPage | Org dashboard |

## Styles

Core styles in `src/styles/main.css`:
- CSS custom properties for theming
- Component-specific styles
- Responsive layout

## Security Considerations

1. **Non-enumerating errors**: Auth errors don't reveal if email exists
2. **Role immutability**: Enforced at database level
3. **RLS enforcement**: All data access through RLS policies
4. **Session handling**: Secure token storage and refresh

## Testing

### Manual Testing Checklist

- [ ] Sign up with email creates account
- [ ] Sign in with valid credentials works
- [ ] Invalid credentials show generic error
- [ ] Google OAuth initiates correctly
- [ ] Unauthenticated user redirects to /auth
- [ ] Authenticated user without role goes to /onboarding/role
- [ ] Role selection sets role correctly
- [ ] ORG_ADMIN goes to /onboarding/org after role selection
- [ ] INDIVIDUAL goes to /vault after role selection
- [ ] Org creation works with valid data
- [ ] Public domain shows warning
- [ ] Pending review page shows when flagged
- [ ] Sign out clears session

### Automated Tests

RLS tests will be implemented to verify:
- Users can only read their own profile
- Users cannot update privileged fields
- Org admins can only see their organization

## Future Enhancements

- Password reset flow
- Email verification reminder
- Multi-factor authentication
- Session management UI (view/revoke sessions)
- Organization member invitation

---

*Last updated: 2026-01-30 by Kai*
*Status: P2 Implementation Complete*
