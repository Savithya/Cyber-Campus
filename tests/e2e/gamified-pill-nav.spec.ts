import { test, expect } from "@playwright/test";

test.describe("Design 02: Gamified Pill Navigation Verification", () => {
  test("Desktop navigation structure, icons, and pill layout", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // Verify Site Header landmark
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();

    // Verify Clickable Logo and Brand
    const brand = page.locator("header.site-header .brand");
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute("href", "/#home");
    await expect(brand).toContainText("cybercampus");

    // Verify Center Navigation Pills
    const navPills = page.locator("nav.desktop-pill-nav .nav-pill");
    await expect(navPills).toHaveCount(4);

    // 1. Home
    const homePill = navPills.nth(0);
    await expect(homePill).toContainText("Home");
    await expect(homePill).toHaveAttribute("href", "/#home");
    await expect(homePill).toHaveClass(/active/);
    await expect(homePill).toHaveAttribute("aria-current", "page");

    // 2. Cyber Challenges
    const challengesPill = navPills.nth(1);
    await expect(challengesPill).toContainText("Cyber Challenges");
    await expect(challengesPill).toHaveAttribute("href", "/#challenges");

    // 3. Join Research
    const joinPill = navPills.nth(2);
    await expect(joinPill).toContainText("Join Research");
    await expect(joinPill).toHaveAttribute("href", "/consent");

    // 4. About the Study
    const aboutPill = navPills.nth(3);
    await expect(aboutPill).toContainText("About the Study");
    await expect(aboutPill).toHaveAttribute("href", "/privacy");

    // Verify Researcher Access on Right
    const researcherPill = page.locator("header.site-header .nav-researcher-pill");
    await expect(researcherPill).toBeVisible();
    await expect(researcherPill).toContainText("Researcher Access");
    await expect(researcherPill).toHaveAttribute("href", "/admin/login");

    // Verify Appearance Switcher with 2 options
    const switcher = page.locator("header.site-header .appearance-switcher");
    await expect(switcher).toBeVisible();
    const segments = switcher.locator("button[role='radio']");
    await expect(segments).toHaveCount(2);
    await expect(segments.nth(0)).toContainText("Dark");
    await expect(segments.nth(1)).toContainText("Light");
  });

  test("Active route styling based on route (not hardcoded Home)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // On /privacy (About the Study)
    await page.goto("/privacy");
    const homePill = page.locator("nav.desktop-pill-nav .nav-pill").nth(0);
    const aboutPill = page.locator("nav.desktop-pill-nav .nav-pill").nth(3);
    await expect(homePill).not.toHaveClass(/active/);
    await expect(aboutPill).toHaveClass(/active/);
    await expect(aboutPill).toHaveAttribute("aria-current", "page");

    // On /consent (Join Research)
    await page.goto("/consent");
    const joinPill = page.locator("nav.desktop-pill-nav .nav-pill").nth(2);
    await expect(homePill).not.toHaveClass(/active/);
    await expect(joinPill).toHaveClass(/active/);
    await expect(joinPill).toHaveAttribute("aria-current", "page");

    // On /admin/login (Researcher Access)
    await page.goto("/admin/login");
    const researcherPill = page.locator("header.site-header .nav-researcher-pill");
    await expect(homePill).not.toHaveClass(/active/);
    await expect(researcherPill).toHaveClass(/active/);
    await expect(researcherPill).toHaveAttribute("aria-current", "page");
  });

  test("Home button and Logo smooth navigation to Hero Section", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to /privacy and then click Home
    await page.goto("/privacy");
    const homePill = page.locator("nav.desktop-pill-nav .nav-pill").nth(0);
    await homePill.click();

    await page.waitForURL(/\/(#home)?$/);
    const heroSection = page.locator("#home");
    await expect(heroSection).toBeVisible();
    await expect(heroSection.locator("h1")).toContainText(/Explore Cyber Threats|Impact of Social Engineering Threats/);

    // Scroll down and test Logo click returns to hero
    await page.evaluate(() => window.scrollTo(0, 800));
    const logo = page.locator("header.site-header .brand");
    await logo.click();
    await page.waitForTimeout(300);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test("Two-mode Appearance Switcher: Dark, Light functionality & persistence", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const switcher = page.locator("header.site-header .appearance-switcher");
    const darkBtn = switcher.locator("button[role='radio']").nth(0);
    const lightBtn = switcher.locator("button[role='radio']").nth(1);

    // Switch to Light
    await lightBtn.click();
    await expect(lightBtn).toHaveClass(/selected/);
    await expect(lightBtn).toHaveAttribute("aria-checked", "true");
    let themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAttr).toBe("light");
    let stored = await page.evaluate(() => localStorage.getItem("cc-theme"));
    expect(stored).toBe("light");

    // Switch to Dark
    await darkBtn.click();
    await expect(darkBtn).toHaveClass(/selected/);
    await expect(darkBtn).toHaveAttribute("aria-checked", "true");
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAttr).toBe("dark");
    stored = await page.evaluate(() => localStorage.getItem("cc-theme"));
    expect(stored).toBe("dark");

    // Verify persistence across page navigation
    await lightBtn.click();
    await page.goto("/privacy");
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAttr).toBe("light");
  });

  test("Mobile navigation drawer: open, ordered links, appearance switcher, and close", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Desktop nav should be hidden, trigger visible
    await expect(page.locator("nav.desktop-pill-nav")).toBeHidden();
    const menuTrigger = page.locator(".mobile-menu-trigger");
    await expect(menuTrigger).toBeVisible();
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "false");

    // Open mobile menu
    await menuTrigger.click();
    await expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
    const drawer = page.locator("#mobile-navigation-drawer");
    await expect(drawer).toBeVisible();

    // Verify links in exact order
    const mobileLinks = drawer.locator("nav.mobile-nav-links .mobile-nav-pill");
    await expect(mobileLinks).toHaveCount(5);
    await expect(mobileLinks.nth(0)).toContainText("Home");
    await expect(mobileLinks.nth(1)).toContainText("Cyber Challenges");
    await expect(mobileLinks.nth(2)).toContainText("Join Research");
    await expect(mobileLinks.nth(3)).toContainText("About the Study");
    await expect(mobileLinks.nth(4)).toContainText("Researcher Access");

    // Verify touch target height >= 44px
    for (let i = 0; i < 5; i++) {
      const box = await mobileLinks.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    // Verify Appearance switcher inside mobile menu
    const mobileSwitcher = drawer.locator(".mobile-appearance-toggle");
    await expect(mobileSwitcher).toBeVisible();
    const mobileSegments = mobileSwitcher.locator("button[role='radio']");
    await expect(mobileSegments).toHaveCount(2);
    await expect(mobileSegments.nth(0)).toContainText("Dark");
    await expect(mobileSegments.nth(1)).toContainText("Light");

    // Test theme change from mobile drawer
    await mobileSegments.nth(1).click();
    const themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAttr).toBe("light");

    // Close via Close button
    const closeBtn = drawer.locator(".mobile-close-button");
    await closeBtn.click();
    await expect(drawer).toBeHidden();

    // Reopen and test close on Escape
    await menuTrigger.click();
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
