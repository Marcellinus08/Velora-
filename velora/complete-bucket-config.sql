-- Konfigurasi lengkap untuk semua bucket yang dibutuhkan

-- 1. Hapus dan buat ulang bucket studio dengan limit 4GB
DROP POLICY IF EXISTS "Allow authenticated users to upload to studio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from studio" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'studio';

INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'studio',
  'studio', 
  NULL,
  4294967296,  -- 4GB dalam bytes
  ARRAY[
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/webm', 'video/flv',
    'image/jpeg', 'image/png', 'image/webp'
  ],
  true
);

-- 2. Hapus dan buat ulang bucket videos (untuk carousel/ads)
DROP POLICY IF EXISTS "Allow authenticated users to upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all videos" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'videos';

INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'videos',
  'videos', 
  NULL,
  4294967296,  -- 4GB dalam bytes
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/webm', 'video/flv'],
  true
);

-- 3. Hapus dan buat ulang bucket thumbnails
DROP POLICY IF EXISTS "Allow authenticated users to upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read thumbnails" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'thumbnails';

INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'thumbnails',
  'thumbnails', 
  NULL,
  10485760,  -- 10MB untuk thumbnails
  ARRAY['image/jpeg', 'image/png', 'image/webp'],
  true
);

-- 4. Buat ulang semua policies
-- Studio policies (untuk user uploads)
CREATE POLICY "Allow authenticated users to upload to studio" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'studio');

CREATE POLICY "Allow public read from studio" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'studio');

CREATE POLICY "Users can update their studio files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'studio');

CREATE POLICY "Users can delete their studio files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'studio');

-- Videos policies (untuk carousel/ads)
CREATE POLICY "Allow authenticated users to upload videos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public read videos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'videos');

-- Thumbnails policies
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

-- 5. Verifikasi konfigurasi final
SELECT 
    id, 
    name, 
    file_size_limit,
    ROUND(file_size_limit / 1024.0 / 1024.0 / 1024.0, 2) as limit_gb,
    allowed_mime_types,
    public 
FROM storage.buckets 
WHERE id IN ('studio', 'videos', 'thumbnails')
ORDER BY id;