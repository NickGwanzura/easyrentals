-- ============================================================================
-- EazyRentals - Neon PostgreSQL Schema
-- Auth managed by Auth0 (no password_hash stored here)
-- Run this in your Neon SQL editor or via psql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Users (identity synced from Auth0 on first login)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub     VARCHAR(255) UNIQUE,                -- Auth0 user_id (sub claim)
  email         VARCHAR(255) UNIQUE NOT NULL,
  first_name    VARCHAR(100) NOT NULL DEFAULT '',
  last_name     VARCHAR(100) NOT NULL DEFAULT '',
  role          VARCHAR(20)  NOT NULL DEFAULT 'tenant'
                  CHECK (role IN ('admin', 'landlord', 'agent', 'tenant')),
  avatar_url    TEXT,
  phone         VARCHAR(20),
  is_active     BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  current_company_id UUID,
  primary_company_id UUID,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth0_sub ON users(auth0_sub);
CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);

-- Backward-compat view used by legacy code that queries "profiles"
CREATE OR REPLACE VIEW profiles AS SELECT * FROM users;

-- ============================================================================
-- Companies (multi-tenant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(100) UNIQUE NOT NULL,
  custom_domain       VARCHAR(255),
  logo_url            TEXT,
  logo_dark_url       TEXT,
  favicon_url         TEXT,
  primary_color       VARCHAR(7)   DEFAULT '#2563eb',
  secondary_color     VARCHAR(7)   DEFAULT '#64748b',
  accent_color        VARCHAR(7)   DEFAULT '#f59e0b',
  background_color    VARCHAR(7)   DEFAULT '#f8fafc',
  surface_color       VARCHAR(7)   DEFAULT '#ffffff',
  text_color          VARCHAR(7)   DEFAULT '#0f172a',
  custom_css          TEXT,
  email_sender_name   VARCHAR(255) DEFAULT 'EazyRentals',
  email_sender_email  VARCHAR(255) DEFAULT 'noreply@eazyrentals.com',
  status              VARCHAR(20)  DEFAULT 'active',
  subscription_status VARCHAR(20)  DEFAULT 'active',
  subscription_tier   VARCHAR(20)  DEFAULT 'starter',
  max_users           INTEGER      DEFAULT 5,
  max_properties      INTEGER      DEFAULT 10,
  features            JSONB        DEFAULT '[]',
  owner_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug   ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(custom_domain);

-- ============================================================================
-- Company Users (membership)
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role              VARCHAR(20) DEFAULT 'member',
  invitation_status VARCHAR(20) DEFAULT 'active',
  invited_by        UUID REFERENCES users(id),
  invited_at        TIMESTAMPTZ,
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cu_user    ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_cu_company ON company_users(company_id);

-- Add FK from users → companies (deferred to avoid circular dep)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_current_company') THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_current_company
      FOREIGN KEY (current_company_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_primary_company') THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_primary_company
      FOREIGN KEY (primary_company_id) REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- Properties
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  address          VARCHAR(255) NOT NULL,
  city             VARCHAR(100) NOT NULL,
  state            VARCHAR(50)  NOT NULL,
  zip_code         VARCHAR(20)  NOT NULL,
  country          VARCHAR(100) DEFAULT 'USA',
  type             VARCHAR(20)  NOT NULL CHECK (type IN ('apartment','house','condo','townhouse','commercial')),
  status           VARCHAR(20)  NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant','occupied','maintenance','inactive')),
  bedrooms         INTEGER      DEFAULT 0,
  bathrooms        DECIMAL(3,1) DEFAULT 0,
  square_feet      INTEGER,
  year_built       INTEGER,
  monthly_rent     DECIMAL(10,2) NOT NULL,
  deposit_amount   DECIMAL(10,2) NOT NULL,
  landlord_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  current_tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amenities        JSONB  DEFAULT '[]',
  featured_image_url TEXT,
  images           JSONB  DEFAULT '[]',
  company_id       UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status   ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_company  ON properties(company_id);

-- ============================================================================
-- Tenants
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth            DATE,
  emergency_contact_name   VARCHAR(200),
  emergency_contact_phone  VARCHAR(20),
  employer                 VARCHAR(200),
  employment_status        VARCHAR(20) CHECK (employment_status IN ('employed','self-employed','unemployed','student','retired')),
  monthly_income           DECIMAL(10,2),
  current_property_id      UUID REFERENCES properties(id) ON DELETE SET NULL,
  status                   VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active','inactive','pending','evicted')),
  credit_score             INTEGER,
  background_check_status  VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending','passed','failed')),
  documents                JSONB  DEFAULT '[]',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Leases
-- ============================================================================

CREATE TABLE IF NOT EXISTS leases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES tenants(id)    ON DELETE CASCADE,
  landlord_id       UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  monthly_rent      DECIMAL(10,2) NOT NULL,
  deposit_amount    DECIMAL(10,2) NOT NULL,
  late_fee_amount   DECIMAL(10,2) DEFAULT 50.00,
  payment_due_day   INTEGER DEFAULT 1 CHECK (payment_due_day BETWEEN 1 AND 31),
  grace_period_days INTEGER DEFAULT 5,
  status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active','expired','terminated','pending')),
  documents         JSONB DEFAULT '[]',
  terminated_at     TIMESTAMPTZ,
  termination_reason TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ============================================================================
-- Payments
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id)   ON DELETE CASCADE,
  property_id         UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  lease_id            UUID REFERENCES leases(id) ON DELETE SET NULL,
  amount              DECIMAL(10,2) NOT NULL,
  type                VARCHAR(20) NOT NULL CHECK (type IN ('rent','deposit','late_fee','maintenance','other')),
  status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue','partial','failed')),
  method              VARCHAR(20) CHECK (method IN ('cash','bank_transfer','credit_card','debit_card','check','money_order','online')),
  payment_for_month   INTEGER NOT NULL CHECK (payment_for_month BETWEEN 1 AND 12),
  payment_for_year    INTEGER NOT NULL,
  due_date            DATE NOT NULL,
  paid_date           DATE,
  transaction_id      VARCHAR(255),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  recorded_by         UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- Maintenance Requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id)    ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  category      VARCHAR(20) CHECK (category IN ('plumbing','electrical','hvac','appliance','structural','cosmetic','other')),
  priority      VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','emergency')),
  status        VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported','assigned','in_progress','completed','cancelled')),
  assigned_to   VARCHAR(255),
  scheduled_for TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  estimated_cost DECIMAL(10,2),
  actual_cost   DECIMAL(10,2),
  images        JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  is_read    BOOLEAN DEFAULT false,
  link       VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['users','companies','company_users','properties','tenants','leases','payments','maintenance_requests']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', tbl, tbl);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END $$;
