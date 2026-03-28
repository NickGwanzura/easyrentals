# EazyRentals: Platform Capabilities

> **White-label property management software for rental agencies, estate managers, and landlords.**
> Built on Next.js 15 · Role-based access · One-click demo · Vercel-hosted · Zimbabwe-localised

---

## 1. Who It's For

| Persona | What they get |
|---|---|
| **Property Management Company** | Full admin suite: properties, tenants, accounting, reporting, and staff access |
| **Landlord** | Portfolio overview, rental income tracking, estate finance, and owner statements |
| **Letting Agent** | Properties, leads, inspections, and lease reviews with no financial clutter |
| **Tenant** | Payments dashboard, maintenance requests, and personal account |

---

## 2. Core Modules

### 2.1 Property Management
- Add and manage **rental properties**: address, bedrooms, bathrooms, rental price, and status
- Track vacancy and occupied status per property
- Upload property documents and photos
- Link properties to tenants via lease records

### 2.2 Tenant Management
- Full tenant profiles: contact details, ID, lease terms, and rental amount
- Track active, past, and prospective tenants
- Lease start and end dates with automated review alerts
- Tenant portal access for payments, statements, and requests

### 2.3 Payments and Arrears
- Log and track rent payments per tenant
- Outstanding balance and arrears visibility
- Payment history with method (Cash, EFT, EcoCash, ZipIt, etc.)
- Tenant-facing payments dashboard showing what is due and what has been paid

### 2.4 Leads and Enquiries
- Capture leads from prospective tenants
- Track lead status through the pipeline: New, Viewing, Application, Placed
- Assign leads to agents
- Notes and follow-up tracking

### 2.5 Inspections
- Schedule property inspections
- Create inspection reports with room-by-room condition ratings
- Photo upload per inspection item
- Full inspection history per property

### 2.6 Lease Reviews
- Lease reviews are conducted in line with physical property inspections, covering both the tenant's payment behaviour and the physical condition of the property
- Payment history is assessed alongside inspection findings so that renewal decisions are based on the full picture: how the tenant pays and how they look after the property
- Track upcoming lease renewals with due date alerts so nothing slips through
- Log review outcomes: renewal, rent increase, or exit
- Each review record shows the linked inspection report including room-by-room condition ratings and overall property condition
- Inspection history is visible within the review so the agent or landlord can compare condition across multiple periods

### 2.7 Analytics
- Portfolio-level performance metrics
- Occupancy rate, revenue trends, and vacancy duration
- Charts and KPIs for landlord and admin roles

---

## 3. Estate Management Suite

For gated estates, complexes, and multi-block developments.

### 3.1 Estates and Units
- Create and manage multiple estates (Harare, Bulawayo, etc.)
- Block and unit structure: Block A contains Unit A-01, and so on
- Unit profiles: owner details, tenant details, lease dates, monthly rent, and levy amount
- Occupancy status: Occupied, Vacant, Owner-Occupied, or Under Maintenance
- Monthly rental income per estate with occupancy rate at a glance

### 3.2 Levies
- Monthly levy billing per unit
- Track Paid, Partial, Unpaid, and Overdue status
- Record payments with reference numbers and payment method
- Running balance per unit

### 3.3 Move-In Management
- Structured move-in checklist: deposit, keys issued, access cards, inspection completed, documents signed
- Vehicle registration capture
- Emergency contact logging
- Move-in date and lease period recording

### 3.4 Move-Out Management
- Notice period tracking
- Final inspection with condition notes
- Damage charges and cleaning charges
- Deposit refund calculation showing total deductions against deposit held
- Move-out status tracking: Pending through to Completed

### 3.5 Rental Billing and Invoicing
- **Generate invoices** for all occupied units: rent and levy combined on one invoice
- Choose billing period, estate, and due date
- Option to email invoices to tenants automatically
- Invoice statuses: Paid, Unpaid, Partial, and Overdue
- **Printable invoice** with full line items, estate bank details, and payment reference
- **Record payments** against invoices: method, date, reference, and amount
- Balance tracking per invoice
- Export and PDF download

### 3.6 Estate Finance
- Revenue overview: levy income, rental income, and other income
- Expense tracking by category
- Net financial position per estate

### 3.7 Budget
- Set annual budget targets per estate
- Track actual spend against budgeted spend

### 3.8 Expenses
- Log estate expenses: security, maintenance, utilities, landscaping, and admin
- Filter by category, estate, and date range
- Add new expenses with receipt capture

### 3.9 Arrears
- Outstanding levies per estate, per unit
- Ageing analysis

### 3.10 Owner Statements
- Per-landlord or per-owner financial statement
- Income received, expenses deducted, and net payout
- Downloadable PDF-ready format

### 3.11 Estate Reports
- Monthly levy collection report
- Occupancy report
- Financial summary report

---

## 4. Accounting Suite

Full financial overview for the management company. Admin access only.

- **Revenue YTD**: rental income, levy income, and management fees
- **Expenses YTD**: by category with visual progress bars
- **Net Profit**: real-time profit and loss position
- **Outstanding Arrears**: across all estates at a glance
- **Monthly P&L Chart**: 12-month income vs expense bar chart
- **Income Breakdown**: Rent, Levy, Fees, and Other with percentage of total
- **Expense Breakdown**: Security, Maintenance, Utilities, Admin, and Landscaping
- **Expenses Table**: searchable and filterable by category and estate
- Add new expenses inline without leaving the page

---

## 5. White-Label Branding

Every deployment is fully branded to the agency.

- **Custom logo**: uploaded agency logo shown in the sidebar, login page, and on invoices
- **Brand colours**: primary and secondary colours applied across the entire UI
- **Agency name**: visible in sidebar header, login page, and the landing page
- **Tagline**: shown on the login page right panel
- Per-company configuration managed through settings

---

## 6. Role-Based Access Control

Every page and navigation item is gated by user role. Users only see what is relevant to them.

| Feature | Admin | Landlord | Agent | Tenant |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Properties | ✓ | ✓ | ✓ | |
| Tenants | ✓ | ✓ | ✓ | |
| Payments | ✓ | ✓ | | ✓ |
| Leads | ✓ | ✓ | ✓ | |
| Inspections | ✓ | ✓ | ✓ | |
| Lease Reviews | ✓ | ✓ | ✓ | |
| Analytics | ✓ | ✓ | | |
| Estate Management | ✓ | ✓ | ✓ | |
| Billing and Invoicing | ✓ | ✓ | | |
| Accounting | ✓ | | | |
| Estate Finance and Budget | ✓ | ✓ | | |
| Owner Statements | ✓ | ✓ | | |
| Settings | ✓ | ✓ | ✓ | ✓ |

---

## 7. Authentication and Access

- **Demo mode**: instant access with no sign-up required
- Four one-click demo accounts on the login page: Admin, Landlord, Agent, and Tenant
- Session persistence via localStorage
- Route protection: unauthenticated users are redirected to the login page
- Role-based redirects: users are only taken to pages they have access to

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Sora + Inter (Google Fonts) |
| Hosting | Vercel (Edge Network) |
| Database | PostgreSQL via Neon |

---

## 9. Demo Access

Live demo: **[easyrentals-master.vercel.app](https://easyrentals-master.vercel.app)**

| Role | Email | Password |
|---|---|---|
| Admin | demo@admin.com | demo123 |
| Landlord | demo@landlord.com | demo123 |
| Agent | demo@agent.com | demo123 |
| Tenant | demo@tenant.com | demo123 |

All four accounts are available as one-click cards on the login page. No typing required.

---

## 10. Deployment and Multi-Tenancy

- Deployable as a **single white-label instance** per client with a custom domain and custom branding
- Or run as a **multi-tenant SaaS** with company switching and per-company context
- Company registration flow at `/signup/company`
- Admin company management at `/admin/companies`
- CI/CD via Vercel: every push to main deploys automatically

---

## 11. Localisation

- Default currency: **USD** (Zimbabwe market)
- Local payment methods: EcoCash, OneMoney, ZipIt, Bank Transfer, Cash, and Cheque
- Local banks: CBZ, Stanbic, CABS, FBC, Ecobank, and NMB
- Zimbabwe provinces, cities, and address format
- Demo content uses Zimbabwean first names and surnames

---

*Updated: March 2026*
