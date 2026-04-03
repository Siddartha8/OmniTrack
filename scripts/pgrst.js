const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function check() {
  try {
    await sql`NOTIFY pgrst, 'reload schema'`;
    console.log("Reloaded pgrst cache just in case.");
  } finally {
    process.exit(0);
  }
}
check();
