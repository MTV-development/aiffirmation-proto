# Implementation Plan: Prototype Password Protection

**Branch**: `004-prototype-password` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-prototype-password/spec.md`

## Summary

Implement a simple password gate for the entire prototype that requires users to enter "123mtv123" before accessing any content. Authentication is persisted in browser cookies for 30 days. This is achieved using Next.js middleware for route protection and a client-side password form component.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16 (App Router)
**Primary Dependencies**: Next.js middleware, React 19, cookies-next or native cookies API
**Storage**: Browser cookies (30-day expiration) - no database storage needed
**Testing**: Manual testing (prototype-level feature)
**Target Platform**: Web browser (modern browsers supporting cookies)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Instant authentication check (<50ms middleware execution)
**Constraints**: Simple shared password, no user accounts, no server-side session storage
**Scale/Scope**: Single prototype application, all routes protected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. KV-Driven Agent Configuration** | N/A | This feature does not involve AI agents |
| **II. Modern Web Stack** | PASS | Uses Next.js App Router, React Server Components where applicable, Tailwind CSS |
| **III. Database-Backed State** | N/A | Uses browser cookies, not database state (intentional for simplicity) |
| **Development Workflow** | PASS | No new navigation sections needed |
| **Quality Gates** | PASS | Must pass lint, build, and TypeScript checks |

**Gate Result**: PASS - No violations. This is a self-contained feature that uses Next.js middleware and client-side cookies, which is the appropriate pattern for simple prototype authentication.

## Project Structure

### Documentation (this feature)

```text
specs/004-prototype-password/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - cookie structure only)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API contracts needed)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── layout.tsx           # Root layout (will wrap with auth provider)
├── password/
│   └── page.tsx         # Password entry page (new)
└── ...                  # All other routes (protected by middleware)

components/
└── password-gate.tsx    # Password form component (new)

middleware.ts            # Next.js middleware for route protection (new)
```

**Structure Decision**: This feature adds minimal new files to the existing Next.js App Router structure:
1. A new middleware.ts at the project root for route protection
2. A new password page at `/password` for the login form
3. A client component for the password form UI

## Complexity Tracking

> No violations - table not required.

## Implementation Approach

### Authentication Flow

1. **Middleware Check**: Every request hits middleware.ts which checks for a valid auth cookie
2. **Unauthenticated**: Redirect to `/password` page
3. **Password Entry**: User enters password on `/password` page
4. **Validation**: Client-side validation against hardcoded password "123mtv123"
5. **Cookie Set**: On success, set HTTP-only cookie with 30-day expiration
6. **Redirect**: Send user to originally requested page (or home)

### Cookie Strategy

- **Name**: `prototype_auth`
- **Value**: Simple timestamp or token (not sensitive since password is hardcoded)
- **Expiration**: 30 days from authentication
- **Flags**: HttpOnly, Secure (in production), SameSite=Lax

### Route Protection

- Middleware runs on all routes except:
  - `/password` (the login page itself)
  - `/_next/*` (Next.js internals)
  - `/favicon.ico` and static assets
