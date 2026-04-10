require('dotenv').config();
async function test() {
  try {
    const url = process.env.SUPABASE_URL + '/rest/v1/?apikey=' + process.env.SUPABASE_ANON_KEY;
    const res = await fetch(url);
    const api = await res.json();
    console.log("Tables:", Object.keys(api.definitions || {}));
  } catch (e) {}
}
test();
