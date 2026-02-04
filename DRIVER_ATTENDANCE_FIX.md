# Driver Attendance Setup - Fixing "null driver_id" Error

## Problem
The error `"null value in column \"driver_id\" of relation \"driver_attendance\" violates not-null constraint"` occurs because:

1. The `drivers` table and `users` table are not linked
2. When a user logs in, we have their `user.id`, but not their `driver_id`
3. The attendance system requires a valid `driver_id` to create records

## Solution Overview
Link the `drivers` table to the `users` table by adding a `user_id` column, then update the attendance page to fetch the driver record based on the logged-in user.

---

## Step 1: Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor **in this order**:

### 1.1 Link Drivers to Users
```sql
-- File: migrations/link_drivers_to_users.sql
-- This adds a user_id column to the drivers table
```

**Run this migration first:** [migrations/link_drivers_to_users.sql](migrations/link_drivers_to_users.sql)

### 1.2 Configure Storage Policies
```sql
-- File: migrations/configure_storage_policies.sql
-- This fixes the RLS error for image uploads
```

**Run this migration second:** [migrations/configure_storage_policies.sql](migrations/configure_storage_policies.sql)

### 1.3 Create/Update Attendance Table
```sql
-- File: migrations/create_driver_attendance_table.sql
-- This ensures RLS is disabled for custom auth
```

**Run this migration third:** [migrations/create_driver_attendance_table.sql](migrations/create_driver_attendance_table.sql)

---

## Step 2: Link Existing Drivers to User Accounts

After running the migrations, you need to manually link your existing drivers to their user accounts.

### Option A: Using Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor → `drivers` table
2. For each driver row:
   - Click edit
   - Find the `user_id` column
   - Select the corresponding user from the `users` table
   - Save

### Option B: Using SQL (if you have matching emails or other identifiers)

If drivers and users share a common field (like email), you can bulk update:

```sql
-- Example: If both tables have an email field
UPDATE drivers d
SET user_id = u.id
FROM users u
WHERE d.email = u.email  -- Replace with actual matching logic
AND d.user_id IS NULL;

-- Verify the links
SELECT 
  d.id as driver_id,
  d.full_name as driver_name,
  u.id as user_id,
  u.email as user_email,
  u.role as user_role
FROM drivers d
LEFT JOIN users u ON d.user_id = u.id;
```

### Option C: Manual Creation of Test Users

If you need to create test driver accounts:

```sql
-- 1. Create a user account
INSERT INTO users (email, full_name, role, is_active)
VALUES ('driver1@example.com', 'John Doe', 'driver', true)
RETURNING id;

-- 2. Copy the returned user ID, then update the driver record
UPDATE drivers
SET user_id = '<paste-user-id-here>'
WHERE license_number = 'DL123456';  -- Use a unique identifier
```

---

## Step 3: Verify the Setup

### 3.1 Check Database Links
```sql
-- Verify all drivers are linked to users
SELECT 
  d.id,
  d.full_name,
  d.license_number,
  d.user_id,
  u.email,
  u.role
FROM drivers d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.full_name;

-- Find drivers without user accounts
SELECT * FROM drivers WHERE user_id IS NULL;
```

### 3.2 Test the Attendance Flow

1. **Login** as a user that has a linked driver record
2. **Navigate** to `/attendance` page
3. **Check Console** - you should see:
   ```
   Current user loaded: { id: "...", email: "...", role: "driver" }
   Driver record loaded: { id: "...", full_name: "...", user_id: "..." }
   ```
4. **Capture Image** - take a photo
5. **Record Attendance** - click Login/Logout button
6. **Verify** - check console for success messages

---

## Step 4: Create Storage Bucket

If you haven't already created the storage bucket:

1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `driver-attendance`
4. Public bucket: **Yes** ✅
5. File size limit: `5242880` (5MB)
6. Allowed MIME types: `image/jpeg, image/jpg, image/png`
7. Click "Create bucket"

Or run the migration which will create it automatically: [migrations/configure_storage_policies.sql](migrations/configure_storage_policies.sql)

---

## Updated Code Changes

The following files have been updated:

### DriverAttendancePage.tsx
- ✅ Now fetches driver record from `drivers` table using `user_id`
- ✅ Validates that a driver profile exists for the logged-in user
- ✅ Provides clear error messages if driver record is missing
- ✅ Added `supabase` import for database queries

### Migrations
- ✅ `link_drivers_to_users.sql` - Links drivers to user accounts
- ✅ `configure_storage_policies.sql` - Fixes image upload permissions
- ✅ `create_driver_attendance_table.sql` - Disables RLS for custom auth

---

## Troubleshooting

### Error: "No driver profile linked to your account"
**Cause:** The logged-in user doesn't have a corresponding driver record
**Solution:** Link the user to a driver in Step 2 above

### Error: "Failed to upload image: new row violates row-level security policy"
**Cause:** Storage bucket policies not configured
**Solution:** Run [migrations/configure_storage_policies.sql](migrations/configure_storage_policies.sql)

### Error: "null value in column 'driver_id'"
**Cause:** Driver record not found or not linked to user
**Solution:** 
1. Verify user is logged in
2. Check driver record exists with matching `user_id`
3. Review console logs for specific error details

### Attendance Records Not Showing
**Cause:** Data might be filtered or driver_id mismatch
**Solution:**
```sql
-- Check all attendance records
SELECT 
  a.*,
  d.full_name as driver_name,
  u.email as user_email
FROM driver_attendance a
JOIN drivers d ON a.driver_id = d.id
LEFT JOIN users u ON d.user_id = u.id
ORDER BY a.timestamp DESC;
```

---

## Next Steps

1. ✅ Run all three migrations in Supabase SQL Editor
2. ✅ Link existing drivers to user accounts
3. ✅ Create storage bucket (if not exists)
4. ✅ Test the attendance flow end-to-end
5. ✅ Deploy to production (HTTPS required for camera/GPS)

---

## Database Schema Changes

### Before
```
users (id, email, role)
drivers (id, full_name, license_number)
❌ No connection between users and drivers
```

### After
```
users (id, email, role)
       ↓ (one-to-one)
drivers (id, full_name, license_number, user_id)
       ↓ (one-to-many)
driver_attendance (id, driver_id, action_type, image_url, ...)
```

Now when a user logs in → fetch their driver record → use driver_id for attendance ✅
