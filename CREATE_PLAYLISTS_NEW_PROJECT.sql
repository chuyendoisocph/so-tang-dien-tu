-- Tạo table playlists trong project mới
-- Copy và chạy trong Supabase Dashboard > SQL Editor

-- 1. Tạo table playlists
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

-- 2. Create index
CREATE INDEX idx_playlists_created_at ON public.playlists(created_at DESC);

-- 3. Grant permissions
GRANT ALL ON public.playlists TO postgres;
GRANT ALL ON public.playlists TO anon;
GRANT ALL ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;

-- 4. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 5. Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- 6. Create policy
CREATE POLICY "Allow all operations on playlists" 
ON public.playlists 
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- 7. Create trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger
CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON public.playlists 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Force PostgREST reload
NOTIFY pgrst, 'reload schema';

-- 10. Insert test data
INSERT INTO public.playlists (name, description) 
VALUES ('Test Playlist', 'Created by setup script');

-- 11. Verify
SELECT * FROM public.playlists;

-- 12. Clean up test data
DELETE FROM public.playlists WHERE name = 'Test Playlist';