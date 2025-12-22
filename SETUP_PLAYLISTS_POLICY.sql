-- Setup RLS policy cho table playlists
-- Chạy trong Supabase Dashboard > SQL Editor

-- Enable RLS nếu chưa có
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Allow all operations on playlists" ON playlists;

-- Tạo policy mới cho phép tất cả operations
CREATE POLICY "Allow all operations on playlists" ON playlists 
FOR ALL USING (true);

-- Kiểm tra policy đã được tạo
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'playlists';