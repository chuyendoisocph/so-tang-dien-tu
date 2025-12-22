-- Tắt RLS tạm thời để test (CHỈ DÙNG ĐỂ TEST)
-- Copy và chạy trong Supabase Dashboard > SQL Editor

ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;

-- Kiểm tra RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'playlists';