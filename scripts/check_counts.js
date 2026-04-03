const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    const c = await sql`SELECT * FROM content`;
    const s = await sql`SELECT * FROM seasons`;
    const p = await sql`SELECT * FROM progress`;
    const u = await sql`SELECT * FROM auth.users`;
    console.log(`DB Counts -> Users: ${u.length}, Content: ${c.length}, Seasons: ${s.length}, Progress: ${p.length}`);
    
    if (c.length > 0) {
      console.log(`Sample content user_id: ${c[0].user_id}`);
      console.log(`Current users id: ${u.map(x=>x.id).join(', ')}`);
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
