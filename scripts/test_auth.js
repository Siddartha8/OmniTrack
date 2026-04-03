async function checkAuth() {
  const url = "https://wksawrydcqsbfdmvouie.supabase.co/auth/v1/token?grant_type=password";
  const apiKey = "sb_publishable_4_2zFp_GiKbHsSWev0XNIw_tV_gMTl-";

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'sid@gmail.com', password: '11111111' })
  });

  const data = await res.json();
  console.log("Auth Response:", JSON.stringify(data, null, 2));
}
checkAuth();
