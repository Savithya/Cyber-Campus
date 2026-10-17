import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const origin = "http://127.0.0.1:3005";
test.beforeEach(async ({ request }) => {
  const check = await request.get("/api/config");
  expect(
    check.ok(),
    "Expected the local Cyber Campus demo server",
  ).toBeTruthy();
  expect(
    (await check.json()).mode,
    "Refusing to send test answers to research mode",
  ).toBe("demo");
});
const blank = () =>
  Object.fromEntries(
    Array.from({ length: 25 }, (_, i) => [
      "Q" + (i + 1),
      { value: null, status: "not_answered" },
    ]),
  );
const post = (request: APIRequestContext, path: string, data: unknown) =>
  request.post("/api/" + path, { data, headers: { Origin: origin } });
async function start(page: Page, practice = false) {
  const r = await post(page.request, "session/start", {
    consented: !practice,
    eligible: !practice,
    practice,
    priorExposure: false,
    token: "a".repeat(64),
  });
  expect(r.ok()).toBeTruthy();
  return (await r.json()).session;
}
async function submit(page: Page) {
  await start(page);
  const r = await post(page.request, "session/submit", {
    answers: blank(),
    idempotencyKey: crypto.randomUUID(),
  });
  expect(r.ok()).toBeTruthy();
}
test("consent, no defaults, skips, back navigation, recovery, review, submit once, withdrawal", async ({
  page,
}) => {
  await page.goto("/consent");
  await page.getByRole("checkbox", { name: /I am 18/ }).check();
  await page.getByRole("checkbox", { name: /I have read/ }).check();
  await page
    .getByRole("button", { name: "Consent and begin questionnaire" })
    .click();
  await expect(page).toHaveURL(/\/survey$/);
  await expect(page.getByRole("radio").first()).not.toBeChecked();
  await page.getByRole("combobox").first().selectOption("2");
  await page
    .getByRole("radio", { name: "Prefer not to say", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Skip this question", exact: true })
    .nth(2)
    .click();
  await expect(page.locator(".save-status")).toHaveText("Saved securely");
  await page.reload();
  await expect(page.getByRole("combobox").first()).toHaveValue("2");
  await expect(
    page.getByRole("radio", { name: "Prefer not to say", exact: true }),
  ).toBeChecked();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "Next section", exact: true })
      .click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Online Scams & Malicious Link Threats",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await page.getByRole("button", { name: "Review answers" }).click();
  await expect(
    page.getByText("Unanswered and skipped questions are welcome.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Submit questionnaire", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Thank you for sharing your perspective.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("cc-private-draft-v1")),
  ).toBeNull();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Thank you for sharing your perspective.",
    }),
  ).toBeVisible();
  const state = (await (await page.request.get("/api/session")).json()).session;
  expect(state.status).toBe("submitted_with_missing");
  expect(state.answers.Q1.value).toBe(2);
  expect(state.answers.Q3).toEqual({ value: null, status: "skipped" });
  expect(
    (await post(page.request, "session/draft", { answers: blank() })).status(),
  ).toBe(409);
  await page.getByText("Show private deletion token", { exact: true }).click();
  const token = await page.locator(".token").innerText();
  await page.goto("/withdraw");
  await page.getByLabel("Participant code", { exact: true }).fill(state.code);
  await page.getByLabel("Private deletion token", { exact: true }).fill(token);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Delete my response", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your active response has been deleted.",
    }),
  ).toBeVisible();
});
test("locked games, unauthorised admin, cross-origin writes and separate demo fixtures", async ({
  page,
  browser,
}) => {
  expect((await page.request.get("/api/scenarios")).status()).toBe(403);
  expect((await page.request.get("/api/admin/data")).ok()).toBe(false);
  expect(
    (await page.request.get("/api/admin/export?kind=responses-wide")).ok(),
  ).toBe(false);
  expect(
    (await page.request.post("/api/session/start", { data: {} })).status(),
  ).toBe(403);
  await page.goto("/play");
  await expect(
    page.getByRole("heading", {
      name: "Start with the participation information.",
    }),
  ).toBeVisible();
  await start(page);
  expect((await page.request.get("/api/scenarios")).status()).toBe(403);
  const other = await browser.newContext();
  expect(
    (await (await other.request.get(origin + "/api/session")).json()).session,
  ).toBeNull();
  await other.close();
  const data = await (await page.request.get("/api/demo/data")).json();
  expect(data.sessions).toHaveLength(48);
  expect(data.sessions.every((s: { mode: string }) => s.mode === "demo")).toBe(
    true,
  );
});
test("all 12 scenarios across 4 missions, keyboard controls, correct total, locked first scores and skips", async ({
  page,
}) => {
  await submit(page);
  const correct: Record<string, string> = {
    PH01: "report",
    PH02: "verify",
    PH03: "report",
    PT01: "verify",
    PT02: "report",
    PT03: "verify",
    IM01: "verify",
    IM02: "report",
    IM03: "verify",
    SC01: "report",
    SC02: "verify",
    SC03: "report",
  };
  const groups = [
    ["phishing", "PH"],
    ["pretexting", "PT"],
    ["impersonation", "IM"],
    ["links", "SC"],
  ];
  const labels: Record<string, string> = {
    report: "Withhold details and report",
    verify: "Verify through a known channel",
    proceed: "Proceed with the request",
  };
  for (const [mission, prefix] of groups) {
    await page.goto("/play/" + mission);
    for (let i = 1; i <= 3; i++) {
      const id = prefix + "0" + i;
      await page.locator(".clue summary").first().press("Enter");
      await page
        .getByRole("radio", { name: labels[correct[id]], exact: true })
        .press("Space");
      await page
        .getByRole("button", { name: "Confirm decision" })
        .press("Enter");
      await expect(
        page.getByRole("heading", { name: "10 / 10 first-attempt points" }),
      ).toBeVisible();
      if (i < 3)
        await page.getByRole("button", { name: "Next scenario" }).click();
    }
  }
  await page.goto("/results");
  await expect(page.locator(".stat-card").first()).toContainText("120");
  await page.goto("/play/phishing");
  await page
    .getByRole("radio", { name: "Proceed with the request", exact: true })
    .check();
  await page.getByRole("button", { name: "Confirm decision" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Practice replay · first score unchanged",
    }),
  ).toBeVisible();
  const s = (await (await page.request.get("/api/session")).json()).session;
  expect(
    s.attempts
      .filter((a: { attemptNumber: number }) => a.attemptNumber === 1)
      .reduce((n: number, a: { points: number }) => n + a.points, 0),
  ).toBe(120);
});
test("decline participation, practice, known exposure and separate accuracy denominator", async ({
  page,
}) => {
  await page.goto("/consent");
  await page.getByRole("button", { name: "Decline & practise only" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await page
    .getByRole("link", { name: "Enter mission", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Skip this scenario", exact: true })
    .click();
  await expect(page.getByText("Skipped — ready to learn")).toBeVisible();
  await page.goto("/results");
  await expect(page.locator(".stat-card").nth(1)).toContainText(
    "0 correct / 0 attempted",
  );
  await page.goto("/play");
  await page
    .getByRole("button", { name: "End practice & return to consent" })
    .click();
  await expect(
    page.getByRole("checkbox", { name: /I have previously played/ }),
  ).toBeChecked();
});
test("connection failure keeps the draft and retry does not duplicate baseline", async ({
  page,
}) => {
  await start(page);
  await page.goto("/survey");
  await page.route("**/api/session/draft", (route) => route.abort());
  await page.getByRole("combobox").first().selectOption("3");
  await expect(page.locator('.error-box[role="alert"]')).toBeVisible();
  await page.unroute("**/api/session/draft");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".save-status")).toHaveText("Saved securely");
  await page.goto("/survey/review");
  await page.route("**/api/session/submit", (route) => route.abort());
  await page
    .getByRole("button", { name: "Submit questionnaire", exact: true })
    .click();
  await expect(page.locator('.error-box[role="alert"]')).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("cc-private-draft-v1")),
  ).not.toBeNull();
  await page.unroute("**/api/session/submit");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Thank you for sharing your perspective.",
    }),
  ).toBeVisible();
});
test("all 25 charts, filtered CSV, downloadable charts and print report", async ({
  page,
}) => {
  await page.goto("/demo/questions/Q1?Q3=1");
  for (let i = 1; i <= 25; i++) {
    await page.goto("/demo/questions/Q" + i + "?Q3=1");
    await expect(page.locator(".chart-card").first()).toBeVisible();
    await expect(page.locator(".chart-card table").first()).toBeVisible();
    await expect(page.locator(".chart-card").first()).toContainText(
      "Year of Study: Year 1",
    );
  }
  const csv = await (
    await page.request.get("/api/demo/export?kind=responses-wide&Q3=1")
  ).text();
  expect(csv).toContain("synthetic_demo");
  expect(csv).toContain("Year of Study: Year 1");
  const svg = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  expect((await svg).suggestedFilename()).toBe("Q25-response-distribution.svg");
  const png = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  expect((await png).suggestedFilename()).toBe("Q25-response-distribution.png");
  await page.goto("/demo/report?Q3=1");
  await expect(page.locator(".chart-card")).toHaveCount(25);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".admin-sidebar")).toBeHidden();
});
test("responsive layouts at 320, 375, 768, 1024 and 1440; reduced motion and accessibility", async ({
  page,
}) => {
  await fs.mkdir("artifacts", { recursive: true });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width === 1440)
      await page.screenshot({
        path: "artifacts/landing-desktop.png",
        fullPage: true,
      });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await start(page);
  await page.goto("/survey");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  const surveyAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    surveyAxe.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.screenshot({
    path: "artifacts/survey-mobile.png",
    fullPage: true,
  });
  await page.goto("/demo/questions/Q25");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/demo");
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("touch interaction across all 12 scenarios in portrait and landscape", async ({
  browser,
}) => {
  test.setTimeout(120000);
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  await start(page, true);
  for (const mission of ["phishing", "pretexting", "impersonation", "links"]) {
    await page.goto("/play/" + mission);
    for (let i = 0; i < 3; i++) {
      await page.locator(".clue summary").first().tap();
      await page
        .getByRole("radio", {
          name: "Verify through a known channel",
          exact: true,
        })
        .tap();
      await page.getByRole("button", { name: "Confirm decision" }).tap();
      await expect(page.locator(".feedback")).toBeVisible();
      expect(await page.locator('a[href*=".example"]').count()).toBe(0);
      if (i < 2)
        await page.getByRole("button", { name: "Next scenario" }).tap();
    }
    await page.setViewportSize({ width: 812, height: 375 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 375, height: 812 });
  }
  await fs.mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/mission-mobile.png",
    fullPage: true,
  });
  await page.close();
});

test("researcher PIN login, show/hide masking, invalid PIN rejection, dashboard access, and signout", async ({
  page,
}) => {
  const pin = process.env.RESEARCHER_ACCESS_PIN || "CyberSec1234";
  await page.goto("/admin/login");

  // Verify page copy and elements
  await expect(
    page.getByRole("heading", { name: "Welcome back, Researcher." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Enter your authorised Researcher Access PIN to securely access the research dashboard.",
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Researcher Access PIN")).toBeVisible();
  await expect(
    page.getByPlaceholder("Enter your access PIN"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Access Research Dashboard" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Researcher access is restricted to authorised personnel only.",
    ),
  ).toBeVisible();

  // Test password masking and show/hide toggle
  const pinInput = page.getByLabel("Researcher Access PIN");
  await expect(pinInput).toHaveAttribute("type", "password");

  const toggleBtn = page.getByRole("button", { name: /access PIN/i });
  await toggleBtn.click();
  await expect(pinInput).toHaveAttribute("type", "text");

  await toggleBtn.click();
  await expect(pinInput).toHaveAttribute("type", "password");

  // Verify submission is disabled when PIN is empty
  const submitBtn = page.getByRole("button", { name: "Access Research Dashboard" });
  await expect(submitBtn).toBeDisabled();

  // Test invalid PIN
  await pinInput.fill("wrongPIN123");
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
  await expect(
    page.getByText("Invalid Researcher Access PIN. Please try again."),
  ).toBeVisible();
  expect(page.url()).toContain("/admin/login");

  // Test valid PIN
  await pinInput.fill(pin);
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
  await page.waitForURL(/\/admin/);
  await expect(page).toHaveURL(/\/admin/);

  // Verify dashboard has rendered
  await expect(page.locator(".admin-sidebar")).toBeVisible();

  // Test sign out
  const signoutBtn = page.getByRole("button", { name: /Sign out/i });
  await expect(signoutBtn).toBeVisible();
  await signoutBtn.click();
  await page.waitForURL(/\/admin\/login/);
  await expect(page).toHaveURL(/\/admin\/login/);

  // Verify unauthenticated direct access is blocked
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Researcher access required" }),
  ).toBeVisible();
});

