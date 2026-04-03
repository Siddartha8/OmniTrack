const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('progress').select('id, season_id, seasons ( content_id )').limit(1).single();
  console.log("Data:", data, "Error:", error);
}

require('dotenv').config({ path: '.env.local' });
test().then(() => process.exit(0));
