import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const output = "dist";
if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(`${output}/admin/tracker`, { recursive: true });
for (const file of ["index.html", "styles.css", "styles-polish.css", "auth-provider.js", "app.js"]) cpSync(file, `${output}/${file}`);
cpSync("index.html", `${output}/admin/tracker/index.html`);
cpSync("public", `${output}/public`, { recursive: true });
writeFileSync(`${output}/.nojekyll`, "");
console.log("Production artifact created in dist/");
