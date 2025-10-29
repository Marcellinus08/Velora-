-- Add foreign key constraint for actor_addr to profiles
-- This allows Supabase to understand the relationship for joined queries

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_actor_addr_fkey;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_actor_addr_fkey
  FOREIGN KEY (actor_addr)
  REFERENCES profiles(abstract_id)
  ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_actor_addr ON notifications(actor_addr);
CREATE INDEX IF NOT EXISTS idx_notifications_abstract_id_unread ON notifications(abstract_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable realtime for notifications table (CRITICAL for real-time updates!)
-- Add table to realtime publication
DO $$
BEGIN
    -- Try to drop first (ignore error if not exists)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE notifications;
    EXCEPTION
        WHEN undefined_table THEN
            -- Table not in publication, that's okay
            NULL;
    END;
    
    -- Add table to realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
END $$;

-- Verify realtime is enabled
COMMENT ON TABLE notifications IS 'Notifications table with realtime enabled for INSERT, UPDATE, DELETE events';
