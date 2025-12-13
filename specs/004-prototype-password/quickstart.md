# Quickstart: Prototype Password Protection

**Date**: 2025-12-13
**Feature Branch**: `004-prototype-password`

## What This Feature Does

Adds a simple password gate to the entire prototype. Users must enter "123mtv123" to access any page. Authentication is remembered for 30 days.

## Files to Create

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection - checks auth cookie on every request |
| `app/password/page.tsx` | Password entry page |
| `app/password/actions.ts` | Server Action for password validation |

## Implementation Steps

### 1. Create Middleware (Route Protection)

Create `middleware.ts` in the project root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('prototype_auth');

  if (!authCookie) {
    const url = new URL('/password', request.url);
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!password|_next/static|_next/image|favicon.ico|api).*)'],
};
```

### 2. Create Password Page

Create `app/password/page.tsx`:

```typescript
import { validatePassword } from './actions';

export default async function PasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo = '/', error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Aiffirmation</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter password to access the prototype
        </p>
        <form action={validatePassword}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg mb-4"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">Invalid password</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 3. Create Server Action

Create `app/password/actions.ts`:

```typescript
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const VALID_PASSWORD = '123mtv123';
const COOKIE_NAME = 'prototype_auth';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

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

  redirect(`/password?redirectTo=${encodeURIComponent(redirectTo)}&error=1`);
}
```

## Testing

1. **First Visit**: Open incognito window, navigate to any page → should redirect to `/password`
2. **Wrong Password**: Enter wrong password → should show error, stay on page
3. **Correct Password**: Enter "123mtv123" → should redirect to original page
4. **Return Visit**: Close browser, reopen → should access directly (within 30 days)
5. **All Routes**: Navigate to different pages → no password prompt after auth

## Clearing Authentication

To test the unauthenticated flow again:
- Clear browser cookies for the site
- Or use incognito/private browsing mode

## Testing Session Expiration (30-Day)

To verify the 30-day expiration works correctly:

1. **Using Browser DevTools**:
   - Open DevTools (F12) → Application tab → Cookies
   - Find the `prototype_auth` cookie
   - Note the `Expires/Max-Age` field shows ~30 days from creation
   - To simulate expiration: Delete the cookie manually, then refresh

2. **Programmatic Verification**:
   - The cookie is set with `maxAge: 2592000` (30 days in seconds)
   - Browser automatically removes expired cookies
   - After expiration, middleware redirects to `/password`

3. **Cookie Details**:
   - Name: `prototype_auth`
   - Value: Unix timestamp of authentication
   - Max-Age: 2592000 seconds (30 days)
   - HttpOnly: true (not accessible via JavaScript)
   - Secure: true in production
   - SameSite: lax
