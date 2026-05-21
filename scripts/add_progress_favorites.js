const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Connecting securely to Supabase Database...");
    console.log("Injecting favorite columns DDL into progress table...");
    
    await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false`;
    await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS favorite_time text`;
    
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("Database successfully migrated with progress-level favorite tracking fields!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}
run();
