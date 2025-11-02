-- Create notification_video_purchases table
-- Purpose: Notify video creator when someone buys their video

CREATE TABLE IF NOT EXISTS notification_video_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Who bought the video
    buyer_addr VARCHAR(42) NOT NULL,
    
    -- Who created/owns the video
    creator_addr VARCHAR(42) NOT NULL,
    
    -- The purchased video
    video_id TEXT NOT NULL,
    
    -- Purchase details
    price_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    tx_hash VARCHAR(255),
    
    -- Notification fields
    type VARCHAR(20) NOT NULL DEFAULT 'video_purchase',
    message TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_notification_video_purchases_creator 
    ON notification_video_purchases(creator_addr);

CREATE INDEX idx_notification_video_purchases_video 
    ON notification_video_purchases(video_id);

CREATE INDEX idx_notification_video_purchases_buyer 
    ON notification_video_purchases(buyer_addr);

CREATE INDEX idx_notification_video_purchases_is_read 
    ON notification_video_purchases(is_read);

CREATE INDEX idx_notification_video_purchases_created 
    ON notification_video_purchases(created_at DESC);

-- Create index for common queries
CREATE INDEX idx_notification_video_purchases_creator_unread 
    ON notification_video_purchases(creator_addr, is_read)
    WHERE is_read = false;

-- Function to prevent duplicate notifications per buyer-video per day
CREATE OR REPLACE FUNCTION check_duplicate_video_purchase_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if notification already exists for this buyer-video combination today
    IF EXISTS (
        SELECT 1 FROM notification_video_purchases 
        WHERE buyer_addr = NEW.buyer_addr 
        AND video_id = NEW.video_id 
        AND DATE(created_at) = DATE(CURRENT_TIMESTAMP)
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Duplicate video purchase notification for this buyer-video today';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce uniqueness
CREATE TRIGGER trigger_check_duplicate_video_purchase
    BEFORE INSERT ON notification_video_purchases
    FOR EACH ROW
    EXECUTE FUNCTION check_duplicate_video_purchase_notification();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_video_purchases TO authenticated;
GRANT SELECT ON notification_video_purchases TO anon;

-- Enable RLS
ALTER TABLE notification_video_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own notifications (as creator)
CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" ON notification_video_purchases
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their notifications" ON notification_video_purchases
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

-- RLS Policy: System can insert notifications (admin)
CREATE POLICY "System can insert notifications" ON notification_video_purchases
    FOR INSERT WITH CHECK (true);
