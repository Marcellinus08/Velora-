-- ============================================
-- MIGRATION SCRIPT: Sync Existing Purchases to user_video_progress
-- ============================================

-- 1. Create function to calculate points from purchase (40%)
CREATE OR REPLACE FUNCTION calculate_purchase_points(video_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_points NUMERIC;
  purchase_points NUMERIC;
BEGIN
  -- Get total points from video
  SELECT COALESCE(points_total, 0) INTO total_points
  FROM videos
  WHERE id = video_id_param;
  
  -- Calculate 40% for purchase
  purchase_points := FLOOR(total_points * 0.4);
  
  RETURN purchase_points;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Create trigger function for new purchases
-- ============================================
CREATE OR REPLACE FUNCTION create_progress_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  points_earned NUMERIC;
BEGIN
  -- Calculate points
  points_earned := calculate_purchase_points(NEW.video_id);
  
  -- Insert or update progress record
  INSERT INTO user_video_progress (
    user_addr,
    video_id,
    has_purchased,
    has_completed_task,
    has_shared,
    points_from_purchase,
    points_from_task,
    points_from_share,
    total_points_earned,
    purchased_at,
    created_at,
    updated_at
  ) VALUES (
    LOWER(NEW.buyer_id),
    NEW.video_id,
    true,
    false,
    false,
    points_earned,
    0,
    0,
    points_earned,
    NEW.created_at,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (user_addr, video_id) 
  DO UPDATE SET
    has_purchased = true,
    points_from_purchase = points_earned,
    total_points_earned = user_video_progress.points_from_task + user_video_progress.points_from_share + points_earned,
    purchased_at = NEW.created_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Create trigger on video_purchases table
-- ============================================
DROP TRIGGER IF EXISTS trigger_create_progress_on_purchase ON video_purchases;

CREATE TRIGGER trigger_create_progress_on_purchase
AFTER INSERT ON video_purchases
FOR EACH ROW
EXECUTE FUNCTION create_progress_on_purchase();

-- ============================================
-- 4. Migrate existing purchases
-- ============================================
INSERT INTO user_video_progress (
  user_addr,
  video_id,
  has_purchased,
  has_completed_task,
  has_shared,
  points_from_purchase,
  points_from_task,
  points_from_share,
  total_points_earned,
  purchased_at,
  created_at,
  updated_at
)
SELECT 
  LOWER(vp.buyer_id) as user_addr,
  vp.video_id,
  true as has_purchased,
  false as has_completed_task,
  false as has_shared,
  FLOOR(COALESCE(v.points_total, 0) * 0.4) as points_from_purchase,
  0 as points_from_task,
  0 as points_from_share,
  FLOOR(COALESCE(v.points_total, 0) * 0.4) as total_points_earned,
  vp.created_at as purchased_at,
  vp.created_at as created_at,
  NOW() as updated_at
FROM video_purchases vp
INNER JOIN videos v ON vp.video_id = v.id
ON CONFLICT (user_addr, video_id) 
DO UPDATE SET
  has_purchased = true,
  points_from_purchase = EXCLUDED.points_from_purchase,
  total_points_earned = user_video_progress.points_from_task + user_video_progress.points_from_share + EXCLUDED.points_from_purchase,
  purchased_at = EXCLUDED.purchased_at,
  updated_at = NOW();

-- ============================================
-- 5. Verify migration
-- ============================================
-- Check how many records were migrated
SELECT 
  COUNT(*) as total_migrated,
  SUM(points_from_purchase) as total_points_awarded
FROM user_video_progress
WHERE has_purchased = true;

-- Compare with original purchases
SELECT 
  COUNT(*) as total_purchases
FROM video_purchases;

-- Show sample migrated records
SELECT 
  user_addr,
  video_id,
  has_purchased,
  points_from_purchase,
  total_points_earned,
  purchased_at
FROM user_video_progress
WHERE has_purchased = true
LIMIT 10;
