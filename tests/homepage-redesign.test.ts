import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from "@/app/page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/hero-section";
import { ResearchMetrics } from "@/components/research-metrics";
import { ThreatCategories } from "@/components/threat-categories";
import { ParticipationJourney } from "@/components/participation-journey";
import { CyberLabPreview } from "@/components/cyber-lab-preview";
import { ResearchEthics } from "@/components/research-ethics";
import { ResearchCTA } from "@/components/research-cta";
import { ThemeProvider, THEMES } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Cyber Campus — Complete Hybrid Cyber Research Lab Homepage Redesign Verification", () => {
  it("renders the redesigned split-screen HeroSection with all required elements", () => {
    const html = renderToString(React.createElement(HeroSection));

    // Academic research badge
    expect(html).toContain("ACADEMIC CYBERSECURITY RESEARCH • SRI LANKA");

    // Main headline & gradient
    expect(html).toContain("Explore Cyber Threats.");
    expect(html).toContain("Protect Your Digital Privacy.");

    // Supporting research statement
    expect(html).toContain(
      "Participate in interactive cybersecurity scenarios investigating how social engineering threats relate to user privacy among university students in Sri Lanka."
    );

    // Primary & Secondary CTAs
    expect(html).toContain("Start Research");
    expect(html).toContain('href="/consent"');
    expect(html).toContain("Explore Cyber Challenges");
    expect(html).toContain('href="/play"');

    // 4 Trust Indicators
    expect(html).toContain("Voluntary Participation");
    expect(html).toContain("Anonymous Research ID");
    expect(html).toContain("Safe Simulated Scenarios");
    expect(html).toContain("No Real Passwords");

    // Right-hand visual console artwork & threat panels
    expect(html).toContain("cyber-hero-lab-8x5");
    expect(html).toContain("CYBER THREAT LAB · CONSOLE");
    expect(html).toContain("User Privacy Shield");
    expect(html).toContain("Phishing");
    expect(html).toContain("Pretexting");
    expect(html).toContain("Impersonation");
    expect(html).toContain("Online Scams");
    expect(html).toContain("Threat Telemetry &amp; Privacy Simulation");
  });

  it("renders the 4 compact ResearchMetrics cards with accurate study metrics", () => {
    const html = renderToString(React.createElement(ResearchMetrics));

    // Card 1 — Threat Categories
    expect(html).toContain("04");
    expect(html).toContain("Threat Categories");
    expect(html).toContain(
      "Phishing, Pretexting, Impersonation, and Online Scams &amp; Malicious Links."
    );
    expect(html).toContain("IV1–IV4");

    // Card 2 — Interactive Challenges
    expect(html).toContain("20");
    expect(html).toContain("Interactive Challenges");
    expect(html).toContain("Five realistic scenarios for each research threat category.");

    // Card 3 — Estimated Participation Time
    expect(html).toContain("15–20");
    expect(html).toContain("Estimated Participation Time");
    expect(html).toContain("Complete the research activities at your own pace.");

    // Card 4 — Target Population
    expect(html).toContain("University Students");
    expect(html).toContain("Target Research Population");
    expect(html).toContain("Students from eligible higher education institutions across Sri Lanka.");
  });

  it("renders all four social engineering threat cards (IV1–IV4) in ThreatCategories", () => {
    const html = renderToString(React.createElement(ThreatCategories));

    // Section title & subtitle
    expect(html).toContain("Explore the Four Social Engineering Threats");
    expect(html).toContain(
      "Discover the deceptive techniques explored in this study through realistic digital scenarios."
    );

    // IV1 Phishing
    expect(html).toContain("IV1");
    expect(html).toContain("Phishing");
    expect(html).toContain(
      "Investigate deceptive emails and messages designed to trick users into revealing sensitive information."
    );
    expect(html).toContain("Explore Phishing");

    // IV2 Pretexting
    expect(html).toContain("IV2");
    expect(html).toContain("Pretexting");
    expect(html).toContain(
      "Recognize fabricated stories and convincing requests designed to manipulate personal-information disclosure."
    );
    expect(html).toContain("Explore Pretexting");

    // IV3 Impersonation
    expect(html).toContain("IV3");
    expect(html).toContain("Impersonation");
    expect(html).toContain(
      "Identify deceptive accounts or individuals pretending to represent trusted people or organizations."
    );
    expect(html).toContain("Explore Impersonation");

    // IV4 Online Scams & Malicious Links
    expect(html).toContain("IV4");
    expect(html).toContain("Online Scams &amp; Malicious Links");
    expect(html).toContain(
      "Examine fraudulent offers, deceptive websites, and links that may expose personal information."
    );
    expect(html).toContain("Explore Online Scams &amp; Malicious Links");

    // Verify 5 challenges badge on all cards
    expect(html).toContain("5 Challenges");
  });

  it("renders the 4-step ParticipationJourney with connected stepper and direct CTA", () => {
    const html = renderToString(React.createElement(ParticipationJourney));

    // Section title & subtitle
    expect(html).toContain("How Cyber Campus Works");
    expect(html).toContain(
      "A simple four-step research experience designed for university students in Sri Lanka."
    );

    // Step 01
    expect(html).toContain("01");
    expect(html).toContain("Research Information &amp; Consent");
    expect(html).toContain(
      "Read the research information, confirm eligibility, and provide informed consent."
    );

    // Step 02
    expect(html).toContain("02");
    expect(html).toContain("Participant Demographics");
    expect(html).toContain(
      "Provide basic, non-identifying academic background information."
    );
    expect(html).toContain("Age group &amp; Gender");
    expect(html).toContain("University type (State, Private, Foreign Branch Campus)");

    // Step 03
    expect(html).toContain("03");
    expect(html).toContain("Cyber Investigation Missions");
    expect(html).toContain(
      "Complete realistic simulated scenarios covering four social engineering threat categories."
    );
    expect(html).toContain("Phishing: 5 challenges (IV1)");
    expect(html).toContain("Pretexting: 5 challenges (IV2)");
    expect(html).toContain("Impersonation: 5 challenges (IV3)");
    expect(html).toContain("Online Scams &amp; Malicious Links: 5 challenges (IV4)");

    // Step 04
    expect(html).toContain("04");
    expect(html).toContain("Submit &amp; Complete");
    expect(html).toContain(
      "Submit your responses and view any available educational feedback after completing the research."
    );

    // CTA
    expect(html).toContain("Begin Research Participation");
    expect(html).toContain('href="/consent"');
  });

  it("renders the interactive CyberLabPreview educational demo with research validity disclaimer", () => {
    const html = renderToString(React.createElement(CyberLabPreview));

    // Section title & subtitle
    expect(html).toContain("Think Like a Cyber Investigator");
    expect(html).toContain(
      "Explore a sample digital scenario and discover how online deception can threaten your privacy."
    );

    // Critical Research Validity Banner
    expect(html).toContain("Optional Educational Demo — Not Part of Research Scoring");

    // Simulated email UI
    expect(html).toContain("Campus Mail Client · Simulation");
    expect(html).toContain("Safe Simulation");
    expect(html).toContain("security@campus-serendib-verify.example");
    expect(html).toContain("URGENT: Mandatory Student Security Audit");
    expect(html).toContain("Link is disabled in educational simulation mode");

    // Decision Panel
    expect(html).toContain("What Would You Do?");
    expect(html).toContain("Click the verification link immediately to avoid losing LMS access");
    expect(html).toContain(
      "Verify the notice through an official university helpdesk or published phone directory"
    );
    expect(html).toContain("Ignore the email and take no action");
    expect(html).toContain(
      "Report the message as a phishing attempt to university IT cybersecurity"
    );
  });

  it("renders the ResearchEthics & Privacy section with 4 clear cards and direct policy links", () => {
    const html = renderToString(React.createElement(ResearchEthics));

    expect(html).toContain("Research Ethics &amp; Your Privacy");
    expect(html).toContain(
      "Your participation is voluntary, and the study is designed to protect participant information."
    );

    // 4 Cards
    expect(html).toContain("Voluntary Participation");
    expect(html).toContain("Data Minimization");
    expect(html).toContain("Confidentiality &amp; Protection");
    expect(html).toContain("Research Transparency");

    // Links to verified routes
    expect(html).toContain('href="/consent"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/withdraw"');
  });

  it("renders the ResearchCTA banner with prominent buttons above the footer", () => {
    const html = renderToString(React.createElement(ResearchCTA));

    expect(html).toContain("Contribute to Cybersecurity Research in Sri Lanka");
    expect(html).toContain(
      "Help researchers better understand how social engineering threats relate to digital privacy among university students."
    );
    expect(html).toContain("Start Your Research Journey");
    expect(html).toContain('href="/consent"');
    expect(html).toContain("Learn About the Study");
    expect(html).toContain('href="/privacy"');
  });

  it("renders the sticky SiteHeader navigation with brand, 4 central items, researcher access, and theme support", () => {
    const html = renderToString(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(SiteHeader)
      )
    );

    // Brand and logo
    expect(html).toContain("cyber");
    expect(html).toContain("campus");
    expect(html).toContain("Cybersecurity Research Platform");

    // 4 central navigation items
    expect(html).toContain("Home");
    expect(html).toContain('href="/#home"');
    expect(html).toContain("Cyber Challenges");
    expect(html).toContain('href="/play"');
    expect(html).toContain("Join Research");
    expect(html).toContain('href="/consent"');
    expect(html).toContain("About the Study");
    expect(html).toContain('href="/privacy"');

    // Right: Researcher Access
    expect(html).toContain("Researcher Access");
    expect(html).toContain('href="/admin/login"');

    // Appearance Selector supporting all 3 themes
    expect(html).toContain("Light");
    expect(html).toContain("Dark");
    expect(html).toContain("Cyber");
  });

  it("verifies THEMES array contains light, dark, and cyber modes with correct icons", () => {
    expect(THEMES).toHaveLength(3);
    expect(THEMES.map((t) => t.id)).toEqual(["light", "dark", "cyber"]);
    expect(THEMES.map((t) => t.label)).toEqual(["Light", "Dark", "Cyber"]);
  });

  it("renders the complete redesigned Home page without missing sections", () => {
    const html = renderToString(React.createElement(Home));

    // Section 1: Hero
    expect(html).toContain("hero-section");
    expect(html).toContain("Protect Your Digital Privacy.");

    // Section 2: Metrics
    expect(html).toContain("research-metrics-section");
    expect(html).toContain("Threat Categories");

    // Section 3: Threats
    expect(html).toContain("threat-categories-section");
    expect(html).toContain("Explore the Four Social Engineering Threats");

    // Section 4: Journey
    expect(html).toContain("participation-journey-section");
    expect(html).toContain("How Cyber Campus Works");

    // Section 5: Demo Lab
    expect(html).toContain("cyber-lab-preview-section");
    expect(html).toContain("Think Like a Cyber Investigator");

    // Section 6: Ethics
    expect(html).toContain("research-ethics-section");
    expect(html).toContain("Research Ethics &amp; Your Privacy");

    // Section 7: Final CTA
    expect(html).toContain("research-cta-section");
    expect(html).toContain("Contribute to Cybersecurity Research in Sri Lanka");
  });
});
