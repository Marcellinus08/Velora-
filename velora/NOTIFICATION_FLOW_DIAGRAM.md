# 🔄 NOTIFICATION CREATION FLOW - VISUAL GUIDE

## Current Flow (What Should Happen)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER A (Video Creator)                        │
│                     Address: 0xAAAA...                           │
└─────────────────────────────────────────────────────────────────┘
                              △
                              │
                         Creates Video
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       VIDEOS TABLE                               │
│                    id: video-123                                 │
│              abstract_id: 0xAAAA...                              │
│                 title: "My Video"                                │
└─────────────────────────────────────────────────────────────────┘
                              △
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    USER B (Commenter)                            │
│                     Address: 0xBBBB...                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                        Adds Comment
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               POST /api/videos/[id]/comments                    │
│                                                                  │
│  Body: {                                                         │
│    userAddr: "0xBBBB...",                                       │
│    content: "Great video!"                                      │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Validate Input  │
                    │     ✅ OK        │
                    └──────────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │  Fetch Video Creator    │
                 │  creator_addr: 0xAAAA.. │
                 │         ✅ OK            │
                 └─────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │ [1] INSERT to video_comments            │
        │     id: comment-uuid                    │
        │     video_id: video-123                 │
        │     user_addr: 0xBBBB...                │
        │     content: "Great video!"             │
        │                                         │
        │ RESULT: ✅ WORKING - Row inserted       │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │ Check: creator ≠ commenter?             │
        │ 0xAAAA... ≠ 0xBBBB...?                 │
        │ YES ✅ → Create notification             │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │ [2] INSERT to notification_video_comments│
        │     comment_id: comment-uuid (FK)       │
        │     video_id: video-123                 │
        │     creator_addr: 0xAAAA...             │
        │     commenter_addr: 0xBBBB...           │
        │     message: "commented on your..."     │
        │                                         │
        │ RESULT: ❌ NOT WORKING - Row NOT created│
        │ (But no error message?)                 │
        └─────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Response   │
                    │  comment object  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │    UI Updates    │
                    │ Comment appears  │
                    │ BUT Notification │
                    │   Does NOT show  │
                    └──────────────────┘
```

---

## What's Broken

```
[2] INSERT to notification_video_comments is FAILING
    ↓
Possible Reasons:
    ├─ 1️⃣ RLS Policy blocking INSERT (60%)
    │   └─ Even service role bypassed?
    │
    ├─ 2️⃣ Table doesn't exist (30%)
    │   └─ Migration not applied in Supabase
    │
    └─ 3️⃣ Environment issue (10%)
        └─ SUPABASE_SERVICE_ROLE_KEY not set
```

---

## Database Schema Involved

### Table: videos
```
id (PK)          │ abstract_id  │ title
─────────────────┼──────────────┼───────────
video-123        │ 0xAAAA...    │ My Video
```

### Table: video_comments
```
id (PK)          │ video_id  │ user_addr │ content
─────────────────┼───────────┼───────────┼──────────────
comment-uuid ✅  │ video-123 │ 0xBBBB... │ Great video!
```

### Table: notification_video_comments (ISSUE HERE ❌)
```
id (PK)          │ comment_id (FK)   │ video_id  │ creator_addr │ commenter_addr
─────────────────┼───────────────────┼───────────┼──────────────┼──────────────
???              │ comment-uuid ⚠️   │ video-123 │ 0xAAAA...    │ 0xBBBB...
                 │ (Should be here   │           │              │
                 │  but data missing)│           │              │
```

---

## Debug Points

### ✅ Working Path
```
User Input
    ↓
API Endpoint Received ✅
    ↓
Input Validated ✅
    ↓
Video Fetched ✅
    ↓
Comment Inserted ✅ (Confirmed in DB)
    ↓
Check: Should notify? ✅ (YES - different users)
    ↓
❌ STOPS HERE - Notification not inserted
```

### ✅ Debug Logs That Should Appear
```
[POST /api/videos/[id]/comments] Video data retrieved: {...} ✅
[POST /api/videos/[id]/comments] Comment inserted successfully: {...} ✅
[Video Comment Notification] Payload to insert: {...} ✅
[Video Comment Notification] Insert response: {...} ⚠️
```

---

## RLS Policy Check

### Current Policies
```
SELECT     → Users can view their notifications (WORKING)
UPDATE     → Users can update their notifications (WORKING)
DELETE     → Users can delete their notifications (WORKING)
INSERT     → ??? Must allow all (MIGHT BE BROKEN)
```

### INSERT Policy MUST be
```sql
CREATE POLICY "Anyone can insert notifications" 
    ON notification_video_comments
    FOR INSERT 
    WITH CHECK (true);  ← THIS IS KEY!
```

NOT this:
```sql
WITH CHECK (creator_addr = current_user)  ← WRONG! Blocks INSERT
```

---

## What Happens During INSERT

```
Request comes in
    ↓
Is user authenticated? (Yes, via service_role)
    ↓
Does RLS policy allow INSERT?
    ├─ ✅ Yes (WITH CHECK (true)) → Row inserted ✓
    └─ ❌ No (WITH CHECK (something)) → Error: violates RLS policy ✗
```

---

## Environment Requirements

```
.env.local
├─ NEXT_PUBLIC_SUPABASE_URL        ✅ Present
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY   ✅ Present
└─ SUPABASE_SERVICE_ROLE_KEY       ✅ Present (CRITICAL!)
                                      │
                                      └─ Allows .insert() to bypass RLS
```

---

## Fix Summary

```
        ┌─────────────────────────────┐
        │  Issue: Notification ❌     │
        └─────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Fix #1      Fix #2      Fix #3
    ────────      ────────    ────────
   Verify RLS   Apply Migration  Restart
   is Permissive               Dev Server
                                
   1 min          5 min           1 min
```

---

## Success Criteria

```
Before
  ├─ Comment appears ✅
  └─ Notification appears ❌

After
  ├─ Comment appears ✅
  ├─ Notification appears ✅
  ├─ Real-time fires ✅
  └─ UI updates ✅
```

---

## Code Components

```
API Route               Schema              Hooks
├─ route.ts           ├─ migration SQL    ├─ use-notifications
│  ├─ POST            │  ├─ Table          │  ├─ Query
│  │  ├─ Validate     │  ├─ FK constraint  │  └─ Subscribe
│  │  ├─ Insert       │  ├─ RLS            │
│  │  │  comment ✅   │  │  ├─ SELECT      │
│  │  └─ Insert       │  │  ├─ UPDATE      │
│  │     notif ❌     │  │  ├─ DELETE      │
│  └─ GET             │  │  └─ INSERT ⚠️   │
│                     │  └─ Indexes        │
└─ route.ts shared    └─                 └─
```

---

## Next Phase (After Fix)

```
✅ Notifications inserting
    ↓
✅ Real-time working (already stable)
    ↓
✅ UI showing notifications
    ↓
✅ Mark as read
    ↓
✅ Delete notifications
    ↓
✅ Add more types (likes, purchases, etc)
```

---

**Current Status:** 🔴 BLOCKED AT INSERTION PHASE
**Fix Time:** 15 minutes
**Effort:** Easy (just verify database config)
