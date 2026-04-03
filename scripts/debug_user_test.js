require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function check() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Login as the user, wait! The user hasn't given me their password. 
  // I can't login as them without the password!
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
}
check();
