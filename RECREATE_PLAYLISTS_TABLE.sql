-- RECREATE PLAYLISTS TABLE (PostgREST-friendly)
-- CẢNH BÁO: Script này sẽ XÓA table cũ và tạo lại
-- Chạy trong Supabase Dashboard > SQL Editor

-- 1. Drop table cũ (nếu có)
DROP TABLE IF EXISTS public.playlists CASCADE;

-- 2. Tạo table mới với đầy đủ permissions
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

-- 3. Create index
CREATE INDEX idx_playlists_created_at ON public.playlists(created_at DESC);

-- 4. Grant permissions to all roles (QUAN TRỌNG!)
GRANT ALL ON public.playlists TO postgres;
GRANT ALL ON public.playlists TO anon;
GRANT ALL ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;

-- 5. Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- 7. Create permissive policy
DROP POLICY IF EXISTS "Allow all operations on playlists" ON public.playlists;
CREATE POLICY "Allow all operations on playlists" 
ON public.playlists 
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- 8. Create trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger
DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON public.playlists 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- 11. Insert test data để verify
INSERT INTO public.playlists (name, description) 
VALUES ('Test Playlist', 'Created by SQL script');

-- 12. Verify everything works
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'playlists';

SELECT * FROM public.playlists;