-- Setup RLS policy cho table playlists (table đã tồn tại)
-- Copy và chạy trong Supabase Dashboard > SQL Editor

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Allow all operations on playlists" ON playlists;

-- Tạo policy mới cho phép tất cả operations
CREATE POLICY "Allow all operations on playlists" ON playlists 
FOR ALL USING (true);

-- Tạo trigger function nếu chưa có
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho updated_at
DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON playlists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Kiểm tra kết quả
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd 
FROM pg_policies 
WHERE tablename = 'playlists';