-- Seed page_restrictions table with default access control
-- Run this after creating page_restrictions table
-- This populates initial access rules based on role requirements

-- Dashboard (all roles can access)
INSERT INTO page_restrictions (page_name, page_path, page_description, 
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES 
  ('Dashboard', '/dashboard', 'Main dashboard with analytics overview', 
   true, true, true, true, true, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Vehicles
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Vehicles', '/vehicles', 'Vehicle fleet management',
   true, true, true, true, true, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Maintenance
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Maintenance', '/maintenance', 'Vehicle maintenance scheduling',
   true, true, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Drivers
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Drivers', '/drivers', 'Driver management',
   true, false, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Trips
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Trips', '/trips', 'Trip logging and tracking',
   true, false, true, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Fuel Tracking
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Fuel Tracking', '/fuel', 'Fuel consumption monitoring',
   true, false, true, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Incidents & Insurance
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Incidents & Insurance', '/incidents', 'Incident and insurance management',
   true, true, true, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Reports
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Reports', '/reports', 'Reporting and analytics',
   true, false, false, true, true, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Compliance Documents
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Compliance', '/compliance', 'Compliance and documentation',
   true, false, false, true, true, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Vehicle Disposal
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Disposal', '/disposal', 'Vehicle disposal management',
   true, true, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Analytics
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Analytics', '/analytics', 'Advanced analytics dashboard',
   true, false, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- User Management (Administration only)
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Users', '/users', 'User account management',
   false, false, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Page Restrictions (Administration only)
INSERT INTO page_restrictions (page_name, page_path, page_description,
  fleet_manager_access, maintenance_team_access, driver_access, administration_access, client_company_liaison_access, is_active)
VALUES
  ('Page Restrictions', '/page-restrictions', 'Access control management',
   false, false, false, true, false, true)
ON CONFLICT (page_path) DO UPDATE SET
  updated_at = NOW();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Page restrictions seeded successfully!';
  RAISE NOTICE '📊 Total pages configured: 13';
  RAISE NOTICE '🔐 Access control is now active and database-driven';
  RAISE NOTICE '⚙️  Administrators can modify via Page Restrictions UI';
END $$;
