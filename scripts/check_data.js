const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'
});
async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*) FROM content');
    console.log('Total content:', res.rows[0]);
    
    const prog = await client.query('SELECT COUNT(*) FROM progress');
    console.log('Total progress:', prog.rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
