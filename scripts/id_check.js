const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    await sql`DELETE FROM auth.identities WHERE email = 'sid@gmail.com'`;
    await sql`DELETE FROM auth.users WHERE email = 'sid@gmail.com'`;
    console.log("Completely scrubbed all auth linkages for sid@gmail.com!");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
