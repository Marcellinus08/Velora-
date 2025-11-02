# 🔍 DEBUG: Notification Not Inserting - Fix Guide

## ❌ Problem: Comments masuk tapi notification tidak

**Tanda-tanda:**
- ✅ Comment muncul di UI
- ✅ Data masuk ke `video_comments` table
- ❌ Data TIDAK masuk ke `notification_video_comments` table

---

## 🔎 Diagnosa: Penyebab Umum

### Penyebab #1: RLS Policy Blocking INSERT (80% kemungkinan)

**Tanda:** Console error: `new row violates row-level security policy`

**Fix:**

Go to Supabase SQL Editor dan jalankan:

```sql
-- Check current RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'notification_video_comments';

-- DROP existing restrictive policies
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

-- CREATE permissive INSERT policy
CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);

-- Verify
\d+ notification_video_comments
```

---

### Penyebab #2: Missing SUPABASE_SERVICE_ROLE_KEY

**Tanda:** 
- Console: `undefined` atau env variable error
- Notification insert fail silently

**Fix:**

Check `.env.local` (or `.env`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  ← HARUS ADA INI!
```

Jika tidak ada:

1. Buka Supabase Dashboard
2. Settings → API Keys
3. Copy: Service role secret
4. Paste ke `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=...`
5. Restart `npm run dev`

---

### Penyebab #3: Migration Belum Dijalankan

**Tanda:**
- Table `notification_video_comments` tidak ada
- atau Foreign Key constraint tidak ada

**Fix:**

1. Supabase Dashboard → SQL Editor
2. Run migration: `src/migrations/notification_video_comments.sql`
3. Verify table exists dan punya FK constraint

```sql
-- Verify table
\d notification_video_comments

-- Should show:
-- Columns: id, commenter_addr, creator_addr, video_id, 
--          comment_id (NOT NULL), type, message, is_read, created_at
-- Constraint: fk_notification_video_comments_comment
```

---

### Penyebab #4: FK Constraint Violation

**Tanda:** Error: `violates foreign key constraint`

**Fix:**

Ensure `comment_id` is valid:

```sql
-- Check: comment exists when notification insert
SELECT * FROM video_comments WHERE id = '...comment_id...';

-- If empty = comment doesn't exist
-- Fix: Comment must be inserted BEFORE notification
```

---

## 🛠️ Step-by-Step Debugging

### Step 1: Check Console Logs

When creating comment, look for:

```javascript
// SHOULD see:
[POST /api/videos/[id]/comments] Comment inserted successfully: {
  commentId: "UUID",
  videoId: "...",
  userAddr: "0x..."
}

[Video Comment Notification] Payload to insert: {
  video_id: "...",
  comment_id: "UUID",  ← THIS MUST BE VALID UUID!
  creator_addr: "0x...",
  commenter_addr: "0x...",
  message: "..."
}

[Video Comment] ✅ Created notification successfully: {
  notificationId: "UUID",
  ...
}

// IF ERROR:
[Video Comment Notification] ❌ INSERT FAILED - Error Details: {
  code: "42P01",  ← Table not found
  message: "relation \"notification_video_comments\" does not exist"
  // OR
  code: "42501",  ← RLS policy blocking
  message: "new row violates row-level security policy"
  // OR
  code: "23503",  ← FK constraint violation
  message: "violates foreign key constraint"
}
```

### Step 2: Verify RLS Policies

```sql
-- Supabase SQL Editor
SELECT * FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
ORDER BY policyname;

-- Should show:
-- 1. Users can view their notifications (SELECT)
-- 2. Users can update their notifications (UPDATE)
-- 3. Users can delete their notifications (DELETE)
-- 4. Anyone can insert notifications (INSERT) ← THIS MUST ALLOW TRUE!
```

### Step 3: Test INSERT Manually

```sql
-- Supabase SQL Editor
-- First: Get valid comment_id from video_comments
SELECT id FROM video_comments LIMIT 1;

-- Then: Try INSERT notification
INSERT INTO notification_video_comments (
  comment_id,
  video_id,
  commenter_addr,
  creator_addr,
  type,
  message
) VALUES (
  'UUID-FROM-ABOVE',
  'video-123',
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  'video_comment',
  'Test message'
);

-- If success: ✅ RLS and FK are OK
-- If error: 🔴 See error message to fix
```

### Step 4: Verify API is Using Admin Client

In `route.ts`, line ~155:

```typescript
// MUST be using supabaseAdmin (service role), NOT sbService (anon)
const { data: insertedNotif, error: notifErr } = await supabaseAdmin  // ← NOT sbService!
  .from("notification_video_comments")
  .insert([notifPayload])
  .select()
  .single();
```

If using `sbService` → Change to `supabaseAdmin`!

---

## ✅ Full Diagnostic Checklist

Run ini untuk verify semua working:

```bash
# 1. Check environment
echo $SUPABASE_SERVICE_ROLE_KEY  # Should have value

# 2. Check database
# In Supabase SQL Editor:
\d notification_video_comments  # Table should exist with FK

# 3. Check RLS
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments';

# 4. Check FK
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'notification_video_comments' 
AND constraint_type = 'FOREIGN KEY';

# 5. Test migration
# Supabase SQL Editor: Run notification_video_comments.sql

# 6. Test API
# Create comment in UI
# Check console for errors

# 7. Verify database
# Supabase Table Editor:
# - notification_video_comments should have rows with comment_id
```

---

## 🚀 Complete Fix (All-in-One)

### Fix #1: Update RLS Policy (Supabase Dashboard)

SQL Editor → Run:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

-- Create new permissive policy
CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);

-- Verify
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
AND policyname LIKE '%insert%';
```

### Fix #2: Verify Environment Variables

`.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  ← ENSURE THIS EXISTS!
```

### Fix #3: Restart Dev Server

```bash
# Terminal
Ctrl+C  # Stop
npm run dev  # Start
```

### Fix #4: Test Again

1. Create new comment
2. Check console for logs
3. Verify database: Should have new notification row

---

## 🎯 Expected Success Output

```javascript
// Terminal/Console when creating comment:

[POST /api/videos/[id]/comments] Video data retrieved: {
  videoId: "abc123",
  creatorAddr: "0x2222...",
  commenterAddr: "0x1111...",
  willCreateNotif: true
}

[POST /api/videos/[id]/comments] Comment inserted successfully: {
  commentId: "550e8400-e29b-41d4-a716-446655440000"
}

[Video Comment Notification] Payload to insert: {
  video_id: "abc123",
  comment_id: "550e8400-e29b-41d4-a716-446655440000",
  creator_addr: "0x2222...",
  commenter_addr: "0x1111...",
  type: "video_comment",
  message: "commented on your video \"My Video\""
}

[Video Comment Notification] Insert response: {
  data: {
    id: "UUID-OF-NOTIFICATION",
    comment_id: "550e8400...",
    video_id: "abc123",
    ...
  },
  error: null
}

[Video Comment] ✅ Created notification successfully: {
  notificationId: "UUID-OF-NOTIFICATION",
  creatorAddr: "0x2222...",
  commenterAddr: "0x1111...",
  videoId: "abc123",
  createdAt: "2025-11-01T10:30:00Z"
}

// Then in Supabase:
// Table: notification_video_comments
// Should have new row with comment_id = "550e8400..."
```

---

## 📞 If Still Not Working

Provide these logs:

1. Console error message (full)
2. Supabase SQL query result:
   ```sql
   SELECT COUNT(*) FROM notification_video_comments;
   SELECT constraint_name FROM information_schema.table_constraints 
   WHERE table_name = 'notification_video_comments';
   ```
3. Environment: `echo $SUPABASE_SERVICE_ROLE_KEY`
4. Screenshot of RLS policies

---

**Let me know what error you get!** 🚀
