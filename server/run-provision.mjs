import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { provision } from "./provision.mjs";

const config = loadConfig();
const pool = createPool(config.databaseUrl);
try {
  await migrate(pool);
  const result = await provision(pool, process.env);
  console.log(`ELU account provisioning complete: ${result.students} students, ${result.admins} admin`);
} finally {
  await pool.end();
}
