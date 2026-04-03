const postgres = require('postgres');

const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function runMigrations() {
  console.log("Connecting securely to Supabase Database...");
  try {
    console.log("Creating 'content' table...");
    await sql`
      CREATE TABLE IF NOT EXISTS content (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT CHECK (type IN ('anime', 'movie', 'series')) NOT NULL,
        total_episodes INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("Creating 'seasons' table...");
    await sql`
      CREATE TABLE IF NOT EXISTS seasons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content_id UUID REFERENCES content(id) ON DELETE CASCADE,
        season_number INT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log("Creating 'progress' table...");
    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
        current_episode INT NOT NULL DEFAULT 0,
        duration_watched INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log("Enabling Row Level Security (RLS)...");
    await sql`ALTER TABLE content ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE progress ENABLE ROW LEVEL SECURITY;`;

    console.log("Setting up authentication policies...");
    
    await sql`CREATE POLICY "content_insert_policy" ON content FOR INSERT WITH CHECK (auth.uid() = user_id);`.catch(() => {});
    await sql`CREATE POLICY "content_select_policy" ON content FOR SELECT USING (auth.uid() = user_id);`.catch(() => {});
    await sql`CREATE POLICY "content_update_policy" ON content FOR UPDATE USING (auth.uid() = user_id);`.catch(() => {});
    await sql`CREATE POLICY "content_delete_policy" ON content FOR DELETE USING (auth.uid() = user_id);`.catch(() => {});

    console.log("Database schema successfully generated!");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}
runMigrations();
