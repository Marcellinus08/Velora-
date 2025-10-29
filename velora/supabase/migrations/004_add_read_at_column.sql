-- Add read_at column to notifications table if it doesn't exist
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';

-- Update existing read notifications to have read_at timestamp
UPDATE notifications 
SET read_at = created_at 
WHERE is_read = true AND read_at IS NULL;
