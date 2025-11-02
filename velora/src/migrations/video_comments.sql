-- Create video_comments table for storing user comments on videos
-- This table stores the actual comment data
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id TEXT NOT NULL,
    user_addr TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false
);

-- Create indexes for better query performance
CREATE INDEX idx_video_comments_video 
    ON video_comments(video_id);

CREATE INDEX idx_video_comments_user 
    ON video_comments(user_addr);

CREATE INDEX idx_video_comments_parent 
    ON video_comments(parent_id);

CREATE INDEX idx_video_comments_created 
    ON video_comments(created_at DESC);

CREATE INDEX idx_video_comments_video_created 
    ON video_comments(video_id, created_at DESC);

CREATE INDEX idx_video_comments_is_deleted
    ON video_comments(is_deleted);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON video_comments TO authenticated;
GRANT SELECT ON video_comments TO anon;

-- Enable Row Level Security
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view comments on videos (not deleted)
CREATE POLICY "Anyone can view video comments" ON video_comments
    FOR SELECT USING (is_deleted = false);

-- Users can create comments
CREATE POLICY "Users can create comments" ON video_comments
    FOR INSERT WITH CHECK (
        LOWER(user_addr) = LOWER(auth.jwt()->>'abstract_id') OR
        auth.jwt()->>'abstract_id' IS NOT NULL
    );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON video_comments
    FOR UPDATE USING (
        LOWER(user_addr) = LOWER(auth.jwt()->>'abstract_id')
    );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON video_comments
    FOR DELETE USING (
        LOWER(user_addr) = LOWER(auth.jwt()->>'abstract_id')
    );
