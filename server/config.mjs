import process from "node:process";

function required(name, env = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  return {
    production,
    port: Number(env.PORT || 3000),
    databaseUrl: required("DATABASE_URL", env),
    sessionSecret: required("SESSION_SECRET", env),
    trustProxy: production,
    secureCookies: production,
    sessionHours: Math.max(1, Number(env.SESSION_HOURS || 12)),
  };
}
