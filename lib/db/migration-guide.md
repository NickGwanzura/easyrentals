# Supabase Migration Guide

## Step 1: Set Up Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note your project URL and anon key

## Step 2: Run Database Schema

1. Open Supabase SQL Editor
2. Copy and run `lib/db/supabase-auth-schema.sql`
3. This creates all tables with RLS policies

## Step 3: Configure Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For Vercel deployment:
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Step 4: Enable Email Auth Provider

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)

## Step 5: Create Admin User

Run this SQL in Supabase SQL Editor:
```sql
-- Create admin user (replace with your email)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@yourcompany.com',
    crypt('your-password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User","role":"admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);
```

## Step 6: Migrate Data (if needed)

If you have existing data to migrate:

1. Export data from old database
2. Transform to match new schema
3. Import via Supabase Table Editor or SQL

## Step 7: Test Authentication

1. Start your app: `npm run dev`
2. Go to `/signup` and create a test user
3. Verify profile is created in Supabase
4. Test login/logout

## Row Level Security (RLS)

The schema includes RLS policies for:
- **Profiles**: Users see their own, admins see all
- **Properties**: Public read, landlords manage their own
- **Tenants**: Tenants see their own, landlords see their tenants
- **Payments**: Tenants see their own, landlords see all
- **Leases**: Role-based access
- **Maintenance**: Tenants create/view their own, landlords manage all

## Demo Mode

The app still supports demo mode for testing:
- `demo@admin.com` / `demo123`
- `demo@agent.com` / `demo123`
- `demo@tenant.com` / `demo123`

## Troubleshooting

### "Invalid login credentials"
- Check email confirmation status in Supabase Auth
- Verify environment variables are correct

### "Profile not created"
- Check if trigger is created: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created'`
- Check logs in Supabase Logs

### "RLS policy violation"
- Verify user role in profiles table
- Check RLS policies are enabled

## Storage Buckets

The schema creates these buckets:
- `avatars`: Public, user profile pictures
- `properties`: Public, property images
- `documents`: Private, lease documents etc.
