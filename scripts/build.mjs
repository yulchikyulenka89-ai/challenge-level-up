import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const output = "dist";
if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(`${output}/admin/tracker`, { recursive: true });
for (const file of ["index.html", "styles.css", "app.js"]) cpSync(file, `${output}/${file}`);
cpSync("index.html", `${output}/admin/tracker/index.html`);
cpSync("public", `${output}/public`, { recursive: true });
writeFileSync(`${output}/index.html`, readFileSync(`${output}/index.html`, "utf8")
  .replace('href="/styles.css"', 'href="./styles.css"')
  .replace('src="/app.js"', 'src="./app.js"'));
writeFileSync(`${output}/styles.css`, readFileSync(`${output}/styles.css`, "utf8")
  .replaceAll("url('/public/", "url('./public/"));
writeFileSync(`${output}/app.js`, readFileSync(`${output}/app.js`, "utf8")
  .replace('const ASSET_BASE = "/public/assets/game";', 'const ASSET_BASE = "./public/assets/game";'));
writeFileSync(`${output}/.nojekyll`, "");
console.log("Production artifact created in dist/");
