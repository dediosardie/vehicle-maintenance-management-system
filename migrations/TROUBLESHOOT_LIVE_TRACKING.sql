-- Quick Test: Check if Live Tracking page restriction exists
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if page restriction exists
SELECT 
  page_name, 
  page_path, 
  fleet_manager_access,
  administration_access,
  is_active,
  created_at
FROM page_restrictions 
WHERE page_path = '/live-tracking';

-- If no results, the migration wasn't run yet
-- Expected: 1 row showing "Live Driver Tracking"

-- 2. Check your user's role
SELECT email, role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email';

-- Expected: Your email and role (e.g., 'administration', 'fleet_manager')

-- 3. Check if user_page_access table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_page_access';

-- Expected: 1 row with 'user_page_access'

-- 4. Check user-specific access
SELECT user_email, page_path, is_active 
FROM user_page_access 
WHERE page_path = '/live-tracking';

-- Expected: 2 rows (dediosardie11@gmail.com, advillanuevajr@gmail.com)

-- ========================================
-- QUICK FIX: If page restriction is missing
-- ========================================
-- Run this to manually add the page restriction:

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
    true,   -- Fleet Manager
    false,  -- Maintenance Team
    false,  -- Driver
    true,   -- Administration
    false,  -- Client Liaison
    true    -- Active
  )
ON CONFLICT (page_path) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  page_description = EXCLUDED.page_description,
  fleet_manager_access = EXCLUDED.fleet_manager_access,
  administration_access = EXCLUDED.administration_access,
  updated_at = NOW();

-- ========================================
-- VERIFICATION: Check if it now appears
-- ========================================
SELECT 
  page_name, 
  page_path, 
  CASE 
    WHEN (SELECT role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email') = 'fleet_manager' 
      THEN fleet_manager_access
    WHEN (SELECT role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email') = 'administration' 
      THEN administration_access
    WHEN (SELECT role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email') = 'maintenance_team' 
      THEN maintenance_team_access
    WHEN (SELECT role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email') = 'driver' 
      THEN driver_access
    WHEN (SELECT role FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email') = 'client_company_liaison' 
      THEN client_company_liaison_access
  END as your_access
FROM page_restrictions 
WHERE page_path = '/live-tracking';

-- Expected: your_access should be 'true' if you're fleet_manager or administration
