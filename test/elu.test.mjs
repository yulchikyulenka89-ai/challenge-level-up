import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");

test("season starts with four zero-state students", () => {
  assert.equal((app.match(/transactions:\[\]/g) || []).length, 4);
  assert.equal((app.match(/inventory:\[\]/g) || []).length, 4);
  assert.equal((app.match(/streak:0/g) || []).length, 4);
  assert.match(app, /currentWeek:1/);
});

test("the current app has no background video implementation", () => {
  const html = readFileSync("index.html", "utf8");
  assert.doesNotMatch(`${app}\n${html}`, /<video\b|autoplay|\.mp4|\.webm/i);
});

test("teacher workflow surfaces are present", () => {
  for (const marker of ["8 Week Matrix", "Lesson Mode", "XP TRANSACTION", "RESET SEASON", "Preview as Student"]) assert.ok(app.includes(marker), marker);
});
