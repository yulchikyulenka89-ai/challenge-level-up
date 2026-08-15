import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = `${readFileSync("styles.css", "utf8")}\n${readFileSync("styles-polish.css", "utf8")}`;
const seed = app.slice(app.indexOf("const seedStudents"), app.indexOf("const seedState"));

test("season starts with four zero-state students", () => {
  assert.equal((seed.match(/transactions:\[\]/g) || []).length, 4);
  assert.equal((seed.match(/inventory:\[\]/g) || []).length, 4);
  assert.equal((seed.match(/streak:0/g) || []).length, 4);
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

test("delegated overlays do not block internal Admin actions", () => {
  assert.doesNotMatch(`${app}\n${html}`, /\bonclick\s*=/);
  assert.doesNotMatch(app, /backdrop[^>]*data-action=["']close-overlay/);
  assert.match(app, /data-overlay-backdrop/);
  assert.match(app, /event\.target === backdrop|e\.target\.matches\("\[data-overlay-backdrop\]"\)/);
});

test("student identity, Admin Preview and mutation layers are separated", () => {
  assert.doesNotMatch(`${app}\n${html}`, /data-action="open-admin"/);
  assert.match(app, /student-card-readonly/);
  assert.match(app, /currentStudentId/);
  assert.match(app, /adminPreviewStudentId/);
  assert.match(app, /requireAdminMutation/);
  assert.match(app, /LocalDemoStore/);
});

test("mission and XP-only leaderboard flows are explicit", () => {
  assert.match(app, /function hasLeaderboardStarted/);
  assert.match(app, /data-action="open-current-mission"/);
  assert.match(app, /data-action="submit-mission"/);
  assert.match(app, /record\.progress=0/);
});
