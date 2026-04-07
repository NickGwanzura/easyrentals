import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { Pool } from 'pg';
import { sql } from '@/lib/db/client';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // enable once email provider is configured
  },

  // Extend the user table with app-specific fields
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: true,
      },
      lastName: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: true,
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'tenant',
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },

  // After a user signs up, also upsert into our business `users` table
  // so all FKs (properties.landlord_id, tenants.user_id, etc.) resolve correctly.
  hooks: {
    after: [
      {
        matcher: (ctx: any) =>
          ctx.path === '/sign-up/email' || ctx.path === '/sign-in/email',
        handler: async (ctx: any) => {
          const user = ctx.context?.newSession?.user ?? ctx.context?.session?.user;
          if (!user?.id) return;

          const firstName = (user as any).firstName || user.name?.split(' ')[0] || '';
          const lastName  = (user as any).lastName  || user.name?.split(' ').slice(1).join(' ') || '';
          const role      = (user as any).role || 'tenant';
          const phone     = (user as any).phone || null;

          try {
            await sql`
              INSERT INTO users (id, email, first_name, last_name, role, phone, avatar_url, email_verified)
              VALUES (
                ${user.id}::uuid,
                ${user.email},
                ${firstName},
                ${lastName},
                ${role},
                ${phone},
                ${user.image ?? null},
                ${user.emailVerified ?? false}
              )
              ON CONFLICT (id) DO UPDATE SET
                email          = EXCLUDED.email,
                first_name     = COALESCE(NULLIF(users.first_name, ''), EXCLUDED.first_name),
                last_name      = COALESCE(NULLIF(users.last_name,  ''), EXCLUDED.last_name),
                avatar_url     = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
                email_verified = EXCLUDED.email_verified,
                updated_at     = NOW()
            `;
          } catch (err) {
            console.error('[auth hook] Failed to sync user to users table:', err);
          }
        },
      },
    ],
  },

  plugins: [nextCookies()],
});

// Inferred types for use across the app
export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser   = typeof auth.$Infer.Session.user;
