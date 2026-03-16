-- ============================================================================
-- Pricing & Subscriptions Schema (Fixed)
-- ============================================================================

-- Subscription Plans (Pricing Tiers)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    max_properties INTEGER NOT NULL,
    max_tenants INTEGER NOT NULL,
    max_users INTEGER NOT NULL,
    max_storage_gb INTEGER DEFAULT 10,
    max_api_calls_per_month INTEGER DEFAULT 1000,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
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
    status VARCHAR(20) DEFAULT 'trialing',
    billing_interval VARCHAR(20) DEFAULT 'month',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancellation_reason TEXT,
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

-- Usage Tracking
CREATE TABLE IF NOT EXISTS company_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_company ON company_usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_type ON company_usage_logs(usage_type);

-- Invoices
CREATE TABLE IF NOT EXISTS company_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES company_subscriptions(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    line_items JSONB DEFAULT '[]'::jsonb,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    stripe_invoice_id VARCHAR(255),
    stripe_invoice_pdf_url TEXT,
    stripe_invoice_hosted_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_company ON company_invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON company_invoices(status);

-- Add-on Pricing
CREATE TABLE IF NOT EXISTS addon_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,4) NOT NULL,
    unit_name VARCHAR(50),
    billing_interval VARCHAR(20) DEFAULT 'month',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    min_plan_id UUID REFERENCES subscription_plans(id),
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
(
    '11111111-1111-1111-1111-111111111111',
    'Starter', 'starter', 'Perfect for individual landlords',
    49.00, 39.00, 5, 20, 2, 2, 100,
    '["basic_branding", "property_management", "tenant_tracking", "payment_tracking", "basic_reporting", "maintenance_requests", "email_support"]',
    1, true, true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Growth', 'growth', 'Ideal for small property management companies',
    149.00, 119.00, 50, 200, 5, 10, 10000,
    '["custom_domain", "remove_badge", "full_branding", "advanced_analytics", "automated_reminders", "lease_management", "document_storage", "basic_api", "owner_statements", "priority_support"]',
    2, true, true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Professional', 'professional', 'For medium-sized agencies',
    399.00, 319.00, 200, 1000, 20, 100, 100000,
    '["multiple_domains", "owner_portal", "advanced_api", "custom_integrations", "budget_tools", "automated_workflows", "bulk_tools", "dedicated_manager", "phone_support"]',
    3, true, true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Enterprise', 'enterprise', 'Custom solutions for large companies',
    999.00, 799.00, 999999, 999999, 999999, 999999, 999999999,
    '["unlimited_everything", "sla_guarantee", "dedicated_infrastructure", "24_7_support", "custom_development", "on_premise_option", "multi_region"]',
    4, true, false
)
ON CONFLICT (id) DO NOTHING;

-- Seed Add-ons
INSERT INTO addon_pricing (name, slug, description, unit_price, unit_name, billing_interval) VALUES
('Extra Property', 'extra_property', 'Additional property', 2.00, 'property', 'month'),
('Extra Team Member', 'extra_user', 'Additional user', 10.00, 'user', 'month'),
('SMS Notification', 'sms', 'SMS message', 0.05, 'sms', 'one_time'),
('Extra Storage', 'extra_storage', 'Additional 10GB', 5.00, '10GB', 'month'),
('API Calls', 'api_calls', 'Additional API calls', 0.001, 'call', 'one_time')
ON CONFLICT (slug) DO NOTHING;

-- Seed Feature Flags
INSERT INTO feature_flags (name, slug, description, allowed_plan_ids) VALUES
('Custom Domain', 'custom_domain', 'Use your own domain', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('Remove Badge', 'remove_badge', 'Remove branding', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]'),
('API Access', 'api_access', 'REST API access', '["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333", "44444444-4444-4444-4444-444444444444"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Views (Fixed - using explicit table aliases)
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS mrr_summary;
DROP VIEW IF EXISTS subscriptions_by_plan;

-- Monthly Recurring Revenue View
CREATE OR REPLACE VIEW mrr_summary AS
SELECT 
    DATE_TRUNC('month', cs.created_at) as month,
    cs.plan_id,
    sp.name as plan_name,
    COUNT(*) as new_subscriptions,
    SUM(CASE 
        WHEN cs.billing_interval = 'month' THEN sp.monthly_price 
        ELSE sp.annual_price / 12 
    END) as mrr_added
FROM company_subscriptions cs
JOIN subscription_plans sp ON cs.plan_id = sp.id
WHERE cs.status IN ('active', 'trialing')
GROUP BY DATE_TRUNC('month', cs.created_at), cs.plan_id, sp.name
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
