-- ============================================================================
-- Seed Data for Development
-- ============================================================================

-- Insert demo users (password would be hashed in production)
INSERT INTO users (id, email, first_name, last_name, role, phone, is_active, email_verified, created_at) VALUES
('user-admin-1', 'demo@admin.com', 'Michael', 'Anderson', 'admin', '+1 (555) 100-0001', true, true, NOW()),
('user-agent-1', 'demo@agent.com', 'Sarah', 'Johnson', 'agent', '+1 (555) 100-0002', true, true, NOW()),
('user-tenant-1', 'demo@tenant.com', 'David', 'Martinez', 'tenant', '+1 (555) 100-0003', true, true, NOW()),
('user-landlord-1', 'landlord@example.com', 'Robert', 'Williams', 'landlord', '+1 (555) 100-0004', true, true, NOW()),
('user-agent-2', 'agent2@example.com', 'Emily', 'Chen', 'agent', '+1 (555) 100-0005', true, true, NOW());

-- Insert agent profiles
INSERT INTO agents (id, user_id, license_number, commission_rate, total_deals_closed, status, created_at) VALUES
('agent-1', 'user-agent-1', 'RE-12345-CA', 0.05, 23, 'active', NOW()),
('agent-2', 'user-agent-2', 'RE-67890-TX', 0.04, 15, 'active', NOW());

-- Insert properties
INSERT INTO properties (id, title, description, address, city, state, zip_code, country, type, status, bedrooms, bathrooms, square_feet, year_built, monthly_rent, deposit_amount, landlord_id, agent_id, amenities, created_at) VALUES
('prop-1', 'Modern Downtown Loft', 'Stunning modern loft in the heart of downtown', '123 Main Street, Apt 4B', 'New York', 'NY', '10001', 'USA', 'apartment', 'occupied', 2, 2, 1200, 2015, 3500, 7000, 'user-admin-1', 'agent-1', '["Gym", "Parking", "Pool", "Elevator", "Security"]', NOW()),
('prop-2', 'Cozy Suburban Home', 'Beautiful 3-bedroom family home', '456 Oak Avenue', 'Austin', 'TX', '78701', 'USA', 'house', 'occupied', 3, 2.5, 2100, 2008, 2800, 5600, 'user-admin-1', 'agent-2', '["Garage", "Garden", "Fireplace", "Central AC"]', NOW()),
('prop-3', 'Luxury Waterfront Condo', 'Exclusive waterfront living', '789 Harbor Drive, Unit 1201', 'Miami', 'FL', '33131', 'USA', 'condo', 'vacant', 2, 2, 1450, 2019, 4200, 8400, 'user-admin-1', 'agent-1', '["Pool", "Gym", "Spa", "Valet", "Concierge", "Beach Access"]', NOW());

-- Insert tenant profiles
INSERT INTO tenants (id, user_id, date_of_birth, employer, employment_status, monthly_income, current_property_id, status, credit_score, background_check_status, created_at) VALUES
('tenant-1', 'user-tenant-1', '1988-05-15', 'Tech Solutions Inc', 'employed', 8500, 'prop-1', 'active', 745, 'passed', NOW());

-- Insert leases
INSERT INTO leases (id, property_id, tenant_id, landlord_id, start_date, end_date, monthly_rent, deposit_amount, payment_due_day, grace_period_days, status, created_at) VALUES
('lease-1', 'prop-1', 'tenant-1', 'user-admin-1', '2023-06-01', '2024-05-31', 3500, 7000, 1, 5, 'active', NOW());

-- Insert payments
INSERT INTO payments (id, tenant_id, property_id, lease_id, amount, type, status, method, payment_for_month, payment_for_year, due_date, paid_date, created_at) VALUES
('pay-1', 'tenant-1', 'prop-1', 'lease-1', 3500, 'rent', 'paid', 'bank_transfer', 1, 2024, '2024-01-01', '2023-12-30', NOW()),
('pay-2', 'tenant-1', 'prop-1', 'lease-1', 3500, 'rent', 'paid', 'bank_transfer', 2, 2024, '2024-02-01', '2024-02-01', NOW());

-- Insert leads
INSERT INTO leads (id, property_id, agent_id, first_name, last_name, email, phone, message, preferred_move_in_date, budget, status, source, created_at) VALUES
('lead-1', 'prop-3', 'agent-1', 'Michael', 'Roberts', 'michael.roberts@example.com', '+1 (555) 400-0001', 'Interested in viewing the waterfront condo', '2024-03-01', 4500, 'contacted', 'website', NOW());

-- Insert maintenance requests
INSERT INTO maintenance_requests (id, property_id, tenant_id, title, description, category, priority, status, assigned_to, reported_at, scheduled_for, completed_at, estimated_cost, actual_cost, created_at) VALUES
('maint-1', 'prop-1', 'tenant-1', 'Leaky Faucet in Kitchen', 'Kitchen sink faucet dripping', 'plumbing', 'low', 'completed', 'Mike the Plumber', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 150, 125, NOW());

-- Insert user preferences
INSERT INTO user_preferences (user_id, email_notifications, sms_notifications, theme, language, timezone, currency) VALUES
('user-admin-1', true, false, 'light', 'en', 'America/New_York', 'USD'),
('user-agent-1', true, true, 'light', 'en', 'America/Los_Angeles', 'USD'),
('user-tenant-1', true, false, 'light', 'en', 'America/Chicago', 'USD');
