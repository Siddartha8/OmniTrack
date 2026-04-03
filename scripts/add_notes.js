const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`ALTER TABLE progress ADD COLUMN IF NOT EXISTS notes text`;
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("Added notes column to progress table and reloaded API cache!");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
