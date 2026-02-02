-- ========================================
-- LIVE DRIVER TRACKING - COMPLETE SETUP
-- ========================================
-- Run this script in Supabase SQL Editor to set up live tracking

-- STEP 1: Create trip_locations table (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS trip_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2), -- GPS accuracy in meters
  speed DECIMAL(10, 2), -- Speed in km/h
  heading DECIMAL(5, 2), -- Direction in degrees (0-360)
  altitude DECIMAL(10, 2), -- Altitude in meters
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 2: Add indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_id ON trip_locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_locations_timestamp ON trip_locations(timestamp DESC);

-- STEP 3: Add tracking columns to trips table
-- ========================================
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tracking_started_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tracking_stopped_at TIMESTAMPTZ;

-- STEP 4: Enable Row Level Security
-- ========================================
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS trip_locations_select_policy ON trip_locations;
DROP POLICY IF EXISTS trip_locations_insert_policy ON trip_locations;
DROP POLICY IF EXISTS trip_locations_all_policy ON trip_locations;

-- Create new policies (allow all authenticated users)
CREATE POLICY trip_locations_all_policy ON trip_locations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- STEP 5: Add page restriction for /live-tracking
-- ========================================
INSERT INTO page_restrictions (
  page_name,
  page_path,
  fleet_manager_access,
  maintenance_team_access,
  driver_access,
  administration_access,
  client_company_liaison_access,
  is_active
) VALUES (
  'Live Driver Tracking',
  '/live-tracking',
  true,   -- fleet_manager can access
  false,  -- maintenance_team cannot access
  false,  -- driver cannot access (privacy)
  true,   -- administration can access
  false   -- client_company_liaison cannot access
)
ON CONFLICT (page_path) DO UPDATE SET
  fleet_manager_access = EXCLUDED.fleet_manager_access,
  administration_access = EXCLUDED.administration_access,
  is_active = EXCLUDED.is_active;

-- STEP 6: Create sample test data (OPTIONAL - for testing)
-- ========================================
-- UNCOMMENT THIS SECTION TO CREATE TEST DATA

/*
-- Create a test trip with tracking enabled
DO $$
DECLARE
  test_trip_id UUID;
  test_driver_id UUID;
  test_vehicle_id UUID;
BEGIN
  -- Get first driver
  SELECT id INTO test_driver_id FROM drivers LIMIT 1;
  
  -- Get first vehicle
  SELECT id INTO test_vehicle_id FROM vehicles LIMIT 1;
  
  -- Only create test trip if we have driver and vehicle
  IF test_driver_id IS NOT NULL AND test_vehicle_id IS NOT NULL THEN
    -- Insert test trip
    INSERT INTO trips (
      vehicle_id,
      driver_id,
      start_location,
      end_location,
      start_time,
      status,
      tracking_enabled,
      tracking_started_at,
      trip_type
    ) VALUES (
      test_vehicle_id,
      test_driver_id,
      'Makati City, Metro Manila',
      'Quezon City, Metro Manila',
      NOW(),
      'in_progress',
      true,
      NOW(),
      'regular'
    ) RETURNING id INTO test_trip_id;
    
    -- Insert sample location points along a route
    INSERT INTO trip_locations (trip_id, latitude, longitude, speed, accuracy, timestamp) VALUES
      (test_trip_id, 14.5547, 121.0244, 45.5, 10.0, NOW() - INTERVAL '5 minutes'),
      (test_trip_id, 14.5595, 121.0295, 52.3, 8.0, NOW() - INTERVAL '4 minutes'),
      (test_trip_id, 14.5642, 121.0346, 48.7, 12.0, NOW() - INTERVAL '3 minutes'),
      (test_trip_id, 14.5689, 121.0397, 55.1, 9.0, NOW() - INTERVAL '2 minutes'),
      (test_trip_id, 14.5736, 121.0448, 50.8, 11.0, NOW() - INTERVAL '1 minute'),
      (test_trip_id, 14.5783, 121.0499, 47.2, 10.0, NOW());
    
    RAISE NOTICE 'Test trip created with ID: %', test_trip_id;
  ELSE
    RAISE NOTICE 'Cannot create test trip: No drivers or vehicles found';
  END IF;
END $$;
*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if trip_locations table exists
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'trip_locations';

-- Check tracking columns on trips table
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'trips' 
  AND column_name IN ('tracking_enabled', 'tracking_started_at', 'tracking_stopped_at');

-- Check RLS policies on trip_locations
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies
WHERE tablename = 'trip_locations';

-- Check page restrictions for live tracking
SELECT 
  page_name,
  page_path,
  fleet_manager_access,
  administration_access,
  is_active
FROM page_restrictions
WHERE page_path = '/live-tracking';

-- Count active trips with tracking
SELECT 
  COUNT(*) as active_tracked_trips
FROM trips
WHERE status = 'in_progress' 
  AND tracking_enabled = true;

-- Count total location records
SELECT 
  COUNT(*) as total_locations
FROM trip_locations;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Live Driver Tracking setup complete!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify the verification queries above show correct results';
  RAISE NOTICE '2. Optional: Uncomment test data section to create sample tracking data';
  RAISE NOTICE '3. Refresh your application and login as administration or fleet_manager';
  RAISE NOTICE '4. Navigate to "Live Tracking" in the menu';
END $$;
