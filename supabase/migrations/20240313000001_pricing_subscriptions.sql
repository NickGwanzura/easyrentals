-- ============================================================================
-- Pricing & Subscriptions Schema
-- ============================================================================

-- Subscription Plans (Pricing Tiers)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Plan Details
    name VARCHAR(100) NOT NULL, -- 'Starter', 'Growth', 'Professional', 'Enterprise'
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'starter', 'growth', 'pro', 'enterprise'
    description TEXT,
    
    -- Pricing
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) NOT NULL, -- Usually 20% discount
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Limits
    max_properties INTEGER NOT NULL,
    max_tenants INTEGER NOT NULL,
    max_users INTEGER NOT NULL,
    max_storage_gb INTEGER DEFAULT 10,
    max_api_calls_per_month INTEGER DEFAULT 1000,
    
    -- Features (JSON array of feature slugs)
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Plan Settings
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- Show on pricing page
    sort_order INTEGER DEFAULT 0,
    
    -- Stripe Integration
    stripe_product_id VARCHAR(255),
    stripe_monthly_price_id VARCHAR(255),
    stripe_annual_price_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Subscriptions
CREATE TABLE IF NOT EXISTS company_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription Status
    status VARCHAR(20) DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'paused'
    
    -- Billing Cycle
    billing_interval VARCHAR(20) DEFAULT 'month', -- 'month', 'year'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Trial
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Stripe Integration
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    
    -- Cancellation
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
    
    -- Usage Tracking (for overages)
    current_properties_count INTEGER DEFAULT 0,
    current_users_count INTEGER DEFAULT 0,
    current_storage_used_gb DECIMAL(10,2) DEFAULT 0,
    current_api_calls_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON company_subscriptions(current_period_end);

-- Usage Tracking (for overages)
CREATE TABLE IF NOT EXISTS company_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Usage Type
    usage_type VARCHAR(50) NOT NULL, -- 'property', 'tenant', 'user', 'storage', 'api_call', 'sms'
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_company ON company_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_type ON company_usage_logs(usage_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON company_usage_logs(created_at);

-- Invoices
CREATE TABLE IF NOT EXISTS company_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES company_subscriptions(id),
    
    -- Invoice Details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void', 'uncollectible'
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Line Items (JSON)
    line_items JSONB DEFAULT '[]'::jsonb,
    
    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Stripe Integration
    stripe_invoice_id VARCHAR(255),
    stripe_invoice_pdf_url TEXT,
    stripe_invoice_hosted_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company ON company_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON company_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON company_invoices(invoice_date);

-- Add-ons / Extra Usage Pricing
CREATE TABLE IF NOT EXISTS addon_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL, -- 'Extra Property', 'Extra User', 'SMS Credits'
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'extra_property', 'extra_user', 'sms'
    description TEXT,
    
    unit_price DECIMAL(10,4) NOT NULL, -- Price per unit
    unit_name VARCHAR(50), -- 'property', 'user', 'sms', 'GB'
    billing_interval VARCHAR(20) DEFAULT 'month', -- 'month', 'one_time'
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Flags (for gating features by plan)
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(100) NOT NULL, -- 'Custom Domain', 'API Access', 'Advanced Reports'
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'custom_domain', 'api_access', 'advanced_reports'
    description TEXT,
    
    -- Minimum plan required
    min_plan_id UUID REFERENCES subscription_plans(id),
    
    -- Alternative: specify which plans have access
    allowed_plan_ids JSONB DEFAULT '[]'::jsonb,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Seed Data - Default Pricing Plans
-- ============================================================================

INSERT INTO subscription_plans (
    id, name, slug, description, monthly_price, annual_price,
    max_properties, max_tenants, max_users, max_storage_gb, max_api_calls_per_month,
    features, sort_order, is_active, is_public
) VALUES 
-- Starter Plan
(
    '11111111-1111-1111-1111-111111111111',
    'Starter',
    'starter',
    'Perfect for individual landlords managing a few properties',
    49.00, 39.00,
    5, 20, 2, 2, 100,
    '["basic_branding", "property_management", "tenant_tracking", "payment_tracking", "basic_reporting", "maintenance_requests", "email_support"]',
    1, true, true
),
-- Growth Plan
(
    '22222222-2222-2222-2222-222222222222',
    'Growth',
    'growth',
    'Ideal for small property management companies',
    149.00, 119.00,
    50, 200, 5, 10, 10000,
    '["custom_domain", "remove_badge", "full_branding", "advanced_analytics", "automated_reminders", "lease_management", "document_storage", "basic_api", "owner_statements", "priority_support"]',
    2, true, true
),
-- Professional Plan
(
    '33333333-3333-3333-3333-333333333333',
    'Professional',
    'professional',
    'For medium-sized property management agencies',
    399.00, 319.00,
    200, 1000, 20, 100, 100000,
    '["multiple_domains", "owner_portal", "advanced_api", "custom_integrations", "budget_tools", "automated_workflows", "bulk_tools", "dedicated_manager", "phone_support"]',
    3, true, true
),
-- Enterprise Plan
(
    '44444444-4444-4444-4444-444444444444',
    'Enterprise',
    'enterprise',
    'Custom solutions for large property management companies',
    999.00, 799.00,
    999999, 999999, 999999, 999999, 999999999,
    '["unlimited_everything", "sla_guarantee", "dedicated_infrastructure", "24_7_support", "custom_development", "on_premise_option", "multi_region"]',
    4, true, false -- Hidden from public pricing page
)
ON CONFLICT (id) DO NOTHING;

-- Seed Add-on Pricing
INSERT INTO addon_pricing (name, slug, description, unit_price, unit_name, billing_interval) VALUES
('Extra Property', 'extra_property', 'Additional property beyond plan limit', 2.00, 'property', 'month'),
('Extra Team Member', 'extra_user', 'Additional user beyond plan limit', 10.00, 'user', 'month'),
('SMS Notification', 'sms', 'SMS message to tenants', 0.05, 'sms', 'one_time'),
('Extra Storage', 'extra_storage', 'Additional 10GB storage', 5.00, '10GB', 'month'),
('API Calls', 'api_calls', 'Additional API calls beyond quota', 0.001, 'call', 'one_time'),
('Premium Support', 'premium_support', '1-hour response time guarantee', 199.00, 'month', 'month')
ON CONFLICT (slug) DO NOTHING;

-- Seed Feature Flags
INSERT INTO feature_flags (name, slug, description, allowed_plan_ids) VALUES
('Custom Domain', 'custom_domain', 'Use your own domain name', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Remove Powered By Badge', 'remove_badge', 'Remove EazyRentals branding', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('API Access', 'api_access', 'Access to REST API', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Advanced Analytics', 'advanced_analytics', 'Detailed reporting and analytics', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Owner Portal', 'owner_portal', 'Separate portal for property owners', '["33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Custom Integrations', 'custom_integrations', 'Build custom integrations', '["33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Automated Workflows', 'automated_workflows', 'Create automation rules', '["33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('24/7 Phone Support', 'phone_support_24_7', 'Round-the-clock phone support', '["44444444-4444-4444-4444-444444444444"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Views for Reporting
-- ============================================================================

-- Monthly Recurring Revenue (MRR) View
CREATE OR REPLACE VIEW mrr_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    plan_id,
    sp.name as plan_name,
    COUNT(*) as new_subscriptions,
    SUM(CASE 
        WHEN billing_interval = 'month' THEN sp.monthly_price 
        ELSE sp.annual_price / 12 
    END) as mrr_added
FROM company_subscriptions cs
JOIN subscription_plans sp ON cs.plan_id = sp.id
WHERE status IN ('active', 'trialing')
GROUP BY DATE_TRUNC('month', created_at), plan_id, sp.name
ORDER BY month DESC;

-- Active Subscriptions by Plan
CREATE OR REPLACE VIEW subscriptions_by_plan AS
SELECT 
    sp.name as plan_name,
    sp.monthly_price,
    COUNT(cs.id) as active_subscriptions,
    SUM(CASE 
        WHEN cs.billing_interval = 'month' THEN sp.monthly_price 
        ELSE sp.annual_price / 12 
    END) as total_mrr
FROM subscription_plans sp
LEFT JOIN company_subscriptions cs ON sp.id = cs.plan_id AND cs.status = 'active'
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.monthly_price
ORDER BY sp.sort_order;

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_subscriptions_updated_at ON company_subscriptions;
CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_invoices_updated_at ON company_invoices;
CREATE TRIGGER update_company_invoices_updated_at BEFORE UPDATE ON company_invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- End
-- ============================================================================
