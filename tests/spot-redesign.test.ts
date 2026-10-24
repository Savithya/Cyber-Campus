import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Home from "@/app/page";
import { SpotHero } from "@/components/spot-hero";
import { SpotTrustBar } from "@/components/spot-trust-bar";
import { SpotMissionSteps } from "@/components/spot-mission-steps";
import { SpotResearchVariables } from "@/components/spot-research-variables";
import { SpotPurposeCard } from "@/components/spot-purpose-card";

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
});
