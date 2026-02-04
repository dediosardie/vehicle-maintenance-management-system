-- Link drivers table to users table
-- This allows driver accounts to be associated with user login accounts

-- Add user_id column to drivers table
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add unique constraint to ensure one user = one driver
ALTER TABLE drivers 
ADD CONSTRAINT drivers_user_id_unique UNIQUE (user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

-- Update existing drivers to link with users if email matches
-- This is optional and depends on your data - you may need to manually link drivers to users
-- UPDATE drivers d
-- SET user_id = (
--   SELECT u.id 
--   FROM users u 
--   WHERE u.email = d.email_field_if_exists
--   LIMIT 1
-- )
-- WHERE d.user_id IS NULL;

-- Add comment
COMMENT ON COLUMN drivers.user_id IS 'References the user account that can login as this driver';

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'drivers'
  AND column_name = 'user_id';
