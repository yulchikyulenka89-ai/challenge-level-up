import { resolve } from "node:path";
import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { createApp } from "./app.mjs";

const config = loadConfig();
const pool = createPool(config.databaseUrl);

await migrate(pool);

const app = createApp({
  pool,
  config,
  staticDirectory: resolve("dist"),
});

const server = app.listen(config.port, () => {
  console.log(`ELU Live server listening on port ${config.port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down ELU Live`);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
