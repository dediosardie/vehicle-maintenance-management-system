-- ========================================
-- LIVE TRACKING DIAGNOSTICS
-- ========================================
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if trip_locations table exists
SELECT 
  'trip_locations table' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'trip_locations'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status;

-- 2. Check tracking columns on trips table
SELECT 
  'trips.tracking_enabled' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'trips' AND column_name = 'tracking_enabled'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status
UNION ALL
SELECT 
  'trips.tracking_started_at' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'trips' AND column_name = 'tracking_started_at'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status
UNION ALL
SELECT 
  'trips.tracking_stopped_at' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'trips' AND column_name = 'tracking_stopped_at'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status;

-- 3. Check RLS policies
SELECT 
  'RLS policies on trip_locations' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'trip_locations'
    ) THEN '✅ CONFIGURED (' || COUNT(*)::text || ' policies)'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status
FROM pg_policies
WHERE tablename = 'trip_locations'
GROUP BY tablename;

-- 4. Check page restrictions
SELECT 
  '/live-tracking page restriction' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM page_restrictions WHERE page_path = '/live-tracking'
    ) THEN '✅ CONFIGURED'
    ELSE '❌ MISSING - Run SETUP_LIVE_TRACKING.sql'
  END as status;

-- 5. Check for active trips
SELECT 
  'Active trips' as check_name,
  COUNT(*)::text || ' trips found' as status
FROM trips
WHERE status = 'in_progress';

-- 6. Check for trips with tracking enabled
SELECT 
  'Trips with tracking enabled' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'tracking_enabled')
    THEN (SELECT COUNT(*)::text || ' trips' FROM trips WHERE tracking_enabled = true)
    ELSE '❌ tracking_enabled column missing'
  END as status;

-- 7. Check for location data
SELECT 
  'Location records' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_locations')
    THEN (SELECT COUNT(*)::text || ' records' FROM trip_locations)
    ELSE '❌ trip_locations table missing'
  END as status;

-- 8. Detailed data check (if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trip_locations') THEN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'DETAILED STATUS:';
    RAISE NOTICE '===========================================';
    
    RAISE NOTICE 'Total trips: %', (SELECT COUNT(*) FROM trips);
    RAISE NOTICE 'In-progress trips: %', (SELECT COUNT(*) FROM trips WHERE status = 'in_progress');
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'tracking_enabled') THEN
      RAISE NOTICE 'Trips with tracking enabled: %', (SELECT COUNT(*) FROM trips WHERE tracking_enabled = true);
      RAISE NOTICE 'In-progress trips with tracking: %', (SELECT COUNT(*) FROM trips WHERE status = 'in_progress' AND tracking_enabled = true);
    ELSE
      RAISE NOTICE 'tracking_enabled column: MISSING';
    END IF;
    
    RAISE NOTICE 'Total location records: %', (SELECT COUNT(*) FROM trip_locations);
    RAISE NOTICE '===========================================';
    
    IF NOT EXISTS (SELECT 1 FROM trips WHERE status = 'in_progress' AND tracking_enabled = true) THEN
      RAISE NOTICE '⚠️  NO ACTIVE TRIPS WITH TRACKING ENABLED';
      RAISE NOTICE 'To test:';
      RAISE NOTICE '1. Create a trip';
      RAISE NOTICE '2. Set status = ''in_progress''';
      RAISE NOTICE '3. Set tracking_enabled = true';
      RAISE NOTICE '4. Add location records to trip_locations table';
      RAISE NOTICE 'OR run the test data section in SETUP_LIVE_TRACKING.sql';
    END IF;
  ELSE
    RAISE NOTICE '❌ trip_locations table does not exist';
    RAISE NOTICE 'Run SETUP_LIVE_TRACKING.sql to create it';
  END IF;
END $$;

-- 9. Show sample query that the app runs
SELECT 
  '=== SAMPLE QUERY (what the app executes) ===' as info;

-- This is what LiveDriverTrackingMap.tsx executes:
/*
SELECT 
  t.*,
  d.id, d.full_name, d.license_number, d.phone, d.email, d.status as driver_status,
  v.id, v.plate_number, v.make, v.model, v.year, v.status as vehicle_status
FROM trips t
LEFT JOIN drivers d ON t.driver_id = d.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
WHERE t.status = 'in_progress' 
  AND t.tracking_enabled = true;
*/

-- Try the query to see if it works:
DO $$
DECLARE
  result_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'tracking_enabled') THEN
    SELECT COUNT(*) INTO result_count
    FROM trips t
    LEFT JOIN drivers d ON t.driver_id = d.id
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    WHERE t.status = 'in_progress' 
      AND t.tracking_enabled = true;
    
    RAISE NOTICE 'Query executed successfully: % trips found', result_count;
  ELSE
    RAISE NOTICE '❌ Cannot execute query: tracking_enabled column missing';
  END IF;
END $$;
