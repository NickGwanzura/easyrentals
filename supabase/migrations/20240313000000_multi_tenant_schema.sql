-- ============================================================================
-- Multi-Tenant White-Label Schema Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Companies (Tenants) Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    
    -- Branding
    logo_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563eb',
    secondary_color VARCHAR(7) DEFAULT '#64748b',
    accent_color VARCHAR(7) DEFAULT '#f59e0b',
    background_color VARCHAR(7) DEFAULT '#f8fafc',
    surface_color VARCHAR(7) DEFAULT '#ffffff',
    text_color VARCHAR(7) DEFAULT '#0f172a',
    custom_css TEXT,
    
    -- Email
    email_sender_name VARCHAR(255) DEFAULT 'EazyRentals',
    email_sender_email VARCHAR(255) DEFAULT 'noreply@eazyrentals.com',
    
    -- Subscription
    subscription_status VARCHAR(20) DEFAULT 'active',
    subscription_tier VARCHAR(20) DEFAULT 'basic',
    
    -- Limits
    max_users INTEGER DEFAULT 10,
    max_properties INTEGER DEFAULT 20,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(custom_domain);

-- ============================================================================
-- Company Users
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    invitation_status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user ON company_users(user_id);

-- ============================================================================
-- Add company_id columns
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_company_id UUID REFERENCES companies(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_company_id UUID REFERENCES companies(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE leases ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- ============================================================================
-- Default Company
-- ============================================================================

INSERT INTO companies (id, name, slug, subscription_status, subscription_tier, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Company', 'default', 'active', 'enterprise', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Migrate existing data
-- ============================================================================

UPDATE users SET primary_company_id = '00000000-0000-0000-0000-000000000001' WHERE primary_company_id IS NULL;
UPDATE properties SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;
UPDATE tenants SET company_id = '00000000-0000-0000-0000-000000000001' WHERE company_id IS NULL;
UPDATE agents SET company_id = '00000000-0000-0000-0000-000000000001' WHERE agents.company_id IS NULL;
UPDATE leases SET company_id = '00000000-0000-0000-0000-000000000001' WHERE leases.company_id IS NULL;
UPDATE payments SET company_id = '00000000-0000-0000-0000-000000000001' WHERE payments.company_id IS NULL;
UPDATE leads SET company_id = '00000000-0000-0000-0000-000000000001' WHERE leads.company_id IS NULL;
UPDATE maintenance_requests SET company_id = '00000000-0000-0000-0000-000000000001' WHERE maintenance_requests.company_id IS NULL;
UPDATE notifications SET company_id = '00000000-0000-0000-0000-000000000001' WHERE notifications.company_id IS NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
DECLARE
    company_id UUID;
BEGIN
    BEGIN
        company_id := current_setting('app.current_company_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        company_id := NULL;
    END;
    RETURN company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "tenant_isolation_properties" ON properties
    USING (company_id = get_current_company_id());

CREATE POLICY IF NOT EXISTS "tenant_isolation_tenants" ON tenants
    USING (company_id = get_current_company_id());

CREATE POLICY IF NOT EXISTS "tenant_isolation_leases" ON leases
    USING (company_id = get_current_company_id());

CREATE POLICY IF NOT EXISTS "tenant_isolation_payments" ON payments
    USING (company_id = get_current_company_id());

-- ============================================================================
-- End
-- ============================================================================
