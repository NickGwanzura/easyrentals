# EazyRentals - Property Management Portal

A modern, full-featured real estate rental management system built with Next.js, Tailwind CSS, and TypeScript.

## Features

### Multi-Role Support
- **Admin**: Full system access, manage all properties, tenants, and payments
- **Landlord**: Manage own properties and tenants
- **Agent**: Handle assigned properties and leads
- **Tenant**: View lease details, make payments, submit maintenance requests

### Core Modules
- **Property Management**: Add, edit, and track properties with detailed information
- **Tenant Management**: Tenant profiles, background checks, lease tracking
- **Payment Processing**: Record and track rent payments, view payment history
- **Lead Management**: Track prospective tenants through the application pipeline
- **Maintenance Requests**: Submit and track maintenance issues
- **Analytics**: Revenue reports, occupancy rates, and performance metrics

### Demo Mode
Try the application without any setup:

| Role  | Email             | Password |
|-------|-------------------|----------|
| Admin | demo@admin.com    | demo123  |
| Agent | demo@agent.com    | demo123  |
| Tenant| demo@tenant.com   | demo123  |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind UI patterns
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eazyrentals-portal
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── analytics/         # Analytics & reports page
├── dashboard/         # Main dashboard (role-based views)
├── landing/          # Landing/marketing page
├── leads/            # Lead management
├── login/            # Authentication page
├── payments/         # Payment management
├── properties/       # Property management
├── settings/         # User settings
├── tenants/          # Tenant management
├── globals.css       # Global styles
├── layout.tsx        # Root layout

components/
├── dashboard/        # Dashboard-specific components
├── layout/           # Layout components (Sidebar, Header)
├── ui/               # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   └── Input.tsx

lib/
├── auth/             # Authentication
│   ├── context.tsx   # Auth context provider
│   └── hooks.ts      # Auth hooks
├── db/               # Database
│   ├── schema.sql    # PostgreSQL schema
│   └── seed.sql      # Seed data
├── mockData/         # Demo data
│   └── index.ts      # Mock data for demo mode
├── utils/            # Utility functions
│   └── index.ts      # Helper functions

types/
└── index.ts          # TypeScript types/interfaces
```

## Demo Data

The application includes comprehensive demo data:
- 10 Properties (various types and locations)
- 20 Tenants (mix of active, inactive, pending)
- 15 Payments (rent, deposits, late fees)
- 5 Leads (in various stages)
- 3 Maintenance requests
- 2 Agents

## Authentication Flow

1. User enters credentials on login page
2. Demo mode validates against mock credentials
3. On success, user data is stored in localStorage
4. Auth context provides user state throughout the app
5. Route guards protect authenticated routes

## Role-Based Access Control

Each role has specific permissions:

| Feature | Admin | Landlord | Agent | Tenant |
|---------|-------|----------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage All Properties | ✅ | Own only | Assigned | Current only |
| Manage Tenants | ✅ | ✅ | View | Self only |
| Record Payments | ✅ | ✅ | ❌ | View own |
| View Analytics | ✅ | ✅ | ❌ | ❌ |
| Manage Leads | ✅ | ✅ | Own | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

## Database Schema

See `lib/db/schema.sql` for the complete PostgreSQL schema including:
- Users table with role-based access
- Properties with full details
- Tenants, Agents, and Leads
- Leases and Payments
- Maintenance Requests
- Audit Logs and Notifications

## Customization

### Theme Colors
Edit `tailwind.config.js` to customize:
- Primary colors
- Success/Warning/Danger colors
- Shadows and animations

### Fonts
The app uses "Instrument Sans" from Google Fonts. Update in `app/globals.css`.

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
Build the application:
```bash
npm run build
```

Deploy the `.next` folder according to your platform's instructions.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or feature requests, please open an issue on the repository.
