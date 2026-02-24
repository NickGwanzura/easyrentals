-- ============================================================================
-- Estate Accounting System Database Schema
-- ============================================================================

-- ============================================================================
-- Estates
-- ============================================================================

CREATE TABLE estates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    description TEXT,
    total_units INTEGER NOT NULL DEFAULT 0,
    
    -- Financial Settings
    default_levy_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    levy_due_day INTEGER DEFAULT 1 CHECK (levy_due_day BETWEEN 1 AND 31),
    
    -- Penalty Settings
    penalty_enabled BOOLEAN DEFAULT false,
    penalty_type VARCHAR(20) CHECK (penalty_type IN ('fixed', 'percentage')),
    penalty_value DECIMAL(10,2) DEFAULT 0,
    grace_period_days INTEGER DEFAULT 0,
    
    -- Bank Details
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_routing_number VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    managed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_estates_managed_by ON estates(managed_by);
CREATE INDEX idx_estates_status ON estates(status);

-- ============================================================================
-- Estate Units
-- ============================================================================

CREATE TABLE estate_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    unit_type VARCHAR(20) CHECK (unit_type IN ('apartment', 'house', 'townhouse', 'commercial', 'other')),
    
    -- Owner Info
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_name VARCHAR(200) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(20),
    
    -- Levy Settings
    levy_amount DECIMAL(10,2),
    
    -- Unit Details
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant', 'rented')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(estate_id, unit_number)
);

CREATE INDEX idx_estate_units_estate ON estate_units(estate_id);
CREATE INDEX idx_estate_units_owner ON estate_units(owner_id);
CREATE INDEX idx_estate_units_status ON estate_units(status);

-- ============================================================================
-- Levies
-- ============================================================================

CREATE TABLE levies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    owner_name VARCHAR(200) NOT NULL,
    
    -- Levy Period
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (amount + penalty_amount - amount_paid) STORED,
    
    -- Status
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'partial')),
    
    -- Due Date
    due_date DATE NOT NULL,
    
    -- Payment Tracking
    paid_date DATE,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'online')),
    payment_reference VARCHAR(255),
    
    -- Penalty
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount + penalty_amount) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by VARCHAR(20) DEFAULT 'auto' CHECK (generated_by IN ('auto', 'manual')),
    
    -- Prevent duplicate levies
    UNIQUE(estate_id, unit_id, month, year)
);

CREATE INDEX idx_levies_estate ON levies(estate_id);
CREATE INDEX idx_levies_unit ON levies(unit_id);
CREATE INDEX idx_levies_status ON levies(status);
CREATE INDEX idx_levies_period ON levies(year, month);
CREATE INDEX idx_levies_due_date ON levies(due_date);
CREATE INDEX idx_levies_unpaid ON levies(status) WHERE status != 'paid';

-- ============================================================================
-- Levy Penalties
-- ============================================================================

CREATE TABLE levy_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    levy_id UUID NOT NULL REFERENCES levies(id) ON DELETE CASCADE,
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    
    -- Penalty Details
    penalty_type VARCHAR(20) CHECK (penalty_type IN ('fixed', 'percentage')),
    penalty_value DECIMAL(10,2) NOT NULL,
    calculated_amount DECIMAL(10,2) NOT NULL,
    
    -- Applied Date
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'waived', 'paid')),
    waived_reason TEXT,
    waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
    waived_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_levy_penalties_levy ON levy_penalties(levy_id);
CREATE INDEX idx_levy_penalties_estate ON levy_penalties(estate_id);
CREATE INDEX idx_levy_penalties_status ON levy_penalties(status);

-- ============================================================================
-- Estate Budgets
-- ============================================================================

CREATE TABLE estate_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    
    -- Budget Categories (stored as JSON for flexibility)
    budgets JSONB NOT NULL DEFAULT '{
        "maintenance": {"budgeted": 0, "actual": 0, "variance": 0},
        "security": {"budgeted": 0, "actual": 0, "variance": 0},
        "cleaning": {"budgeted": 0, "actual": 0, "variance": 0},
        "utilities": {"budgeted": 0, "actual": 0, "variance": 0},
        "landscaping": {"budgeted": 0, "actual": 0, "variance": 0},
        "admin": {"budgeted": 0, "actual": 0, "variance": 0},
        "insurance": {"budgeted": 0, "actual": 0, "variance": 0},
        "other": {"budgeted": 0, "actual": 0, "variance": 0}
    }',
    
    -- Totals
    total_budgeted DECIMAL(12,2) DEFAULT 0,
    total_actual DECIMAL(12,2) DEFAULT 0,
    total_variance DECIMAL(12,2) GENERATED ALWAYS AS (total_budgeted - total_actual) STORED,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(estate_id, year, month)
);

CREATE INDEX idx_estate_budgets_estate ON estate_budgets(estate_id);
CREATE INDEX idx_estate_budgets_period ON estate_budgets(year, month);
CREATE INDEX idx_estate_budgets_status ON estate_budgets(status);

-- ============================================================================
-- Estate Expenses
-- ============================================================================

CREATE TABLE estate_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Expense Details
    category VARCHAR(20) NOT NULL CHECK (category IN ('maintenance', 'security', 'cleaning', 'utilities', 'landscaping', 'admin', 'insurance', 'other')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Date
    expense_date DATE NOT NULL,
    
    -- Vendor
    vendor_name VARCHAR(200),
    vendor_contact VARCHAR(255),
    
    -- Payment
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'credit_card')),
    payment_date DATE,
    
    -- Receipt/Invoice
    receipt_url TEXT,
    invoice_number VARCHAR(100),
    
    -- Approval
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_estate_expenses_estate ON estate_expenses(estate_id);
CREATE INDEX idx_estate_expenses_category ON estate_expenses(category);
CREATE INDEX idx_estate_expenses_date ON estate_expenses(expense_date);
CREATE INDEX idx_estate_expenses_created ON estate_expenses(created_at);

-- ============================================================================
-- Owner Statements
-- ============================================================================

CREATE TABLE owner_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES estate_units(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_name VARCHAR(200) NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    
    -- Statement Period
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Levies
    levies_charged DECIMAL(10,2) DEFAULT 0,
    levies_paid DECIMAL(10,2) DEFAULT 0,
    levies_balance DECIMAL(10,2) DEFAULT 0,
    
    -- Penalties
    penalties_charged DECIMAL(10,2) DEFAULT 0,
    penalties_paid DECIMAL(10,2) DEFAULT 0,
    penalties_balance DECIMAL(10,2) DEFAULT 0,
    
    -- Total
    total_charged DECIMAL(10,2) DEFAULT 0,
    total_paid DECIMAL(10,2) DEFAULT 0,
    total_balance DECIMAL(10,2) DEFAULT 0,
    
    -- Opening/Closing Balance
    opening_balance DECIMAL(10,2) DEFAULT 0,
    closing_balance DECIMAL(10,2) DEFAULT 0,
    
    -- Transactions (stored as JSON array)
    transactions JSONB DEFAULT '[]',
    
    -- Statement Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid')),
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(estate_id, unit_id, month, year)
);

CREATE INDEX idx_owner_statements_estate ON owner_statements(estate_id);
CREATE INDEX idx_owner_statements_unit ON owner_statements(unit_id);
CREATE INDEX idx_owner_statements_owner ON owner_statements(owner_id);
CREATE INDEX idx_owner_statements_period ON owner_statements(year, month);
CREATE INDEX idx_owner_statements_status ON owner_statements(status);

-- ============================================================================
-- Levy Arrears View
-- ============================================================================

CREATE VIEW levy_arrears_view AS
SELECT 
    eu.id as unit_id,
    eu.estate_id,
    eu.unit_number,
    eu.owner_name,
    eu.owner_email,
    eu.owner_phone,
    COUNT(l.id) as months_overdue,
    SUM(l.total_amount) as total_outstanding,
    MIN(l.year * 12 + l.month) as oldest_unpaid_period,
    CASE 
        WHEN COUNT(l.id) >= 4 THEN 'critical'
        WHEN COUNT(l.id) >= 2 THEN 'high'
        WHEN COUNT(l.id) = 1 THEN 'medium'
        ELSE 'low'
    END as risk_level
FROM estate_units eu
LEFT JOIN levies l ON eu.id = l.unit_id AND l.status != 'paid'
WHERE l.id IS NOT NULL
GROUP BY eu.id, eu.estate_id, eu.unit_number, eu.owner_name, eu.owner_email, eu.owner_phone;

-- ============================================================================
-- Triggers for Updated At
-- ============================================================================

CREATE TRIGGER update_estates_updated_at BEFORE UPDATE ON estates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_units_updated_at BEFORE UPDATE ON estate_units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_levies_updated_at BEFORE UPDATE ON levies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_budgets_updated_at BEFORE UPDATE ON estate_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estate_expenses_updated_at BEFORE UPDATE ON estate_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owner_statements_updated_at BEFORE UPDATE ON owner_statements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to calculate and apply penalty
CREATE OR REPLACE FUNCTION apply_levy_penalty(levy_id UUID)
RETURNS VOID AS $$
DECLARE
    levy_record RECORD;
    estate_record RECORD;
    penalty_amount DECIMAL(10,2);
    grace_period_end DATE;
BEGIN
    -- Get levy details
    SELECT * INTO levy_record FROM levies WHERE id = levy_id;
    
    -- Get estate penalty settings
    SELECT * INTO estate_record FROM estates WHERE id = levy_record.estate_id;
    
    -- Check if penalties are enabled
    IF NOT estate_record.penalty_enabled THEN
        RETURN;
    END IF;
    
    -- Calculate grace period end
    grace_period_end := levy_record.due_date + estate_record.grace_period_days;
    
    -- Check if past grace period
    IF CURRENT_DATE <= grace_period_end THEN
        RETURN;
    END IF;
    
    -- Calculate penalty amount
    IF estate_record.penalty_type = 'fixed' THEN
        penalty_amount := estate_record.penalty_value;
    ELSE
        penalty_amount := levy_record.amount * (estate_record.penalty_value / 100);
    END IF;
    
    -- Update levy with penalty
    UPDATE levies 
    SET penalty_amount = penalty_amount,
        updated_at = NOW()
    WHERE id = levy_id;
    
    -- Create penalty record
    INSERT INTO levy_penalties (
        levy_id, estate_id, unit_id, penalty_type, penalty_value, calculated_amount
    ) VALUES (
        levy_id, levy_record.estate_id, levy_record.unit_id,
        estate_record.penalty_type, estate_record.penalty_value, penalty_amount
    );
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate monthly levies
CREATE OR REPLACE FUNCTION generate_monthly_levies(estate_id UUID, levy_month INTEGER, levy_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    unit_record RECORD;
    levy_count INTEGER := 0;
    levy_amount DECIMAL(10,2);
    due_date DATE;
BEGIN
    -- Get estate details
    SELECT levy_due_day INTO due_date FROM estates WHERE id = estate_id;
    due_date := make_date(levy_year, levy_month, due_date);
    
    -- Generate levies for each unit
    FOR unit_record IN 
        SELECT * FROM estate_units WHERE estate_id = estate_id AND status != 'vacant'
    LOOP
        -- Check if levy already exists
        IF EXISTS (
            SELECT 1 FROM levies 
            WHERE unit_id = unit_record.id AND month = levy_month AND year = levy_year
        ) THEN
            CONTINUE;
        END IF;
        
        -- Determine levy amount
        levy_amount := COALESCE(unit_record.levy_amount, (SELECT default_levy_amount FROM estates WHERE id = estate_id));
        
        -- Create levy
        INSERT INTO levies (
            estate_id, unit_id, unit_number, owner_name, month, year,
            amount, due_date, generated_by
        ) VALUES (
            estate_id, unit_record.id, unit_record.unit_number, unit_record.owner_name,
            levy_month, levy_year, levy_amount, due_date, 'auto'
        );
        
        levy_count := levy_count + 1;
    END LOOP;
    
    RETURN levy_count;
END;
$$ LANGUAGE plpgsql;
