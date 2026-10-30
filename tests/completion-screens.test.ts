import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Review from "@/components/review";
import { SessionContext, type SessionContextType } from "@/lib/client";
import { SCENARIO_STORIES } from "@/content/scenario-stories";
import type { Attempt } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/survey/review",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Research Completion Flow - 20 Questions (Image 1 and Image 2)", () => {
  it("verifies that all 20 scenarios are defined with story titles and order numbers 01 to 20", () => {
    expect(SCENARIO_STORIES.length).toBe(20);
    expect(SCENARIO_STORIES[0].orderNumber).toBe("01");
    expect(SCENARIO_STORIES[0].storyTitle).toBe("The account notice");
    expect(SCENARIO_STORIES[1].orderNumber).toBe("02");
    expect(SCENARIO_STORIES[1].storyTitle).toBe("Scholarship shortlist");
    expect(SCENARIO_STORIES[19].orderNumber).toBe("20");
    expect(SCENARIO_STORIES[19].storyTitle).toBe("Remote internship opportunity");
  });

  it("renders Image 1 ('Ready to finish?') when user has answered the 20 questions before submitting", () => {
    // 20 completed attempts
    const mockAttempts: Attempt[] = SCENARIO_STORIES.map((story, i) => ({
      id: `att-${i}`,
      runId: "run-001",
      scenarioId: story.id,
      scenarioVersion: "2.0.0",
      scoringVersion: "2.0.0",
      primaryIV: "IV1",
      attemptNumber: 1,
      selectedAction: story.correctAction,
      correct: true,
      points: 10,
      privacyRiskScore: 0,
      unsafe: false,
      disclosedInfoCategory: "None",
      elapsedMs: 5000,
      presentedOrder: i + 1,
      createdAt: new Date().toISOString(),
      practice: false,
      idempotencyKey: `idem-${i}`,
    }));

    const mockContextValue = {
      session: {
        code: "P-8C0C39B7A0E1",
        status: "in_progress" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
        attempts: mockAttempts,
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

    // Image 1: Subtitle
    expect(html).toContain("Examine each email carefully and decide what you would do.");

    // Image 1: 4 metrics tiles
    expect(html).toContain("Game Performance Score");
    expect(html).toContain("200");
    expect(html).toContain("Decision accuracy");
    expect(html).toContain("100%");
    expect(html).toContain("Current streak");
    expect(html).toContain("Scenarios saved");
    expect(html).toContain("20 / 20");

    // Image 1: Progress indicator
    expect(html).toContain("All twenty decisions saved");
    expect(html).toContain("100%");

    // Image 1: Ready to finish center card
    expect(html).toContain("YOU&#x27;VE EXPLORED THE WHOLE INBOX");
    expect(html).toContain("Ready to finish?");
    expect(html).toContain(
      "Your twenty decisions are saved. Submit the completed study to see your game results and the explanations."
    );
    expect(html).toContain("Submit &amp; see my results");
  });

  it("renders Image 2 ('Challenge Complete!' & 'Every email tells a story.') after final submission", () => {
    // 20 completed attempts
    const mockAttempts: Attempt[] = SCENARIO_STORIES.map((story, i) => ({
      id: `att-${i}`,
      runId: "run-001",
      scenarioId: story.id,
      scenarioVersion: "2.0.0",
      scoringVersion: "2.0.0",
      primaryIV: "IV1",
      attemptNumber: 1,
      selectedAction: i % 2 === 0 ? story.correctAction : "proceed",
      correct: i % 2 === 0,
      points: i % 2 === 0 ? 10 : 0,
      privacyRiskScore: 0,
      unsafe: false,
      disclosedInfoCategory: "None",
      elapsedMs: 5000,
      presentedOrder: i + 1,
      createdAt: new Date().toISOString(),
      practice: false,
      idempotencyKey: `idem-${i}`,
    }));

    const mockContextValue = {
      session: {
        code: "P-8C0C39B7A0E1",
        status: "submitted_complete" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
        attempts: mockAttempts,
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

    // Image 2: Header & Badges
    expect(html).not.toContain("MISSION ACCOMPLISHED");
    expect(html).toContain("Challenge Complete!");
    expect(html).toContain("Submit Responses");
    expect(html).toContain("Thank you for participating in this research study.");
    expect(html).toContain("Your responses have been securely recorded for academic research.");
    expect(html).toContain("Anonymous participant code:");
    expect(html).toContain("P-8C0C39B7A0E1");

    // Image 2: Dark Teal Card
    expect(html).toContain("Your Game Performance");
    expect(html).toContain("Game Performance Score");
    expect(html).toContain("Decision accuracy");
    expect(html).toContain("Scenarios completed");
    expect(html).toContain("20 / 20");
    expect(html).toContain(
      "Your game score is separate from the research measurements. It does not assess or label you as an individual."
    );

    // Image 2: Section below - All 20 questions
    expect(html).toContain("A CLOSER LOOK");
    expect(html).toContain("Every email tells a story.");

    // Verify all 20 scenario cards exist in the rendered output
    for (let i = 1; i <= 20; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      expect(html).toContain(numStr);
    }

    // Verify key story titles from Image 2
    expect(html).toContain("The account notice");
    expect(html).toContain("Scholarship shortlist");
    expect(html).toContain("The timetable change");
    expect(html).toContain("A library update");
    expect(html).toContain("Shared course notes");
    expect(html).toContain("Remote internship opportunity");

    // Subtitle outcomes
    expect(html).toContain("An opportunity to pause &amp; verify · 0 game points");
  });
});
