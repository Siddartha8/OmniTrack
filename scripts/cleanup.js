const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Scrubbing corrupted identity...");
    await sql`DELETE FROM auth.users WHERE email = 'sidd@gmail.com'`;
    console.log("Cleanup finished.");
  } finally {
    process.exit(0);
  }
}
run();
