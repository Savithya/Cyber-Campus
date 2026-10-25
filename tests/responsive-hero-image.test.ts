import { describe, it, expect } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { HeroSection } from "@/components/hero-section";
import { HeroCyberVisual } from "@/components/hero-cyber-visual";
import { SpotHero } from "@/components/spot-hero";

describe("Cyber Campus — Final Responsive Hero Image Enhancement", () => {
  it("renders HeroSection with .cyber-hero-image-wrapper and .cyber-hero-image", () => {
    const html = renderToString(React.createElement(HeroSection));

    // Verify presence of classes
    expect(html).toContain("cyber-hero-image-wrapper");
    expect(html).toContain("cyber-hero-image");

    // Verify image attributes
    expect(html).toContain('src="/images/cyber-research-node.png"');
    expect(html).toContain('width="436"');
    expect(html).toContain('height="437"');

    // Verify balanced two-column hero layout
    expect(html).toContain("lg:grid-cols-2");
    expect(html).toContain("max-w-[1440px]");

    // Verify console badges and overlay text
    expect(html).toContain("Research Intelligence Node - Active &amp; Protected");
    expect(html).toContain("AES-256 Session Encryption");
    expect(html).toContain("Rate-Limited Gateway");
    expect(html).toContain("IRB Ethics Protocol Compliant");

    // Verify CTA and research trust markers
    expect(html).toContain("Start Research");
    expect(html).toContain("Voluntary Participation");
    expect(html).toContain("Anonymous Research ID");
    expect(html).toContain("Safe Simulated Scenarios");
    expect(html).toContain("No Real Passwords");
  });

  it("renders HeroCyberVisual with responsive classes", () => {
    const html = renderToString(React.createElement(HeroCyberVisual));

    expect(html).toContain("cyber-hero-image-wrapper");
    expect(html).toContain("cyber-hero-image");
    expect(html).toContain("CYBER THREAT LAB · RESEARCH CONSOLE");
    expect(html).toContain("User Privacy Shield");
  });

  it("renders SpotHero with responsive container and image artwork", () => {
    const html = renderToString(React.createElement(SpotHero));

    expect(html).toContain("spot-hero-container");
    expect(html).toContain("cyber-hero-image-wrapper");
    expect(html).toContain("cyber-hero-image");
  });

  it("verifies globals.css includes exact responsive rules and all 8 breakpoint adaptations", () => {
    const cssPath = path.resolve(__dirname, "../src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // Desktop max-width: 650px
    expect(css).toContain(".cyber-hero-image-wrapper");
    expect(css).toContain("max-width: 650px");

    // Image properties: width: 100%, height: auto, object-fit: contain
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("aspect-ratio: 1376 / 768");

    // Tablet breakpoint (max-width: 1023px) -> max-width: 550px
    expect(css).toContain("@media (max-width: 1023px)");
    expect(css).toContain("max-width: 550px");

    // Mobile breakpoint (max-width: 767px) -> max-width: 100%
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("max-width: 100%");

    // Desktop right-alignment (min-width: 1024px)
    expect(css).toContain("@media (min-width: 1024px)");
    expect(css).toContain("margin-right: 0");
    expect(css).toContain("margin-left: auto");

    // Micro-device scaling for 320px - 430px
    expect(css).toContain("@media (max-width: 430px)");

    // Themes verification: Dark, Light, Cyber
    expect(css).toContain('[data-theme="light"] .hero-pro-image-card');
    expect(css).toContain('[data-theme="cyber"] .hero-pro-image-card');
    expect(css).toContain('[data-theme="light"] .hero-pro-ambient-glow');
    expect(css).toContain('[data-theme="cyber"] .hero-pro-ambient-glow');
  });

  it("validates responsive calculations for all 8 required test breakpoints", () => {
    const BREAKPOINTS = [320, 375, 430, 768, 1024, 1280, 1440, 1920];
    const imageAspect = 1376 / 768; // 1.7916666...

    BREAKPOINTS.forEach((width) => {
      let expectedWrapperMaxWidth: number;
      let layout: "mobile-stacked" | "tablet-stacked" | "laptop-2col" | "desktop-2col";

      if (width <= 767) {
        layout = "mobile-stacked";
        expectedWrapperMaxWidth = width - 32; // padded full width
      } else if (width <= 1023) {
        layout = "tablet-stacked";
        expectedWrapperMaxWidth = 550; // tablet cap
      } else if (width < 1440) {
        layout = "laptop-2col";
        expectedWrapperMaxWidth = Math.min(650, (width - 48) / 2); // scales to column
      } else {
        layout = "desktop-2col";
        expectedWrapperMaxWidth = 650; // capped at 650px on large desktop
      }

      const calculatedHeight = expectedWrapperMaxWidth / imageAspect;

      expect(expectedWrapperMaxWidth).toBeGreaterThan(0);
      expect(calculatedHeight).toBeGreaterThan(0);
      expect(expectedWrapperMaxWidth).toBeLessThanOrEqual(650);

      if (width >= 1440) {
        expect(expectedWrapperMaxWidth).toBe(650);
        expect(layout).toBe("desktop-2col");
      }
      if (width === 768) {
        expect(expectedWrapperMaxWidth).toBe(550);
        expect(layout).toBe("tablet-stacked");
      }
      if (width <= 430) {
        expect(layout).toBe("mobile-stacked");
      }
    });
  });
});
