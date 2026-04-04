const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres' });
client.connect().then(async () => {
  try {
    await client.query("UPDATE progress SET duration_watched = (CAST(duration_watched AS INTEGER) / 60) || ':00' WHERE duration_watched NOT LIKE '%:%';");
    console.log('Formatted all seconds to MM:SS successfully!');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    client.end();
  }
});
