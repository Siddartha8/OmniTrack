const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Locating the 4 explicit series to purge...");
    let authReq = await sql`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`;
    const userId = authReq[0].id;

    await sql`DELETE FROM content WHERE user_id = ${userId} AND title IN ('Fullmetal Alchemist: Brotherhood', 'Cyberpunk: Edgerunners', 'Steins;Gate', 'Death Note')`;

    console.log("Successfully purged the 4 anime from the database entirely!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
