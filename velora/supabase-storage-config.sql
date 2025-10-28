-- Update existing video bucket untuk mendukung file hingga 4GB
UPDATE storage.buckets 
SET 
  file_size_limit = 4294967296,  -- 4GB dalam bytes (4 * 1024 * 1024 * 1024)
  allowed_mime_types = ARRAY[
    'video/mp4', 
    'video/avi', 
    'video/mov', 
    'video/wmv',
    'video/mkv',
    'video/webm',
    'video/flv'
  ]
WHERE id = 'videos';

-- Jika bucket belum ada, buat yang baru
INSERT INTO storage.buckets (id, name, owner, file_size_limit, allowed_mime_types, public)
VALUES (
  'videos',
  'videos', 
  NULL,
  4294967296,  -- 4GB
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv', 'video/webm', 'video/flv'],
  false
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Buat RLS policy untuk upload videos
CREATE POLICY "Allow authenticated users to upload videos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow users to view their own videos" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'videos');

-- Cek konfigurasi bucket
SELECT id, name, file_size_limit, allowed_mime_types, public 
FROM storage.buckets 
WHERE id = 'videos';