-- ============================================================================
-- EasyRentals Estate Management Database Schema
-- ============================================================================

-- ============================================================================
-- Estates
-- ============================================================================

CREATE TABLE estates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Zimbabwe',
    description TEXT,
    
    -- Estate Manager
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    manager_name VARCHAR(200),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    
    -- Estate Details
    total_units INTEGER NOT NULL DEFAULT 0,
    has_blocks BOOLEAN DEFAULT false,
    
    -- Service Providers
    security_company VARCHAR(255),
    security_contact VARCHAR(20),
    maintenance_company VARCHAR(255),
    maintenance_contact VARCHAR(20),
    
    -- Financial Settings
    default_levy_amount DECIMAL(10,2) DEFAULT 0,
    levy_due_day INTEGER DEFAULT 1 CHECK (levy_due_day BETWEEN 1 AND 31),
    
    -- Bank Details
    bank_name VARCHAR(255),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_branch VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_construction')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_estates_manager ON estates(manager_id);
CREATE INDEX idx_estates_city ON estates(city);
CREATE INDEX idx_estates_status ON estates(status);

-- ============================================================================
-- Estate Blocks (Optional - for estates with block structure)
-- ============================================================================

CREATE TABLE estate_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    block_name VARCHAR(100) NOT NULL,
    block_code VARCHAR(50),
    description TEXT,
    total_units INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(estate_id, block_name)
);

CREATE INDEX idx_estate_blocks_estate ON estate_blocks(estate_id);

-- ============================================================================
-- Estate Units
-- ============================================================================

CREATE TABLE estate_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    block_id UUID REFERENCES estate_blocks(id) ON DELETE SET NULL,
    
    -- Unit Identification
    unit_number VARCHAR(50) NOT NULL,
    unit_type VARCHAR(20) CHECK (unit_type IN ('apartment', 'house', 'townhouse', 'duplex', 'penthouse', 'studio', 'other')),
    
    -- Unit Details
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_meters DECIMAL(8,2),
    parking_spaces INTEGER DEFAULT 0,
    
    -- Owner Information
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_name VARCHAR(200),
    owner_phone VARCHAR(20),
    owner_email VARCHAR(255),
    owner_address TEXT,
    
    -- Tenant Information (if rented)
    tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_name VARCHAR(200),
    tenant_phone VARCHAR(20),
    tenant_email VARCHAR(255),
    
    -- Rental Property Link (optional - for integration with rentals module)
    rental_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Financial
    levy_amount DECIMAL(10,2),
    outstanding_levy DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'owner_occupied', 'under_maintenance')),
    
    -- Dates
    purchase_date DATE,
    occupancy_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(estate_id, unit_number)
);

CREATE INDEX idx_estate_units_estate ON estate_units(estate_id);
CREATE INDEX idx_estate_units_block ON estate_units(block_id);
CREATE INDEX idx_estate_units_owner ON estate_units(owner_id);
CREATE INDEX idx_estate_units_tenant ON estate_units(tenant_id);
CREATE INDEX idx_estate_units_status ON estate_units(status);
CREATE INDEX idx_estate_units_rental ON estate_units(rental_property_id);

-- ============================================================================
-- Estate Levies
-- ============================================================================

CREATE TABLE estate_levies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    
    -- Levy Period
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    
    -- Financial
    levy_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (levy_amount - paid_amount) STORED,
    
    -- Status
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    
    -- Due Date
    due_date DATE NOT NULL,
    
    -- Payment Details
    paid_date DATE,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'ecocash', 'onemoney', 'zipit', 'cheque', 'online')),
    payment_reference VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(estate_id, unit_id, month, year)
);

CREATE INDEX idx_estate_levies_estate ON estate_levies(estate_id);
CREATE INDEX idx_estate_levies_unit ON estate_levies(unit_id);
CREATE INDEX idx_estate_levies_status ON estate_levies(status);
CREATE INDEX idx_estate_levies_period ON estate_levies(year, month);
CREATE INDEX idx_estate_levies_due_date ON estate_levies(due_date);

-- ============================================================================
-- Move Ins
-- ============================================================================

CREATE TABLE estate_move_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    
    -- Resident Information
    resident_name VARCHAR(200) NOT NULL,
    resident_phone VARCHAR(20),
    resident_email VARCHAR(255),
    resident_id_number VARCHAR(100),
    
    -- Move In Details
    move_in_date DATE NOT NULL,
    lease_start_date DATE,
    lease_end_date DATE,
    
    -- Financial
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    first_month_levy_paid BOOLEAN DEFAULT false,
    
    -- Checklist
    keys_issued BOOLEAN DEFAULT false,
    keys_issued_date DATE,
    access_cards_issued INTEGER DEFAULT 0,
    
    inspection_completed BOOLEAN DEFAULT false,
    inspection_date DATE,
    inspection_notes TEXT,
    
    documents_signed BOOLEAN DEFAULT false,
    documents_signed_date DATE,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Vehicle Information
    vehicle_registration VARCHAR(50),
    vehicle_make_model VARCHAR(100),
    vehicle_color VARCHAR(50),
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_estate_move_ins_estate ON estate_move_ins(estate_id);
CREATE INDEX idx_estate_move_ins_unit ON estate_move_ins(unit_id);
CREATE INDEX idx_estate_move_ins_date ON estate_move_ins(move_in_date);

-- ============================================================================
-- Move Outs
-- ============================================================================

CREATE TABLE estate_move_outs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    move_in_id UUID REFERENCES estate_move_ins(id) ON DELETE SET NULL,
    
    -- Resident Information
    resident_name VARCHAR(200) NOT NULL,
    
    -- Notice Details
    notice_date DATE,
    notice_period_days INTEGER DEFAULT 30,
    
    -- Move Out Date
    move_out_date DATE NOT NULL,
    actual_move_out_date DATE,
    
    -- Checklist
    keys_returned BOOLEAN DEFAULT false,
    keys_returned_date DATE,
    access_cards_returned INTEGER DEFAULT 0,
    
    final_inspection_completed BOOLEAN DEFAULT false,
    final_inspection_date DATE,
    final_inspection_notes TEXT,
    
    -- Damage Assessment
    damages_recorded BOOLEAN DEFAULT false,
    damage_description TEXT,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    
    -- Cleaning
    cleaning_required BOOLEAN DEFAULT false,
    cleaning_charges DECIMAL(10,2) DEFAULT 0,
    
    -- Financial
    outstanding_rent DECIMAL(10,2) DEFAULT 0,
    outstanding_levies DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    
    deposit_refunded BOOLEAN DEFAULT false,
    deposit_refund_amount DECIMAL(10,2) DEFAULT 0,
    deposit_refund_date DATE,
    deposit_refund_method VARCHAR(20),
    
    -- Forwarding Address
    forwarding_address TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_estate_move_outs_estate ON estate_move_outs(estate_id);
CREATE INDEX idx_estate_move_outs_unit ON estate_move_outs(unit_id);
CREATE INDEX idx_estate_move_outs_date ON estate_move_outs(move_out_date);
CREATE INDEX idx_estate_move_outs_status ON estate_move_outs(status);

-- ============================================================================
-- Estate Amenities (Many-to-many relationship)
-- ============================================================================

CREATE TABLE estate_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    amenity_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT false,
    additional_cost DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_estate_amenities_estate ON estate_amenities(estate_id);

-- ============================================================================
-- Estate Documents
-- ============================================================================

CREATE TABLE estate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('title_deed', 'zoning_certificate', 'building_plan', 'insurance', 'contract', 'other')),
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_estate_documents_estate ON estate_documents(estate_id);

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE TRIGGER update_estates_updated_at BEFORE UPDATE ON estates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_blocks_updated_at BEFORE UPDATE ON estate_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_units_updated_at BEFORE UPDATE ON estate_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_levies_updated_at BEFORE UPDATE ON estate_levies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_move_ins_updated_at BEFORE UPDATE ON estate_move_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_move_outs_updated_at BEFORE UPDATE ON estate_move_outs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to update unit status based on move in/out
CREATE OR REPLACE FUNCTION update_unit_status_on_move()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'estate_move_ins' THEN
        UPDATE estate_units 
        SET status = 'occupied',
            tenant_id = NEW.resident_id,
            tenant_name = NEW.resident_name,
            occupancy_date = NEW.move_in_date,
            updated_at = NOW()
        WHERE id = NEW.unit_id;
    ELSIF TG_TABLE_NAME = 'estate_move_outs' THEN
        IF NEW.status = 'completed' THEN
            UPDATE estate_units 
            SET status = 'vacant',
                tenant_id = NULL,
                tenant_name = NULL,
                updated_at = NOW()
            WHERE id = NEW.unit_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate monthly levies
CREATE OR REPLACE FUNCTION generate_estate_levies(estate_id UUID, levy_month INTEGER, levy_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    unit_record RECORD;
    levy_count INTEGER := 0;
    levy_amount DECIMAL(10,2);
    due_date DATE;
    estate_record RECORD;
BEGIN
    -- Get estate details
    SELECT levy_due_day INTO estate_record FROM estates WHERE id = estate_id;
    due_date := make_date(levy_year, levy_month, estate_record.levy_due_day);
    
    -- Generate levies for each unit
    FOR unit_record IN 
        SELECT * FROM estate_units WHERE estate_id = estate_id
    LOOP
        -- Check if levy already exists
        IF EXISTS (
            SELECT 1 FROM estate_levies 
            WHERE unit_id = unit_record.id AND month = levy_month AND year = levy_year
        ) THEN
            CONTINUE;
        END IF;
        
        -- Determine levy amount
        levy_amount := COALESCE(unit_record.levy_amount, (SELECT default_levy_amount FROM estates WHERE id = estate_id));
        
        -- Create levy
        INSERT INTO estate_levies (
            estate_id, unit_id, month, year, levy_amount, due_date
        ) VALUES (
            estate_id, unit_record.id, levy_month, levy_year, levy_amount, due_date
        );
        
        levy_count := levy_count + 1;
    END LOOP;
    
    RETURN levy_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views
-- ============================================================================

-- Estate occupancy summary view
CREATE VIEW estate_occupancy_summary AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    COUNT(u.id) as total_units,
    COUNT(CASE WHEN u.status = 'occupied' THEN 1 END) as occupied_units,
    COUNT(CASE WHEN u.status = 'vacant' THEN 1 END) as vacant_units,
    COUNT(CASE WHEN u.status = 'owner_occupied' THEN 1 END) as owner_occupied_units,
    ROUND(COUNT(CASE WHEN u.status = 'occupied' THEN 1 END) * 100.0 / NULLIF(COUNT(u.id), 0), 2) as occupancy_rate
FROM estates e
LEFT JOIN estate_units u ON e.id = u.estate_id
WHERE e.status = 'active'
GROUP BY e.id, e.name;

-- Estate levy summary view
CREATE VIEW estate_levy_summary AS
SELECT 
    e.id as estate_id,
    e.name as estate_name,
    SUM(el.levy_amount) as total_levies,
    SUM(el.paid_amount) as total_paid,
    SUM(el.balance) as total_outstanding,
    ROUND(SUM(el.paid_amount) * 100.0 / NULLIF(SUM(el.levy_amount), 0), 2) as collection_rate
FROM estates e
LEFT JOIN estate_levies el ON e.id = el.estate_id
WHERE el.status != 'paid' OR el.status IS NULL
GROUP BY e.id, e.name;
