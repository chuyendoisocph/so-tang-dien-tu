-- SQL để tạo table playlists trong Supabase
-- Copy và paste vào Supabase Dashboard > SQL Editor

CREATE TABLE playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slide_duration INTEGER NOT NULL DEFAULT 15,
    profile_ids TEXT[] NOT NULL DEFAULT '{}',
    auto_play BOOLEAN NOT NULL DEFAULT true,
    loop BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho performance
CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);

-- Enable Row Level Security
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép tất cả operations (có thể hạn chế sau)
CREATE POLICY "Allow all operations on playlists" ON playlists FOR ALL USING (true);

-- Tạo function để tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động update updated_at khi record được update
CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON playlists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();