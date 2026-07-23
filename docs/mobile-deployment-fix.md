# Mobile Deployment Fix Guide (Heyama Web)

This document explains why the deployed web app can look broken on mobile browsers (especially Safari/iOS), what was fixed, and how to prevent the issue in future deployments.

## Problem symptoms

On mobile, the deployed app may show:
- Skeleton-like gray blocks that never resolve
- Incomplete layout or broken rendering
- App appears “stuck” after opening deployment URL

## Root causes identified

### 1) Overly aggressive global caching in Vercel config
A global header in `web/vercel.json` applied this to **all routes**:

```json
"Cache-Control": "public, max-age=31536000, immutable"
```

This can cache HTML and app entry responses too aggressively, causing clients (mobile Safari included) to keep old bundles while fetching newer chunks or vice versa.

### 2) Duplicate/competing viewport handling
`web/app/layout.tsx` had both:
- Next.js `viewport` export
- Manual `<meta name="viewport" ...>` with strict scaling flags

Duplicate viewport definitions can lead to unpredictable behavior on mobile browsers.

### 3) Brittle API/socket URL derivation
Socket base URL derivation used direct string replacement (`replace('/api', '')`), which is fragile and can break in edge URL forms.

---

## Fixes implemented

## 1) Layout/mobile meta cleanup (`web/app/layout.tsx`)
- Kept Next.js `viewport` export as the single source of truth.
- Removed duplicate manual `viewport` meta tag from `<head>`.
- Removed strict scaling restrictions (`maximumScale`, `userScalable`) to improve mobile compatibility/accessibility.

## 2) Remove non-standard `Viewport` HTTP header (`web/next.config.ts`)
- Removed custom response header that attempted to set viewport at HTTP header level.
- Viewport should be controlled by HTML/meta, not response headers.

## 3) Safe caching policy (`web/vercel.json`)
- Removed global immutable caching from all routes.
- Retained security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`

## 4) API URL normalization (`web/services/api.ts`)
- Normalized API URL by trimming trailing slashes before use.
- Keeps API base URL more stable across env configurations.

## 5) Socket URL derivation hardening (`web/context/SocketContext.tsx`)
- Normalized URL and removed only terminal `/api` segment safely.
- Avoided brittle broad string replacement.

---

## Files changed

- `web/app/layout.tsx`
- `web/next.config.ts`
- `web/vercel.json`
- `web/services/api.ts`
- `web/context/SocketContext.tsx`

---

## Verification checklist

After deploy:
1. Open deployed URL on mobile Safari/Chrome.
2. Confirm object list loads (not stuck on skeleton).
3. Navigate to detail page and back.
4. Create/delete object and confirm UI updates.
5. Hard refresh mobile browser and verify app still renders correctly.
6. Confirm no stale old UI appears after new deployment.

---

## Deployment best practices (educational)

1. **Do not set immutable cache for dynamic HTML/app routes.**  
   Use long cache only for hashed static assets.

2. **Use one viewport source of truth.**  
   In Next.js App Router, prefer exported `viewport`.

3. **Normalize env URLs in code.**  
   Trim trailing slash and parse URL safely.

4. **Test on real mobile browsers after each production deploy.**  
   Especially Safari on iOS.

5. **When users report “broken mobile UI”, test cache first.**  
   Force refresh / clear website data and compare with desktop.

---

## Optional improvement for future

If desired, add route-specific cache headers:
- Dynamic routes: `Cache-Control: no-store` or low TTL
- Static hashed assets: `public, max-age=31536000, immutable`

This gives performance without stale app-shell issues.
