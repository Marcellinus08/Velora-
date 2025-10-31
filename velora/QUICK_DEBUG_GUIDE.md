# 🔧 Debugging Video Purchase Notifications

## Quick Diagnosis

1. **Open page**: http://localhost:3000/debug-notifications
2. **Connect wallet**
3. **Click "Test Notifications" button**
4. **Check results** to determine root cause

---

## Expected Results

### ✅ Everything Working
```
Admin endpoint: count = 1+ (data found)
Direct query:   count = 1+ (RLS allows access)
Result: Notifications should appear ✓
```

### ❌ Data Not Fetching (RLS Blocking)
```
Admin endpoint: count = 1+ (data exists)
Direct query:   count = 0  (RLS blocks access)
Root cause: RLS policies need LOWER()
Action: Run SQL fix below
```

### ❌ Data Not Created (API Issue)
```
Admin endpoint: count = 0 (no data)
Direct query:   count = 0 (nothing to fetch)
Root cause: API not creating notifications
Action: Check purchase API logs
```

---

## If Still Not Working

### Fix Option 1: Update RLS Policies via SQL

Run in Supabase SQL editor:

```sql
DROP POLICY IF EXISTS "Users can view their notifications" ON notification_video_purchases;
DROP POLICY IF EXISTS "Users can update their notifications" ON notification_video_purchases;
DROP POLICY IF EXISTS "Users can delete their notifications" ON notification_video_purchases;

CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can update their notifications" ON notification_video_purchases
    FOR UPDATE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));

CREATE POLICY "Users can delete their notifications" ON notification_video_purchases
    FOR DELETE USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));
```

Then refresh page and test again.

### Fix Option 2: Check Purchase API

Look for logs when purchasing:
```
[Video Purchase Notification] Error: ...
```

If error, check:
1. Video has `abstract_id` (creator address)
2. Buyer address is valid
3. Buyer ≠ Creator
4. Table `notification_video_purchases` exists

---

## Console Logs to Check

Press F12 → Console tab

Look for:
```
✓ [NotificationsMenu] Current user address: { address: '0x...', abstractId: '0x...' }
✓ [useNotifications] Fetching for address: 0x...
✓ [useNotifications] Video Purchases: 1  ← Should be > 0
```

If "Video Purchases: 0" even with data in database:
→ RLS policy issue (need LOWER())

---

## Complete Workflow to Test

1. **Setup**:
   - Open `/debug-notifications` page
   - Connect wallet (User A)
   - Note address: e.g., `0xAAA...`

2. **Check Data**:
   - Click "Test Notifications"
   - See if admin endpoint shows data

3. **Check RLS**:
   - If admin shows data but direct query shows 0
   - RLS policies are blocking
   - Run SQL fix above

4. **Test Purchase**:
   - Open new browser/incognito (User B)
   - Buy video from User A
   - Switch back to User A browser
   - Refresh `/debug-notifications`
   - Should show new notification

5. **Check UI**:
   - Go to notification bell icon
   - Should show notification with 💰 emoji

---

## Files for Testing

- Debug page: `src/app/debug-notifications/page.tsx` (NEW)
- Debug endpoint: `src/app/api/notifications/debug/route.ts` (NEW)
- Hook with logs: `src/hooks/use-notifications.ts` (UPDATED)
- Component logs: `src/components/header/notificationsmenu.tsx` (UPDATED)

---

## Report With These Details

Once you test, report:

1. **Admin endpoint result**: count = ?
2. **Direct query result**: count = ?
3. **Browser console**: Video Purchases: ?
4. **Test purchase**: Did you actually purchase from different account?
5. **Database data**: Does `notification_video_purchases` table have rows?

With these details, can pinpoint exact issue!

---

## TL;DR

```
1. Go to http://localhost:3000/debug-notifications
2. Connect wallet
3. Click "Test Notifications"
4. Share screenshot of results
5. I'll give next steps
```
