const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    console.log("Seeding your Completed Archive...");
    let authReq = await sql`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`;
    const userId = authReq[0].id;

    await sql`UPDATE content SET status = 'completed' WHERE user_id = ${userId} AND title IN ('Frieren: Beyond Journey''s End', 'Fate/strange Fake')`;

    const newCompleted = [
      { name: "Death Note", eps: 37 },
      { name: "Steins;Gate", eps: 24 },
      { name: "Cyberpunk: Edgerunners", eps: 10 },
      { name: "Fullmetal Alchemist: Brotherhood", eps: 64 },
      { name: "Attack on Titan", eps: 89 }
    ];

    for (const anime of newCompleted) {
      const existing = await sql`SELECT id FROM content WHERE user_id = ${userId} AND title = ${anime.name}`;
      if (existing.length === 0) {
        const contentRes = await sql`INSERT INTO content (user_id, title, type, total_episodes, status) VALUES (${userId}, ${anime.name}, 'anime', ${anime.eps}, 'completed') RETURNING id`;
        const contentId = contentRes[0].id;

        const seasonRes = await sql`INSERT INTO seasons (content_id, season_number) VALUES (${contentId}, 1) RETURNING id`;
        const seasonId = seasonRes[0].id;

        await sql`INSERT INTO progress (season_id, current_episode, duration_watched) VALUES (${seasonId}, ${anime.eps}, ${anime.eps * 24})`;
        console.log(`Archived: ${anime.name}`);
      }
    }

    console.log("Completed Archive physically injected!");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
