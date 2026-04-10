require('dotenv').config();
const SupabaseOrderRepository = require('./src/infrastructure/database/SupabaseOrderRepository');
const LocalId = "02ef18a9-62aa-4fcd-98ee-1134e4aaf197";

async function test() {
  const repo = new SupabaseOrderRepository();
  try {
    const result = await repo.findAll({ localId: LocalId, limit: 10 });
    console.log(JSON.stringify(result, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
