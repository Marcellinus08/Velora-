# Video Purchase Notifications - Complete Debugging Guide

## Steps to Debug

### Step 1: Check Browser Console Logs

Open browser DevTools (F12) → Console tab and look for these logs:

```
[NotificationsMenu] Current user address: { address: '0x...', abstractId: '0x...' }
[useNotifications] ===== FETCH START =====
[useNotifications] Fetching for address: 0x...
[useNotifications] Address type: string Length: 42
[useNotifications] ===== QUERY RESULTS =====
[useNotifications] Community Likes: 0
[useNotifications] Community Replies: 0
[useNotifications] Reply Likes: 0
[useNotifications] Video Purchases: 0 ← THIS SHOULD BE 1+
```

### Step 2: Test Debug Endpoint

Open browser and navigate to:
```
http://localhost:3000/api/notifications/debug?addr=0xYOUR_ADDRESS_HERE
```

**Example:**
```
http://localhost:3000/api/notifications/debug?addr=0xabcd1234...
```

**Expected Response:**
```json
{
  "address": "0xabcd1234...",
  "count": 1,
  "notifications": [
    {
      "id": "uuid",
      "buyer_addr": "0x...",
      "creator_addr": "0xabcd1234...",
      "video_id": "uuid",
      "message": "...",
      "is_read": false,
      "created_at": "2025-10-31T...",
      ...
    }
  ]
}
```

If `count: 0` → data tidak ada di database  
If `count: 1+` → data ada, tapi RLS policy blocking access

### Step 3: Query Notifications Directly

Check what's actually in the database:

```sql
-- Check if data exists
SELECT id, buyer_addr, creator_addr, video_id, created_at 
FROM notification_video_purchases
ORDER BY created_at DESC
LIMIT 10;

-- Check what address format is used
SELECT DISTINCT creator_addr 
FROM notification_video_purchases;

-- Check RLS policies
SELECT polname, poltype, polqual
FROM pg_policy
WHERE polrelid = 'public.notification_video_purchases'::regclass;
```

### Step 4: Check Address Matching

**Critical Debugging:**

In browser console, run:
```javascript
// Get your current address
const { data: { user } } = await supabase.auth.getUser();
console.log('Auth user:', user.user_metadata);

// Your address should be in abstract_id or user_id
```

Then compare:
- Address from `/api/notifications/debug?addr=YOUR_ADDR`
- Address stored in `creator_addr` in database
- Address in JWT token

Must match **exactly** (case-insensitive with LOWER())

---

## Possible Issues & Solutions

### Issue 1: Video Purchases: 0 (but data exists in debug endpoint)

**Problem**: RLS policy still blocking access  
**Solution**:

1. Check RLS policy has LOWER():
```sql
SELECT pg_get_expr(polqual, polrelid)
FROM pg_policy
WHERE polrelid = 'public.notification_video_purchases'::regclass
AND polname = 'Users can view their notifications';
```

Should show: `creator_addr = lower(auth.jwt() ->> 'abstract_id')`

2. If not using LOWER(), run:
```sql
DROP POLICY "Users can view their notifications" ON notification_video_purchases;

CREATE POLICY "Users can view their notifications" ON notification_video_purchases
    FOR SELECT USING (creator_addr = LOWER(auth.jwt()->>'abstract_id'));
```

### Issue 2: Debug endpoint returns count: 0

**Problem**: No data in database  
**Solution**: Check if API is creating notifications:

1. Check API logs:
```
[Video Purchase] Created notification: {uuid}
```

2. If no log, notification creation failed silently. Check:
```
- Did purchase complete? (video_purchases table should have entry)
- Did creator_addr match? (buyer !== creator check)
- Check API error logs in Supabase dashboard
```

### Issue 3: Address mismatch

**Problem**: Addresses don't match between database and auth token  
**Solution**:

1. Video created with address: `0xABCD1234...` (mixed case)
2. Stored as: `0xabcd1234...` (lowercase in API)
3. Auth token has: `0xABCD1234...` (original case)
4. LOWER() converts token to `0xabcd1234...` → Match! ✓

Make sure LOWER() is in RLS policy!

---

## Quick Test Workflow

1. **Add debug logs** (✅ Already done)
2. **Open browser console** (F12)
3. **Navigate to notification page**
4. **Look for logs** - check Video Purchases count
5. **If count: 0**:
   - Open `/api/notifications/debug?addr=YOUR_ADDR`
   - If debug returns data → RLS issue (run SQL fix above)
   - If debug returns 0 → No data in database (check API logs)

---

## Complete Address Flow

```
Purchase Request
    ↓
API receives buyer address (from wallet)
    ↓
Query videos table for creator abstract_id
    ↓
Convert to lowercase: abstract_id.toLowerCase()
    ↓
INSERT into notification_video_purchases
    creator_addr = lowercase_address
    ↓
Frontend fetches with:
    .eq("creator_addr", addr.toLowerCase())
    ↓
RLS Policy checks:
    creator_addr = LOWER(auth.jwt()->>'abstract_id')
    ↓
If auth token is '0xABCD...':
    LOWER('0xABCD...') = '0xabcd...' ✓ MATCH
```

---

## Files with Debug Info

- `src/components/header/notificationsmenu.tsx` - Logs current address
- `src/hooks/use-notifications.ts` - Detailed fetch logs
- `src/app/api/notifications/debug/route.ts` - Admin bypass endpoint (NEW)

---

## Production Checklist

- [ ] Video Purchases: count > 0 in console
- [ ] Debug endpoint shows data
- [ ] RLS policies use LOWER()
- [ ] Notifications appear in UI with 💰 icon
- [ ] Can mark as read
- [ ] Can delete
- [ ] Real-time updates work

---

## Next Actions

1. **Check browser console** for Video Purchases count
2. **Test debug endpoint** with your address
3. **Compare addresses** - database vs auth token
4. **Report findings** with console logs

Once we see the logs, can pinpoint exact issue!
