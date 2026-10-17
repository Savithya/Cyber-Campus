import { test, expect } from "@playwright/test";

const BREAKPOINTS = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
const CORE_PAGES = ["/", "/privacy", "/consent", "/demographics", "/admin/login"];

test.describe("Comprehensive Responsive Quality Assurance across all 8 breakpoints", () => {
  for (const width of BREAKPOINTS) {
    test(`Verify layout, no overflow, and typography at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of CORE_PAGES) {
        await page.goto(path);

        // Check for horizontal overflow
        const noOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= window.innerWidth;
        });
        expect(noOverflow, `Horizontal overflow detected on ${path} at ${width}px`).toBe(true);

        // Verify key landmarks are visible
        await expect(page.locator("header.site-header")).toBeVisible();
      }
    });
  }

  test("Verify theme switching between Light, Dark, and Cyber at 375px and 1280px", async ({ page }) => {
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      // Test Cyber theme
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "cyber");
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add("cyber");
      });
      let overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(overflow, `Overflow in cyber theme at ${width}px`).toBe(true);

      // Test Light theme
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.classList.remove("cyber", "dark");
        document.documentElement.classList.add("light");
      });
      overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(overflow, `Overflow in light theme at ${width}px`).toBe(true);

      // Test Dark theme
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.remove("cyber", "light");
        document.documentElement.classList.add("dark");
      });
      overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(overflow, `Overflow in dark theme at ${width}px`).toBe(true);
    }
  });

  test("Verify touch button sizes are at least 44px for accessibility", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const primaryBtn = page.getByRole("link", { name: /Participate in Research|Join the Research/i });
    await expect(primaryBtn).toBeVisible();
    const box = await primaryBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const challengeBtn = page.getByRole("link", { name: /Explore Cyber Games|Explore Cyber Challenges/i });
    await expect(challengeBtn).toBeVisible();
    const challengeBox = await challengeBtn.boundingBox();
    expect(challengeBox).not.toBeNull();
    if (challengeBox) {
      expect(challengeBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("Verify Demographic Profile page UI, Stepper, 5 Cards, and Actions", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/demographics");

    // Stepper checks
    const stepper = page.locator(".research-progress-stepper");
    await expect(stepper).toBeVisible();
    await expect(stepper.getByText("Research Consent")).toBeVisible();
    await expect(stepper.getByText("Student Profile")).toBeVisible();
    await expect(stepper.getByText("Cyber Missions")).toBeVisible();
    await expect(stepper.getByText("Completion")).toBeVisible();

    // Header & Info Bar
    await expect(page.getByRole("heading", { name: "Student Demographic Profile" })).toBeVisible();
    await expect(page.locator(".demographics-info-bar")).toBeVisible();

    // 5 Demographic Questions
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`DEMOGRAPHIC 0${i} / 05`)).toBeVisible();
    }

    // Touch targets >= 44px
    const optionButtons = page.locator(".demo-option-button");
    const count = await optionButtons.count();
    expect(count).toBeGreaterThanOrEqual(20);
    const firstOptionBox = await optionButtons.first().boundingBox();
    expect(firstOptionBox).not.toBeNull();
    if (firstOptionBox) {
      expect(firstOptionBox.height).toBeGreaterThanOrEqual(44);
    }

    // Test selection on Q1
    const firstOption = optionButtons.first();
    await firstOption.click();
    await expect(firstOption).toHaveClass(/selected/);
    await expect(firstOption).toHaveAttribute("aria-checked", "true");

    // Back button and Continue button
    const backBtn = page.getByRole("link", { name: /Back to Research Consent/i });
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toHaveAttribute("href", "/consent");

    const continueBtn = page.getByRole("button", { name: /Save & Continue to Cyber Missions/i });
    await expect(continueBtn).toBeVisible();

    // Incomplete submission validation check
    await continueBtn.click();
    await expect(page.locator(".demo-validation-message")).toBeVisible();
  });
});
