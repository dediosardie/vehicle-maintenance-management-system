-- Add Live Driver Tracking page restriction
-- Access controlled through role-based permissions in page_restrictions table

-- Insert page restriction with default role access for fleet managers and admins
INSERT INTO page_restrictions (
  page_name, 
  page_path, 
  page_description,
  fleet_manager_access, 
  maintenance_team_access, 
  driver_access, 
  administration_access, 
  client_company_liaison_access, 
  is_active
)
VALUES
  (
    'Live Driver Tracking', 
    '/live-tracking', 
    'Real-time GPS tracking map showing current driver locations',
    true,   -- Fleet Manager: can track fleet vehicles
    false,  -- Maintenance Team: no access
    false,  -- Driver: no access (drivers shouldn't see all other drivers)
    true,   -- Administration: full access
    false,  -- Client Liaison: no access
    true    -- Active
  )
ON CONFLICT (page_path) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  page_description = EXCLUDED.page_description,
  fleet_manager_access = EXCLUDED.fleet_manager_access,
  maintenance_team_access = EXCLUDED.maintenance_team_access,
  driver_access = EXCLUDED.driver_access,
  administration_access = EXCLUDED.administration_access,
  client_company_liaison_access = EXCLUDED.client_company_liaison_access,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Access is controlled purely through role-based permissions above
-- Admins can modify access via the Page Restriction module in the UI
