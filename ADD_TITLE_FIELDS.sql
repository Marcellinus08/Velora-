-- Add video_title field to notification_video_comments if not exists
ALTER TABLE notification_video_comments
ADD COLUMN IF NOT EXISTS video_title TEXT DEFAULT 'Video';

-- Add video_title field to notification_video_likes if not exists
ALTER TABLE notification_video_likes
ADD COLUMN IF NOT EXISTS video_title TEXT DEFAULT 'Video';

-- Add video_title field to notification_video_purchases if not exists
ALTER TABLE notification_video_purchases
ADD COLUMN IF NOT EXISTS video_title TEXT DEFAULT 'Video';

-- Add post_title field to notification_community_likes if not exists
ALTER TABLE notification_community_likes
ADD COLUMN IF NOT EXISTS post_title TEXT DEFAULT 'Post';

-- Add post_title field to notification_community_replies if not exists
ALTER TABLE notification_community_replies
ADD COLUMN IF NOT EXISTS post_title TEXT DEFAULT 'Post';

-- Add reply_content field to notification_reply_likes if not exists
ALTER TABLE notification_reply_likes
ADD COLUMN IF NOT EXISTS reply_content TEXT DEFAULT 'Reply';

-- Update existing video_comments with titles from videos table
UPDATE notification_video_comments nvc
SET video_title = v.title
FROM videos v
WHERE nvc.video_id = v.id 
AND (nvc.video_title IS NULL OR nvc.video_title = 'Video');

-- Update existing video_likes with titles from videos table
UPDATE notification_video_likes nvl
SET video_title = v.title
FROM videos v
WHERE nvl.video_id = v.id 
AND (nvl.video_title IS NULL OR nvl.video_title = 'Video');

-- Update existing video_purchases with titles from videos table
UPDATE notification_video_purchases nvp
SET video_title = v.title
FROM videos v
WHERE nvp.video_id = v.id 
AND (nvp.video_title IS NULL OR nvp.video_title = 'Video');

-- Update existing community_likes with titles from community_posts table
UPDATE notification_community_likes ncl
SET post_title = cp.title
FROM community_posts cp
WHERE ncl.post_id = cp.id 
AND (ncl.post_title IS NULL OR ncl.post_title = 'Post');

-- Update existing community_replies with titles from community_posts table
UPDATE notification_community_replies ncr
SET post_title = cp.title
FROM community_posts cp
WHERE ncr.post_id = cp.id 
AND (ncr.post_title IS NULL OR ncr.post_title = 'Post');

-- Update existing reply_likes with content from community_replies table
UPDATE notification_reply_likes nrl
SET reply_content = cr.content
FROM community_replies cr
WHERE nrl.reply_id = cr.id 
AND (nrl.reply_content IS NULL OR nrl.reply_content = 'Reply');
