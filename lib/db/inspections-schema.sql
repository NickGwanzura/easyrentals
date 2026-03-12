-- ============================================================================
-- EasyRentals House Inspections Database Schema
-- ============================================================================
-- This schema supports both Routine Inspections and Move-in/Move-out Inspections
-- ============================================================================

-- ============================================================================
-- Inspection Types
-- ============================================================================

-- Main Inspections Table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Inspection Type
    inspection_type VARCHAR(20) NOT NULL CHECK (inspection_type IN ('routine', 'move_in', 'move_out', 'final', 'safety', 'emergency')),
    
    -- Property/Unit References (supports both Properties and Estate Units)
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
    estate_unit_id UUID REFERENCES estate_units(id) ON DELETE CASCADE,
    
    -- Tenant (for move-in/move-out)
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Lease Reference
    lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
    
    -- Inspection Details
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    completed_date DATE,
    inspector_name VARCHAR(200),
    inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    
    -- Overall Rating
    overall_condition VARCHAR(20) CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    
    -- Notes
    general_notes TEXT,
    landlord_notified BOOLEAN DEFAULT false,
    tenant_notified BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_inspections_property ON inspections(property_id);
CREATE INDEX idx_inspections_estate_unit ON inspections(estate_unit_id);
CREATE INDEX idx_inspections_type ON inspections(inspection_type);
CREATE INDEX idx_inspections_status ON inspections(status_type);
CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_date);
CREATE INDEX idx_inspections_tenant ON inspections(tenant_id);

-- ============================================================================
-- Inspection Checklist Categories
-- ============================================================================

CREATE TABLE inspection_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default inspection categories
INSERT INTO inspection_categories (name, description, icon, display_order, is_default) VALUES
('Kitchen', 'Kitchen appliances and fixtures', 'Chef', 1, true),
('Bathroom', 'Bathroom fixtures and plumbing', 'Bath', 2, true),
('Living Areas', 'Living room and dining areas', 'Sofa', 3, true),
('Bedrooms', 'Bedroom condition and fixtures', 'Bed', 4, true),
('Flooring', 'Floors, carpets, and tiles', 'Layers', 5, true),
('Walls & Ceiling', 'Wall paint and ceiling condition', 'Paintbrush', 6, true),
('Windows & Doors', 'Windows, doors, and locks', 'DoorOpen', 7, true),
('Electrical', 'Outlets, switches, and lighting', 'Zap', 8, true),
('Plumbing', 'Pipes, faucets, and water fixtures', 'Droplets', 9, true),
('Exterior', 'Balcony, garden, and exterior areas', 'Sun', 10, true),
('Appliances', 'All included appliances', 'Refrigerator', 11, true),
('Safety', 'Smoke detectors, fire extinguishers', 'Shield', 12, true);

-- ============================================================================
-- Inspection Checklist Items
-- ============================================================================

CREATE TABLE inspection_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES inspection_categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_critical BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default checklist items per category
INSERT INTO inspection_checklist_items (category_id, name, description, is_critical, is_default, display_order)
SELECT 
    ic.id,
    item.name,
    item.description,
    item.is_critical,
    true,
    item.display_order
FROM inspection_categories ic
CROSS JOIN (
    -- Kitchen items
    VALUES
    ('Kitchen', 'Sink and faucet', 'Check for leaks, proper drainage', true, 1),
    ('Kitchen', 'Oven/Range', 'Check burners, oven function, cleanliness', false, 2),
    ('Kitchen', 'Refrigerator', 'Check cooling, cleanliness', false, 3),
    ('Kitchen', 'Dishwasher', 'Check function and drainage', false, 4),
    ('Kitchen', 'Microwave', 'Check function', false, 5),
    ('Kitchen', 'Cabinets', 'Check doors, handles, condition', false, 6),
    ('Kitchen', 'Countertops', 'Check for damage, stains', false, 7),
    ('Kitchen', 'Exhaust fan', 'Check function', false, 8),
    -- Bathroom items
    ('Bathroom', 'Toilet', 'Check flush, leaks, stability', true, 1),
    ('Bathroom', 'Sink/Faucet', 'Check for leaks, drainage', true, 2),
    ('Bathroom', 'Shower/Tub', 'Check drainage, leaks, caulking', true, 3),
    ('Bathroom', 'Mirror/Cabinet', 'Check condition', false, 4),
    ('Bathroom', 'Towel rails', 'Check stability', false, 5),
    ('Bathroom', 'Ventilation', 'Check fan function', false, 6),
    ('Bathroom', 'Tiles', 'Check for cracks, missing grout', false, 7),
    -- Living Areas
    ('Living Areas', 'Walls', 'Check for marks, holes, paint condition', false, 1),
    ('Living Areas', 'Ceiling', 'Check for stains, cracks', false, 2),
    ('Living Areas', 'Flooring', 'Check for damage, wear', true, 3),
    ('Living Areas', 'Light fixtures', 'Check function, bulbs', false, 4),
    ('Living Areas', 'Outlets', 'Check function, cover plates', true, 5),
    ('Living Areas', 'Windows', 'Check operation, locks', true, 6),
    ('Living Areas', 'Doors', 'Check operation, locks', true, 7),
    -- Bedrooms
    ('Bedrooms', 'Walls/Ceiling', 'Check condition', false, 1),
    ('Bedrooms', 'Flooring/Carpet', 'Check for wear, stains', false, 2),
    ('Bedrooms', 'Wardrobes', 'Check doors, mirrors', false, 3),
    ('Bedrooms', 'Windows', 'Check operation, locks', true, 4),
    ('Bedrooms', 'Outlets', 'Check function', false, 5),
    ('Bedrooms', 'Light fixtures', 'Check function', false, 6),
    -- Flooring
    ('Flooring', 'Hardwood floors', 'Check for scratches, damage', false, 1),
    ('Flooring', 'Tile floors', 'Check for cracks, missing grout', false, 2),
    ('Flooring', 'Carpet', 'Check for stains, wear', false, 3),
    ('Flooring', 'Vinyl/Laminate', 'Check for peeling, damage', false, 4),
    ('Flooring', 'General cleanliness', 'Check overall cleanliness', false, 5),
    -- Walls & Ceiling
    ('Walls & Ceiling', 'Paint condition', 'Check for peeling, fading', false, 1),
    ('Walls & Ceiling', 'Wall marks/damage', 'Check for holes, marks', false, 2),
    ('Walls & Ceiling', 'Ceiling cracks', 'Check for cracks, water stains', true, 3),
    ('Walls & Ceiling', 'Mold/Mildew', 'Check for moisture issues', true, 4),
    -- Windows & Doors
    ('Windows & Doors', 'Window operation', 'Check opens/closes properly', true, 1),
    ('Windows & Doors', 'Window locks', 'Check security', true, 2),
    ('Windows & Doors', 'Door operation', 'Check opens/closes properly', true, 3),
    ('Windows & Doors', 'Door locks', 'Check security', true, 4),
    ('Windows & Doors', 'Handles/Hinges', 'Check condition', false, 5),
    ('Windows & Doors', 'Flyscreens', 'Check condition', false, 6),
    -- Electrical
    ('Electrical', 'Power outlets', 'Test all outlets', true, 1),
    ('Electrical', 'Light switches', 'Check function', false, 2),
    ('Electrical', 'Ceiling fans', 'Check operation', false, 3),
    ('Electrical', 'Air conditioning', 'Check function', false, 4),
    ('Electrical', 'Smoke detectors', 'Check batteries, function', true, 5),
    ('Electrical', 'Electrical panel', 'Check condition', true, 6),
    -- Plumbing
    ('Plumbing', 'Water pressure', 'Check all fixtures', true, 1),
    ('Plumbing', 'Drainage', 'Check all drains', true, 2),
    ('Plumbing', 'Hot water system', 'Check function', true, 3),
    ('Plumbing', 'Pipes visible', 'Check for leaks', true, 4),
    ('Plumbing', 'Outdoor taps', 'Check function', false, 5),
    -- Exterior
    ('Exterior', 'Balcony/Patio', 'Check condition', true, 1),
    ('Exterior', 'Garden/Grounds', 'Check maintenance', false, 2),
    ('Exterior', 'Parking', 'Check condition', false, 3),
    ('Exterior', 'External walls', 'Check condition', false, 4),
    ('Exterior', 'Roof', 'Check visible condition', true, 5),
    -- Appliances
    ('Appliances', 'Washing machine', 'Check function', false, 1),
    ('Appliances', 'Dryer', 'Check function', false, 2),
    ('Appliances', 'All provided appliances', 'List and test all', false, 3),
    -- Safety
    ('Safety', 'Smoke alarms', 'Test and check batteries', true, 1),
    ('Safety', 'Fire extinguisher', 'Check expiry, location', true, 2),
    ('Safety', 'Emergency exits', 'Check accessibility', true, 3),
    ('Safety', 'Security system', 'Check function', false, 4),
    ('Safety', 'Safety switches', 'Test RCD/safety switches', true, 5)
) AS item(name, description, is_critical, display_order)
WHERE ic.name = item.name;

-- ============================================================================
-- Inspection Responses (Checklist Answers)
-- ============================================================================

CREATE TABLE inspection_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id UUID NOT NULL REFERENCES inspection_checklist_items(id) ON DELETE CASCADE,
    
    -- Response
    status VARCHAR(20) NOT NULL CHECK (status IN ('good', 'fair', 'poor', 'not_applicable', 'not_inspected')),
    condition_notes TEXT,
    requires_maintenance BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspection_responses_inspection ON inspection_responses(inspection_id);
CREATE UNIQUE INDEX idx_inspection_responses_item ON inspection_responses(inspection_id, checklist_item_id);

-- ============================================================================
-- Inspection Photos
-- ============================================================================

CREATE TABLE inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_response_id UUID REFERENCES inspection_responses(id) ON DELETE SET NULL,
    
    -- Photo Details
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50),
    
    -- Photo Metadata
    caption TEXT,
    photo_type VARCHAR(20) CHECK (photo_type IN ('before', 'during', 'after', 'issue', 'general')),
    taken_by UUID REFERENCES users(id) ON DELETE SET NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Location reference
    category_id UUID REFERENCES inspection_categories(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspection_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_inspection_photos_response ON inspection_photos(checklist_response_id);

-- ============================================================================
-- Inspection Maintenance Issues
-- ============================================================================

CREATE TABLE inspection_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_response_id UUID REFERENCES inspection_responses(id) ON DELETE SET NULL,
    
    -- Issue Details
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'deferred')),
    
    -- Resolution
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Cost
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- References
    maintenance_request_id UUID REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspection_issues_inspection ON inspection_issues(inspection_id);
CREATE INDEX idx_inspection_issues_status ON inspection_issues(status);

-- ============================================================================
-- Inspection Templates (for different property types)
-- ============================================================================

CREATE TABLE inspection_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    property_type VARCHAR(20) CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse', 'commercial')),
    is_default BOOLEAN DEFAULT false,
    
    -- Categories included (JSON array of category IDs)
    categories JSONB DEFAULT '[]',
    
    -- Created/Updated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Default templates
INSERT INTO inspection_templates (name, description, property_type, is_default) VALUES
('Standard Apartment', 'Standard inspection template for apartments', 'apartment', true),
('Standard House', 'Standard inspection template for houses', 'house', true),
('Standard Condo', 'Standard inspection template for condos', 'condo', true),
('Standard Townhouse', 'Standard inspection template for townhouses', 'townhouse', true),
('Commercial Property', 'Inspection template for commercial properties', 'commercial', true);

-- ============================================================================
-- Routine Inspection Schedule
-- ============================================================================

CREATE TABLE inspection_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Property/Unit to inspect
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    estate_unit_id UUID REFERENCES estate_units(id) ON DELETE CASCADE,
    
    -- Schedule Details
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'biannual', 'annual')),
    interval_value INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    next_inspection_date DATE NOT NULL,
    end_date DATE,
    
    -- Inspector assignment
    default_inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notify_landlord BOOLEAN DEFAULT true,
    notify_tenant BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_inspection_schedules_property ON inspection_schedules(property_id);
CREATE INDEX idx_inspection_schedules_unit ON inspection_schedules(estate_unit_id);
CREATE INDEX idx_inspection_schedules_next ON inspection_schedules(next_inspection_date);

-- ============================================================================
-- Inspection Reports
-- ============================================================================

CREATE TABLE inspection_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    
    -- Report Details
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(20) CHECK (report_type IN ('summary', 'full', 'tenant', 'landlord', 'insurance')),
    
    -- Generated Report
    file_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Recipients
    sent_to_tenant BOOLEAN DEFAULT false,
    sent_to_landlord BOOLEAN DEFAULT false,
    sent_to_insurance BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspection_reports_inspection ON inspection_reports(inspection_id);
