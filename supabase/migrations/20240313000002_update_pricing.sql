-- ============================================================================
-- Update Pricing - Min $22/property and Pro Plan = 20 properties
-- ============================================================================

-- Update plan pricing and limits
UPDATE subscription_plans 
SET 
    monthly_price = 110.00,  -- 5 properties * $22
    annual_price = 88.00,    -- 20% discount
    max_properties = 5,
    max_tenants = 20,
    max_users = 2
WHERE slug = 'starter';

UPDATE subscription_plans 
SET 
    monthly_price = 440.00,  -- 20 properties * $22
    annual_price = 352.00,   -- 20% discount
    max_properties = 20,
    max_tenants = 100,
    max_users = 5
WHERE slug = 'growth';

UPDATE subscription_plans 
SET 
    monthly_price = 440.00,  -- 20 properties * $22 (same as growth)
    annual_price = 352.00,   -- 20% discount
    max_properties = 20,
    max_tenants = 200,
    max_users = 20,
    features = '["multiple_domains", "owner_portal", "advanced_api", "custom_integrations", "budget_tools", "automated_workflows", "bulk_tools", "dedicated_manager", "phone_support", "all_growth_features"]'
WHERE slug = 'professional';

-- Update add-on pricing for extra properties
UPDATE addon_pricing 
SET unit_price = 22.00 
WHERE slug = 'extra_property';

-- Verify updates
SELECT name, slug, monthly_price, max_properties, max_tenants, max_users 
FROM subscription_plans 
ORDER BY sort_order;
