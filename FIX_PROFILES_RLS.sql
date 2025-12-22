-- Fix RLS policy cho table profiles
-- Copy và chạy trong Supabase Dashboard > SQL Editor

-- 1. Kiểm tra RLS status hiện tại
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Kiểm tra policies hiện tại
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Tạm thời disable RLS để test (KHÔNG KHUYẾN NGHỊ cho production)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Hoặc tạo policy cho phép tất cả operations (KHUYẾN NGHỊ)
-- Xóa policies cũ nếu có
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON profiles;

-- Tạo policy mới cho phép tất cả operations
CREATE POLICY "Allow all operations on profiles" 
ON profiles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- 5. Kiểm tra lại policies sau khi tạo
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Test insert để verify
-- INSERT INTO profiles (name, slug) VALUES ('Test Profile RLS', 'testprofilrels');

-- 7. Xóa test data
-- DELETE FROM profiles WHERE slug = 'testprofilrels';