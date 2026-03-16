-- ============================================================================
-- White-Label Multi-Tenant Database Schema
-- ============================================================================
-- Run this migration to add multi-tenancy support to the existing database
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Companies (Tenants) Table
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- for subdomains: slug.yourapp.com
    custom_domain VARCHAR(255) UNIQUE, -- for custom domains
    
    -- Branding (moved from localStorage to database)
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
    
    -- Email Configuration
    email_sender_name VARCHAR(255) DEFAULT 'EazyRentals',
    email_sender_email VARCHAR(255) DEFAULT 'noreply@eazyrentals.com',
    email_reply_to VARCHAR(255),
    
    -- Company Info
    description TEXT,
    website VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    
    -- Subscription/Billing
    subscription_status VARCHAR(20) DEFAULT 'trial' 
        CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'suspended')),
    subscription_tier VARCHAR(20) DEFAULT 'basic'
        CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Limits (based on subscription tier)
    max_users INTEGER DEFAULT 10,
    max_properties INTEGER DEFAULT 20,
    max_storage_mb INTEGER DEFAULT 1000, -- 1GB
    
    -- Features
    features JSONB DEFAULT '[]'::jsonb, -- ["custom_domain", "api_access", ...]
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarded_at TIMESTAMP WITH TIME ZONE,
    
    -- Owner (first admin user)
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_domain ON companies(custom_domain);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_subscription ON companies(subscription_status);

-- ============================================================================
-- Company Users (Many-to-Many with Roles)
-- ============================================================================

CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role within this company
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'agent', 'viewer')),
    
    -- Invitation status
    invitation_status VARCHAR(20) DEFAULT 'active'
        CHECK (invitation_status IN ('pending', 'active', 'removed')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);
CREATE INDEX idx_company_users_role ON company_users(role);

-- ============================================================================
-- Add company_id to existing tables
-- ============================================================================

-- Users (can belong to multiple companies via company_users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
CREATE INDEX idx_users_primary_company ON users(primary_company_id);

-- Properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_properties_company ON properties(company_id);
UPDATE properties SET company_id = (
    SELECT c.id FROM companies c LIMIT 1
) WHERE company_id IS NULL;
ALTER TABLE properties ALTER COLUMN company_id SET NOT NULL;

-- Tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_tenants_company ON tenants(company_id);

-- Agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_agents_company ON agents(company_id);

-- Leases
ALTER TABLE leases ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_leases_company ON leases(company_id);

-- Payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_payments_company ON payments(company_id);

-- Leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_leads_company ON leads(company_id);

-- Maintenance Requests
ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_maintenance_company ON maintenance_requests(company_id);

-- Estate Management Tables
ALTER TABLE estates ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_estates_company ON estates(company_id);

ALTER TABLE estate_units ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_estate_units_company ON estate_units(company_id);

ALTER TABLE estate_levies ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_estate_levies_company ON estate_levies(company_id);

ALTER TABLE estate_expenses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_estate_expenses_company ON estate_expenses(company_id);

-- Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_notifications_company ON notifications(company_id);

-- Audit Logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to get current company ID from session
CREATE OR REPLACE FUNCTION get_current_company_id()
RETURNS UUID AS $$
BEGIN
    -- Get company_id from current session variable
    -- This is set by the application based on the user's active company
    RETURN current_setting('app.current_company_id', true)::UUID;
END;
$$ LANGUAGE plpgsql;

-- Policies for properties
CREATE POLICY "tenant_isolation_properties" ON properties
    USING (company_id = get_current_company_id());

-- Policies for tenants
CREATE POLICY "tenant_isolation_tenants" ON tenants
    USING (company_id = get_current_company_id());

-- Policies for agents
CREATE POLICY "tenant_isolation_agents" ON agents
    USING (company_id = get_current_company_id());

-- Policies for leases
CREATE POLICY "tenant_isolation_leases" ON leases
    USING (company_id = get_current_company_id());

-- Policies for payments
CREATE POLICY "tenant_isolation_payments" ON payments
    USING (company_id = get_current_company_id());

-- Policies for leads
CREATE POLICY "tenant_isolation_leads" ON leads
    USING (company_id = get_current_company_id());

-- Policies for maintenance_requests
CREATE POLICY "tenant_isolation_maintenance" ON maintenance_requests
    USING (company_id = get_current_company_id());

-- Policies for notifications (user sees own + company-wide)
CREATE POLICY "tenant_isolation_notifications" ON notifications
    USING (
        company_id = get_current_company_id() 
        AND (user_id = auth.uid() OR user_id IS NULL)
    );

-- ============================================================================
-- Company Activity Log
-- ============================================================================

CREATE TABLE company_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(50) NOT NULL, -- 'user_invited', 'branding_updated', etc.
    entity_type VARCHAR(50), -- 'user', 'property', 'setting'
    entity_id UUID,
    
    details JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_company_activity_company ON company_activity_log(company_id);
CREATE INDEX idx_company_activity_created ON company_activity_log(created_at);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Default Company (for migration)
-- ============================================================================

-- Create a default company for existing data
INSERT INTO companies (
    id,
    name, 
    slug, 
    subscription_status,
    subscription_tier,
    status,
    onboarded_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Company',
    'default',
    'active',
    'enterprise',
    'active',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Set all existing users to primary company
UPDATE users SET primary_company_id = '00000000-0000-0000-0000-000000000001' 
WHERE primary_company_id IS NULL;

-- Set all existing data to default company
UPDATE properties SET company_id = '00000000-0000-0000-0000-000000000001' 
WHERE company_id IS NULL;

UPDATE tenants SET company_id = '00000000-0000-0000-0000-000000000001' 
WHERE company_id IS NULL;

-- (Continue for all tables...)

-- ============================================================================
-- Views for Multi-Tenant Queries
-- ============================================================================

-- Company dashboard stats
CREATE VIEW company_dashboard_stats AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(DISTINCT t.id) as total_tenants,
    COUNT(DISTINCT cu.user_id) as total_users,
    SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END) as total_revenue
FROM companies c
LEFT JOIN properties p ON p.company_id = c.id
LEFT JOIN tenants t ON t.company_id = c.id
LEFT JOIN company_users cu ON cu.company_id = c.id AND cu.invitation_status = 'active'
LEFT JOIN payments pay ON pay.company_id = c.id
GROUP BY c.id, c.name;

-- ============================================================================
-- End of Migration
-- ============================================================================
