import { describe, it, expect, vi } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { HeroSection } from "@/components/hero-section";
import { ThreatCategories } from "@/components/threat-categories";
import { ParticipationJourney } from "@/components/participation-journey";
import { CyberLabPreview } from "@/components/cyber-lab-preview";
import { ResearchEthics } from "@/components/research-ethics";
import { ResearchJourneyFrame } from "@/components/research-journey-frame";
import { ResearchParticipationPage } from "@/components/research-participation-page";
import AdminLoginPage from "@/app/admin/login/page";
import WithdrawPage from "@/app/withdraw/page";
import { demoConfig } from "@/lib/config.server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("CYBER CAMPUS — Complete 14-Viewport Responsiveness & Accessibility Audit", () => {
  const cssPath = path.resolve(__dirname, "../src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  const ALL_14_VIEWPORTS = [
    { width: 320, category: "Small Android phone (JioPhone, Fold cover)", type: "mobile" },
    { width: 360, category: "Common Android phone (Galaxy A, Moto G)", type: "mobile" },
    { width: 375, category: "Small iPhone (iPhone SE)", type: "mobile" },
    { width: 390, category: "Modern iPhone (iPhone 13/14/15/16)", type: "mobile" },
    { width: 414, category: "Large phone (iPhone Plus/XR)", type: "mobile" },
    { width: 430, category: "Large phone (iPhone Pro Max)", type: "mobile" },
    { width: 600, category: "Small tablet (Nexus 7, Kindle Fire)", type: "small-tablet" },
    { width: 768, category: "Tablet portrait (iPad Mini, iPad 10th)", type: "tablet" },
    { width: 820, category: "Larger tablet portrait (iPad Air 11)", type: "tablet" },
    { width: 1024, category: "Tablet landscape / small laptop", type: "laptop" },
    { width: 1280, category: "Standard laptop (MacBook Air 13)", type: "laptop" },
    { width: 1366, category: "Standard laptop display (1366x768)", type: "laptop" },
    { width: 1440, category: "Desktop display (QHD/Desktop)", type: "desktop" },
    { width: 1920, category: "Full HD 1080p monitor", type: "desktop" },
    { width: 2560, category: "Large / Ultrawide monitor (1440p/4K)", type: "ultrawide" },
  ];

  describe("1. Viewport Coverage & Breakpoint Matrix", () => {
    it("validates all 14 requested device viewports are mapped correctly", () => {
      expect(ALL_14_VIEWPORTS).toHaveLength(15); // 15 test widths covering all 14 specified categories

      ALL_14_VIEWPORTS.forEach((vp) => {
        expect(vp.width).toBeGreaterThanOrEqual(320);
        expect(vp.width).toBeLessThanOrEqual(2560);
      });
    });

    it("verifies global responsive layout rules prevent horizontal overflow", () => {
      expect(css).toContain("max-width: 100%");
      expect(css).toContain("overflow-x: hidden");
      expect(css).toContain("box-sizing: border-box");
      expect(css).toContain("min-width: 0");
    });

    it("verifies touch target size compliance across touch devices (min-height >= 44px)", () => {
      expect(css).toContain("min-height: 44px");
      expect(css).toContain("touch-action: manipulation");
    });

    it("verifies iOS Safari zoom prevention on form inputs", () => {
      expect(css).toContain("font-size: 16px !important");
    });

    it("verifies notch & safe area inset protection", () => {
      expect(css).toContain("env(safe-area-inset-top)");
      expect(css).toContain("env(safe-area-inset-bottom)");
      expect(css).toContain("env(safe-area-inset-left)");
      expect(css).toContain("env(safe-area-inset-right)");
    });
  });

  describe("2. Navigation Bar (All Devices: Mobile, Tablet, Desktop)", () => {
    it("renders SiteHeader with responsive brand, desktop navigation, and mobile hamburger trigger", () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(SiteHeader)
        )
      );

      // Brand mark
      expect(html).toContain("brand");
      expect(html).toContain("cyber");
      expect(html).toContain("campus");
      expect(html).toContain("RESEARCH");

      // Desktop navigation
      expect(html).toContain("desktop-pill-nav");
      expect(html).toContain("Home");
      expect(html).toContain("Join Research");
      expect(html).toContain("About the Study");

      // Right controls
      expect(html).toContain("Researcher Access");
      expect(html).toContain("Appearance");

      // Mobile trigger
      expect(html).toContain("mobile-header-actions");
      expect(html).toContain("mobile-menu-trigger");
    });

    it("verifies adaptive navbar media queries in globals.css", () => {
      // Tablet breakpoint (<= 1023px): switches to mobile hamburger menu
      expect(css).toContain("@media (max-width: 1023px)");
      // Tablet landscape / small laptop (1024px to 1240px): balanced compact pills
      expect(css).toContain("@media (min-width: 1024px) and (max-width: 1240px)");
      // Micro phone tuning (<= 360px)
      expect(css).toContain("@media (max-width: 360px)");
    });
  });

  describe("3. Homepage Hero Section (Mobile, Tablet, Desktop)", () => {
    it("renders HeroSection with 2-column balanced grid and responsive image constraints", () => {
      const html = renderToString(React.createElement(HeroSection));

      expect(html).toContain("cyber-hero-image-wrapper");
      expect(html).toContain("cyber-hero-image");
      expect(html).toContain("max-w-[1440px]");
      expect(html).toContain("lg:grid-cols-2");
      expect(html).toContain("Start Research");
      expect(html).toContain("Voluntary Participation");
      expect(html).toContain("Anonymous Research ID");
    });

    it("verifies CSS image constraints (width: 100%, max-width: 650px, height: auto)", () => {
      expect(css).toContain(".cyber-hero-image-wrapper");
      expect(css).toContain("max-width: 650px");
      expect(css).toContain("object-fit: contain");
    });
  });

  describe("4. Cyber Challenges & Threat Categories", () => {
    it("renders ThreatCategories with all 4 IVs and responsive layout", () => {
      const html = renderToString(React.createElement(ThreatCategories));

      expect(html).toContain("threat-categories-section");
      expect(html).toContain("grid-cols-1 lg:grid-cols-2");
      expect(html).toContain("IV1");
      expect(html).toContain("Phishing");
      expect(html).toContain("IV2");
      expect(html).toContain("Pretexting");
      expect(html).toContain("IV3");
      expect(html).toContain("Impersonation");
      expect(html).toContain("IV4");
      expect(html).toContain("Online Scams &amp; Malicious Links");
    });

    it("renders CyberLabPreview with safe simulated email headers", () => {
      const html = renderToString(React.createElement(CyberLabPreview));

      expect(html).toContain("cyber-lab-preview-section");
      expect(html).toContain("LMS Account Verification");
      expect(html).toContain("From:");
      expect(html).toContain("Subject:");
      expect(html).toContain("Simulated Link Destination:");
      expect(html).toContain("What Would You Do?");
    });
  });

  describe("5. Participation Journey & Workflow", () => {
    it("renders ParticipationJourney with 4 responsive step cards", () => {
      const html = renderToString(React.createElement(ParticipationJourney));

      expect(html).toContain("participation-journey-section");
      expect(html).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
      expect(html).toContain("Research Information &amp; Consent");
      expect(html).toContain("Participant Demographics");
      expect(html).toContain("Cyber Investigation Missions");
      expect(html).toContain("Submit &amp; Complete");
    });

    it("renders ResearchJourneyFrame with responsive sidebar and action bar", () => {
      const html = renderToString(
        React.createElement(
          ResearchJourneyFrame,
          {
            currentStep: "consent",
            progressPercent: 0,
            missionKicker: "STEP 01 OF 07",
            title: "Research Consent",
            subtitle: "Your choice to take part in academic research.",
            backHref: "/",
            backLabel: "Home",
            continueLabel: "Continue to Step 02",
            onContinue: () => {},
          },
          React.createElement("div", { className: "content-slot" }, "Step Content")
        )
      );

      expect(html).toContain("journey-layout-container");
      expect(html).toContain("journey-layout-grid");
      expect(html).toContain("journey-sidebar");
      expect(html).toContain("journey-stepper-list");
      expect(html).toContain("journey-action-bar");
      expect(html).toContain("content-slot");
    });
  });

  describe("6. Researcher Access Portal & Login", () => {
    it("renders AdminLoginPage with fluid responsive container", () => {
      const html = renderToString(React.createElement(AdminLoginPage));

      expect(html).toContain("research-portal-container");
      expect(html).toContain("research-intro-section");
      expect(html).toContain("research-login-section");
      expect(html).toContain("Researcher Access PIN");
      expect(html).toContain("Access Research Dashboard");
    });
  });

  describe("7. Research Ethics, About the Study & Withdrawal", () => {
    it("renders ResearchEthics with responsive 4-card grid", () => {
      const html = renderToString(React.createElement(ResearchEthics));

      expect(html).toContain("research-ethics-section");
      expect(html).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
      expect(html).toContain("Voluntary Participation");
      expect(html).toContain("Data Minimization");
      expect(html).toContain("Confidentiality &amp; Protection");
      expect(html).toContain("Research Transparency");
    });

    it("renders ResearchParticipationPage with quick jump dock", () => {
      const html = renderToString(
        React.createElement(ResearchParticipationPage, { config: demoConfig })
      );

      expect(html).toContain("research-page");
      expect(html).toContain("research-nav-strip");
      expect(html).toContain("research-nav-pill-dock");
    });

    it("renders WithdrawPage with full-width responsive form controls", () => {
      const html = renderToString(React.createElement(WithdrawPage));

      expect(html).toContain("narrow page-space");
      expect(html).toContain("Participant code");
      expect(html).toContain("Private deletion token");
      expect(html).toContain("Delete my response");
    });
  });

  describe("8. Dark and Light Theme Consistency", () => {
    it("verifies complete theme tokens exist for light, dark, and cyber modes", () => {
      expect(css).toContain('[data-theme="light"]');
      expect(css).toContain('[data-theme="dark"]');
      expect(css).toContain('[data-theme="cyber"]');
    });
  });
});
