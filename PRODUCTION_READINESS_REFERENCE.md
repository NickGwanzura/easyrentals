# Production Readiness Reference

## Status

The codebase now has a clean release pipeline for the active Next.js app: `type-check`, `lint`, `build`, and `npm audit --omit=dev` all pass. It is much closer to production-ready, but the new Supabase hardening migration still needs to be applied and verified in each real environment before final signoff.

## What Was Fixed In This Pass

### Authentication and Access

- Demo logins are now gated by `NEXT_PUBLIC_DEMO_MODE`.
- The normal login flow no longer accepts hardcoded demo credentials unless demo mode is explicitly enabled.
- The demo CTA is hidden on the login page when demo mode is disabled.
- The admin company management page now requires an authenticated admin session at the UI layer.

### Company Creation Safety

- Company creation now requires a signed-in, non-demo user.
- The company creation flow assigns the current authenticated user as `owner_id`.
- Unauthenticated visitors to `/signup/company` are redirected into an account-first flow instead of creating companies anonymously.
- Company signup now uses the signed-in account as the real company owner/admin instead of collecting an unused password field.
- Company service admin operations now require an authenticated admin role at the app layer:
  - `getAllCompanies`
  - `updateCompany`
  - `deleteCompany`

### Tenant Security and Account Consistency

- Added a shared tenant resolver so middleware and server-side branding resolve companies from the same hostname logic.
- Middleware now forwards resolved company context on the request, not only the response, so server components can actually read it.
- Server-side company resolution now falls back to hostname lookup if request headers are missing or stale.
- Added a shared account-record helper so the active auth flow reads from `profiles` first, falls back to legacy `users`, and keeps company context in sync.
- Company switching now validates active membership before updating the user’s current company.
- Added a new Supabase migration, [supabase/migrations/20260314000100_tenant_security_hardening.sql](/Users/itai/Desktop/SYS/easyrentals-master/supabase/migrations/20260314000100_tenant_security_hardening.sql), which:
  - adds `primary_company_id` and `current_company_id` to `profiles`
  - adds missing `owner_id`, `invited_by`, and `invited_at` tenant-management columns
  - replaces `get_current_company_id()` with an auth-driven resolver
  - enables RLS on `companies` and `company_users`
  - adds membership/admin policies for tenant management

### Dependency Hardening

- Upgraded `next` and `eslint-config-next` to `15.5.12`.
- Removed the `node-vibrant` dependency by replacing logo color extraction with an in-app browser canvas implementation.
- `npm audit --omit=dev` now reports `0 vulnerabilities`.

### Build and Deployment Discipline

- `next.config.js` was updated to stop ignoring TypeScript build errors.
- `next.config.js` now enforces ESLint during build again.
- GitHub Actions no longer swallows `npm run type-check`.
- `vercel.json` no longer rewrites `/` to `/login`, so production routing matches the current landing page.
- Added `.eslintrc.json` so `npm run lint` runs non-interactively.

### TypeScript Parsing Fixes

- JSX-bearing files were renamed to `.tsx`:
  - `lib/billing/useFeatureGate.tsx`
  - `lib/whitelabel/branding-server.tsx`

### Compile and Lint Cleanup

- Cleared the remaining active TypeScript failures across leads, lease reviews, branding, finance, estate mock data, and shared badge logic.
- Fixed hard lint errors caused by unescaped entities and invalid page navigation markup.
- Converted active app-shell images and inspection/settings image surfaces to `next/image`.
- Stabilized hook dependencies in shared auth and company-switching code.
- Added a focused `.eslintignore` for legacy billboard-era components that are only referenced by `App.tsx.bak`, so lint reflects the live Next.js app instead of backup code.
- Restored a truthful release path where `type-check`, `lint`, and `build` all run without being bypassed.

## Verification Snapshot

### Commands Run

- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`

### Current Results

- `npm run lint` now executes correctly instead of opening the Next.js setup prompt.
- `npm run type-check` passes.
- `npm run lint` passes with no warnings or errors.
- `npm run build` passes with lint enforcement turned back on.
- `npm audit --omit=dev` reports `0 vulnerabilities`.

## Remaining Blocking Risks

- The new Supabase migration still needs to be applied in every deployed database before the code-side tenant hardening becomes authoritative.
- Middleware and tenant-context propagation still need a real deployed-environment validation pass, especially on custom domains and subdomains.
- The repository still carries a legacy `users` model alongside the active `profiles` model; the live app now prefers `profiles`, but the legacy table should eventually be retired or formally migrated.
- Privileged company mutations are still happening from the client and would be safer behind server-side handlers or RPCs even with RLS in place.

## Recommended Next Batch

1. Apply [supabase/migrations/20260314000100_tenant_security_hardening.sql](/Users/itai/Desktop/SYS/easyrentals-master/supabase/migrations/20260314000100_tenant_security_hardening.sql) to staging and production, then verify the new RLS policies with real tenant accounts.
2. Move company creation, membership updates, and company deletion behind server-side handlers or Supabase RPCs.
3. Finish retiring the legacy `users` table from the runtime path once production data is migrated.
4. Validate tenant resolution on `localhost`, preview URLs, subdomains, and custom domains.
5. Review the legacy billboard-era backup components and either migrate them intentionally or remove them from the repository.

## Files Touched In This Hardening Pass

- `app/admin/companies/page.tsx`
- `app/login/page.tsx`
- `app/signup/company/page.tsx`
- `lib/auth/context.tsx`
- `lib/whitelabel/company-service.ts`
- `lib/whitelabel/server.tsx`
- `lib/billing/useFeatureGate.tsx`
- `lib/whitelabel/branding-server.tsx`
- `app/dashboard/page.tsx`
- `app/leads/page.tsx`
- `app/lease-reviews/page.tsx`
- `app/estate-moves/page.tsx`
- `app/estate-moves/move-in/page.tsx`
- `app/estates/page.tsx`
- `app/inspections/new/page.tsx`
- `app/settings/page.tsx`
- `components/ui/Badge.tsx`
- `components/company/CompanySwitcher.tsx`
- `components/inspections/PhotoUpload.tsx`
- `components/layout/MobileSidebar.tsx`
- `components/layout/Sidebar.tsx`
- `lib/auth/account-records.ts`
- `lib/branding/colorExtractor.ts`
- `lib/branding/context.tsx`
- `lib/finance/calculations.ts`
- `lib/finance/hooks.ts`
- `lib/mockData/estates.ts`
- `types/estate-management.ts`
- `middleware.ts`
- `next.config.js`
- `.github/workflows/deploy.yml`
- `vercel.json`
- `tsconfig.json`
- `.eslintrc.json`
- `.eslintignore`
- `package.json`
- `package-lock.json`
- `lib/whitelabel/tenant-resolver.ts`
- `supabase/migrations/20260314000100_tenant_security_hardening.sql`
