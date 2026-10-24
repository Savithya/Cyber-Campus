import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from "@/app/page";
import { SpotHero } from "@/components/spot-hero";
import { SpotResearchVariables } from "@/components/spot-research-variables";
import { ResearchProgressStepper } from "@/components/research-progress-stepper";
import { ResearchConsentPage } from "@/components/research-consent-page";
import { SessionProvider } from "@/lib/client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/consent",
}));

describe("Cyber Campus Spot-the-Phish Redesign Verification", () => {
  it("renders the redesigned home page with all essential Spot-the-Phish components", () => {
    const html = renderToString(React.createElement(Home));

    // Verify Brand & Editorial Title
    expect(html).toContain("Spot the");
    expect(html).toContain("Threat");
    expect(html).toContain("SOCIAL ENGINEERING CHALLENGES");

    // Verify Core Question & Sri Lanka University Research Topic
    expect(html).toContain("Can you spot the signs before your privacy is compromised?");
    expect(html).toContain("Sri Lanka");
    expect(html).toContain("university students");
    expect(html).toContain("Around 12–15 minutes");

    // Verify 3 Trust Safeguards
    expect(html).toContain("Anonymous participation");
    expect(html).toContain("Fictional scenarios only (IV1–IV4)");
    expect(html).toContain("For students in Sri Lanka, aged 18+");

    // Verify 'YOUR MISSION, SHOULD YOU ACCEPT IT' 3-card steps
    expect(html).toContain("YOUR MISSION, SHOULD YOU ACCEPT IT");
    expect(html).toContain("A few questions.");
    expect(html).toContain("A fresh challenge.");
    expect(html).toContain("Tell us about you");
    expect(html).toContain("Meet the threats");
    expect(html).toContain("See how you did");

    // Verify All 4 Research Variables (IV1–IV4)
    expect(html).toContain("RESEARCH VARIABLES (IV1–IV4)");
    expect(html).toContain("IV1");
    expect(html).toContain("Phishing");
    expect(html).toContain("IV2");
    expect(html).toContain("Pretexting");
    expect(html).toContain("IV3");
    expect(html).toContain("Impersonation");
    expect(html).toContain("IV4");
    expect(html).toContain("Online Scams &amp; Malicious Links");

    // Verify Dependent Variable (DV) User Privacy
    expect(html).toContain("DEPENDENT VARIABLE (DV) IMPACT");
    expect(html).toContain("User Privacy Risk");

    // Verify Purpose Card
    expect(html).toContain("A CHALLENGE WITH A PURPOSE");
    expect(html).toContain("Your perspective supports student research.");
  });

  it("renders the interactive challenge inbox preview card inside SpotHero", () => {
    const html = renderToString(React.createElement(SpotHero));
    expect(html).toContain("YOUR CHALLENGE INBOX");
    expect(html).toContain("Look a little closer");
    expect(html).toContain("Safe space to explore");
    expect(html).toContain("No real attacks. No credentials.");
    expect(html).toContain("What would you do?");
  });

  it("renders all 4 research variables with distinct targets and mechanisms", () => {
    const html = renderToString(React.createElement(SpotResearchVariables));
    expect(html).toContain("LMS &amp; Student Portal Logins");
    expect(html).toContain("Four Threat Vectors. One Privacy Shield.");
  });

  it("verifies clicking Start Challenge directs to /consent Join Research page", () => {
    const html = renderToString(React.createElement(SpotHero));
    expect(html).toContain('href="/consent"');
    expect(html).toContain("Start Challenge");
  });

  it("renders the 4-stage research progress stepper matching Image 2", () => {
    const html = renderToString(React.createElement(ResearchProgressStepper, { currentStep: 1 }));
    expect(html).toContain("STEP 01");
    expect(html).toContain("Research Consent");
    expect(html).toContain("STEP 02");
    expect(html).toContain("Student Profile");
    expect(html).toContain("STEP 03");
    expect(html).toContain("Cyber Missions");
    expect(html).toContain("STEP 04");
    expect(html).toContain("Completion");
  });

  it("renders the redesigned Join Research page matching Image 1 layout & requirements", () => {
    const html = renderToString(
      React.createElement(
        SessionProvider,
        null,
        React.createElement(ResearchConsentPage)
      )
    );

    // Editorial Header
    expect(html).toContain("BEFORE WE BEGIN");
    expect(html).toContain("A little context.");
    expect(html).toContain("Your choice to take part.");
    expect(html).toContain("Read the study information, then decide whether you&#x27;d like to participate.");

    // Research Information Card
    expect(html).toContain("RESEARCH INFORMATION");
    expect(html).toContain("An Analysis of Factors Influencing University Students&#x27; Vulnerability to AI-Generated Phishing Emails in Sri Lanka");
    expect(html).toContain("The purpose of this Computing Research Project is to analyze factors that may influence university students&#x27; vulnerability to AI-generated phishing emails.");

    // 4 Key Information Blocks (2x2 Grid)
    expect(html).toContain("Around 12–18 minutes");
    expect(html).toContain("Always your choice");
    expect(html).toContain("Confidential research");
    expect(html).toContain("A controlled simulation");

    // Mint Callout Box
    expect(html).toContain("How your responses are saved");
    expect(html).toContain("Draft answers stay in this browser tab");

    // Consent & Eligibility Checkboxes
    expect(html).toContain("id=\"consent-checkbox\"");
    expect(html).toContain("id=\"eligibility-checkbox\"");
    expect(html).toContain("I have read the information above and voluntarily agree to participate in this research study.");

    // Action Buttons
    expect(html).toContain("I Agree &amp; Continue");
    expect(html).toContain("I Do Not Agree");
  });
});
