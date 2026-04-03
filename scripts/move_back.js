const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Moving Frieren and Fate back to active library...");
    let authReq = await sql`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`;
    const userId = authReq[0].id;

    await sql`UPDATE content SET status = 'watching' WHERE user_id = ${userId} AND title IN ('Frieren: Beyond Journey''s End', 'Fate/strange Fake')`;

    console.log("Archive modified. Series are now actively watching!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
