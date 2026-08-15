import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";

const html = readFileSync("dist/index.html", "utf8");
const app = readFileSync("dist/app.js", "utf8");
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const studentUsers = {
  alena: { id: "user-alena", role: "student", studentId: "alena" },
  anastasia: { id: "user-anastasia", role: "student", studentId: "anastasia" },
  egor: { id: "user-egor", role: "student", studentId: "egor" },
  kirill: { id: "user-kirill", role: "student", studentId: "kirill" }
};
const adminUser = { id: "teacher-test", role: "admin", studentId: null };

function createTestAuthProvider(initialUser = studentUsers.alena) {
  let session = initialUser ? { user: structuredClone(initialUser) } : null;
  return {
    async login(login, password) {
      await tick();
      const user = studentUsers[login];
      if (!user || password !== "integration-only") {
        const error = new Error("Rejected by test provider");
        error.code = "invalid_credentials";
        throw error;
      }
      session = { user: structuredClone(user) };
      return session;
    },
    async logout() { session = null; },
    async getSession() { return session; }
  };
}

async function boot(hash = "", { user = studentUsers.alena, provider = createTestAuthProvider(user), legacyStudentId = null } = {}) {
  const window = new Window({ url: `http://localhost:4173/${hash}` });
  window.innerWidth = 1366;
  window.innerHeight = 768;
  window.document.write(html);
  window.document.close();
  window.localStorage.clear();
  if (legacyStudentId) window.localStorage.setItem("elu-demo-student-id", legacyStudentId);
  if (provider) window.ELU_AUTH_PROVIDER = provider;
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

function submit(window, form) {
  form.dispatchEvent(new window.SubmitEvent("submit", { bubbles: true, cancelable: true }));
}

function savedState(window) {
  return JSON.parse(window.localStorage.getItem("elu-live-state-v2"));
}

test("no session and direct student URLs render the provider-backed Login Screen", async () => {
  for (const route of ["profile", "missions", "challenge", "crew", "leaderboard"]) {
    const { window, document, errors } = await boot(`#${route}`, { user: null });
    assert.equal(window.location.hash, "#login");
    assert.ok(document.querySelector("#loginForm"));
    assert.match(document.querySelector("#view").textContent, /ВХОД В ПРОФИЛЬ/);
    assert.equal(document.querySelector(".profile-hero"), null);
    assert.equal(document.querySelectorAll(".student-card").length, 0, "login never exposes profile cards");
    assert.deepEqual(errors, []);
    window.close();
  }

  const unconfigured = await boot("", { user: null, provider: null });
  assert.match(unconfigured.document.querySelector(".auth-disclaimer").textContent, /BACKEND REQUIRED/);
  assert.match(unconfigured.document.querySelector(".auth-disclaimer").textContent, /Auth provider не подключён/);
  unconfigured.window.close();
});

test("login, student isolation, logout and session restoration use only the auth provider", async () => {
  const provider = createTestAuthProvider(null);
  const { window, document, errors } = await boot("", { user: null, provider });
  const passwordInput = document.querySelector("#loginPassword");
  change(window, document.querySelector("#loginName"), "unknown");
  change(window, passwordInput, "wrong");
  click(window, document.querySelector('[data-action="toggle-password"]'));
  assert.equal(passwordInput.type, "text");
  assert.equal(document.querySelector('[data-action="toggle-password"]').getAttribute("aria-label"), "Скрыть пароль");
  submit(window, document.querySelector("#loginForm"));
  await tick();
  await tick();
  assert.match(document.querySelector("#loginError").textContent, /Неверный логин или пароль/);

  change(window, document.querySelector("#loginName"), "egor");
  change(window, document.querySelector("#loginPassword"), "integration-only");
  submit(window, document.querySelector("#loginForm"));
  assert.match(document.querySelector(".login-submit").textContent, /ВХОДИМ/);
  await tick();
  await tick();
  await tick();
  assert.equal(window.location.hash, "");
  assert.equal(window.AuthService.getCurrentUser().studentId, "egor");
  assert.match(document.querySelector("#miniProfile").textContent, /Егор/);

  const teammateCard = [...document.querySelectorAll(".student-card")].find(card => /Алёна/.test(card.textContent));
  click(window, teammateCard);
  assert.equal(window.AuthService.getCurrentUser().studentId, "egor", "Team card cannot switch identity");

  click(window, document.querySelector('[data-route="profile"]'));
  assert.match(document.querySelector(".profile-name h1").textContent, /Егор/);
  click(window, document.querySelector('[data-route="missions"]'));
  click(window, document.querySelector('[data-action="start-mission"]'));
  const beforeLogout = savedState(window);
  assert.equal(beforeLogout.weekRecords.egor[0].status, "In Progress");
  click(window, document.querySelector('[data-route="profile"]'));
  click(window, document.querySelector('[data-action="logout-request"]'));
  assert.match(document.querySelector(".logout-modal").textContent, /Выйти из профиля/);
  click(window, document.querySelector('.logout-modal [data-action="logout-confirm"]'));
  await tick();
  await tick();
  assert.equal(window.location.hash, "#login");
  assert.equal(window.AuthService.getCurrentUser(), null);
  assert.equal(window.localStorage.getItem("elu-demo-student-id"), null);
  assert.deepEqual(savedState(window), beforeLogout, "logout keeps XP, progress, rewards, photos, submissions and history");

  change(window, document.querySelector("#loginName"), "alena");
  change(window, document.querySelector("#loginPassword"), "integration-only");
  submit(window, document.querySelector("#loginForm"));
  await tick();
  await tick();
  click(window, document.querySelector('[data-route="profile"]'));
  assert.match(document.querySelector(".profile-name h1").textContent, /Алёна/);
  const browserStorage = Object.keys(window.localStorage).map(key => `${key}:${window.localStorage.getItem(key)}`).join("\n");
  assert.doesNotMatch(browserStorage, /integration-only|wrong/);
  assert.deepEqual(errors, []);
  window.close();

  const restored = await boot("#profile", { user: studentUsers.egor });
  assert.equal(restored.window.AuthService.getCurrentUser().studentId, "egor");
  assert.match(restored.document.querySelector(".profile-name h1").textContent, /Егор/);
  restored.window.close();
});

test("legacy identity injection is ignored and a student cannot enter Admin", async () => {
  const isolated = await boot("#profile", { user: studentUsers.alena, legacyStudentId: "egor" });
  assert.equal(isolated.window.localStorage.getItem("elu-demo-student-id"), null);
  assert.equal(isolated.window.AuthService.getCurrentUser().studentId, "alena");
  assert.match(isolated.document.querySelector(".profile-name h1").textContent, /Алёна/);
  assert.doesNotMatch(isolated.document.querySelector(".profile-name h1").textContent, /Егор/);
  isolated.window.close();

  const blockedAdmin = await boot("#admin", { user: studentUsers.alena });
  assert.equal(blockedAdmin.window.location.hash, "#login");
  assert.equal(blockedAdmin.document.querySelector(".admin-shell"), null);
  assert.match(blockedAdmin.document.querySelector("#loginError").textContent, /Admin/);
  blockedAdmin.window.close();
});

test("Challenge click opens Week 1 mission detail and locked Week 2 stays closed", async () => {
  const { window, document, errors } = await boot();

  click(window, document.querySelector('[data-route="challenge"]'));
  assert.equal(window.location.hash, "#challenge");
  const weekOne = document.querySelector('.big-week [data-action="view-week"][data-week="1"]');
  assert.match(weekOne.textContent, /Открыть миссию/);
  click(window, weekOne);
  assert.equal(window.location.hash, "#missions");
  assert.match(document.querySelector("#view").textContent, /Week 1/);
  assert.match(document.querySelector("#view").textContent, /Who Am I\?/);
  assert.match(document.querySelector("#view").textContent, /Two Truths & One Lie/);
  assert.ok(document.querySelector(".mission-detail"), "mission detail screen is rendered");

  click(window, document.querySelector('[data-route="challenge"]'));
  const weekTwo = document.querySelector('.big-week [data-action="view-week"][data-week="2"]');
  assert.equal(weekTwo.disabled, false, "locked control remains clickable so it can explain the lock");
  assert.equal(weekTwo.getAttribute("aria-disabled"), "true");
  click(window, weekTwo);
  assert.equal(window.location.hash, "#challenge");
  assert.equal(document.querySelector(".mission-detail"), null);
  assert.match(document.querySelector(".toast-root").textContent, /Эта неделя пока закрыта/);

  click(window, document.querySelector('[data-route="home"]'));
  const homeMissionButtons = [...document.querySelectorAll('[data-action="open-current-mission"]')];
  assert.equal(homeMissionButtons.length, 2, "hero and current-week card share the mission entry point");
  click(window, homeMissionButtons[1]);
  assert.equal(window.location.hash, "#missions");
  assert.match(document.querySelector("#view").textContent, /Two Truths & One Lie/);

  click(window, document.querySelector('[data-route="home"]'));
  click(window, document.querySelector('.roadmap [data-action="view-week"][data-week="1"]'));
  assert.equal(window.location.hash, "#missions");
  assert.match(document.querySelector("#view").textContent, /Who Am I\?/);
  assert.deepEqual(errors, []);
  window.close();
});

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
  const { window, document, errors } = await boot("#admin", { user: adminUser });
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
  assert.equal(window.localStorage.getItem("elu-demo-student-id"), null);
  assert.equal(window.AuthService.getCurrentUser().id, adminUser.id);
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

test("all Student and Admin screens render at 1366x768 in Dark and Light themes", async () => {
  const routes = ["home", "challenge", "missions", "crew", "events", "feed", "leaderboard", "profile"];
  const adminTabs = ["tracker", "matrix", "lesson", "missions", "assets", "events", "audit", "media", "settings"];

  for (const expectedTheme of ["dark", "light"]) {
    const { window, document, errors } = await boot();
    if (expectedTheme === "light") click(window, document.querySelector(".theme-toggle"));
    assert.equal(document.documentElement.dataset.theme, expectedTheme);

    for (const route of routes) {
      click(window, document.querySelector(`[data-route="${route}"]`));
      assert.equal(window.location.hash, route === "home" ? "" : `#${route}`);
      assert.ok(document.querySelector(".page-enter"), `${expectedTheme} ${route} renders`);
    }

    window.history.replaceState(null, "", "#admin");
    window.close();
    const adminBoot = await boot("#admin", { user: adminUser });
    if (expectedTheme === "light") click(adminBoot.window, adminBoot.document.querySelector(".admin-bar .theme-toggle"));
    assert.equal(adminBoot.document.documentElement.dataset.theme, expectedTheme);
    for (const tab of adminTabs) {
      click(adminBoot.window, adminBoot.document.querySelector(`[data-admin-tab="${tab}"]`));
      assert.equal(adminBoot.document.querySelector(".admin-tab.active").dataset.adminTab, tab);
      assert.ok(adminBoot.document.querySelector(".admin-content"), `${expectedTheme} Admin ${tab} renders`);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(adminBoot.errors, []);
    adminBoot.window.close();
  }
});
