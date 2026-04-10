require('dotenv').config();

async function test() {
  try {
    const url = process.env.SUPABASE_URL + '/graphql/v1';
    const query = `
      query {
        __type(name: "tipo_entrega") {
          name
          enumValues {
            name
          }
        }
      }
    `;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    const body = await res.json();
    console.log(JSON.stringify(body, null, 2));

  } catch (e) {
    console.error(e.message);
  }
}
test();
