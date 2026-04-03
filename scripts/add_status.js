const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`ALTER TABLE content ADD COLUMN IF NOT EXISTS status text DEFAULT 'watching'`;
    console.log("Status column injected into relational database!");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
