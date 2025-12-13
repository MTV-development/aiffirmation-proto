# Data Model: Prototype Password Protection

**Date**: 2025-12-13
**Feature Branch**: `004-prototype-password`

## Overview

This feature uses browser cookies for state persistence. No database entities are required.

## Cookie Schema

### `prototype_auth` Cookie

| Attribute | Value | Description |
|-----------|-------|-------------|
| **Name** | `prototype_auth` | Cookie identifier |
| **Value** | Unix timestamp (string) | Time of authentication (e.g., "1702483200000") |
| **MaxAge** | 2592000 | 30 days in seconds |
| **Path** | `/` | Available on all routes |
| **HttpOnly** | `true` | Not accessible via JavaScript |
| **Secure** | `true` (production) | Only sent over HTTPS in production |
| **SameSite** | `Lax` | Sent with same-site requests and navigation |

## State Transitions

```
┌─────────────────┐     No cookie      ┌─────────────────┐
│  Unauthenticated│──────────────────▶│  Password Page  │
│   (any page)    │                    │   /password     │
└─────────────────┘                    └─────────────────┘
                                              │
                                              │ Enter correct
                                              │ password
                                              ▼
┌─────────────────┐    Cookie valid    ┌─────────────────┐
│  Authenticated  │◀──────────────────│   Set Cookie    │
│  (full access)  │                    │  (30 day TTL)   │
└─────────────────┘                    └─────────────────┘
        │
        │ Cookie expires (30 days)
        │ or user clears cookies
        ▼
┌─────────────────┐
│  Unauthenticated│
│   (redirected)  │
└─────────────────┘
```

## Validation Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Password match | `input === '123mtv123'` | Set cookie, redirect to target |
| Password mismatch | `input !== '123mtv123'` | Show error, remain on page |
| Cookie exists | `prototype_auth` cookie present | Allow request |
| Cookie missing | No `prototype_auth` cookie | Redirect to `/password` |

## Notes

- No database migrations required
- Cookie value (timestamp) is informational only - presence indicates auth
- Expiration is handled by browser via MaxAge attribute
- Cookie is automatically deleted by browser after 30 days
