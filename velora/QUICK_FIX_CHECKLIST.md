# ✅ ACTIONABLE CHECKLIST - Fix Notification Creation

**Estimated Time:** 15 minutes  
**Difficulty:** Easy (just verifying database)

---

## 📋 DO THESE 3 THINGS IN ORDER

### ✅ STEP 1: Verify Migration in Supabase (2 min)

**Go to:** `https://app.supabase.com` → Your Project → SQL Editor

**Run this command:**

```sql
\d notification_video_comments
```

**Result:**
- ✅ If shows table structure = Migration OK, go to Step 2
- ❌ If shows error "does not exist" = Migration not applied

**IF MIGRATION NOT APPLIED:**

1. Open file: `src/migrations/notification_video_comments.sql`
2. Copy **ENTIRE FILE CONTENT**
3. Go back to Supabase SQL Editor
4. Paste all content
5. Click "Run"
6. Then re-run `\d notification_video_comments` to verify

---

### ✅ STEP 2: Verify RLS Policy Allows INSERT (3 min)

**Still in Supabase SQL Editor, run:**

```sql
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
AND policyname LIKE '%insert%';
```

**Result:**
- ✅ If shows 1-2 rows with `permissive = t` (true) = OK, go to Step 3
- ❌ If shows `permissive = f` (false) or NO rows = RLS broken

**IF RLS BROKEN:**

Run this:

```sql
DROP POLICY IF EXISTS "System can insert notifications" ON notification_video_comments;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notification_video_comments;

CREATE POLICY "Anyone can insert notifications" ON notification_video_comments
    FOR INSERT WITH CHECK (true);
```

Then verify again:

```sql
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notification_video_comments' 
AND policyname LIKE '%insert%';
```

Should now show `'Anyone can insert notifications' | t`

---

### ✅ STEP 3: Restart Dev Server & Test (10 min)

**Terminal at workspace root:**

```bash
# If running:
Ctrl+C

# Restart:
npm run dev

# Wait for:
# ▲ Next.js 15.x.x
# - Local: http://localhost:3000
```

**NOW TEST:**

1. Open `http://localhost:3000`
2. Login with Wallet A
3. Create/upload a video
4. Note: Your address (e.g., `0xAAAA...`)

5. **Switch to Wallet B** (different address)
6. Find Wallet A's video
7. Add comment: `"Test comment"`

8. **Watch Server Console** for these logs:

```
[POST /api/videos/[id]/comments] Comment inserted successfully: {
  commentId: "550e8400-e29b-41d4-a716-446655440000"
}

[Video Comment Notification] Payload to insert: {
  video_id: "...",
  comment_id: "550e8400-e29b-41d4-a716-446655440000",
  creator_addr: "0xaaaa...",
  commenter_addr: "0xbbbb...",
  ...
}

[Video Comment Notification] Insert response: {
  data: { id: "...", comment_id: "550e8400...", ... },
  error: null
}

[Video Comment] ✅ Created notification successfully: {...}
```

---

## 🎯 VERIFICATION

**Do ALL of these:**

- [ ] Migration applied (table exists)
- [ ] RLS policy allows INSERT (permissive = true)
- [ ] Dev server restarted
- [ ] Created comment with 2 different wallets
- [ ] Server console shows debug logs
- [ ] No error messages in console

**Then check database:**

**Go to:** Supabase → Table Editor → `notification_video_comments`

**Should see:**
- [ ] New row appeared
- [ ] `comment_id` has value (UUID)
- [ ] `creator_addr` = Wallet A address
- [ ] `commenter_addr` = Wallet B address  
- [ ] `message` = "commented on your video..."
- [ ] `created_at` = recent timestamp

---

## ✨ EXPECTED SUCCESS

When everything works:

```
✅ Comment appears in UI
✅ Server logs show all debug messages
✅ New row in notification_video_comments table
✅ Notification shows in UI (if you have notification UI)
✅ Real-time update works
```

---

## 🚨 TROUBLESHOOTING

### Problem: No debug logs in console

**Solution:**
```bash
# Press Ctrl+C to stop
Ctrl+C

# Restart
npm run dev
```

Logs only show after dev server restart.

---

### Problem: Console shows error

**If you see:**

```
[Video Comment Notification] ❌ INSERT FAILED - Error Details: {
  code: "42P01",
  message: "relation \"notification_video_comments\" does not exist"
}
```

**Fix:** Go back to Step 1, migration not applied.

---

**If you see:**

```
[Video Comment Notification] ❌ INSERT FAILED - Error Details: {
  code: "42501",
  message: "new row violates row-level security policy"
}
```

**Fix:** Go back to Step 2, RLS policy blocking INSERT.

---

### Problem: No new row in database

**Possible causes:**
1. ❌ Notification insert silently failed (check logs)
2. ❌ Wrong addresses (wallet not switched)
3. ❌ Commenting on own video (no notification for self)

**Test fix:**

```sql
-- Supabase SQL Editor

-- Get actual comment ID from recent comment
SELECT id, video_id FROM video_comments ORDER BY created_at DESC LIMIT 1;

-- Try manual insert (copy IDs from above)
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
  'Test message'
);

-- If success: error is in Node.js code
-- If error: copy full error message
```

---

## 📝 Report Format

When reporting issues, provide:

1. **Environment:**
   - OS: Windows/Mac/Linux
   - Node version: `node --version`
   - npm version: `npm --version`

2. **Steps taken:**
   - [ ] Migration verified/applied
   - [ ] RLS policy verified/fixed
   - [ ] Dev server restarted
   - [ ] Test comment created

3. **Error (if any):**
   - Copy full console error message
   - Screenshot of error
   - Console logs before error

4. **Database state:**
   - Count of rows: `SELECT COUNT(*) FROM notification_video_comments;`
   - Any rows present? (yes/no)
   - FK constraint exists? (yes/no)

---

## ✅ SUCCESS CRITERIA

Feature is WORKING when:

1. ✅ No errors in server console
2. ✅ All debug logs appear (payload, response, success message)
3. ✅ New row appears in `notification_video_comments` table
4. ✅ Row has `comment_id` (FK) with valid UUID
5. ✅ Notification appears in UI (if notification UI exists)

---

## 🚀 Next Phase (After Fix)

Once notifications are inserting:

1. Real-time will automatically work (WebSocket is stable)
2. Build notification UI to display them
3. Add mark-as-read functionality
4. Add delete notifications feature
5. Add more notification types (likes, purchases, etc)

---

**Ready? Start with Step 1!** 🎯
