// src/lib/database-setup.md

## Database Setup for Feedback Feature

### Tabel feedback sudah ada dengan struktur:

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('bug', 'idea', 'other')),
    message TEXT NOT NULL,
    email TEXT,
    media_path TEXT,
    media_type TEXT,
    media_size BIGINT,
    profile_abstract_id TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Supabase Storage Bucket

Pastikan bucket `uploads` sudah dibuat di Supabase Storage dengan struktur folder:
- `uploads/feedback/` - untuk menyimpan file attachment feedback

### Storage Policies (RLS)

```sql
-- Allow public to upload files to feedback folder
CREATE POLICY "Allow uploads to feedback folder" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = 'feedback');

-- Allow public to view feedback attachments
CREATE POLICY "Allow public read access to feedback attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = 'feedback');
```

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```