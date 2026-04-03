const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function seedData() {
  try {
    console.log("Locating your newly created profile...");
    let user = await sql`SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1`;

    if (user.length === 0) {
      console.error("ERROR: No clean profile found! Please Sign Up through the Localhost UI first.");
      process.exit(1);
    }
    const userId = user[0].id;
    console.log(`Profile verified (${userId})! Initiating secure history restoration...`);

    const initialAnime = [
      { name: "Barakamon", eps: 4 },
      { name: "Fate/strange Fake", eps: 12 },
      { name: "One Piece", eps: 1145 },
      { name: "Frieren: Beyond Journey's End", eps: 9 },
      { name: "The Demon King's Daughter Is Too Kind!!", eps: 9 }
    ];

    for (const anime of initialAnime) {
      const existing = await sql`SELECT id FROM content WHERE user_id = ${userId} AND title = ${anime.name}`;
      if (existing.length === 0) {
        const contentRes = await sql`
          INSERT INTO content (user_id, title, type, total_episodes) 
          VALUES (${userId}, ${anime.name}, 'anime', NULL)
          RETURNING id;
        `;
        const contentId = contentRes[0].id;

        const seasonRes = await sql`
          INSERT INTO seasons (content_id, season_number) 
          VALUES (${contentId}, 1)
          RETURNING id;
        `;
        const seasonId = seasonRes[0].id;

        await sql`
          INSERT INTO progress (season_id, current_episode, duration_watched)
          VALUES (${seasonId}, ${anime.eps}, ${anime.eps * 24})
        `;
        console.log(`Seeded: ${anime.name} progress restored.`);
      }
    }
    console.log("✔ Your entire historical timeline has been seamlessly restored!");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}
seedData();
