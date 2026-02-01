-- Add rejected_by and rejection_date fields to disposal_requests table
-- These fields track who rejected a disposal request and when

ALTER TABLE disposal_requests
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejection_date TIMESTAMPTZ;

-- Add comment to document the new fields
COMMENT ON COLUMN disposal_requests.rejected_by IS 'User ID of the person who rejected the disposal request';
COMMENT ON COLUMN disposal_requests.rejection_date IS 'Timestamp when the disposal request was rejected';

-- Note: approved_by and approval_date fields should already exist in the table
-- If they don't exist, add them as well:
ALTER TABLE disposal_requests
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;

COMMENT ON COLUMN disposal_requests.approved_by IS 'User ID of the person who approved the disposal request';
COMMENT ON COLUMN disposal_requests.approval_date IS 'Timestamp when the disposal request was approved';
