import { describe, it, expect } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { SiteFooter } from "@/components/site-footer";

describe("Cyber Campus — Site Footer Layout & Bottom Bar", () => {
  it("renders SiteFooter with full width and proper bottom bar layout", () => {
    const html = renderToString(React.createElement(SiteFooter));

    // Verify main footer landmark and container
    expect(html).toContain('role="contentinfo"');
    expect(html).toContain("container mx-auto");

    // Verify footer bottom bar texts are present
    expect(html).toContain("© 2026 Cyber Campus Research Initiative • Sri Lanka");
    expect(html).toContain(
      "Voluntary Higher Education Study · Empirical Research Protocol Aligned",
    );

    // Verify bottom bar has full width styling and responsive flex
    expect(html).toContain("border-t");
    expect(html).toContain("w-full");
    expect(html).toContain("justify-between");
  });

  it("renders compact SiteFooter with clean responsive layout", () => {
    const html = renderToString(React.createElement(SiteFooter, { compact: true }));

    expect(html).toContain("CyberCampus");
    expect(html).toContain("Academic Cybersecurity Research · Sri Lanka");
    expect(html).toContain("Privacy &amp; Rights");
    expect(html).toContain("Withdrawal");
    expect(html).toContain("Researcher Access");
  });

  it("verifies globals.css does not force flex on .site-footer container", () => {
    const cssPath = path.resolve(__dirname, "../src/app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    // .site-footer should be a block container
    expect(css).toMatch(/\.site-footer\s*\{[^}]*display:\s*block/);

    // Should NOT have .site-footer > div { display: flex } that breaks nested containers
    expect(css).not.toContain(".site-footer > div");
  });
});
