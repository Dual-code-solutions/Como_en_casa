require('dotenv').config();
const supabase = require('./src/infrastructure/config/supabase');

async function check() {
  const { data, error } = await supabase.from('pedidos').select('*').order('creado_at', { ascending: false }).limit(5);
  console.log(error || data);
}
check();
