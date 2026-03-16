# Product Roadmap

## Product Position

EasyRentals is no longer just a rental tracker. The app already spans:

- rental operations
- estate management
- owner delegation
- payments and levies
- inspections
- lease reviews

The next step is to turn those modules into one operational platform with clear workflows, role-aware action centers, and stronger communication loops.

## Execution Principles

- Build around daily workflows, not isolated pages.
- Keep admin, landlord, agent, tenant, and delegated owner experiences distinct but connected.
- Reuse existing screens before creating entirely new surface area.
- Prefer shared models, shared cards, and shared action patterns over feature-by-feature UI drift.
- Each phase must improve both product value and perceived quality.

## Phase 1: Operations Core

### Summary

Turn the app into a daily command center. Users should immediately see what needs attention, what is blocked, and what action to take next.

### Outcome

- The dashboard becomes the operating hub.
- Key workflows become actionable from one place.
- Teams stop hopping between pages just to find urgent work.

### Features

- Unified activity center
  - rent due and overdue
  - levy arrears
  - expiring leases
  - pending inspections
  - vacant units needing marketing
  - recently delegated estate units
- Role-aware task list
  - admin sees full portfolio issues
  - landlord sees owned properties and delegated estate units
  - agent sees leads, vacant stock, pending follow-up
  - tenant sees payments, lease status, maintenance status
- Priority banners and alerts
  - high-risk arrears
  - leases ending soon
  - inspections overdue
  - move-ins and move-outs due today
- Quick actions
  - record payment
  - add tenant
  - assign property owner
  - remove tenant
  - start inspection
  - generate statement
- Better empty and loading states across operational pages

### Execution Targets

- [app/dashboard/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/dashboard/page.tsx)
- [components/dashboard](/Users/itai/Desktop/SYS/easyrentals-master/components/dashboard)
- [app/payments/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/payments/page.tsx)
- [app/tenants/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/tenants/page.tsx)
- [app/estates/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estates/page.tsx)
- [app/estates/estate-units/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estates/estate-units/page.tsx)
- [app/estate-moves/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estate-moves/page.tsx)
- [app/inspections/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/inspections/page.tsx)
- [lib/auth/hooks.ts](/Users/itai/Desktop/SYS/easyrentals-master/lib/auth/hooks.ts)
- [lib/mockData](/Users/itai/Desktop/SYS/easyrentals-master/lib/mockData)

### UX Improvements

- Create one shared “attention” card pattern for alerts, tasks, and deadlines.
- Standardize filters and table headers across tenants, payments, estates, and units.
- Add direct navigation from alerts into the relevant page state.
- Use stronger status grouping:
  - healthy
  - attention needed
  - overdue
  - blocked

### Success Criteria

- A user can understand today’s priorities in under 30 seconds.
- Most urgent actions are reachable in one click from the dashboard.
- Role-specific dashboards feel materially different, not cosmetically different.

## Phase 2: Communication And Workflow Automation

### Summary

Add the systems that turn data into movement: reminders, follow-ups, scheduled actions, and team accountability.

### Outcome

- The app starts driving operations instead of just reflecting them.
- Users are reminded before issues become emergencies.
- Managers can trust task ownership and workflow progress.

### Features

- Notification center
  - in-app notification feed
  - unread counts
  - severity and category grouping
- Communication workflows
  - payment reminders
  - levy arrears reminders
  - inspection scheduling notices
  - lease expiry reminders
  - move-in and move-out communication templates
- Task engine
  - assign task to admin, agent, landlord, or delegated owner
  - due dates and completion states
  - audit trail for completion
- Trigger-based automation
  - tenant removed -> mark unit vacant -> create turnover task set
  - lease expiry within threshold -> renewal review task
  - overdue payment -> collections follow-up task
  - delegated owner assigned -> notify owner and show new unit in their dashboard
- Better confirmation UX for sensitive actions
  - remove tenant
  - reassign owner
  - delete company or estate
  - terminate lease

### Execution Targets

- [components/layout/Header.tsx](/Users/itai/Desktop/SYS/easyrentals-master/components/layout/Header.tsx)
- [app/dashboard/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/dashboard/page.tsx)
- [app/payments/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/payments/page.tsx)
- [app/lease-reviews/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/lease-reviews/page.tsx)
- [app/estates/estate-units/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estates/estate-units/page.tsx)
- [app/estate-moves/move-in/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estate-moves/move-in/page.tsx)
- [app/estate-moves/move-out/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estate-moves/move-out/page.tsx)
- [components/ui/Modal.tsx](/Users/itai/Desktop/SYS/easyrentals-master/components/ui/Modal.tsx)
- [components/ui/Toast.tsx](/Users/itai/Desktop/SYS/easyrentals-master/components/ui/Toast.tsx)
- new task and notification domain modules under `lib/` and `components/`

### UX Improvements

- Add notification badges and recent activity previews to the shell.
- Use side panels or drawers for quick task completion without losing context.
- Add confirmation dialogs with explicit consequence language.
- Make automation visible so users know why they are seeing a task or alert.

### Success Criteria

- Time-sensitive issues generate visible follow-up automatically.
- Teams can see who owns each task and what is still pending.
- Sensitive actions feel safe, reversible where possible, and well-audited.

## Phase 3: Premium Owner And Tenant Experience

### Summary

Deepen retention and product value by improving self-service for owners and tenants while giving admins better oversight.

### Outcome

- Owners get a premium portfolio view instead of a thin data mirror.
- Tenants gain real self-service capability.
- Admins spend less time answering repetitive status questions.

### Features

- Upgraded owner workspace
  - delegated units
  - property and estate income
  - levies, expenses, arrears, occupancy
  - downloadable statements
  - owner-level activity feed
- Upgraded tenant workspace
  - payment history
  - receipts
  - lease status
  - maintenance requests
  - inspection history
  - move-out preparation checklist
- Document hub
  - lease agreements
  - inspection reports
  - statements
  - proof of payment
  - owner mandates
- Better account and profile management
  - contact updates
  - profile completeness
  - role-aware settings
- Service and support layer
  - request help
  - dispute a charge
  - upload supporting documents

### Execution Targets

- [app/settings/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/settings/page.tsx)
- [app/payments/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/payments/page.tsx)
- [app/tenants/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/tenants/page.tsx)
- [app/analytics/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/analytics/page.tsx)
- [app/inspections/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/inspections/page.tsx)
- [components/layout/navigation.ts](/Users/itai/Desktop/SYS/easyrentals-master/components/layout/navigation.ts)
- [lib/auth/context.tsx](/Users/itai/Desktop/SYS/easyrentals-master/lib/auth/context.tsx)
- new document and statement modules under `lib/` and `components/`

### UX Improvements

- Create premium statement and reporting surfaces for owners.
- Add clearer financial storytelling:
  - collected
  - due
  - overdue
  - projected
- Improve tenant reassurance with explicit timelines, receipts, and process visibility.
- Reduce admin friction by moving repeat questions into self-service status views.

### Success Criteria

- Owners can understand portfolio performance without asking support.
- Tenants can resolve common needs without manual staff intervention.
- Admins and agents spend less time on repetitive status updates.

## Phase 4: Analytics, Intelligence, And Scaling

### Summary

Once the operations and experience layers are solid, turn the app into a smarter management system with stronger reporting and decision support.

### Outcome

- Leadership can make portfolio decisions with confidence.
- Teams can spot risk earlier.
- The platform becomes more defensible and differentiated.

### Features

- Advanced analytics
  - arrears aging
  - occupancy trends
  - lease renewal risk
  - maintenance cost by building or unit
  - owner yield reporting
  - agent conversion funnel
- Operational forecasting
  - expected collections
  - likely vacancy windows
  - projected levy shortfalls
- Risk scoring
  - repeat late payer risk
  - lease renewal risk
  - maintenance escalation risk
- Portfolio reporting exports
  - owner-ready PDFs
  - management snapshots
  - monthly operations reports
- Cross-module intelligence
  - connect inspections, payments, lease reviews, and tenant status into one risk picture

### Execution Targets

- [app/analytics/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/analytics/page.tsx)
- [app/dashboard/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/dashboard/page.tsx)
- [app/lease-reviews/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/lease-reviews/page.tsx)
- [app/payments/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/payments/page.tsx)
- [app/estate-expenses/page.tsx](/Users/itai/Desktop/SYS/easyrentals-master/app/estate-expenses/page.tsx)
- [lib/finance](/Users/itai/Desktop/SYS/easyrentals-master/lib/finance)
- [lib/pdfExport.ts](/Users/itai/Desktop/SYS/easyrentals-master/lib/pdfExport.ts)

### UX Improvements

- Use cleaner chart narratives instead of showing raw metrics without context.
- Add filterable date ranges, estate or property scopes, and role-aware analytics.
- Show what changed, why it matters, and what to do next.

### Success Criteria

- Reports answer operational questions, not just display numbers.
- Portfolio and owner reporting becomes one of the product’s strongest selling points.
- Teams can identify issues before they become payment loss or vacancy loss.

## Recommended Delivery Order

1. Phase 1 because it sharpens daily value immediately.
2. Phase 2 because workflows and reminders multiply the usefulness of Phase 1.
3. Phase 3 because self-service reduces operational load and raises product quality.
4. Phase 4 because intelligence is most valuable once the underlying workflows are reliable.

## What To Build First

If only one quarter is available, ship this subset:

1. Unified dashboard activity center.
2. Role-aware task cards and quick actions.
3. Notification center with payment and lease reminders.
4. Owner delegation visibility on the dashboard.
5. Vacancy turnover workflow after tenant removal.

## Practical Build Notes

- Reuse current role filtering from [components/layout/navigation.ts](/Users/itai/Desktop/SYS/easyrentals-master/components/layout/navigation.ts) and [lib/auth/hooks.ts](/Users/itai/Desktop/SYS/easyrentals-master/lib/auth/hooks.ts).
- Extend the current estate and rental data models instead of creating parallel tracking systems.
- Keep alerts, tasks, and notifications in shared primitives so they can appear on dashboard, list pages, and mobile surfaces.
- Favor small composable cards and drawers over large modal-heavy workflows where possible.
- Treat delegated estate ownership as a first-class workflow everywhere it affects visibility and action rights.

## Phase Summaries

- Phase 1 builds the operational spine.
- Phase 2 adds accountability and automation.
- Phase 3 upgrades the owner and tenant experience.
- Phase 4 makes the platform intelligent and decision-ready.
