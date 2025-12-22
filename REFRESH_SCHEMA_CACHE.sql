-- Refresh schema cache cho PostgREST
-- Copy và chạy trong Supabase Dashboard > SQL Editor

-- 1. Kiểm tra table có tồn tại không
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'playlists';

-- 2. Kiểm tra columns của table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'playlists' 
ORDER BY ordinal_position;

-- 3. Refresh schema cache (PostgREST sẽ tự động reload)
NOTIFY pgrst, 'reload schema';

-- 4. Kiểm tra RLS status (sử dụng pg_class thay vì pg_tables)
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    c.relrowsecurity as row_security_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'playlists' AND n.nspname = 'public';

-- 5. Kiểm tra policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'playlists';

-- 6. Test simple select (để xem có access được không)
SELECT COUNT(*) as total_records FROM playlists;