const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Injecting massive shonen list into Completed Archive...");
    let authReq = await sql`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`;
    const userId = authReq[0].id;

    const newCompleted = [
      { name: "Naruto", eps: 220 },
      { name: "Naruto Shippuden", eps: 500 },
      { name: "Bleach", eps: 366 },
      { name: "Bleach: Thousand-Year Blood War", eps: 26 },
      { name: "Hunter x Hunter", eps: 148 },
      { name: "Black Clover", eps: 170 },
      { name: "Solo Leveling", eps: 12 },
      { name: "Demon Slayer", eps: 55 },
      { name: "Hajime no Ippo", eps: 75 },
      { name: "Baki Hanma", eps: 39 }
    ];

    for (const anime of newCompleted) {
      const existing = await sql`SELECT id FROM content WHERE user_id = ${userId} AND title = ${anime.name}`;
      if (existing.length === 0) {
        const contentRes = await sql`INSERT INTO content (user_id, title, type, total_episodes, status) VALUES (${userId}, ${anime.name}, 'anime', ${anime.eps}, 'completed') RETURNING id`;
        const contentId = contentRes[0].id;

        const seasonRes = await sql`INSERT INTO seasons (content_id, season_number) VALUES (${contentId}, 1) RETURNING id`;
        const seasonId = seasonRes[0].id;

        await sql`INSERT INTO progress (season_id, current_episode, duration_watched) VALUES (${seasonId}, ${anime.eps}, ${anime.eps * 24})`;
        console.log(`Archived: ${anime.name} (${anime.eps} Episodes fully completed)`);
      }
    }

    console.log("All legendary shonen completely injected!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
