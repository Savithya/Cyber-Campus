import { test, expect } from "@playwright/test";

test.describe("Hero Page & Cyber Mission Control Verification", () => {
  test("Home Hero Page has professional image, exact content, and no '~' symbols", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // 1. Badge
    const badge = page.locator(".eyebrow");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText("INTERACTIVE CYBERSECURITY RESEARCH PLATFORM");

    // 2. Heading
    const heading = page.locator(".hero-main-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Explore Cyber Threats.");
    await expect(heading).toContainText("Protect Your Digital Privacy.");

    // 3. Subtitle
    const subtitle = page.locator(".hero-subtitle-text");
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText(
      "Participate in interactive social engineering simulations and contribute to academic research on user privacy among university students in Sri Lanka."
    );

    // 4. Research Highlights
    const highlights = page.locator(".hero-research-highlights");
    await expect(highlights).toBeVisible();
    await expect(highlights).toContainText("4");
    await expect(highlights).toContainText("Social Engineering Threat Categories");
    await expect(highlights).toContainText("20");
    await expect(highlights).toContainText("Interactive Challenges");
    await expect(highlights).toContainText("15–20 Min");
    await expect(highlights).toContainText("Estimated Participation Time");

    // 5. CTA Buttons
    const startBtn = page.locator(".hero-actions-row a.button.primary");
    await expect(startBtn).toContainText("Start Research");
    await expect(startBtn).toHaveAttribute("href", "/consent");

    const exploreBtn = page.locator(".hero-actions-row a.button.secondary");
    await expect(exploreBtn).toContainText("Explore Cyber Challenges");
    await expect(exploreBtn).toHaveAttribute("href", "#challenges");

    // 6. Reassurance chips (verify 20 challenges, no '~')
    const reassuranceRow = page.locator(".hero-reassurance-row");
    await expect(reassuranceRow).toContainText("15–20 Min · 20 Interactive Challenges");
    const chipsText = await reassuranceRow.innerText();
    expect(chipsText).not.toContain("~");

    // 7. Right Column Hero Image
    const heroImg = page.locator(".hero-cybersecurity-image");
    await expect(heroImg).toBeVisible();
    await expect(heroImg).toHaveAttribute("src", /\/images\/cyber-research-lab\.(webp|jpg)/);
    await expect(heroImg).toHaveAttribute(
      "alt",
      /Interactive Cybersecurity Research Laboratory/i
    );

    // 8. Proposed Variable 5 (AI Deepfake Deception) must NOT be in the active variables section
    const variablesSection = page.locator("#framework");
    if (await variablesSection.isVisible()) {
      const varsText = await variablesSection.innerText();
      expect(varsText).not.toContain("VARIABLE 5");
      expect(varsText).not.toContain("AI Deepfake Deception");
    }
  });

  test("Cyber Mission Control (/play) displays 4 active modules, 20 challenges, 200 Max XP, and 2x2 grid", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Establish session first via /consent -> /demographics
    await page.goto("/consent");
    await page.locator("#eligibility-checkbox").check();
    await page.locator("#consent-checkbox").check();
    await page.getByRole("button", { name: /Continue to Student Profile/i }).click();
    await page.waitForURL(/\/demographics/);

    // Wait for demographics page and session state to be fully ready
    await expect(page.getByRole("heading", { name: "Student Demographic Profile" })).toBeVisible();
    const infoBar = page.locator(".demographics-info-bar");
    await expect(infoBar).toBeVisible();
    await expect(infoBar).toContainText("Anonymous ID:");

    // Answer all 5 demographic questions with verification
    for (let i = 0; i < 5; i++) {
      const opt = page.locator(".demo-card").nth(i).locator(".demo-option-button").first();
      await opt.click();
      await expect(opt).toHaveClass(/selected/);
    }

    // Wait until proceed button is enabled and click
    const proceedBtn = page.getByRole("button", {
      name: /Save Profile & Enter Cyber Missions|Enter Cyber Mission Control/i,
    });
    await expect(proceedBtn).not.toHaveClass(/disabled-btn/);
    await proceedBtn.click();
    await page.waitForURL(/\/play/);

    // 1. Page Header
    const labBadge = page.locator(".cmc-header-centered .eyebrow");
    await expect(labBadge).toContainText("CYBER SIMULATION LABORATORY · SRI LANKA");

    const cmcTitle = page.locator(".cmc-main-heading");
    await expect(cmcTitle).toContainText("Cyber Mission Control");

    const cmcDesc = page.locator(".cmc-description");
    await expect(cmcDesc).toContainText(
      "Investigate four social engineering threat categories through realistic interactive cybersecurity scenarios."
    );

    // 2. 4-Step Tracker
    const tracker = page.locator(".research-journey-tracker");
    await expect(tracker).toBeVisible();
    await expect(tracker.locator(".tracker-step").nth(0)).toHaveClass(/completed/);
    await expect(tracker.locator(".tracker-step").nth(1)).toHaveClass(/completed/);
    await expect(tracker.locator(".tracker-step").nth(2)).toHaveClass(/active/);
    await expect(tracker.locator(".tracker-step").nth(2)).toContainText("Cyber Missions (0/20)");
    await expect(tracker.locator(".tracker-step").nth(3)).not.toHaveClass(/active|completed/);

    // 3. Compact Session Info Bar
    const sessionBar = page.locator(".cmc-session-bar");
    await expect(sessionBar).toBeVisible();
    await expect(sessionBar).toContainText("ANONYMOUS RESEARCH ID");
    await expect(sessionBar).toContainText("SESSION STATUS");
    await expect(sessionBar).toContainText("CURRENT RESEARCH STEP");
    await expect(sessionBar).toContainText("SECURITY & PRIVACY");

    // 4. Research Statistics Panel
    const statsPanel = page.locator(".cmc-stats-panel");
    await expect(statsPanel).toBeVisible();
    await expect(statsPanel).toContainText("INVESTIGATOR RANK");
    await expect(statsPanel).toContainText("RESEARCH XP EARNED");
    await expect(statsPanel).toContainText("200 XP");
    await expect(statsPanel).toContainText("CHALLENGES EVALUATED");
    await expect(statsPanel).toContainText("20 challenges remaining");
    await expect(statsPanel).toContainText("OVERALL RESEARCH STATUS");

    // 5. Threat Modules Grid (Exactly 4 cards)
    const cards = page.locator(".threat-modules-grid .module-card");
    await expect(cards).toHaveCount(4);

    // Verify all 4 threat modules exist in the grid
    const grid = page.locator(".threat-modules-grid");
    await expect(grid).toContainText("M01");
    await expect(grid).toContainText("Phishing Investigation");
    await expect(grid).toContainText("M02");
    await expect(grid).toContainText("Pretexting Detection");
    await expect(grid).toContainText("M03");
    await expect(grid).toContainText("Impersonation Investigation");
    await expect(grid).toContainText("M04");
    await expect(grid).toContainText("Scam & Malicious Link Investigation");

    // Verify each card has 5 separate challenge-ID chips (total 20 chips in the grid)
    const allChips = page.locator(".threat-modules-grid .challenge-indicator-pill");
    await expect(allChips).toHaveCount(20);

    // Verify that NO deepfake or DF cards exist in active mission cards
    const gridText = await grid.innerText();
    expect(gridText).not.toMatch(/\bM05\b/);
    expect(gridText).not.toContain("M05 ·");
    expect(gridText).not.toContain("DF01");
    expect(gridText).not.toContain("Deepfake");

    // Verify Start Mission button launches into challenge view
    const firstLaunchBtn = cards.first().locator(".module-launch-btn");
    await expect(firstLaunchBtn).toBeVisible();
    await expect(firstLaunchBtn).toContainText("Start Mission");
    await firstLaunchBtn.click();

    // Verify scenario runner container opens
    const scenarioRunner = page.locator(".interactive-challenge-runner");
    await expect(scenarioRunner).toBeVisible();
    await expect(scenarioRunner).toContainText("Challenge 1 of 5");
  });
});
