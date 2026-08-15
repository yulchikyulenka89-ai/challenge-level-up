import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = `${readFileSync("styles.css", "utf8")}\n${readFileSync("styles-polish.css", "utf8")}`;

test("season starts with four zero-state students", () => {
  assert.equal((app.match(/transactions:\[\]/g) || []).length, 4);
  assert.equal((app.match(/inventory:\[\]/g) || []).length, 4);
  assert.equal((app.match(/streak:0/g) || []).length, 4);
  assert.match(app, /currentWeek:1/);
});

test("the current app has no background video implementation", () => {
  assert.doesNotMatch(`${app}\n${html}`, /<video\b|autoplay|\.mp4|\.webm/i);
});

test("teacher workflow surfaces are present", () => {
  for (const marker of ["Матрица 8 недель", "Режим урока", "XP TRANSACTION", "RESET SEASON", "Preview as Student", "Quick Update"]) assert.ok(app.includes(marker), marker);
});

test("season structure is exactly eight weeks with week one open", () => {
  assert.equal((app.match(/number:\d,title:/g) || []).length, 8);
  assert.match(app, /status:w\.number===1\?"Not Started":"Locked"/);
});

test("custom cursor and student assets navigation are removed", () => {
  assert.doesNotMatch(`${app}\n${html}\n${css}`, /cursor-dot|cursor-ring|cursorEnabled|setupCursor|cursor-on|data-cursor/i);
  assert.doesNotMatch(app, /\["assets","Ассеты"\]|assets:\s*renderAssets|function renderAssets/);
});

test("theme and profile rewards persist on GitHub Pages-safe paths", () => {
  assert.match(`${app}\n${html}`, /elu-theme/);
  assert.match(app, /function assetUrl\(path\)/);
  assert.match(app, /public\/assets\/hero\/elu-hero-clean\.png/);
  assert.match(app, /Моя коллекция/);
  assert.match(html, /styles-polish\.css/);
});
