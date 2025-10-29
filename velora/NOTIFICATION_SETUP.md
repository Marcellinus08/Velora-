# Notification System Setup

## Step 1: Enable Foreign Key Relationship

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- Add foreign key constraint for actor_addr to profiles
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_actor_addr_fkey;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_actor_addr_fkey
  FOREIGN KEY (actor_addr)
  REFERENCES profiles(abstract_id)
  ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_actor_addr ON notifications(actor_addr);
CREATE INDEX IF NOT EXISTS idx_notifications_abstract_id_unread ON notifications(abstract_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## Step 2: Verify Tables Exist

Pastikan tabel-tabel ini sudah ada:

### ✅ `profiles` table
- `abstract_id` (TEXT, PRIMARY KEY)
- `username` (TEXT)
- `avatar_url` (TEXT)

### ✅ `notifications` table
- `id` (UUID, PRIMARY KEY)
- `abstract_id` (TEXT) - penerima notifikasi
- `user_id` (TEXT) - penerima notifikasi (duplikat)
- `actor_addr` (TEXT) - yang melakukan aksi
- `type` (TEXT) - "like", "comment", "reply", "follow"
- `message` (TEXT)
- `target_id` (TEXT) - ID post/comment
- `target_type` (TEXT) - "post", "comment", "video"
- `metadata` (JSONB)
- `is_read` (BOOLEAN, default false)
- `created_at` (TIMESTAMP)
- `read_at` (TIMESTAMP)

## Step 3: Enable Realtime di Supabase Dashboard

1. Buka **Supabase Dashboard** → **Database** → **Replication**
2. Cari table `notifications`
3. Toggle **Enable Realtime** ON

## Step 4: Test Notifikasi

1. Login dengan 2 akun berbeda (gunakan 2 browser/incognito)
2. User A: Buat post
3. User B: Like post dari User A
4. User A: Seharusnya langsung melihat notifikasi muncul (real-time!)

## Troubleshooting

### Error: "Could not find relationship"
**Solusi:** Jalankan Step 1 (SQL foreign key)

### Error: "notifications table not ready"
**Solusi:** Pastikan tabel `notifications` sudah dibuat

### Notifikasi tidak muncul real-time
**Solusi:** 
1. Pastikan realtime sudah enabled (Step 3)
2. Check console browser untuk error
3. Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar di `.env.local`

### Notifikasi tidak masuk database
**Solusi:** 
1. Check console browser network tab untuk error API
2. Pastikan user sudah login (ada `abstract_id`)
3. Pastikan tidak like/comment post sendiri (tidak akan kirim notifikasi)
