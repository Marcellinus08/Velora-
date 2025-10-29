# Real-time Notification Troubleshooting Guide

## 🔍 Problem: Notifications don't disappear in real-time when unliked/deleted

### ✅ Solution: Enable Supabase Realtime

---

## Step 1: Verify Realtime is Enabled in Supabase Dashboard

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Go to Database** → **Replication**
3. **Find `notifications` table**
4. **Toggle "Enable Realtime"** → ON
5. **Click "Save"**

---

## Step 2: Run SQL to Add Table to Publication

Run this SQL in **Supabase SQL Editor**:

```sql
-- Enable realtime publication for notifications table
DO $$
BEGIN
    -- Remove if exists, then add fresh
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS notifications;
    EXCEPTION
        WHEN undefined_object THEN
            NULL;
    END;
    
    -- Add table to realtime publication
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
END $$;
```

---

## Step 3: Verify Realtime Configuration

### Check Console Logs

Open browser console (F12) and look for these logs:

#### ✅ **Success Indicators:**
```
🔧 Supabase Client created with Realtime enabled
🔴 Realtime enabled: ✅
[useNotifications] 🔄 Setting up real-time subscription for: 0x123...
[useNotifications] 📡 Subscription status: SUBSCRIBED
[useNotifications] ✅ Successfully subscribed to channel: notifications-0x123...
```

#### ❌ **Error Indicators:**
```
[useNotifications] ❌ Subscription error: ...
[useNotifications] 📡 Subscription status: CHANNEL_ERROR
[useNotifications] 📡 Subscription status: TIMED_OUT
```

---

## Step 4: Test Real-time Events

### Test DELETE Event (Unlike):

1. **Open 2 browsers** (or browser + incognito)
2. **User A**: Login and view notifications
3. **User B**: Login and like User A's post
   - ✅ Console should show: `[useNotifications] ✅ Real-time INSERT detected`
   - ✅ Notification appears instantly in User A's list
4. **User B**: Unlike the post
   - ✅ Console should show: `[useNotifications] 🗑️ Real-time DELETE detected`
   - ✅ Notification disappears instantly from User A's list
   - ✅ Badge count decrements

---

## Expected Console Flow

### When User B Likes Post:

**User A's Console:**
```
[useNotifications] ✅ Real-time INSERT detected: {...}
[useNotifications] New notification ID: abc-123
[useNotifications] Adding notification to list, current count: 2
[useNotifications] Incrementing unread count: 2 → 3
[useNotifications] Fetching complete notification data...
```

### When User B Unlikes Post:

**User A's Console:**
```
[useNotifications] 🗑️ Real-time DELETE detected: {...}
[useNotifications] Deleted notification ID: abc-123
[useNotifications] Removing notification from list
[useNotifications] Previous count: 3 → New count: 2
[useNotifications] Deleted notification was unread: true
[useNotifications] Decrementing unread count: 3 → 2
```

---

## Common Issues & Solutions

### Issue 1: "Subscription status: TIMED_OUT"

**Cause:** Realtime not enabled in Supabase Dashboard

**Solution:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for `notifications` table
3. Refresh your app

---

### Issue 2: "Could not find table in publication"

**Cause:** Table not added to `supabase_realtime` publication

**Solution:**
Run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### Issue 3: DELETE event not firing

**Cause:** RLS (Row Level Security) policies

**Solution:**
Make sure DELETE operations use `supabaseAdmin` (service role key), not client key:

```typescript
// ✅ CORRECT - Uses admin (bypasses RLS)
await supabaseAdmin
  .from("notifications")
  .delete()
  .eq("id", notificationId);

// ❌ WRONG - Uses client (RLS might block)
await supabase
  .from("notifications")
  .delete()
  .eq("id", notificationId);
```

---

### Issue 4: Filter not working

**Cause:** Filter syntax incorrect

**Solution:**
Use exact filter format:
```typescript
filter: `abstract_id=eq.${abstractId}`
//       ^^^^^^^^^^^^^ column name
//                    ^^^ operator
//                       ^ value
```

---

## Debug Checklist

- [ ] Realtime enabled in Supabase Dashboard (Database → Replication)
- [ ] Table added to publication (`ALTER PUBLICATION supabase_realtime ADD TABLE notifications`)
- [ ] Console shows "SUBSCRIBED" status
- [ ] Console shows "✅ Successfully subscribed to channel"
- [ ] INSERT events working (notifications appear)
- [ ] UPDATE events working (mark as read)
- [ ] DELETE events working (notifications disappear) ⚠️ **This is what we're fixing!**
- [ ] Using `supabaseAdmin` for DELETE operations
- [ ] Filter syntax correct: `abstract_id=eq.${abstractId}`

---

## Test Script

Run this in browser console to test DELETE:

```javascript
// Get current notifications
const notifs = window.__notifications || [];
console.log("Current notifications:", notifs.length);

// Delete one notification manually
fetch('/api/notifications/' + notifs[0]?.id, { 
  method: 'DELETE' 
})
.then(() => console.log('✅ Deleted'))
.catch(console.error);

// Watch console for DELETE event
// Should see: [useNotifications] 🗑️ Real-time DELETE detected
```

---

## Still Not Working?

1. **Check Supabase Logs**: Dashboard → Logs → Realtime
2. **Check Network Tab**: Look for WebSocket connection
3. **Verify Environment Variables**:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. **Restart Development Server**: `npm run dev`
5. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)

---

## Success Criteria

✅ Like post → Notification appears **instantly** (no refresh)  
✅ Unlike post → Notification disappears **instantly** (no refresh)  
✅ Mark as read → Visual updates **instantly** (no refresh)  
✅ Delete comment → All related notifications disappear **instantly** (no refresh)  

**All operations should be REAL-TIME!** 🚀
