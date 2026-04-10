require('dotenv').config();
const supabase = require('./src/infrastructure/config/supabase');

async function test() {
  const words = ['recoger', 'retiro', 'mostrador', 'sucursal'];
  for (const w of words) {
    const { data, error } = await supabase.from('pedidos').insert({
      id_local: '02ef18a9-62aa-4fcd-98ee-1134e4aaf197',
      nombre_cliente: 'Test ' + w,
      telefono: '9999999999',
      modalidad: w,
      total_pago: 10,
      estado: 'entrante'
    });
    if (error) {
      console.log('Failed for:', w, 'Error:', error.message);
    } else {
      console.log('SUCCESS for:', w);
    }
  }
}
test();
