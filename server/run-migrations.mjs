import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";

const config = loadConfig();
const pool = createPool(config.databaseUrl);
try {
  await migrate(pool);
  console.log("ELU database migrations complete");
} finally {
  await pool.end();
}
