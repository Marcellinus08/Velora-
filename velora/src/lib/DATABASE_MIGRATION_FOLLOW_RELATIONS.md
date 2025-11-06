# Database Migration: Follow Relations Synchronization

## Tujuan
Menghubungkan `notification_follows.id` dengan `profiles_follows.id` sehingga ketika follow record dibuat, notification akan memiliki ID yang sama.

## Schema Changes

### 1. Tambahkan kolom `notification_id` ke `profiles_follows`

```sql
-- Tambah kolom untuk menyimpan reference ke notification
ALTER TABLE profiles_follows
ADD COLUMN notification_id BIGINT;

-- Create index untuk performa query
CREATE INDEX idx_profiles_follows_notification_id 
ON profiles_follows(notification_id);
```

### 2. Buat Foreign Key dari `notification_follows` ke `profiles_follows`

```sql
-- Drop foreign key lama jika ada
ALTER TABLE notification_follows
DROP CONSTRAINT IF EXISTS fk_notification_follows_profiles_follows;

-- Tambah kolom profile_follow_id ke notification_follows
ALTER TABLE notification_follows
ADD COLUMN profile_follow_id BIGINT UNIQUE;

-- Create foreign key
ALTER TABLE notification_follows
ADD CONSTRAINT fk_notification_follows_profiles_follows
FOREIGN KEY (profile_follow_id) 
REFERENCES profiles_follows(id) 
ON DELETE CASCADE;

-- Create index
CREATE INDEX idx_notification_follows_profile_follow_id 
ON notification_follows(profile_follow_id);
```

### 3. Update kolom pada profiles_follows

```sql
-- Update notification_id sesuai dengan profile_follow_id
UPDATE profiles_follows pf
SET notification_id = nf.id
FROM notification_follows nf
WHERE nf.profile_follow_id = pf.id;

-- Atau untuk kasus dimana sudah ada data sebelumnya:
-- Match berdasarkan follower_addr dan followee_addr
UPDATE profiles_follows pf
SET notification_id = nf.id
FROM notification_follows nf
WHERE pf.follower_addr = nf.follower_addr 
AND pf.followee_addr = nf.followee_addr
AND pf.notification_id IS NULL
AND nf.profile_follow_id IS NULL;
```

### 4. (Optional) Buat Foreign Key dari profiles_follows ke profiles

```sql
-- Lebih ketat: pastikan follower dan followee adalah profile yang valid
ALTER TABLE profiles_follows
ADD CONSTRAINT fk_profiles_follows_follower
FOREIGN KEY (follower_addr) 
REFERENCES profiles(abstract_id) 
ON DELETE CASCADE;

ALTER TABLE profiles_follows
ADD CONSTRAINT fk_profiles_follows_followee
FOREIGN KEY (followee_addr) 
REFERENCES profiles(abstract_id) 
ON DELETE CASCADE;
```

## Final Schema

### `profiles_follows`
```
id (int8) - Primary Key
follower_addr (text) - Foreign Key ke profiles(abstract_id)
followee_addr (text) - Foreign Key ke profiles(abstract_id)
notification_id (int8) - Reference ke notification_follows(id)
created_at (timestamptz)
```

### `notification_follows`
```
id (int8) - Primary Key
profile_follow_id (int8) - Unique Foreign Key ke profiles_follows(id)
follower_addr (text)
followee_addr (text)
message (text)
is_read (bool)
read_at (timestamptz)
created_at (timestamptz)
```

## Keuntungan
✓ One-to-One relationship antara follow dan notification
✓ Cascading delete otomatis
✓ ID synchronized
✓ Data integrity terjamin
✓ Query lebih simpel dengan join

## Cara Eksekusi di Supabase

1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste SQL migration di atas
3. Jalankan satu per satu dengan `Run`
4. Verify hasilnya dengan query:
   ```sql
   SELECT pf.id, pf.follower_addr, pf.followee_addr, nf.id as notification_id
   FROM profiles_follows pf
   LEFT JOIN notification_follows nf ON nf.profile_follow_id = pf.id
   LIMIT 10;
   ```
