-- ============================================================================
-- Supabase Auth Schema for EazyRentals
-- ============================================================================
-- Run this in Supabase SQL Editor after setting up your project
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Profiles Table (extends Supabase Auth users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'landlord', 'agent', 'tenant')),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
    ON profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" 
    ON profiles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow insert on profile creation (trigger will handle this)
CREATE POLICY "Enable insert for authenticated users only" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Index on profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================================
-- Properties Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
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
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Relationships
    landlord_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    current_tenant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
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

-- Enable RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Properties are viewable by authenticated users" 
    ON properties FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Landlords can insert their own properties" 
    ON properties FOR INSERT 
    TO authenticated 
    WITH CHECK (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Landlords can update their own properties" 
    ON properties FOR UPDATE 
    TO authenticated 
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'agent')
        )
    );

CREATE POLICY "Landlords can delete their own properties" 
    ON properties FOR DELETE 
    TO authenticated 
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Indexes on properties
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(city, state);

-- ============================================================================
-- Tenants Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Personal Info
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Employment
    employer VARCHAR(200),
    employment_status VARCHAR(20) CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'student', 'retired')),
    monthly_income DECIMAL(10,2),
    
    -- Current Rental
    current_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    lease_start_date DATE,
    lease_end_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'evicted')),
    credit_score INTEGER,
    background_check_status VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'passed', 'failed')),
    
    -- Documents
    documents JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants policies
CREATE POLICY "Tenants can view their own record" 
    ON tenants FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "Landlords and admins can view all tenants" 
    ON tenants FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord', 'agent')
        )
    );

CREATE POLICY "Admins can insert tenants" 
    ON tenants FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

CREATE POLICY "Admins and landlords can update tenants" 
    ON tenants FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

-- Indexes on tenants
CREATE INDEX idx_tenants_user ON tenants(user_id);
CREATE INDEX idx_tenants_property ON tenants(current_property_id);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ============================================================================
-- Leases Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Financial
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
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

-- Enable RLS on leases
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

-- Leases policies
CREATE POLICY "Tenants can view their own leases" 
    ON leases FOR SELECT 
    TO authenticated 
    USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Landlords and admins can view all leases" 
    ON leases FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord', 'agent')
        )
    );

CREATE POLICY "Landlords can manage their leases" 
    ON leases FOR ALL 
    TO authenticated 
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Indexes on leases
CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);

-- ============================================================================
-- Payments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
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
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Tenants can view their own payments" 
    ON payments FOR SELECT 
    TO authenticated 
    USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Landlords and admins can view all payments" 
    ON payments FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

CREATE POLICY "Landlords can manage payments" 
    ON payments FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

-- Indexes on payments
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_dates ON payments(due_date, paid_date);

-- ============================================================================
-- Leads Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
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

-- Enable RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Agents can view assigned leads" 
    ON leads FOR SELECT 
    TO authenticated 
    USING (
        agent_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

CREATE POLICY "Agents can manage their leads" 
    ON leads FOR ALL 
    TO authenticated 
    USING (
        agent_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord')
        )
    );

-- Indexes on leads
CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_agent ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(status);

-- ============================================================================
-- Maintenance Requests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
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

-- Enable RLS on maintenance_requests
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Maintenance policies
CREATE POLICY "Tenants can view their own requests" 
    ON maintenance_requests FOR SELECT 
    TO authenticated 
    USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Landlords and agents can view all requests" 
    ON maintenance_requests FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord', 'agent')
        )
    );

CREATE POLICY "Tenants can create requests" 
    ON maintenance_requests FOR INSERT 
    TO authenticated 
    WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Landlords can update requests" 
    ON maintenance_requests FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'landlord', 'agent')
        )
    );

-- Indexes on maintenance_requests
CREATE INDEX idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_tenant ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);

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

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leases_updated_at ON leases;
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_updated_at ON maintenance_requests;
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
        COALESCE(NEW.raw_user_meta_data->>'phone', null)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Storage Buckets (for file uploads)
-- ============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('properties', 'properties', true),
    ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'properties');

CREATE POLICY "Landlords can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'properties' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'landlord')
    )
);
