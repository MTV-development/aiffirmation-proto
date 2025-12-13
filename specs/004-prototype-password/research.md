# Research: Prototype Password Protection

**Date**: 2025-12-13
**Feature Branch**: `004-prototype-password`

## Research Questions

### 1. Next.js Middleware for Route Protection

**Decision**: Use Next.js middleware.ts at the project root

**Rationale**:
- Next.js middleware runs before every request, making it ideal for authentication gates
- Middleware can check cookies and redirect unauthenticated users
- Executes at the edge, minimal latency impact
- Built into Next.js - no additional dependencies required

**Alternatives Considered**:
- **Higher-Order Component (HOC) wrapper**: Rejected - would need to wrap every page, more code changes
- **Server-side session validation in each page**: Rejected - repetitive, easy to miss pages
- **Client-side protection only**: Rejected - content would briefly flash before redirect

**Implementation Pattern**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('prototype_auth');

  if (!authCookie) {
    return NextResponse.redirect(new URL('/password', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!password|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Cookie-Based Authentication Persistence

**Decision**: Use HTTP cookies with 30-day expiration

**Rationale**:
- Cookies automatically sent with every request (works with middleware)
- Can be set as HttpOnly to prevent XSS access
- Built-in expiration support
- No external dependencies needed

**Alternatives Considered**:
- **localStorage**: Rejected - not accessible in middleware (server-side)
- **sessionStorage**: Rejected - cleared when browser closes (doesn't meet 30-day requirement)
- **Database session**: Rejected - overcomplicated for a simple prototype password

**Cookie Configuration**:
- Name: `prototype_auth`
- Value: Timestamp of authentication (for expiration validation)
- MaxAge: 30 days (2,592,000 seconds)
- Path: `/`
- HttpOnly: true (security best practice)
- SameSite: `Lax` (allows navigation from external links)
- Secure: true in production, false in development

### 3. Password Validation Approach

**Decision**: Server Action for password validation and cookie setting

**Rationale**:
- Server Actions can set HttpOnly cookies (client-side JavaScript cannot)
- Keeps password comparison on server (not visible in browser dev tools)
- Simple async function, no API route needed
- Works seamlessly with React 19 and Next.js App Router

**Alternatives Considered**:
- **API Route**: Rejected - more boilerplate, Server Action is simpler
- **Client-side validation only**: Rejected - password would be visible in source/network
- **Environment variable for password**: Rejected - adds complexity for a simple prototype

**Implementation Pattern**:
```typescript
// app/password/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_PASSWORD = '123mtv123';
const COOKIE_NAME = 'prototype_auth';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export async function validatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/';

  if (password === VALID_PASSWORD) {
    (await cookies()).set(COOKIE_NAME, Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    redirect(redirectTo);
  }

  return { error: 'Invalid password' };
}
```

### 4. Redirect URL Preservation

**Decision**: Pass original URL as query parameter to password page

**Rationale**:
- User lands on `/dashboard` → redirected to `/password?redirectTo=/dashboard`
- After successful login, redirect back to `/dashboard`
- Simple, stateless approach
- Standard pattern used by authentication systems

**Implementation**:
- Middleware captures original URL and adds as `?redirectTo=` parameter
- Password form includes hidden field with redirectTo value
- Server Action reads redirectTo and redirects after successful auth

### 5. Password Page UI Design

**Decision**: Minimal, centered form matching existing Tailwind styling

**Rationale**:
- Consistent with existing app design (Tailwind CSS)
- Simple form: password input + submit button + error message
- No need for complex UI - this is a gate, not a feature
- Should be clear this is intentional protection, not a broken page

**UI Components**:
- Centered card/container
- App title/logo (optional)
- Password input field (type="password")
- Submit button
- Error message area (shown on invalid password)
- Brief instruction text

## Summary of Technical Decisions

| Component | Decision | Dependency |
|-----------|----------|------------|
| Route Protection | Next.js Middleware | Built-in |
| Auth Persistence | HTTP Cookies (30 days) | Built-in |
| Password Validation | Server Action | Built-in |
| Redirect Handling | Query Parameter | Built-in |
| UI Framework | Tailwind CSS | Already installed |

**Total New Dependencies**: 0 (all features use Next.js/React built-ins)
