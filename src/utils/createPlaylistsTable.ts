import { supabase } from "@/integrations/supabase/client";

export const createPlaylistsTable = async () => {
  try {
    // Create the playlists table
    const { error } = await supabase.rpc('create_playlists_table');
    
    if (error) {
      console.error('Error creating playlists table:', error);
      return false;
    }
    
    console.log('Playlists table created successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

// Alternative: Create table using raw SQL
export const createPlaylistsTableSQL = async () => {
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS playlists (
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
      
      CREATE INDEX IF NOT EXISTS idx_playlists_created_at ON playlists(created_at DESC);
      
      ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all operations on playlists" ON playlists;
      CREATE POLICY "Allow all operations on playlists" ON playlists FOR ALL USING (true);
      
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
      CREATE TRIGGER update_playlists_updated_at 
          BEFORE UPDATE ON playlists 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating playlists table:', error);
      return false;
    }
    
    console.log('Playlists table created successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};