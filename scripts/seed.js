const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function seedData() {
  try {
    console.log("Checking if user already exists...");
    let user = await sql`SELECT id FROM auth.users WHERE email = 'sidd@gmail.com'`;
    let userId;

    if (user.length > 0) {
      userId = user[0].id;
      console.log("User already exists with ID:", userId);
    } else {
      console.log("Creating user sidd@gmail.com in Supabase Auth...");
      const newUser = await sql`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
          recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
          created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          'sidd@gmail.com',
          crypt('11111111', gen_salt('bf')),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}',
          '{"username":"siddu"}',
          now(),
          now(),
          '',
          '',
          '',
          ''
        ) RETURNING id;
      `;
      userId = newUser[0].id;

      await sql`
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          ${userId},
          ${`{"sub":"${userId}","email":"sidd@gmail.com"}`},
          'email',
          ${userId},
          now(),
          now(),
          now()
        );
      `;
      console.log("User successfully created!", userId);
    }

    const initialAnime = [
      { name: "Barakamon", eps: 4 },
      { name: "Fate/strange Fake", eps: 12 },
      { name: "One Piece", eps: 1145 },
      { name: "Frieren: Beyond Journey's End", eps: 9 },
      { name: "The Demon King's Daughter Is Too Kind!!", eps: 9 }
    ];

    console.log("Migrating local mock data to cloud database...");
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
        console.log(`Seeded: ${anime.name} (Eps: ${anime.eps})`);
      } else {
        console.log(`${anime.name} already seeded.`);
      }
    }
    
    console.log("✔ All historical info has been preserved in the new schema!");
  } catch(e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}
seedData();
