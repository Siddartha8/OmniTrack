const postgres = require('postgres');
const sql = postgres('postgresql://postgres.wksawrydcqsbfdmvouie:Siddu@955378@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    const check = await sql`SELECT id FROM auth.users WHERE email = 'sid@gmail.com'`;
    if(check.length > 0) {
      await sql`DELETE FROM auth.users WHERE email = 'sid@gmail.com'`;
    }

    const idRes = await sql`SELECT gen_random_uuid() as id`;
    const id = idRes[0].id;
    
    await sql`
      INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, role, aud) 
      VALUES (${id}, '00000000-0000-0000-0000-000000000000', 'sid@gmail.com', crypt('11111111', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated')
    `;

    await sql`
      INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider) 
      VALUES (${id}, ${id}, ${id}, ${sql.json({sub: id, email: 'sid@gmail.com'})}, 'email')
    `;

    console.log("Supabase Auth Bypassed: User perfectly created.");
  } catch(e){
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
