# Video Purchase Notifications - Debugging & Fix

## Problem Identified
✅ Data masuk di database table `notification_video_purchases`
❌ Notifikasi tidak muncul di frontend

## Root Cause Analysis

### Issue: RLS Policy Case Sensitivity

**Problem**:
- Creator address disimpan sebagai **lowercase** di database (Line 89 `purchases/route.ts`):
  ```typescript
  const creatorAddr = videoData.abstract_id.toLowerCase();
  ```

- Tapi RLS policy membandingkan dengan auth token yang mungkin **mixed case**:
  ```sql
  creator_addr = auth.jwt()->>'abstract_id'  -- ❌ WRONG
  ```

**Example**:
```
Database:     creator_addr = '0xabcd1234...'
Auth token:   abstract_id = '0xABCD1234...'
Comparison:   '0xabcd1234...' = '0xABCD1234...' → FALSE ❌
```

RLS policy blocks SELECT karena address tidak match!

---

## Solution

### Step 1: Fix RLS Policies (Case-Insensitive)

Update migration file dengan LOWER() function:

```sql
-- OLD (WRONG)
CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = auth.jwt()->>'abstract_id');

-- NEW (CORRECT)
CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));
```

**Changes made in**:
- `src/migrations/notification_video_purchases.sql` ✅ UPDATED
- `src/migrations/fix_notification_video_purchases_rls_policies.sql` ✅ CREATED

### Step 2: Apply Migration

Run the fix migration to update RLS policies in production database:

```powershell
cd "c:\Users\marcellinus geofani\OneDrive\Dokumen\GitHub\Velora-\velora"
supabase migration up
```

### Step 3: Verify Fix

Check if RLS policies are now using LOWER():

```sql
-- Check policies on notification_video_purchases table
SELECT polname, poltype, polqual 
FROM pg_policy 
WHERE polrelid = 'public.notification_video_purchases'::regclass;
```

Should show:
```
creator_addr = LOWER(auth.jwt()->>'abstract_id')
```

---

## Verification Steps

### 1. Browser Console
Open browser DevTools and check console logs:

```
[useNotifications] Fetching notifications for: 0x...
[useNotifications] Fetch results: {
  likes: 0,
  replies: 0,
  replyLikes: 0,
  videoPurchases: 1  ← Should show 1 or more
}
[useNotifications] Video purchases data: [...]
```

If `videoPurchases: 0`, then RLS policy is still blocking access.

### 2. Frontend Behavior
After fix applied:
- Refresh page → notification should appear ✓
- Should show 💰 icon ✓
- Message should show buyer address and price ✓
- Notification should be in unread state ✓

### 3. Database Verification
Run SQL to verify data structure:

```sql
-- Check notification data
SELECT id, buyer_addr, creator_addr, video_id, message, is_read, created_at
FROM notification_video_purchases
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policy
SELECT polname, polqual
FROM pg_policy
WHERE polrelid = 'public.notification_video_purchases'::regclass
AND poltype = 'r';  -- SELECT policy
```

---

## Enhanced Frontend Logging

Added comprehensive logging to `use-notifications.ts`:

```typescript
console.log("[useNotifications] Fetch results:", {
  likes: likesRes.data?.length || 0,
  replies: repliesRes.data?.length || 0,
  replyLikes: replyLikesRes.data?.length || 0,
  videoPurchases: videoPurchasesRes.data?.length || 0,  // ← Debug this
});

if (videoPurchasesRes.data && videoPurchasesRes.data.length > 0) {
  console.log("[useNotifications] Video purchases data:", videoPurchasesRes.data);
}
```

This helps debug if:
- Query returns 0 results (RLS blocking)
- Query errors out (permission issue)
- Data structure is wrong

---

## Complete Fix Checklist

### Files Updated
- ✅ `src/migrations/notification_video_purchases.sql` - Updated RLS policies
- ✅ `src/migrations/fix_notification_video_purchases_rls_policies.sql` - New migration
- ✅ `src/hooks/use-notifications.ts` - Added debug logging

### Deployment Steps
1. [ ] Apply migration: `supabase migration up`
2. [ ] Clear browser cache/cookies (Ctrl+Shift+Del)
3. [ ] Refresh page
4. [ ] Check browser console for logs
5. [ ] Verify notification appears

### Testing
1. [ ] Login as User A (video creator)
2. [ ] Create/upload video
3. [ ] Login as User B (different browser/incognito)
4. [ ] Purchase User A's video
5. [ ] Switch to User A browser
6. [ ] Refresh notifications page
7. [ ] Verify notification appears with 💰 icon

---

## Troubleshooting

### If still not working:

#### Check 1: Verify database has data
```sql
SELECT * FROM notification_video_purchases LIMIT 1;
```
Should return data. If empty → API not creating notifications.

#### Check 2: Check RLS is actually lowercase
```sql
SELECT pg_get_expr(polqual, polrelid)
FROM pg_policy
WHERE polrelid = 'public.notification_video_purchases'::regclass
AND polname = 'Users can view their notifications';
```
Should show `LOWER(auth.jwt()...)`

#### Check 3: Test RLS directly
```sql
-- As authenticated user
SELECT * FROM notification_video_purchases
WHERE creator_addr = LOWER(auth.jwt()->>'abstract_id');
```
Should return your notifications.

#### Check 4: Check address format
```typescript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log(user.user_metadata); // Check abstract_id format
```

---

## Why This Happened

### API Logic
```typescript
const creatorAddr = videoData.abstract_id.toLowerCase();  // ← Always lowercase
// Insert with lowercase address
```

### RLS Policy Logic
```sql
creator_addr = auth.jwt()->>'abstract_id'  // ← May be mixed case
-- If token has '0xABCD...', won't match '0xabcd...' in database
```

### Solution
```sql
creator_addr = LOWER(auth.jwt()->>'abstract_id')  // ← Now case-insensitive
-- Comparison always uses lowercase
```

---

## Impact

Once fixed:
- ✅ Notifications appear in real-time
- ✅ Multiple notifications work
- ✅ Mark as read/delete works
- ✅ Real-time sync works
- ✅ Unread count updates

---

## Prevention for Future

Always use LOWER() in RLS policies when comparing addresses:

```sql
-- GOOD
WHERE user_addr = LOWER(auth.jwt()->>'abstract_id')

-- BAD
WHERE user_addr = auth.jwt()->>'abstract_id'
```

---

## Status After Fix

```
✅ RLS policies updated to use LOWER()
✅ Migration file created
✅ Frontend logging added
✅ Ready for deployment

Next: Apply migration and test
```
