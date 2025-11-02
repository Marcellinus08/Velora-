-- Create notification_video_comments table
-- Purpose: Notify video creator when someone comments on their video

CREATE TABLE IF NOT EXISTS notification_video_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Who commented
    commenter_addr VARCHAR(42) NOT NULL,
    
    -- Who created/owns the video
    creator_addr VARCHAR(42) NOT NULL,
    
    -- The video being commented on
    video_id TEXT NOT NULL,
    
    -- The comment (reference to video_comments table)
    comment_id UUID NOT NULL,
    CONSTRAINT fk_notification_video_comments_comment 
        FOREIGN KEY (comment_id) 
        REFERENCES video_comments(id) 
        ON DELETE CASCADE,
    
    -- Notification fields
    type VARCHAR(20) NOT NULL DEFAULT 'video_comment',
    message TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_notification_video_comments_creator 
    ON notification_video_comments(creator_addr);

CREATE INDEX idx_notification_video_comments_video 
    ON notification_video_comments(video_id);

CREATE INDEX idx_notification_video_comments_commenter 
    ON notification_video_comments(commenter_addr);

CREATE INDEX idx_notification_video_comments_is_read 
    ON notification_video_comments(is_read);

CREATE INDEX idx_notification_video_comments_created 
    ON notification_video_comments(created_at DESC);

CREATE INDEX idx_notification_video_comments_creator_unread 
    ON notification_video_comments(creator_addr, is_read)
    WHERE is_read = false;

-- Note: We don't prevent duplicates for comments (user can comment multiple times)
-- but we could add a rate limit if needed

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_video_comments TO authenticated;
GRANT SELECT ON notification_video_comments TO anon;

-- Enable RLS
ALTER TABLE notification_video_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications (as creator)
CREATE POLICY "Users can view their notifications" ON notification_video_comments
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON notification_video_comments
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their notifications" ON notification_video_comments
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: System can insert notifications (admin OR service role)
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
CREATE POLICY "System can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);

-- RLS Policy: Allow INSERT from authenticated users and service role
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;
CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);
