import { describe, it, expect, vi } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { HeroSection } from "@/components/hero-section";
import { ThreatCategories } from "@/components/threat-categories";
import { ParticipationJourney } from "@/components/participation-journey";
import { CyberLabPreview } from "@/components/cyber-lab-preview";
import { ResearchEthics } from "@/components/research-ethics";
import { ResearchCTA } from "@/components/research-cta";
import { ResearchJourneyFrame } from "@/components/research-journey-frame";
import { ResearchParticipationPage } from "@/components/research-participation-page";
import WithdrawPage from "@/app/withdraw/page";
import AdminLoginPage from "@/app/admin/login/page";
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

describe("Comprehensive Multi-Device Responsiveness Across All Pages & Screen Sizes", () => {
  const cssPath = path.resolve(__dirname, "../src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  describe("1. CSS Breakpoints & Multi-Device Coverage", () => {
    it("includes media queries covering the complete device spectrum", () => {
      // Micro mobile (320px - 360px: iPhone SE 1st, Galaxy S8)
      expect(css).toContain("@media (max-width: 360px)");

      // Standard mobile (375px - 430px: iPhone 13/14/15/16 Pro, Pixel 7/8)
      expect(css).toContain("@media (max-width: 480px)");
      expect(css).toContain("@media (max-width: 430px)");

      // Phablets & Small tablets (640px)
      expect(css).toContain("@media (max-width: 640px)");

      // Tablets in portrait (768px: iPad mini / iPad 10th gen)
      expect(css).toContain("@media (max-width: 768px)");

      // Tablets in landscape & small laptops (1024px: iPad Pro, Surface Pro)
      expect(css).toContain("@media (max-width: 1024px)");
      expect(css).toContain("@media (min-width: 1024px) and (max-width: 1240px)");

      // Desktops & Ultrawide (1440px - 2560px+)
      expect(css).toContain("@media (min-width: 1441px)");
    });

    it("verifies global horizontal overflow safety", () => {
      expect(css).toContain("max-width: 100vw");
      expect(css).toContain("overflow-x: hidden");
      expect(css).toContain("box-sizing: border-box");
    });

    it("verifies mobile touch targets meet WCAG standards (min-height >= 44px)", () => {
      expect(css).toContain("min-height: 44px");
      expect(css).toContain("touch-action: manipulation");
    });

    it("verifies iOS Safari zoom prevention (font-size >= 16px on inputs)", () => {
      expect(css).toContain("font-size: 16px !important");
    });

    it("verifies safe area insets for notches, Dynamic Island, and cutouts", () => {
      expect(css).toContain("safe-area-inset-top");
      expect(css).toContain("safe-area-inset-bottom");
    });
  });

  describe("2. Research Journey Frame Multi-Device Adaptation", () => {
    it("renders ResearchJourneyFrame with responsive action bar and stepper", () => {
      const html = renderToString(
        React.createElement(
          ResearchJourneyFrame,
          {
            currentStep: "consent",
            progressPercent: 15,
            missionKicker: "STEP 01 OF 07",
            title: "Research Consent",
            subtitle: "Your choice to take part in academic research.",
            backHref: "/",
            backLabel: "Back to Home",
            continueLabel: "Continue to Student Profile",
            onContinue: () => {},
          },
          React.createElement("div", { className: "test-content" }, "Form Content")
        )
      );

      expect(html).toContain("journey-layout-container");
      expect(html).toContain("journey-layout-grid");
      expect(html).toContain("journey-sidebar");
      expect(html).toContain("journey-stepper-list");
      expect(html).toContain("journey-action-bar");
      expect(html).toContain("journey-back-btn");
      expect(html).toContain("journey-continue-btn");
      expect(html).toContain("test-content");
    });

    it("verifies globals.css includes action bar vertical stacking for screens <= 640px", () => {
      expect(css).toContain(".journey-action-bar");
      expect(css).toContain("flex-direction: column-reverse !important");
    });

    it("verifies stepper list collapses to horizontal swipe on screens <= 900px", () => {
      expect(css).toContain(".journey-stepper-list");
      expect(css).toContain("-webkit-overflow-scrolling: touch !important");
    });
  });

  describe("3. Homepage Components Responsive Rendering", () => {
    it("renders HeroSection with balanced columns and fluid container", () => {
      const html = renderToString(React.createElement(HeroSection));
      expect(html).toContain("cyber-hero-image-wrapper");
      expect(html).toContain("cyber-hero-image");
      expect(html).toContain("max-w-[1440px]");
    });

    it("renders ThreatCategories with responsive 1/2 column grid and wrapped header", () => {
      const html = renderToString(React.createElement(ThreatCategories));
      expect(html).toContain("threat-categories-section");
      expect(html).toContain("grid-cols-1 lg:grid-cols-2");
      expect(html).toContain("IV1");
      expect(html).toContain("Phishing");
      expect(html).toContain("IV4");
      expect(html).toContain("Online Scams &amp; Malicious Links");
    });

    it("renders ParticipationJourney with responsive 1/2/4 column grid", () => {
      const html = renderToString(React.createElement(ParticipationJourney));
      expect(html).toContain("participation-journey-section");
      expect(html).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");
      expect(html).toContain("Research Information &amp; Consent");
      expect(html).toContain("Participant Demographics");
      expect(html).toContain("Cyber Investigation Missions");
      expect(html).toContain("Submit &amp; Complete");
    });

    it("renders CyberLabPreview with mobile-safe email metadata headers", () => {
      const html = renderToString(React.createElement(CyberLabPreview));
      expect(html).toContain("cyber-lab-preview-section");
      expect(html).toContain("LMS Account Verification");
      expect(html).toContain("From:");
      expect(html).toContain("Subject:");
      expect(html).toContain("Simulated Link Destination:");
    });

    it("renders ResearchEthics with responsive cards", () => {
      const html = renderToString(React.createElement(ResearchEthics));
      expect(html).toContain("research-ethics-section");
      expect(html).toContain("Voluntary Participation");
      expect(html).toContain("Data Minimization");
      expect(html).toContain("Confidentiality &amp; Protection");
      expect(html).toContain("Research Transparency");
    });

    it("renders ResearchCTA with mobile full-width and desktop inline buttons", () => {
      const html = renderToString(React.createElement(ResearchCTA));
      expect(html).toContain("research-cta-section");
      expect(html).toContain("w-full sm:w-auto");
      expect(html).toContain("Start Your Research Journey");
      expect(html).toContain("Learn About the Study");
    });
  });

  describe("4. Global Navigation & Footer Responsiveness", () => {
    it("renders SiteHeader with both desktop pill navigation and mobile drawer triggers", () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(SiteHeader)
        )
      );
      expect(html).toContain("site-header");
      expect(html).toContain("site-header-inner");
      expect(html).toContain("brand");
      expect(html).toContain("desktop-pill-nav");
      expect(html).toContain("mobile-header-actions");
      expect(html).toContain("mobile-menu-trigger");
    });

    it("renders SiteFooter with responsive 4-column layout and mobile bottom strip", () => {
      const html = renderToString(React.createElement(SiteFooter));
      expect(html).toContain("site-footer");
      expect(html).toContain("grid-cols-1 md:grid-cols-2 lg:grid-cols-4");
      expect(html).toContain("Quick Navigation");
      expect(html).toContain("Research &amp; Ethics");
      expect(html).toContain("Platform Access");
      expect(html).toContain("Back to Top");
    });
  });

  describe("5. Dedicated Utility & Research Pages Responsiveness", () => {
    it("renders ResearchParticipationPage (About/Privacy) with quick-jump dock", () => {
      const html = renderToString(
        React.createElement(ResearchParticipationPage, { config: demoConfig })
      );
      expect(html).toContain("research-page");
      expect(html).toContain("research-nav-strip");
      expect(html).toContain("research-nav-pill-dock");
      expect(html).toContain("Research Overview");
      expect(html).toContain("Research Focus Areas");
      expect(html).toContain("Privacy &amp; Research Ethics");
      expect(html).toContain("Frequently Asked Questions");
    });

    it("renders WithdrawPage with full-width responsive form controls", () => {
      const html = renderToString(React.createElement(WithdrawPage));
      expect(html).toContain("narrow page-space");
      expect(html).toContain("Participant code");
      expect(html).toContain("Private deletion token");
      expect(html).toContain("Delete my response");
    });

    it("renders AdminLoginPage with responsive 3D illustration and login card", () => {
      const html = renderToString(React.createElement(AdminLoginPage));
      expect(html).toContain("research-portal-container");
      expect(html).toContain("research-intro-section");
      expect(html).toContain("research-login-section");
      expect(html).toContain("Researcher Access PIN");
      expect(html).toContain("Access Research Dashboard");
    });
  });
});
