-- ============================================================================
-- EazyRentals Database Schema
-- ============================================================================
-- This schema supports PostgreSQL/Supabase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users & Authentication
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'landlord', 'agent', 'tenant')),
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- Properties
-- ============================================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Property Details
    type VARCHAR(20) NOT NULL CHECK (type IN ('apartment', 'house', 'condo', 'townhouse', 'commercial')),
    status VARCHAR(20) NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance', 'inactive')),
    bedrooms INTEGER DEFAULT 0,
    bathrooms DECIMAL(3,1) DEFAULT 0,
    square_feet INTEGER,
    year_built INTEGER,
    
    -- Financial
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    
    -- Relationships
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Amenities (stored as JSON array)
    amenities JSONB DEFAULT '[]',
    
    -- Media
    featured_image_url TEXT,
    images JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(city, state);

-- ============================================================================
-- Tenants (Extended profile for tenant users)
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Info
    date_of_birth DATE,
    ssn_last_four VARCHAR(4), -- Only store last 4 digits for security
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Employment
    employer VARCHAR(200),
    employment_status VARCHAR(20) CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'student', 'retired')),
    monthly_income DECIMAL(10,2),
    
    -- Current Rental
    current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'evicted')),
    credit_score INTEGER,
    background_check_status VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
    
    -- Documents
    documents JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tenants_user ON tenants(user_id);
CREATE INDEX idx_tenants_property ON tenants(current_property_id);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================================
-- Agents (Extended profile for agent users)
-- ============================================================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Professional Info
    license_number VARCHAR(100),
    license_expiry DATE,
    
    -- Relationships
    landlord_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Performance
    commission_rate DECIMAL(5,2) DEFAULT 0.05,
    total_deals_closed INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_landlord ON agents(landlord_id);

-- ============================================================================
-- Property-Agents (Many-to-many relationship)
-- ============================================================================

CREATE TABLE property_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT false,
    
    UNIQUE(property_id, agent_id)
);

CREATE INDEX idx_property_agents_property ON property_agents(property_id);
CREATE INDEX idx_property_agents_agent ON property_agents(agent_id);

-- ============================================================================
-- Leases
-- ============================================================================

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Financial
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    late_fee_amount DECIMAL(10,2) DEFAULT 50.00,
    
    -- Terms
    payment_due_day INTEGER DEFAULT 1 CHECK (payment_due_day BETWEEN 1 AND 31),
    grace_period_days INTEGER DEFAULT 5,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
    
    -- Documents
    documents JSONB DEFAULT '[]',
    
    -- Termination
    terminated_at TIMESTAMP WITH TIME ZONE,
    termination_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);

-- ============================================================================
-- Payments
-- ============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('rent', 'deposit', 'late_fee', 'maintenance', 'other')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partial', 'failed')),
    method VARCHAR(20) CHECK (method IN ('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'money_order', 'online')),
    
    -- Period
    payment_for_month INTEGER NOT NULL CHECK (payment_for_month BETWEEN 1 AND 12),
    payment_for_year INTEGER NOT NULL,
    
    -- Dates
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Reference
    transaction_id VARCHAR(255),
    check_number VARCHAR(100),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_dates ON payments(due_date, paid_date);
CREATE INDEX idx_payments_period ON payments(payment_for_year, payment_for_month);

-- ============================================================================
-- Leads (Prospective Tenants)
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Contact Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Inquiry
    message TEXT,
    preferred_move_in_date DATE,
    budget DECIMAL(10,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'application_submitted', 'approved', 'rejected', 'converted')),
    source VARCHAR(20) CHECK (source IN ('website', 'referral', 'social_media', 'walk_in', 'other')),
    
    -- Conversion
    converted_to_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_agent ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);

-- ============================================================================
-- Maintenance Requests
-- ============================================================================

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Issue
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'cosmetic', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_to VARCHAR(255),
    
    -- Dates
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Cost
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Media
    images JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_tenant ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);

-- ============================================================================
-- Audit Logs
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'property', 'tenant', 'payment'
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- Notifications
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================================
-- Company Settings
-- ============================================================================

CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- For landlords/admins
    
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    website VARCHAR(255),
    logo_url TEXT,
    
    -- Branding
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    accent_color VARCHAR(7) DEFAULT '#22c55e',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- User Preferences
-- ============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    currency VARCHAR(3) DEFAULT 'USD',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update property status when lease is created/updated
CREATE OR REPLACE FUNCTION update_property_status_on_lease()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE properties SET status = 'occupied', current_tenant_id = NEW.tenant_id WHERE id = NEW.property_id;
    ELSIF NEW.status = 'terminated' OR NEW.status = 'expired' THEN
        UPDATE properties SET status = 'vacant', current_tenant_id = NULL WHERE id = NEW.property_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_property_status
AFTER INSERT OR UPDATE ON leases
FOR EACH ROW EXECUTE FUNCTION update_property_status_on_lease();

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- Property overview view
CREATE VIEW property_overview AS
SELECT 
    p.*,
    u.first_name as landlord_first_name,
    u.last_name as landlord_last_name,
    u.email as landlord_email,
    t.user_id as tenant_user_id
FROM properties p
LEFT JOIN users u ON p.landlord_id = u.id
LEFT JOIN tenants t ON p.current_tenant_id = t.id;

-- Payment summary view
CREATE VIEW payment_summary AS
SELECT 
    p.*,
    u.first_name as tenant_first_name,
    u.last_name as tenant_last_name,
    prop.title as property_title
FROM payments p
JOIN tenants t ON p.tenant_id = t.id
JOIN users u ON t.user_id = u.id
JOIN properties prop ON p.property_id = prop.id;

-- Lease details view
CREATE VIEW lease_details AS
SELECT 
    l.*,
    p.title as property_title,
    p.address as property_address,
    u.first_name as tenant_first_name,
    u.last_name as tenant_last_name
FROM leases l
JOIN properties p ON l.property_id = p.id
JOIN tenants t ON l.tenant_id = t.id
JOIN users u ON t.user_id = u.id;
