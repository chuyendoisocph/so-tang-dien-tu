-- QUICK FIX: Tạm thời disable RLS cho profiles table
-- CẢNH BÁO: Chỉ dùng để test, không khuyến nghị cho production

-- Disable RLS cho profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Kiểm tra status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Để enable lại RLS sau này:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;