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

-- Enable realtime for notifications table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
