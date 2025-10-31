-- Fix RLS policies for notification_video_purchases (case-insensitive comparison)
-- This migration updates the existing RLS policies to use LOWER() for case-insensitive address comparison

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their notifications" ON notification_video_purchases;
DROP POLICY IF EXISTS "Users can update their notifications" ON notification_video_purchases;
DROP POLICY IF EXISTS "Users can delete their notifications" ON notification_video_purchases;
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_purchases;

-- Recreate with LOWER() for case-insensitive comparison
CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can update their notifications" ON notification_video_purchases
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can delete their notifications" ON notification_video_purchases
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "System can insert notifications" ON notification_video_purchases
    FOR INSERT WITH CHECK (true);
