# 🧪 TESTING STEPS - Notification Creation

## Step 1: Ensure Migration is Applied

**Go to:** Supabase Dashboard → SQL Editor

**Run this:**

```sql
-- Check if table exists with correct structure
\d notification_video_comments

-- Output should show:
-- - Column: comment_id (UUID NOT NULL)
-- - Column: video_id (UUID)
-- - Column: creator_addr (TEXT)
-- - Column: commenter_addr (TEXT)
-- - Column: type (TEXT)
-- - Column: message (TEXT)
-- - Column: is_read (BOOLEAN DEFAULT false)
-- - Column: created_at (TIMESTAMP)
-- - Constraint: fk_notification_video_comments_comment
```

**If table doesn't exist:**

Copy full content dari `src/migrations/notification_video_comments.sql` dan run semua di SQL Editor.

---

## Step 2: Verify RLS Policies Allow INSERT

**Go to:** Supabase Dashboard → SQL Editor

**Run this:**

```sql
-- Check ALL RLS policies
SELECT 
    policyname,
    permissive,
    qual AS policy_definition
FROM pg_policies 
WHERE tablename = 'notification_video_comments'
ORDER BY policyname;

-- Should show multiple policies including:
-- - "Users can view their notifications" (SELECT)
-- - "Users can update their notifications" (UPDATE)
-- - "Users can delete their notifications" (DELETE)
-- - "System can insert notifications" (INSERT) ← MUST BE PERMISSIVE=true
-- - "Anyone can insert notifications" (INSERT) ← MUST BE PERMISSIVE=true
```

**If INSERT policy is missing or restrictive:**

Run:

```sql
-- Clear all policies
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

-- Create permissive INSERT policy
CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);

-- Verify it worked
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
AND policyname LIKE '%insert%';
-- Should show: 'Anyone can insert notifications' | true
```

---

## Step 3: Start Dev Server & Create Comment

```bash
# Terminal
npm run dev

# Output should show:
# ▲ Next.js 15.x.x
# Local: http://localhost:3000
```

---

## Step 4: Create Test Comment

1. Open browser: `http://localhost:3000`
2. Login dengan wallet
3. Go to any video
4. Comment on it
5. **WATCH SERVER LOGS** for these exact messages:

```
[POST /api/videos/[id]/comments] Comment inserted successfully: {
  commentId: "550e8400-e29b-41d4-a716-446655440000"
}

[Video Comment Notification] Payload to insert: {
  video_id: "abc123",
  comment_id: "550e8400-e29b-41d4-a716-446655440000",
  creator_addr: "0x...",
  commenter_addr: "0x...",
  type: "video_comment",
  message: "commented on your video \"...\""
}

[Video Comment Notification] Insert response: {
  data: {
    id: "...",
    comment_id: "550e8400...",
    video_id: "abc123",
    ...
  },
  error: null
}

[Video Comment] ✅ Created notification successfully: {...}
```

---

## Step 5: Verify Database

**Go to:** Supabase Dashboard → Table Editor

**Select:** `notification_video_comments`

**Look for:**
- New row should appear
- `comment_id` should have value (not NULL)
- `creator_addr` = video creator's address
- `commenter_addr` = your address

---

## Step 6: Check if Notifications Show in UI

Go back to browser, check notification area for new notification.

---

## ⚠️ TROUBLESHOOTING

### Error 1: "relation \"notification_video_comments\" does not exist"

**Cause:** Migration not applied

**Fix:**
1. Supabase Dashboard → SQL Editor
2. Copy-paste entire content from `src/migrations/notification_video_comments.sql`
3. Click "Run"
4. Go back to Step 1

### Error 2: "new row violates row-level security policy"

**Cause:** RLS policy blocking INSERT

**Fix:**
```sql
-- Supabase SQL Editor
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);
```

### Error 3: "violates foreign key constraint \"fk_notification_video_comments_comment\""

**Cause:** `comment_id` doesn't exist in `video_comments`

**Fix:** This is a bug in the code. Contact if happens.

### Error 4: No debug logs appearing in server console

**Cause:** Dev server not restarted after code changes

**Fix:**
```bash
# Terminal
Ctrl+C  # Stop server
npm run dev  # Restart
```

### Error 5: Still no data in table

**Last resort - Manual test:**

```sql
-- Supabase SQL Editor

-- 1. Get a real video_id
SELECT id FROM videos LIMIT 1;
-- Result: e.g. "video-123-456"

-- 2. Get a real comment_id
SELECT id FROM video_comments LIMIT 1;
-- Result: e.g. "550e8400-e29b-41d4-a716-446655440000"

-- 3. Try manual INSERT
INSERT INTO notification_video_comments (
  video_id,
  comment_id,
  creator_addr,
  commenter_addr,
  type,
  message
) VALUES (
  'video-123-456',  -- from step 1
  '550e8400-e29b-41d4-a716-446655440000',  -- from step 2
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  'video_comment',
  'Test message'
);

-- If success: ✅ Database is OK, issue is in code
-- If error: 🔴 Copy full error message and report
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Migration applied (table exists)
- [ ] RLS policies show INSERT as permissive
- [ ] Server logs show debug messages when creating comment
- [ ] New row appears in `notification_video_comments` table
- [ ] Notification appears in UI

---

**Post results in your next message!** 🚀
