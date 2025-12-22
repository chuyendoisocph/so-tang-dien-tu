# Alternative Solutions for Playlists Table Issue

## Problem
PostgREST không nhận ra table `playlists` mặc dù table đã tồn tại trong database.

## Solutions

### Solution 1: Restart Supabase Project
1. Vào Supabase Dashboard
2. Settings → General
3. Nhấn "Restart project"
4. Đợi 2-3 phút để project restart
5. Test lại

### Solution 2: Manual Schema Refresh
1. Chạy `REFRESH_SCHEMA_CACHE.sql` trong SQL Editor
2. Đợi 1-2 phút
3. Test lại

### Solution 3: Recreate Table với PostgREST-friendly approach
```sql
-- Xóa table cũ (CẨNTHẬN: sẽ mất data)
DROP TABLE IF EXISTS playlists CASCADE;

-- Tạo lại table
CREATE TABLE public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slide_duration INTEGER NOT NULL DEFAULT 15,
    profile_ids TEXT[] NOT NULL DEFAULT '{}',
    auto_play BOOLEAN NOT NULL DEFAULT true,
    loop BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON public.playlists TO postgres;
GRANT ALL ON public.playlists TO anon;
GRANT ALL ON public.playlists TO authenticated;

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations" ON public.playlists FOR ALL USING (true);

-- Refresh schema
NOTIFY pgrst, 'reload schema';
```

### Solution 4: Temporary Workaround - Disable Playlist Feature
Nếu cần thiết, có thể tạm thời disable playlist feature và sử dụng cách cũ (URL parameters).

## Recommended Order
1. Try Solution 1 (Restart project) - Safest
2. Try Solution 2 (Schema refresh)
3. Try Solution 3 (Recreate table) - Only if desperate
4. Solution 4 (Disable feature) - Last resort