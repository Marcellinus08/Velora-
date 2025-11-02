# ⚡ QUICK SQL COMMANDS - Copy & Paste Ready

Use these in **Supabase Dashboard → SQL Editor**

---

## 1️⃣ CHECK TABLE EXISTS

```sql
\d notification_video_comments
```

If shows error `ERROR: relation "notification_video_comments" does not exist` → Go to #5

---

## 2️⃣ CHECK RLS POLICIES

```sql
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
ORDER BY policyname;
```

Should show 5 policies, all with `permissive = t`

---

## 3️⃣ FIX RLS POLICIES (if INSERT missing or restrictive)

```sql
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);
```

Then verify:

```sql
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
AND policyname LIKE '%insert%';
```

---

## 4️⃣ TEST MANUAL INSERT

```sql
-- Get valid IDs first
SELECT id FROM videos LIMIT 1;           -- Copy video_id
SELECT id FROM video_comments LIMIT 1;   -- Copy comment_id

-- Then run (replace XXX with actual IDs):
INSERT INTO notification_video_comments (
  video_id,
  comment_id,
  creator_addr,
  commenter_addr,
  type,
  message
) VALUES (
  'VIDEO_ID_FROM_ABOVE',
  'COMMENT_ID_FROM_ABOVE',
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  'video_comment',
  'Test'
);

-- Result: INSERT 0 1 ✅ (if success)
-- Or error message (if failed)
```

---

## 5️⃣ CREATE TABLE (if doesn't exist)

Copy entire file `src/migrations/notification_video_comments.sql` and paste here, then click Run.

Or just run this if you want quick version:

```sql
CREATE TABLE IF NOT EXISTS notification_video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL,
    comment_id UUID NOT NULL UNIQUE,
    creator_addr TEXT NOT NULL,
    commenter_addr TEXT NOT NULL,
    type TEXT DEFAULT 'video_comment',
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_notification_video_comments_video
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_video_comments_comment
        FOREIGN KEY (comment_id) REFERENCES video_comments(id) ON DELETE CASCADE
);

ALTER TABLE notification_video_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their notifications" ON notification_video_comments
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can update their notifications" ON notification_video_comments
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can delete their notifications" ON notification_video_comments
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON notification_video_comments TO authenticated;
GRANT SELECT ON notification_video_comments TO anon;
```

---

## 6️⃣ VIEW RECENT NOTIFICATIONS

```sql
SELECT 
    id,
    video_id,
    comment_id,
    creator_addr,
    commenter_addr,
    message,
    created_at
FROM notification_video_comments
ORDER BY created_at DESC
LIMIT 20;
```

---

## 7️⃣ DELETE ALL NOTIFICATIONS (for testing)

```sql
DELETE FROM notification_video_comments;
```

Then create new ones to test.

---

## 8️⃣ COUNT NOTIFICATIONS

```sql
SELECT COUNT(*) FROM notification_video_comments;
```

Should increase when you create comments.

---

**Copy, Paste, Run!** 🚀
