import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from "@/app/page";
import { SpotHero } from "@/components/spot-hero";
import { SpotResearchVariables } from "@/components/spot-research-variables";
import { ResearchProgressStepper } from "@/components/research-progress-stepper";
import { ResearchConsentPage } from "@/components/research-consent-page";
import { DemographicsForm } from "@/components/demographics-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import Review from "@/components/review";
import { CyberMissionControl } from "@/components/cyber-mission-control";
import { InteractiveChallengeRunner } from "@/components/interactive-challenge-runner";
import type { Scenario } from "@/lib/types";
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
  it("renders the redesigned home page with all essential Hybrid Cyber Research Lab components", () => {
    const html = renderToString(React.createElement(Home));

    // Verify Brand & Hero Headline
    expect(html).toContain("ACADEMIC CYBERSECURITY RESEARCH • SRI LANKA");
    expect(html).toContain("Explore Cyber Threats.");
    expect(html).toContain("Protect Your Digital Privacy.");

    // Verify Sri Lanka University Research Topic & CTAs
    expect(html).toContain("Participate in interactive cybersecurity scenarios");
    expect(html).toContain("university students in Sri Lanka");
    expect(html).toContain("Start Research");
    expect(html).toContain("Explore Cyber Challenges");

    // Verify Trust Indicators
    expect(html).toContain("Voluntary Participation");
    expect(html).toContain("Anonymous Research ID");
    expect(html).toContain("Safe Simulated Scenarios");
    expect(html).toContain("No Real Passwords");

    // Verify Research Overview Metrics (4 Cards)
    expect(html).toContain("Threat Categories");
    expect(html).toContain("Interactive Challenges");
    expect(html).toContain("Estimated Participation Time");
    expect(html).toContain("University Students");

    // Verify All 4 Research Variables (IV1–IV4)
    expect(html).toContain("Explore the Four Social Engineering Threats");
    expect(html).toContain("IV1");
    expect(html).toContain("Phishing");
    expect(html).toContain("IV2");
    expect(html).toContain("Pretexting");
    expect(html).toContain("IV3");
    expect(html).toContain("Impersonation");
    expect(html).toContain("IV4");
    expect(html).toContain("Online Scams &amp; Malicious Links");

    // Verify Participation Journey (4 Steps)
    expect(html).toContain("How Cyber Campus Works");
    expect(html).toContain("Research Information &amp; Consent");
    expect(html).toContain("Participant Demographics");
    expect(html).toContain("Cyber Investigation Missions");
    expect(html).toContain("Submit &amp; Complete");
    expect(html).toContain("Begin Research Participation");

    // Verify Cyber Lab Preview Demo
    expect(html).toContain("Think Like a Cyber Investigator");
    expect(html).toContain("Optional Educational Demo — Not Part of Research Scoring");

    // Verify Research Ethics & Privacy
    expect(html).toContain("Research Ethics &amp; Your Privacy");
    expect(html).toContain("Voluntary Participation");
    expect(html).toContain("Data Minimization");
    expect(html).toContain("Confidentiality &amp; Protection");
    expect(html).toContain("Research Transparency");

    // Verify Final Research CTA
    expect(html).toContain("Contribute to Cybersecurity Research in Sri Lanka");
    expect(html).toContain("Start Your Research Journey");
    expect(html).toContain("Learn About the Study");
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
    expect(html).toContain("What is your age group?");
    expect(html).toContain("What is your gender?");
    expect(html).toContain("What is your current year of study?");
    expect(html).toContain("What is your main field of study?");
    // Question 5 ('Have you received any formal training...') has been removed:
    expect(html).not.toContain("Have you received any formal training or education about cybersecurity or phishing?");
    expect(html).toContain("Question 1 of 24");
    expect(html).toContain("Question 4 of 24");
    expect(html).not.toContain("Question 5 of 25");
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
    expect(html).toContain("Review your responses.");
    expect(html).toContain("READY FOR THE EMAIL CHALLENGE?");
    expect(html).toContain("Save &amp; continue");
    expect(html).toContain("Save responses &amp; start challenge");
    expect(html).toContain("Leave study");
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
        React.createElement<NonNullable<Parameters<typeof CyberMissionControl>[0]>>(CyberMissionControl, { initialScenarios: [] })
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
        React.createElement<NonNullable<Parameters<typeof CyberMissionControl>[0]>>(CyberMissionControl, { initialScenarios: [] })
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

  it("renders InteractiveChallengeRunner in a spacious dual-column workstation layout with questions and simulators fully visible", () => {
    const mockScenario: Scenario = {
      id: "PH01",
      mission: "phishing",
      primaryIV: "IV1",
      secondaryTags: [],
      version: "1.0",
      title: "The Suspicious University Email",
      situation: "Urgent account deactivation warning",
      senderName: "University IT Account Services",
      senderAddress: "it-support@serendib.campus.example",
      message: "Confirm your student credentials immediately.",
      evidence: [],
      choices: [
        { id: "A", label: "Withhold details and report the email to campus IT security", unsafe: false, privacyRiskScore: 0, disclosedInfoCategory: "None" },
        { id: "B", label: "Verify account status independently through your bookmarked campus portal", unsafe: false, privacyRiskScore: 0, disclosedInfoCategory: "None" },
        { id: "C", label: "Ignore the message without checking or reporting", unsafe: true, privacyRiskScore: 3, disclosedInfoCategory: "None" },
        { id: "D", label: "Proceed by clicking the link and submitting university credentials", unsafe: true, privacyRiskScore: 5, disclosedInfoCategory: "Account Credentials" },
      ],
      interaction: "email",
    };

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
        React.createElement(InteractiveChallengeRunner, {
          scenario: mockScenario,
          missionId: "phishing",
          scenarioIndex: 0,
          totalInMission: 5,
          overallCompleted: 0,
          totalOverall: 20,
          onCompleteScenario: vi.fn(),
          onReturnToHub: vi.fn(),
        })
      )
    );

    // 1. Dual-column workstation layout (no redundant inner sidebar)
    expect(html).toContain("workstation-2col");
    expect(html).not.toContain("workstation-3col");
    expect(html).not.toContain("challenge-workspace-sidebar");

    // 2. Scenario Briefing & Question Evidence Simulator Stage
    expect(html).toContain("challenge-investigation-stage");
    expect(html).toContain("SCENARIO BRIEFING");
    expect(html).toContain("Inspect the communication below before deciding");
    expect(html).toContain("University IT Account Services");

    // 3. Decision Point Question Stage
    expect(html).toContain("challenge-decision-corner");
    expect(html).toContain("DECISION POINT");
    expect(html).toContain("What would you do next?");
    expect(html).toContain("Withhold details and report the email to campus IT security");
    expect(html).toContain("Verify account status independently through your bookmarked campus portal");
    expect(html).toContain("Ignore the message without checking or reporting");
    expect(html).toContain("Proceed by clicking the link and submitting university credentials");
    expect(html).toContain("Next Challenge");
  });

  it("renders STEP 03 to STEP 06 investigation workstation with questions and journey sidebar", () => {
    const mockScenarios: Scenario[] = [
      {
        id: "PH01",
        mission: "phishing",
        primaryIV: "IV1",
        secondaryTags: [],
        version: "1.0",
        title: "The Suspicious University Email",
        situation: "Urgent account deactivation warning",
        senderName: "University IT Account Services",
        senderAddress: "it-support@serendib.campus.example",
        message: "Confirm your student credentials immediately.",
        evidence: [],
        choices: [
          { id: "A", label: "Withhold details and report the email to campus IT security", unsafe: false, privacyRiskScore: 0, disclosedInfoCategory: "None" },
          { id: "B", label: "Verify account status independently", unsafe: false, privacyRiskScore: 0, disclosedInfoCategory: "None" },
        ],
        interaction: "email",
      },
    ];

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
        React.createElement<NonNullable<Parameters<typeof CyberMissionControl>[0]>>(CyberMissionControl, {
          initialMissionId: "phishing",
          initialScenarios: mockScenarios,
        })
      )
    );

    // Sidebar has 7 steps with Step 03 marked active
    expect(html).toContain("YOUR RESEARCH JOURNEY");
    expect(html).toContain("STEP 03");
    expect(html).toContain("Phishing Investigation");

    // Questions and Decision Point are properly rendered
    expect(html).toContain("What would you do?");
    expect(html).toContain("Withhold details and report the email to campus IT security");
  });

  it("renders the redesigned Spot Cyber Campus header brand mark with cyber shield and telemetry badge", () => {
    const html = renderToString(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(SiteHeader)
      )
    );

    // Verify brand anchor attributes
    expect(html).toContain('href="/#home"');
    expect(html).toContain('aria-label="Cyber Campus Home - Return to Hero Section"');

    // Verify brand title text and structure
    expect(html).toContain("cyber");
    expect(html).toContain("campus");
    expect(html).toContain("brand-title");
    expect(html).toContain("brand-light");

    // Verify redesigned cyber shield SVG
    expect(html).toContain("brand-shield-svg");
    expect(html).toContain("brand-shield-grad");
    expect(html).toContain("brand-icon-glow");

    // Verify Research live telemetry badge
    expect(html).toContain("brand-badge");
    expect(html).toContain("brand-badge-pulse");
    expect(html).toContain("RESEARCH");

    // Verify Subtitle platform descriptor
    expect(html).toContain("Cybersecurity Research Platform");
    expect(html).toContain("brand-subtitle");
    expect(html).toContain("brand-subtitle-dot");
  });

  it("renders the redesigned Cyber Campus 4-column footer across the website", () => {
    const html = renderToString(React.createElement(SiteFooter));

    // Verify container and role
    expect(html).toContain("site-footer");
    expect(html).toContain('role="contentinfo"');
    expect(html).toContain("Cyber Campus Research Footer");

    // Verify Platform Description
    expect(html).toContain("An academic cybersecurity research platform exploring social engineering threats");

    // Verify Column 2: Quick Navigation
    expect(html).toContain("Quick Navigation");
    expect(html).toContain("Cyber Challenges");

    // Verify Column 3: Research & Ethics
    expect(html).toContain("Research &amp; Ethics");
    expect(html).toContain("Study Information");
    expect(html).toContain("Participant Rights");
    expect(html).toContain("Privacy Policy");

    // Verify Column 4: Platform Access
    expect(html).toContain("Platform Access");
    expect(html).toContain("Researcher Access");
    expect(html).toContain('href="/admin/login"');
    expect(html).toContain("Participant Withdrawal");
    expect(html).toContain('href="/withdraw"');
    expect(html).toContain("Back to Top");

    // Verify Copyright Notice
    expect(html).toContain("© 2026 Cyber Campus Research Initiative • Sri Lanka");
  });
});
