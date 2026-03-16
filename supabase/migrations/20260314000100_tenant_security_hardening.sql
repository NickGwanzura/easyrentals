-- ============================================================================
-- Tenant Security Hardening
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_auth_uid()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_uid UUID;
BEGIN
  IF to_regprocedure('auth.uid()') IS NOT NULL THEN
    EXECUTE 'SELECT auth.uid()' INTO resolved_uid;
    RETURN resolved_uid;
  END IF;

  RETURN NULL;
END;
$$;

-- Ensure the profiles table exists for either Supabase-auth or legacy-user deployments.
DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL THEN
    EXECUTE $sql$
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'tenant',
        avatar_url TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    $sql$;
  ELSIF to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $sql$
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'tenant',
        avatar_url TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    $sql$;
  ELSE
    EXECUTE $sql$
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        role VARCHAR(20) NOT NULL DEFAULT 'tenant',
        avatar_url TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    $sql$;
  END IF;
END $$;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'tenant',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self_or_admin ON profiles;
CREATE POLICY profiles_select_self_or_admin
ON profiles
FOR SELECT
USING (
  public.current_auth_uid() = id
  OR EXISTS (
    SELECT 1
    FROM profiles AS admin_profiles
    WHERE admin_profiles.id = public.current_auth_uid()
      AND admin_profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS profiles_insert_self ON profiles;
CREATE POLICY profiles_insert_self
ON profiles
FOR INSERT
WITH CHECK (public.current_auth_uid() = id OR public.current_auth_uid() IS NULL);

DROP POLICY IF EXISTS profiles_update_self_or_admin ON profiles;
CREATE POLICY profiles_update_self_or_admin
ON profiles
FOR UPDATE
USING (
  public.current_auth_uid() = id
  OR EXISTS (
    SELECT 1
    FROM profiles AS admin_profiles
    WHERE admin_profiles.id = public.current_auth_uid()
      AND admin_profiles.role = 'admin'
  )
)
WITH CHECK (
  public.current_auth_uid() = id
  OR EXISTS (
    SELECT 1
    FROM profiles AS admin_profiles
    WHERE admin_profiles.id = public.current_auth_uid()
      AND admin_profiles.role = 'admin'
  )
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Bring profile/company metadata in line with the active auth model.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_primary_company ON profiles(primary_company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_company ON profiles(current_company_id);

-- Bring the multi-tenant tables up to the shape the app expects.
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS owner_id UUID;

ALTER TABLE company_users
  ADD COLUMN IF NOT EXISTS invited_by UUID,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE company_users
  ALTER COLUMN role SET DEFAULT 'viewer';

-- Backfill company context from legacy users rows where possible.
DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    IF to_regclass('auth.users') IS NOT NULL THEN
      INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        phone,
        created_at,
        updated_at,
        primary_company_id,
        current_company_id
      )
      SELECT
        u.id,
        u.email,
        COALESCE(u.first_name, ''),
        COALESCE(u.last_name, ''),
        COALESCE(u.role, 'tenant'),
        u.avatar_url,
        u.phone,
        COALESCE(u.created_at, NOW()),
        COALESCE(u.updated_at, NOW()),
        u.primary_company_id,
        u.current_company_id
      FROM users AS u
      JOIN auth.users AS au ON au.id = u.id
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        first_name = COALESCE(NULLIF(profiles.first_name, ''), EXCLUDED.first_name),
        last_name = COALESCE(NULLIF(profiles.last_name, ''), EXCLUDED.last_name),
        role = COALESCE(profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
        phone = COALESCE(profiles.phone, EXCLUDED.phone),
        primary_company_id = COALESCE(profiles.primary_company_id, EXCLUDED.primary_company_id),
        current_company_id = COALESCE(profiles.current_company_id, EXCLUDED.current_company_id),
        updated_at = NOW();
    ELSE
      INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        phone,
        created_at,
        updated_at,
        primary_company_id,
        current_company_id
      )
      SELECT
        u.id,
        u.email,
        COALESCE(u.first_name, ''),
        COALESCE(u.last_name, ''),
        COALESCE(u.role, 'tenant'),
        u.avatar_url,
        u.phone,
        COALESCE(u.created_at, NOW()),
        COALESCE(u.updated_at, NOW()),
        u.primary_company_id,
        u.current_company_id
      FROM users AS u
      ON CONFLICT (id) DO UPDATE
      SET
        email = EXCLUDED.email,
        first_name = COALESCE(NULLIF(profiles.first_name, ''), EXCLUDED.first_name),
        last_name = COALESCE(NULLIF(profiles.last_name, ''), EXCLUDED.last_name),
        role = COALESCE(profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
        phone = COALESCE(profiles.phone, EXCLUDED.phone),
        primary_company_id = COALESCE(profiles.primary_company_id, EXCLUDED.primary_company_id),
        current_company_id = COALESCE(profiles.current_company_id, EXCLUDED.current_company_id),
        updated_at = NOW();
    END IF;

    UPDATE profiles AS p
    SET primary_company_id = COALESCE(
      p.primary_company_id,
      u.primary_company_id,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
    FROM users AS u
    WHERE p.id = u.id
      AND p.primary_company_id IS NULL;

    UPDATE profiles AS p
    SET current_company_id = COALESCE(
      p.current_company_id,
      u.current_company_id,
      p.primary_company_id,
      '00000000-0000-0000-0000-000000000001'::uuid
    )
    FROM users AS u
    WHERE p.id = u.id
      AND p.current_company_id IS NULL;
  END IF;
END $$;

UPDATE profiles
SET primary_company_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE primary_company_id IS NULL;

UPDATE profiles
SET current_company_id = COALESCE(
  current_company_id,
  primary_company_id,
  '00000000-0000-0000-0000-000000000001'::uuid
)
WHERE current_company_id IS NULL;

-- Resolve the active company directly from the authenticated user and membership.
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    company_id UUID;
BEGIN
    BEGIN
        company_id := NULLIF(current_setting('app.current_company_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        company_id := NULL;
    END;

    IF company_id IS NOT NULL THEN
        RETURN company_id;
    END IF;

    IF public.current_auth_uid() IS NULL THEN
        SELECT id
        INTO company_id
        FROM companies
        WHERE slug = 'default'
        ORDER BY created_at ASC
        LIMIT 1;

        RETURN company_id;
    END IF;

    SELECT p.current_company_id
    INTO company_id
    FROM profiles AS p
    WHERE p.id = public.current_auth_uid();

    IF company_id IS NULL THEN
        SELECT u.current_company_id
        INTO company_id
        FROM users AS u
        WHERE u.id = public.current_auth_uid();
    END IF;

    IF company_id IS NULL THEN
        SELECT cu.company_id
        INTO company_id
        FROM company_users AS cu
        WHERE cu.user_id = public.current_auth_uid()
          AND cu.invitation_status = 'active'
        ORDER BY cu.joined_at ASC
        LIMIT 1;
    END IF;

    IF company_id IS NULL THEN
        SELECT id
        INTO company_id
        FROM companies
        WHERE slug = 'default'
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    RETURN company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = public.current_auth_uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM company_users
    WHERE company_id = target_company_id
      AND user_id = public.current_auth_uid()
      AND invitation_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(target_company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM companies
      WHERE id = target_company_id
        AND owner_id = public.current_auth_uid()
    )
    OR EXISTS (
      SELECT 1
      FROM company_users
      WHERE company_id = target_company_id
        AND user_id = public.current_auth_uid()
        AND invitation_status = 'active'
        AND role IN ('owner', 'admin')
    );
$$;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_select_active_or_member ON companies;
CREATE POLICY companies_select_active_or_member
ON companies
FOR SELECT
USING (
  status = 'active'
  OR public.is_platform_admin()
  OR public.is_company_member(id)
);

DROP POLICY IF EXISTS companies_insert_owner_or_admin ON companies;
CREATE POLICY companies_insert_owner_or_admin
ON companies
FOR INSERT
WITH CHECK (
  public.current_auth_uid() IS NOT NULL
  AND (
    owner_id IS NULL
    OR owner_id = public.current_auth_uid()
    OR public.is_platform_admin()
  )
);

DROP POLICY IF EXISTS companies_update_admin ON companies;
CREATE POLICY companies_update_admin
ON companies
FOR UPDATE
USING (public.is_company_admin(id))
WITH CHECK (public.is_company_admin(id));

DROP POLICY IF EXISTS companies_delete_admin ON companies;
CREATE POLICY companies_delete_admin
ON companies
FOR DELETE
USING (public.is_company_admin(id));

DROP POLICY IF EXISTS company_users_select_member ON company_users;
CREATE POLICY company_users_select_member
ON company_users
FOR SELECT
USING (
  public.is_platform_admin()
  OR public.is_company_member(company_id)
);

DROP POLICY IF EXISTS company_users_insert_admin ON company_users;
CREATE POLICY company_users_insert_admin
ON company_users
FOR INSERT
WITH CHECK (
  public.is_company_admin(company_id)
  OR (
    public.current_auth_uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM companies
      WHERE id = company_id
        AND owner_id = public.current_auth_uid()
    )
  )
);

DROP POLICY IF EXISTS company_users_update_admin ON company_users;
CREATE POLICY company_users_update_admin
ON company_users
FOR UPDATE
USING (public.is_company_admin(company_id))
WITH CHECK (public.is_company_admin(company_id));

DROP POLICY IF EXISTS company_users_delete_admin ON company_users;
CREATE POLICY company_users_delete_admin
ON company_users
FOR DELETE
USING (public.is_company_admin(company_id));
