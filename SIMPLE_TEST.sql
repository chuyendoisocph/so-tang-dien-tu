-- Test đơn giản để kiểm tra table playlists
-- Copy và chạy từng dòng một trong Supabase Dashboard > SQL Editor

-- 1. Kiểm tra table tồn tại
SELECT * FROM information_schema.tables WHERE table_name = 'playlists';

-- 2. Kiểm tra structure
\d playlists;

-- 3. Test select
SELECT * FROM playlists LIMIT 1;

-- 4. Test insert (nếu select work)
INSERT INTO playlists (name, description, slide_duration, profile_ids) 
VALUES ('Test Playlist', 'Test description', 15, '{}');

-- 5. Kiểm tra data
SELECT * FROM playlists;