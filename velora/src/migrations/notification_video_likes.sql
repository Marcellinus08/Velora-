-- Create notification_video_likes table
-- Purpose: Notify video creator when someone likes their video

CREATE TABLE IF NOT EXISTS notification_video_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Who liked the video
    liker_addr VARCHAR(42) NOT NULL,
    
    -- Who created/owns the video
    creator_addr VARCHAR(42) NOT NULL,
    
    -- The liked video
    video_id TEXT NOT NULL,
    
    -- Notification fields
    type VARCHAR(20) NOT NULL DEFAULT 'video_like',
    message TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_notification_video_likes_creator 
    ON notification_video_likes(creator_addr);

CREATE INDEX idx_notification_video_likes_video 
    ON notification_video_likes(video_id);

CREATE INDEX idx_notification_video_likes_liker 
    ON notification_video_likes(liker_addr);

CREATE INDEX idx_notification_video_likes_is_read 
    ON notification_video_likes(is_read);

CREATE INDEX idx_notification_video_likes_created 
    ON notification_video_likes(created_at DESC);

CREATE INDEX idx_notification_video_likes_creator_unread 
    ON notification_video_likes(creator_addr, is_read)
    WHERE is_read = false;

-- Function to prevent duplicate likes per creator per day
CREATE OR REPLACE FUNCTION check_duplicate_video_like_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM notification_video_likes 
        WHERE liker_addr = NEW.liker_addr 
        AND video_id = NEW.video_id 
        AND DATE(created_at) = DATE(CURRENT_TIMESTAMP)
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Duplicate video like notification for this liker-video today';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce uniqueness
CREATE TRIGGER trigger_check_duplicate_video_like
    BEFORE INSERT ON notification_video_likes
    FOR EACH ROW
    EXECUTE FUNCTION check_duplicate_video_like_notification();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_video_likes TO authenticated;
GRANT SELECT ON notification_video_likes TO anon;

-- Enable RLS
ALTER TABLE notification_video_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications (as creator)
CREATE POLICY "Users can view their notifications" ON notification_video_likes
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON notification_video_likes
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their notifications" ON notification_video_likes
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: System can insert notifications (admin)
CREATE POLICY "System can insert notifications" ON notification_video_likes
    FOR INSERT WITH CHECK (true);
