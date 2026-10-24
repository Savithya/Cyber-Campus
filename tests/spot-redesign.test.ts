import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from "@/app/page";
import { SpotHero } from "@/components/spot-hero";
import { SpotResearchVariables } from "@/components/spot-research-variables";
import { ResearchProgressStepper } from "@/components/research-progress-stepper";
import { ResearchConsentPage } from "@/components/research-consent-page";
import { DemographicsForm } from "@/components/demographics-form";
import Review from "@/components/review";
import { CyberMissionControl } from "@/components/cyber-mission-control";
import { SessionProvider, SessionContext, type SessionContextType } from "@/lib/client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/consent",
  useSearchParams: () => new URLSearchParams(),
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

  it("renders the cyber hero visual image inside SpotHero", () => {
    const html = renderToString(React.createElement(SpotHero));
    expect(html).toContain("cyber-hero-lab-8x5");
    expect(html).toContain("CYBER THREAT LAB · RESEARCH CONSOLE");
    expect(html).toContain("User Privacy Shield");
    expect(html).toContain("Phishing");
    expect(html).toContain("Pretexting");
    expect(html).toContain("Impersonation");
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
    expect(html).toContain("Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka");
    expect(html).toContain("The purpose of this Computing Research Project is to examine the impact of social engineering threats");

    // 4 Key Information Blocks (2x2 Grid)
    expect(html).toContain("Around 12–15 minutes");
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

  it("renders the redesigned Student Profile page matching the Spot the Phish hero template", () => {
    const mockContextValue = {
      session: {
        code: "001",
        status: "draft" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
      },
      setSession: vi.fn(),
      loading: false,
      error: null,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionContextType;

    const html = renderToString(
      React.createElement(
        SessionContext.Provider,
        { value: mockContextValue },
        React.createElement(DemographicsForm)
      )
    );
    expect(html).toContain("YOUR RESEARCH JOURNEY");
    expect(html).toContain("About You");
    expect(html).toContain("What is your gender?");
    expect(html).toContain("What is your current year of study?");
    expect(html).toContain("What is your main field of study?");
    expect(html).toContain("What type of university do you attend?");
  });

  it("renders the redesigned BEFORE THE INBOX Review & Save page matching the journey layout", () => {
    const mockContextValue = {
      session: {
        code: "001",
        status: "draft" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {
          Q1: { value: 1, status: "answered" as const },
          Q2: { value: 1, status: "answered" as const },
          Q3: { value: 1, status: "answered" as const },
          Q4: { value: 1, status: "answered" as const },
          Q5: { value: 1, status: "answered" as const },
        },
        attempts: [],
      },
      setSession: vi.fn(),
      loading: false,
      error: null,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionContextType;

    const html = renderToString(
      React.createElement(
        SessionContext.Provider,
        { value: mockContextValue },
        React.createElement(Review)
      )
    );

    expect(html).toContain("YOUR RESEARCH JOURNEY");
    expect(html).toContain("STEP 07");
    expect(html).toContain("Review &amp; Save");
    expect(html).toContain("Your questionnaire has no score");
    expect(html).toContain("PARTICIPANT TELEMETRY");
    expect(html).toContain("ANONYMOUS ID: 001");
    expect(html).toContain("Does this reflect your experience?");
    expect(html).toContain("Submit Questionnaire &amp; Complete");
    expect(html).toContain("Back to Step 06: Scam &amp; Malicious Link Investigation");
  });

  it("renders the redesigned Cyber Missions page with journey sidebar and 4 threat modules", () => {
    const mockContextValue = {
      session: {
        code: "001",
        status: "submitted_complete" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
        attempts: [],
      },
      setSession: vi.fn(),
      loading: false,
      error: null,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionContextType;

    const html = renderToString(
      React.createElement(
        SessionContext.Provider,
        { value: mockContextValue },
        React.createElement(CyberMissionControl, { initialScenarios: [] } as any)
      )
    );

    expect(html).toContain("YOUR RESEARCH JOURNEY");
    expect(html).toContain("CYBER SIMULATION LABORATORY · STEPS 03–06");
    expect(html).toContain("Social Engineering Threat Investigations");
    expect(html).toContain("ANONYMOUS RESEARCH ID");
    expect(html).toContain("001");
    expect(html).toContain("Continue to Step 07: Review &amp; Save");
  });

  it("verifies the exact sequential 7-step journey structure (STEP 01 to STEP 07)", () => {
    const mockContextValue = {
      session: {
        code: "001",
        status: "submitted_complete" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
        attempts: [],
      },
      setSession: vi.fn(),
      loading: false,
      error: null,
      reload: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionContextType;

    const html = renderToString(
      React.createElement(
        SessionContext.Provider,
        { value: mockContextValue },
        React.createElement(CyberMissionControl, { initialScenarios: [] } as any)
      )
    );

    // 1. STEP 01: Research Consent
    expect(html).toContain("STEP 01");
    expect(html).toContain("Research Consent");

    // 2. STEP 02: About You
    expect(html).toContain("STEP 02");
    expect(html).toContain("About You");

    // 3. STEP 03: Phishing Investigation
    expect(html).toContain("STEP 03");
    expect(html).toContain("Phishing Investigation");

    // 4. STEP 04: Pretexting Detection
    expect(html).toContain("STEP 04");
    expect(html).toContain("Pretexting Detection");

    // 5. STEP 05: Impersonation Investigation
    expect(html).toContain("STEP 05");
    expect(html).toContain("Impersonation Investigation");

    // 6. STEP 06: Scam & Malicious Link Investigation
    expect(html).toContain("STEP 06");
    expect(html).toContain("Scam &amp; Malicious Link Investigation");

    // 7. STEP 07: Review & Save
    expect(html).toContain("STEP 07");
    expect(html).toContain("Review &amp; Save");
  });
});
