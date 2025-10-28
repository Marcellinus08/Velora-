-- Script untuk memeriksa dan memperbaiki konfigurasi bucket storage

-- 1. Hapus bucket yang ada jika konfigurasinya salah
-- DELETE FROM storage.buckets WHERE id = 'videos';

-- 2. Buat ulang bucket dengan konfigurasi 4GB
DELETE FROM storage.buckets WHERE id = 'videos';

INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'videos',
  'videos', 
  NULL,
  4294967296,  -- 4GB dalam bytes
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/webm', 'video/flv'],
  false
);

-- 3. Buat bucket thumbnails jika belum ada
INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'thumbnails',
  'thumbnails', 
  NULL,
  10485760,  -- 10MB untuk thumbnails
  ARRAY['image/jpeg', 'image/png', 'image/webp'],
  true
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read videos" ON storage.objects;

-- 5. Buat policy baru untuk videos
CREATE POLICY "Allow authenticated users to upload videos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Users can view all videos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'videos');

CREATE POLICY "Users can update their videos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'videos');

CREATE POLICY "Users can delete their videos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'videos');

-- 6. Policy untuk thumbnails
CREATE POLICY "Allow authenticated users to upload thumbnails" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'thumbnails');

CREATE POLICY "Allow public read thumbnails" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'thumbnails');

-- 7. Verifikasi konfigurasi
SELECT 
    id, 
    name, 
    file_size_limit,
    ROUND(file_size_limit / 1024.0 / 1024.0 / 1024.0, 2) as limit_gb,
    allowed_mime_types,
    public 
FROM storage.buckets 
WHERE id IN ('videos', 'thumbnails')
ORDER BY id;