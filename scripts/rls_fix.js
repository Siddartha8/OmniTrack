const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function fix() {
  try {
    // Make sure policies exist for everything!
    console.log("Re-applying universal RLS policies to fix ghosting bugs...");

    await sql`ALTER TABLE content ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE seasons ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE progress ENABLE ROW LEVEL SECURITY`;

    await sql`DROP POLICY IF EXISTS "content_all" ON content`;
    await sql`CREATE POLICY "content_all" ON content FOR ALL USING (auth.uid() = user_id)`;

    await sql`DROP POLICY IF EXISTS "seasons_all" ON seasons`;
    await sql`CREATE POLICY "seasons_all" ON seasons FOR ALL USING (
      EXISTS (SELECT 1 FROM content WHERE id = content_id AND user_id = auth.uid())
    )`;

    await sql`DROP POLICY IF EXISTS "progress_all" ON progress`;
    await sql`CREATE POLICY "progress_all" ON progress FOR ALL USING (
      EXISTS (
        SELECT 1 FROM seasons 
        JOIN content ON content.id = seasons.content_id 
        WHERE seasons.id = season_id AND content.user_id = auth.uid()
      )
    )`;

    console.log("RLS Permissions mathematically synced!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
fix();
