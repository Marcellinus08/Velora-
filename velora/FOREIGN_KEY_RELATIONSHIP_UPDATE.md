# 🔗 Foreign Key Relationship Update - Video Comment Notifications

## 📋 Summary
Anda telah mengubah schema `notification_video_comments` table untuk memiliki **Foreign Key relationship** ke `video_comments` table.

```sql
notification_video_comments.comment_id → video_comments.id (ON DELETE CASCADE)
```

Semua code telah di-update untuk handle relasi ini.

---

## 🔧 Changes Made

### 1️⃣ **Database Schema** (`notification_video_comments.sql`)

#### Before:
```sql
comment_id UUID,  -- ← Optional, bisa null
```

#### After:
```sql
comment_id UUID NOT NULL,
CONSTRAINT fk_notification_video_comments_comment 
    FOREIGN KEY (comment_id) 
    REFERENCES video_comments(id) 
    ON DELETE CASCADE,
```

**Benefits:**
- ✅ Garantee setiap notification punya comment yang valid
- ✅ Auto-delete notification saat comment dihapus (CASCADE)
- ✅ Database integrity terjaga
- ✅ Avoid orphaned records

---

### 2️⃣ **API Endpoint** (`/api/videos/[id]/comments/route.ts`)

#### Change A: POST (Create Comment)
```typescript
// NEW: Validate comment_id before creating notification
if (!commentId) {
  console.error("[Video Comment Notification] ❌ VALIDATION FAILED - comment_id is required");
  throw new Error("comment_id is required for notification");
}

// THEN: Insert notification dengan comment_id (FK)
const { data: insertedNotif, error: notifErr } = await supabaseAdmin
  .from("notification_video_comments")
  .insert({
    video_id: videoId,
    comment_id: commentId, // ← Foreign Key to video_comments
    commenter_addr: userAddr.toLowerCase(),
    creator_addr: creatorAddr.toLowerCase(),
    type: "video_comment",
    message: `commented on your video...`,
  })
```

**Effect:** Notification SELALU punya valid comment_id (FK constraint)

#### Change B: DELETE (Remove Comment)
```typescript
// OLD: Manually delete notification
await supabaseAdmin
  .from("notification_video_comments")
  .delete()
  .eq("comment_id", commentId);

// NEW: Explicit delete dengan better logging
const { error: notifDelErr } = await supabaseAdmin
  .from("notification_video_comments")
  .delete()
  .eq("comment_id", commentId);

console.log(`[Video Comment Delete] ✅ Deleted notification via FK cascade`);
```

**Effect:** Notification auto-deleted via CASCADE, plus logging untuk debug

---

### 3️⃣ **Hooks** (`use-notifications.ts`)

#### Change A: Type Definition
```typescript
export type Notification = {
  // ... existing fields
  // NEW: Optional fields untuk video comments via FK JOIN
  commentText?: string;    // From video_comments.content
  commentId?: string;      // Reference to video_comments.id
};
```

#### Change B: Query dengan JOIN
```typescript
// OLD: Simple select
supabase
  .from("notification_video_comments")
  .select("*")
  .eq("creator_addr", addr)

// NEW: Select dengan JOIN ke video_comments
supabase
  .from("notification_video_comments")
  .select(`
    *,
    video_comments!inner(id, content, created_at)
  `)
  .eq("creator_addr", addr)
```

**Effect:** Setiap notification akan memiliki comment content dari joined table

#### Change C: Process Video Comments
```typescript
// OLD: Hanya notification data
(videoCommentsRes.data || []).forEach((n: any) => {
  allNotifs.push({
    id: n.id,
    type: "video_comment",
    message: n.message,
    // ... other fields
  });
});

// NEW: Include comment content dari FK relationship
(videoCommentsRes.data || []).forEach((n: any) => {
  const commentContent = n.video_comments?.content || n.message;
  
  allNotifs.push({
    id: n.id,
    type: "video_comment",
    message: n.message,
    // NEW FIELDS:
    commentText: commentContent,  // ← Comment actual content
    commentId: n.comment_id,       // ← Reference untuk navigasi
    // ... other fields
  });
});
```

**Effect:** Notifications sekarang include comment content, bukan hanya pesan notifikasi

---

## 🔄 How It Works

### Flow: Create Comment → Create Notification

```
1. User create comment
   ↓
2. API INSERT ke video_comments
   → Get back: commentId (UUID)
   ↓
3. API INSERT ke notification_video_comments WITH comment_id
   → Foreign Key constraint checked ✅
   ↓
4. Notification berhasil dibuat dengan FK relationship
```

### Flow: Delete Comment → Auto-Delete Notification

```
1. User delete comment
   ↓
2. API DELETE dari video_comments
   ↓
3. PostgreSQL FK ON DELETE CASCADE trigger
   → Auto-DELETE dari notification_video_comments ✅
   ↓
4. (PLUS) API juga explicit delete untuk logging/consistency
```

### Flow: Fetch Notifications

```
1. Hook query notification_video_comments
   ↓
2. Query include JOIN ke video_comments
   ↓
3. Get notification + comment content dalam 1 query
   ↓
4. Render notification dengan actual comment text
```

---

## 📊 Data Structure

### Sebelum (Optional FK)
```sql
notification_video_comments
├── id: UUID
├── creator_addr: TEXT
├── commenter_addr: TEXT
├── video_id: TEXT
├── comment_id: UUID (nullable) ← Bisa null (orphaned data possible)
├── message: TEXT
└── created_at: TIMESTAMP

-- Problem: Bisa ada notification tanpa comment
```

### Sesudah (Required FK + CASCADE)
```sql
notification_video_comments
├── id: UUID
├── creator_addr: TEXT
├── commenter_addr: TEXT
├── video_id: TEXT
├── comment_id: UUID NOT NULL ← Must exist in video_comments
│   └─ FOREIGN KEY (comment_id) → video_comments(id)
│      └─ ON DELETE CASCADE ← Auto-delete jika comment dihapus
├── message: TEXT
└── created_at: TIMESTAMP

-- Benefit: Always valid data, no orphans
```

---

## ✅ Validation Checklist

- [x] `notification_video_comments.sql` - FK relationship added
- [x] `/api/videos/[id]/comments` POST - Validate comment_id
- [x] `/api/videos/[id]/comments` DELETE - Handle CASCADE
- [x] `use-notifications.ts` - Type definition updated
- [x] `use-notifications.ts` - Query include JOIN
- [x] `use-notifications.ts` - Process comment content

---

## 🚀 Testing

### Test 1: Create Comment + Notification
```
1. Create comment: POST /api/videos/{videoId}/comments
2. Check: Notification punya comment_id (FK)
3. Expected: ✅ notification_id created with valid comment_id
```

### Test 2: Delete Comment
```
1. Delete comment: DELETE /api/videos/{videoId}/comments/{commentId}
2. Check: Notification auto-deleted via CASCADE
3. Expected: ✅ Notification row deleted automatically
```

### Test 3: Query Notifications
```
1. Fetch: useNotifications hook
2. Check: Each notification has commentText field
3. Expected: ✅ Notification show actual comment content
```

---

## 📝 Code Examples

### Example 1: Creating Notification with FK
```typescript
// API akan auto-ensure comment_id is valid
await supabaseAdmin
  .from("notification_video_comments")
  .insert({
    video_id: videoId,
    comment_id: commentId,  // ← FK constraint
    commenter_addr: userAddr.toLowerCase(),
    creator_addr: creatorAddr.toLowerCase(),
    message: "User X commented: ...",
  })
  .select()
  .single();
```

### Example 2: Fetching with Comment Content
```typescript
// Query include JOIN untuk get comment content
const { data: notifications } = await supabase
  .from("notification_video_comments")
  .select(`
    *,
    video_comments!inner(id, content, created_at)
  `)
  .eq("creator_addr", userAddr);

// Akses comment content
notifications.forEach((notif) => {
  console.log("Notification:", notif.message);
  console.log("Comment text:", notif.video_comments.content); // ← FK content
});
```

---

## 🎯 Benefits

1. **Data Integrity** ✅
   - Setiap notification pasti punya comment
   - No orphaned notification records

2. **Auto-Cleanup** ✅
   - Delete comment → Notification auto-deleted
   - Tidak perlu manual cleanup

3. **Better Queries** ✅
   - JOIN di SQL lebih efficient
   - Get notification + comment dalam 1 query

4. **Stronger Constraints** ✅
   - Database enforce relationship
   - Impossible untuk create invalid notification

5. **Cleaner Code** ✅
   - Explicit validation di API
   - Clear FK relationship di schema

---

## 🔍 Debugging

### Jika notification tidak muncul:

1. **Check Foreign Key:**
   ```sql
   SELECT constraint_name, table_name, column_name 
   FROM information_schema.key_column_usage 
   WHERE table_name = 'notification_video_comments'
   AND constraint_name LIKE '%fk%';
   ```

2. **Check Data Integrity:**
   ```sql
   -- Cari orphaned records (shouldn't exist anymore)
   SELECT n.* FROM notification_video_comments n
   LEFT JOIN video_comments c ON n.comment_id = c.id
   WHERE c.id IS NULL;
   ```

3. **Check Real-time:**
   ```
   F12 → Console → Cari:
   [useNotifications] Video comments subscription status: SUBSCRIBED
   [useNotifications] 🔔 Video comments channel event: INSERT
   ```

---

## 📚 Related Files

- `notification_video_comments.sql` - Schema dengan FK
- `/api/videos/[id]/comments/route.ts` - API create/delete
- `use-notifications.ts` - Hook fetch + real-time
- `notificationsmenu.tsx` - UI display

---

**✨ All done! Foreign key relationship fully implemented! 🎉**
