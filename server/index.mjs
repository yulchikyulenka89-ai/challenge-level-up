import { resolve } from "node:path";
import express from "express";
import { loadConfig } from "./config.mjs";
import { createPool, migrate } from "./db.mjs";
import { createApp } from "./app.mjs";

const config = loadConfig();
const pool = createPool(config.databaseUrl);

await migrate(pool);

const app = createApp({
  pool,
  config,
  staticDirectory: null,
});

const staticDirectory = resolve("dist");
app.use(express.static(staticDirectory, { index: "index.html", maxAge: config.production ? "1h" : 0 }));
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile("index.html", { root: staticDirectory });
});

const server = app.listen(config.port, "0.0.0.0", () => {
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
