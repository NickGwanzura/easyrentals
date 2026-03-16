# White-Label Implementation Checklist

Use this checklist to track progress toward multi-tenant white-label deployment.

## Phase 1: Database Foundation

### Schema Changes
- [ ] Run `lib/whitelabel/database-schema.sql` migration
- [ ] Verify `companies` table created
- [ ] Verify `company_users` junction table created
- [ ] Verify `company_id` added to all relevant tables
- [ ] Verify `company_activity_log` table created
- [ ] Test data migration (existing data assigned to default company)

### Row Level Security
- [ ] Enable RLS on all tables
- [ ] Create RLS policies for each table
- [ ] Test data isolation (users can't see other companies' data)
- [ ] Verify `get_current_company_id()` function works

### Indexes & Performance
- [ ] Create indexes on `company_id` columns
- [ ] Test query performance with large datasets
- [ ] Verify company-scoped views work correctly

---

## Phase 2: Middleware & Subdomain Detection

### Middleware Implementation
- [ ] Create `middleware.ts` in project root
- [ ] Implement subdomain parsing logic
- [ ] Implement custom domain detection
- [ ] Add company loading from database
- [ ] Set company context in request headers
- [ ] Handle 404 for invalid subdomains

### DNS Configuration
- [ ] Configure wildcard DNS: `*.yourdomain.com`
- [ ] Point wildcard to Vercel
- [ ] Test subdomain routing works
- [ ] Set up SSL for wildcard domain

### Domain Management
- [ ] Create custom domain verification system
- [ ] Implement DNS record validation
- [ ] Set up automatic SSL for custom domains
- [ ] Test custom domain routing

---

## Phase 3: Server-Side Branding

### Server Context
- [ ] Implement `getServerBranding()` function
- [ ] Create server-side company context provider
- [ ] Update root `layout.tsx` to load branding server-side
- [ ] Inject CSS variables in HTML head
- [ ] Prevent "flash of unbranded content"

### Client-Side Updates
- [ ] Update `BrandingProvider` to use server data as initial state
- [ ] Keep client-side updates for real-time branding changes
- [ ] Sync localStorage with server (fallback)

### Component Updates
- [ ] Update `Sidebar.tsx` - use dynamic logo/name
- [ ] Update `Header.tsx` - use company branding
- [ ] Update `login/page.tsx` - company-specific branding
- [ ] Update all email templates
- [ ] Update PDF exports with company branding

---

## Phase 4: Data Isolation

### API Routes
- [ ] Audit all API routes
- [ ] Add company_id filters to all queries
- [ ] Update Supabase queries with RLS context
- [ ] Test cross-company data access (should fail)

### Client Queries
- [ ] Update all client-side data fetching
- [ ] Add company context to query keys
- [ ] Implement company-scoped caching

### Auth Updates
- [ ] Update auth context to include company
- [ ] Handle multi-company users (switcher UI)
- [ ] Update JWT claims with company info
- [ ] Implement company-based permissions

---

## Phase 5: Onboarding & Management

### Company Onboarding
- [ ] Create `/signup/company` onboarding flow
- [ ] Implement subdomain availability check
- [ ] Create company setup wizard
- [ ] Add initial user creation
- [ ] Send welcome emails

### Admin Dashboard
- [ ] Create admin layout
- [ ] Company list view
- [ ] Company detail/edit view
- [ ] User management per company
- [ ] Subscription management

### Settings Updates
- [ ] Move branding settings to database
- [ ] Add custom domain configuration
- [ ] Add email sender configuration
- [ ] Add subscription/limits view

---

## Phase 6: Subscription & Billing

### Stripe Integration
- [ ] Set up Stripe products/plans
- [ ] Implement checkout flow
- [ ] Handle subscription webhooks
- [ ] Implement usage tracking
- [ ] Add billing history

### Feature Gates
- [ ] Implement feature flag system
- [ ] Check subscription tier before enabling features
- [ ] Show upgrade prompts
- [ ] Enforce usage limits

---

## Phase 7: Deployment & Operations

### Infrastructure
- [ ] Set up production database
- [ ] Configure CDN for logos/assets
- [ ] Set up image optimization
- [ ] Configure caching strategies

### Monitoring
- [ ] Add company-scoped analytics
- [ ] Set up error tracking per tenant
- [ ] Monitor resource usage per company
- [ ] Set up alerts for limits

### Documentation
- [ ] API documentation
- [ ] Custom domain setup guide
- [ ] White-label configuration guide
- [ ] Troubleshooting guide

---

## Testing Checklist

### Functional Testing
- [ ] Create test company
- [ ] Verify subdomain routing
- [ ] Test custom domain
- [ ] Verify data isolation
- [ ] Test branding customization
- [ ] Test user invitations
- [ ] Test subscription upgrade

### Security Testing
- [ ] Attempt cross-company data access
- [ ] Test RLS policies
- [ ] Verify auth token isolation
- [ ] Test file upload security
- [ ] SQL injection testing

### Performance Testing
- [ ] Load test with multiple companies
- [ ] Test database query performance
- [ ] Verify caching effectiveness
- [ ] Test image/CDN delivery

---

## Pre-Launch Checklist

### Code Review
- [ ] All TODOs resolved
- [ ] No hardcoded company references
- [ ] Error handling for all edge cases
- [ ] TypeScript types complete

### Documentation
- [ ] README updated
- [ ] Deployment docs complete
- [ ] Customer-facing docs ready

### Legal
- [ ] Terms of Service updated
- [ ] Privacy Policy updated
- [ ] Data Processing Agreement ready

### Support
- [ ] Support team trained
- [ ] FAQ prepared
- [ ] Escalation paths defined

---

## Launch Phases

### Soft Launch (Beta)
- [ ] 5-10 friendly companies
- [ ] Close monitoring
- [ ] Daily standups
- [ ] Rapid bug fixes

### Public Launch
- [ ] Marketing ready
- [ ] Sign-up flow tested
- [ ] Payment processing live
- [ ] Support team ready

### Scale
- [ ] Auto-scaling configured
- [ ] Performance monitoring
- [ ] Regular security audits
- [ ] Feature roadmap published

---

## Current Status

**Last Updated**: March 13, 2025

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Database | 🔴 Not Started | 0% |
| Phase 2: Middleware | 🔴 Not Started | 0% |
| Phase 3: Branding | 🟡 Partial | 30% |
| Phase 4: Data Isolation | 🔴 Not Started | 0% |
| Phase 5: Onboarding | 🔴 Not Started | 0% |
| Phase 6: Billing | 🔴 Not Started | 0% |
| Phase 7: Deployment | 🔴 Not Started | 0% |

**Overall Progress**: ~5%

---

## Notes

- Estimated total effort: 9-11 weeks
- Critical path: Phase 1 → Phase 2 → Phase 4
- Can parallelize: Phase 3 (branding) with Phase 1
- Blockers: None currently
