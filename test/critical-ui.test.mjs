import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";

const html = readFileSync("dist/index.html", "utf8");
const app = readFileSync("dist/app.js", "utf8");
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

async function boot(hash = "") {
  const window = new Window({ url: `http://localhost:4173/${hash}` });
  window.innerWidth = 1366;
  window.innerHeight = 768;
  window.document.write(html);
  window.document.close();
  window.localStorage.clear();
  window.structuredClone = globalThis.structuredClone;
  window.requestAnimationFrame = callback => callback();
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} });
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/webp;base64,V0VCUF9URVNU";
  window.Image = class TestImage {
    width = 512;
    height = 512;
    set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
    get src() { return this._src; }
  };
  const errors = [];
  window.addEventListener("error", event => errors.push(event.error || event.message));
  window.eval(app);
  await tick();
  return { window, document: window.document, errors };
}

function click(window, element) {
  assert.ok(element, "click target must exist");
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

function change(window, element, value) {
  element.value = value;
  element.dispatchEvent(new window.Event("change", { bubbles: true }));
}

function savedState(window) {
  return JSON.parse(window.localStorage.getItem("elu-live-state-v2"));
}

test("student UI is read-only and mission/leaderboard zero-state flows work", async () => {
  const { window, document, errors } = await boot();
  assert.equal(document.querySelector('[data-action="open-admin"]'), null);
  assert.equal(document.querySelectorAll(".student-card[data-student]").length, 0);
  assert.equal(document.querySelectorAll(".student-card[role='button']").length, 0);

  click(window, document.querySelector('[data-action="open-current-mission"]'));
  assert.equal(window.location.hash, "#missions");
  assert.match(document.querySelector(".mission-status-value").textContent, /Не начато/);
  click(window, document.querySelector('[data-action="start-mission"]'));
  assert.equal(window.location.hash, "#missions");
  assert.match(document.querySelector(".mission-status-value").textContent, /В процессе/);
  const started = savedState(window);
  assert.equal(started.students[0].transactions.length, 0);
  assert.equal(started.students[0].progress, 0);
  assert.equal(started.weekRecords.alena[0].progress, 0);

  document.querySelector("#submissionValue").value = "https://example.test/submission";
  click(window, document.querySelector('[data-action="submit-mission"]'));
  assert.match(document.querySelector(".mission-status-value").textContent, /На проверке/);
  assert.equal(savedState(window).submissions.alena[1].status, "Submitted");

  click(window, document.querySelector('[data-route="leaderboard"]'));
  assert.match(document.querySelector(".leaderboard-zero").textContent, /ВСЕ НАЧИНАЮТ С ОДНОЙ ПОЗИЦИИ/);
  assert.equal(document.querySelectorAll(".leader-row").length, 0);
  assert.deepEqual(errors, []);
  window.close();
});

test("Admin delegated controls, nested overlays, XP, reward, photo and preview work", async () => {
  const { window, document, errors } = await boot("#admin");
  const quick = () => document.querySelector('button.btn[data-student="alena"]');

  click(window, quick());
  assert.ok(document.querySelector(".drawer"));
  click(window, document.querySelector(".drawer .close-button"));
  assert.equal(document.querySelector(".drawer"), null);

  click(window, quick());
  for (const [amount, expected] of [["10", "10"], ["20", "20"], ["100", "100"], ["-10", "-10"], [null, ""]]) {
    const selector = amount === null ? '[data-action="xp-modal"]:not([data-amount])' : `[data-action="xp-modal"][data-amount="${amount}"]`;
    click(window, document.querySelector(`.drawer ${selector}`));
    assert.equal(document.querySelector("#xpAmount").value, expected);
    click(window, document.querySelector(".modal-actions [data-action='close-overlay']"));
    assert.ok(document.querySelector(".drawer"), "Cancel returns to Quick Update");
  }
  click(window, document.querySelector('[data-action="xp-modal"][data-amount="50"]'));
  assert.ok(document.querySelector("#xpReason"));
  change(window, document.querySelector("#xpReason"), "Teacher Bonus");
  click(window, document.querySelector('[data-action="save-xp"]'));
  assert.ok(document.querySelector(".drawer"), "Quick Update returns after XP save");
  assert.equal(savedState(window).students[0].transactions[0].amount, 50);
  assert.match(document.querySelector(".drawer-head").textContent, /50 XP/);

  click(window, document.querySelector('[data-action="streak-add"]'));
  assert.equal(savedState(window).students[0].streak, 1);
  window.prompt = () => "7";
  click(window, document.querySelector('[data-action="streak-custom"]'));
  assert.equal(savedState(window).students[0].streak, 7);
  click(window, document.querySelector('[data-action="streak-reset"]'));
  assert.equal(savedState(window).students[0].streak, 0);

  change(window, document.querySelector("#studentStatus"), "Needs Revision");
  document.querySelector("#studentProgress").value = "35";
  click(window, document.querySelector('[data-action="save-student"]'));
  assert.ok(document.querySelector(".drawer"));
  assert.equal(savedState(window).students[0].weekStatus, "Needs Revision");
  assert.equal(savedState(window).students[0].progress, 35);

  click(window, document.querySelector('[data-action="complete"]'));
  assert.ok(document.querySelector(".drawer"));
  assert.equal(savedState(window).students[0].weekStatus, "Completed");
  assert.equal(savedState(window).students[0].progress, 100);
  assert.deepEqual(savedState(window).completions.alena, [1]);

  click(window, document.querySelector('[data-action="asset-modal"]'));
  assert.ok(document.querySelector(".asset-picker"));
  click(window, document.querySelector('[data-action="grant-asset"][data-asset-id="ticket"]'));
  assert.ok(document.querySelector(".drawer"));
  assert.deepEqual(savedState(window).students[0].inventory, ["ticket"]);

  click(window, document.querySelector('[data-action="photo"]'));
  assert.ok(document.querySelector(".photo-modal"));
  click(window, document.querySelector('.photo-modal [data-action="close-overlay"]'));
  assert.ok(document.querySelector(".drawer"));
  click(window, document.querySelector('[data-action="photo"]'));
  const fileInput = document.querySelector("#photoInput");
  const file = new window.File([new Uint8Array([137, 80, 78, 71])], "fixture.png", { type: "image/png" });
  Object.defineProperty(fileInput, "files", { configurable: true, value: [file] });
  fileInput.dispatchEvent(new window.Event("change", { bubbles: true }));
  await tick();
  await tick();
  assert.ok(document.querySelector(".crop-stage img"), "photo preview appears");
  const zoom = document.querySelector('[data-crop="zoom"]');
  zoom.value = "1.5";
  zoom.dispatchEvent(new window.Event("input", { bubbles: true }));
  click(window, document.querySelector('[data-action="save-photo"]'));
  await tick();
  assert.match(savedState(window).students[0].photo, /^data:image\/webp/);
  assert.ok(document.querySelector(".drawer .avatar img"), "drawer avatar updates immediately");

  click(window, document.querySelector('[data-action="photo"]'));
  click(window, document.querySelector('[data-action="remove-photo"]'));
  assert.equal(savedState(window).students[0].photo, undefined);
  assert.ok(document.querySelector(".drawer .avatar:not(:has(img))"));
  click(window, document.querySelector(".drawer .close-button"));

  const inlineStatus = document.querySelector('[data-field="weekStatus"][data-id="alena"]');
  change(window, inlineStatus, "In Progress");
  assert.equal(savedState(window).students[0].weekStatus, "In Progress");

  click(window, document.querySelector('[data-action="preview-menu"]'));
  assert.ok(document.querySelector(".preview-modal"));
  change(window, document.querySelector("#previewStudentSelect"), "egor");
  click(window, document.querySelector('[data-action="preview-selected"]'));
  assert.match(document.querySelector("#previewBanner").textContent, /ЕГОР/);
  assert.equal(window.localStorage.getItem("elu-demo-student-id"), "alena");
  click(window, document.querySelector('[data-action="exit-preview"]'));
  assert.equal(window.location.hash, "#admin");

  const beforeTheme = document.documentElement.dataset.theme;
  click(window, document.querySelector(".admin-bar .theme-toggle"));
  assert.notEqual(document.documentElement.dataset.theme, beforeTheme);
  assert.equal(window.localStorage.getItem("elu-theme"), document.documentElement.dataset.theme);

  click(window, document.querySelector('[data-action="preview-menu"]'));
  click(window, document.querySelector("#previewStudentSelect"));
  assert.ok(document.querySelector(".preview-modal"), "internal clicks do not close modal");
  click(window, document.querySelector("[data-overlay-backdrop]"));
  assert.equal(document.querySelector(".preview-modal"), null);
  click(window, document.querySelector('[data-action="preview-menu"]'));
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(document.querySelector(".preview-modal"), null);

  for (const id of ["tracker", "matrix", "lesson", "missions", "assets", "events", "audit", "media", "settings"]) {
    click(window, document.querySelector(`[data-admin-tab="${id}"]`));
    assert.equal(document.querySelector(".admin-tab.active").dataset.adminTab, id);
  }
  assert.deepEqual(errors, []);
  window.close();
});
