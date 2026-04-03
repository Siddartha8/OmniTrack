const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("Supabase Schema Reloaded!");
  } finally {
    process.exit(0);
  }
}
run();
