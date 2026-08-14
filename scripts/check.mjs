import { existsSync, readFileSync } from "node:fs";

const required = ["index.html", "styles.css", "app.js", "README.md", ".env.example", "docs/asset-map.md"];
const gameAssets = ["ticket/ticket.png", "sticker/sticker.png", "access-key/access-key.png", "power-card/power-card.png", "drop/drop.png", "badge/badge.png", "crew-token/crew-token.png", "spotlight/spotlight.png"];
const failures = [];
for (const file of required) if (!existsSync(file)) failures.push(`Missing ${file}`);
for (const file of gameAssets) if (!existsSync(`public/assets/game/${file}`)) failures.push(`Missing game asset ${file}`);
const app = readFileSync("app.js", "utf8");
const html = readFileSync("index.html", "utf8");
if (/<video\b|autoplay|\.mp4|\.webm/i.test(`${app}\n${html}`)) failures.push("Background video implementation must not exist");
if (!/currentWeek:1/.test(app)) failures.push("Initial current week is not 1");
if ((app.match(/transactions:\[\]/g) || []).length < 4) failures.push("All four students must start with empty XP transactions");
if ((app.match(/inventory:\[\]/g) || []).length < 4) failures.push("All four students must start without assets");
if ((app.match(/streak:0/g) || []).length < 4) failures.push("All four students must start with zero streak");
if ((app.match(/progress:0/g) || []).length < 4) failures.push("All four students must start with zero progress");
if (!html.includes('name="robots" content="noindex,nofollow,noarchive"')) failures.push("Private app robots policy missing");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("ELU static lint: OK");
