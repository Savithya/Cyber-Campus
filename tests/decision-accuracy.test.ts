import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { scenarios, answerKeys } from "@/content/scenarios.server";
import { computeGamePerformance, isSafeAttempt, scoreDecision } from "@/lib/scoring";
import { InteractiveChallengeRunner } from "@/components/interactive-challenge-runner";
import Review from "@/components/review";
import { SessionContext, type SessionContextType } from "@/lib/client";
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

function makeAttempt(overrides: Partial<Attempt> & { scenarioId: string }): Attempt {
  return {
    id: `att-${overrides.scenarioId}-${overrides.attemptNumber ?? 1}`,
    runId: "run-001",
    scenarioVersion: "2.0.0",
    scoringVersion: "2.0.0",
    primaryIV: "IV1",
    attemptNumber: 1,
    selectedAction: "verify",
    correct: false,
    points: 0,
    privacyRiskScore: 0,
    unsafe: false,
    disclosedInfoCategory: "None",
    elapsedMs: 4000,
    presentedOrder: 1,
    createdAt: "2026-11-12T10:00:00Z",
    practice: false,
    idempotencyKey: `idem-${overrides.scenarioId}`,
    ...overrides,
  };
}

describe("Decision accuracy and safe protective scoring", () => {
  it("awards 10 points for any safe protective first decision while preserving exact correctAction key", () => {
    const ph02 = scenarios.find((s) => s.id === "PH02")!;
    const key = answerKeys.PH02.action; // "verify"

    // Choosing safe alternative "report" where key is "verify"
    const reportResult = scoreDecision("report", key, true, ph02.choices);
    expect(reportResult).toMatchObject({
      correct: false,
      points: 10,
      unsafe: false,
      privacyRiskScore: 0,
    });

    // Replay does not award extra XP
    expect(scoreDecision("report", key, false, ph02.choices).points).toBe(0);

    // Unsafe action awards 0 points
    expect(scoreDecision("proceed", key, true, ph02.choices)).toMatchObject({
      correct: false,
      points: 0,
      unsafe: true,
    });
  });

  it("computes 100% Decision accuracy and 200 score when all 20 scenarios use safe choices, even if only 6 match single correctAction or unsafe is omitted", () => {
    // Reproduces choosing verify on PH01 and report on PH02..SC05 (matches 6/20 strict keys -> formerly 30% / 60)
    // and simulates Supabase research snapshots where `unsafe` is omitted on Attempt objects.
    const supabaseLikeAttempts = scenarios.map((sc, idx) => {
      const action = sc.choices.some((c) => c.id === "report") ? "report" : "verify";
      const exactMatch = action === answerKeys[sc.id].action;
      const attempt = makeAttempt({
        scenarioId: sc.id,
        primaryIV: sc.primaryIV,
        selectedAction: action,
        correct: exactMatch,
        points: exactMatch ? 10 : 0,
        presentedOrder: idx + 1,
      });
      delete (attempt as Partial<Attempt>).unsafe;
      return attempt;
    });

    const perf = computeGamePerformance(supabaseLikeAttempts, scenarios);
    expect(perf.completedCount).toBe(20);
    expect(perf.safeCount).toBe(20);
    expect(perf.score).toBe(200);
    expect(perf.accuracy).toBe(100);
    expect(perf.currentStreak).toBe(20);
  });

  it("excludes skipped decisions from Decision accuracy denominator and ignores replays", () => {
    const attempts: Attempt[] = [
      makeAttempt({ scenarioId: "PH01", selectedAction: null, correct: null, points: 0 }),
      ...scenarios.slice(1).map((sc, idx) =>
        makeAttempt({
          scenarioId: sc.id,
          primaryIV: sc.primaryIV,
          selectedAction: "report",
          correct: answerKeys[sc.id].action === "report",
          points: 10,
          presentedOrder: idx + 2,
        }),
      ),
      // Replay should not count
      makeAttempt({
        scenarioId: "PH02",
        attemptNumber: 2,
        selectedAction: "proceed",
        correct: false,
        unsafe: true,
        points: 0,
      }),
    ];

    const perf = computeGamePerformance(attempts, scenarios);
    expect(perf.completedCount).toBe(19);
    expect(perf.safeCount).toBe(19);
    expect(perf.score).toBe(190);
    expect(perf.accuracy).toBe(100);
    expect(perf.currentStreak).toBe(19);
  });

  it("does not misclassify unsafe 'proceed' as safe even if stale mock sets unsafe: false", () => {
    const staleMock = makeAttempt({
      scenarioId: "PH04",
      selectedAction: "proceed",
      correct: false,
      points: 0,
      unsafe: false,
    });
    expect(isSafeAttempt(staleMock, [])).toBe(false);
    expect(isSafeAttempt(staleMock, scenarios)).toBe(false);
  });

  it("renders matching 100% Decision accuracy and 200 score in InteractiveChallengeRunner during research play", () => {
    const safeResearchAttempts = scenarios.map((sc, idx) => {
      const action = sc.choices.some((c) => c.id === "report") ? "report" : "verify";
      const exactMatch = action === answerKeys[sc.id].action;
      const attempt = makeAttempt({
        scenarioId: sc.id,
        primaryIV: sc.primaryIV,
        selectedAction: action,
        correct: exactMatch,
        points: exactMatch ? 10 : 0,
        presentedOrder: idx + 1,
      });
      delete (attempt as Partial<Attempt>).unsafe;
      return attempt;
    });

    const mockContextValue = {
      session: {
        code: "01",
        status: "submitted_complete" as const,
        mode: "research" as const,
        draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        answers: {},
        attempts: safeResearchAttempts,
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
          scenario: scenarios[19],
          allScenarios: scenarios,
          missionId: "links",
          scenarioIndex: 4,
          totalInMission: 5,
          onCompleteScenario: vi.fn(),
        }),
      ),
    );

    expect(html).toContain("100%");
    expect(html).not.toContain("30%");
    expect(html).toContain(">200<");
  });

  it("renders accurate 100% / 200 in Review View C and avoids bogus 200 or 20% fallbacks on zero-point or empty runs", () => {
    // 1) All 20 safe choices where only 6 matched single DB correct_action
    const safeAttempts = scenarios.map((sc, idx) => {
      const action = sc.choices.some((c) => c.id === "report") ? "report" : "verify";
      const exactMatch = action === answerKeys[sc.id].action;
      const attempt = makeAttempt({
        scenarioId: sc.id,
        primaryIV: sc.primaryIV,
        selectedAction: action,
        correct: exactMatch,
        points: exactMatch ? 10 : 0,
        presentedOrder: idx + 1,
      });
      delete (attempt as Partial<Attempt>).unsafe;
      return attempt;
    });

    const safeHtml = renderToString(
      React.createElement(
        SessionContext.Provider,
        {
          value: {
            session: {
              code: "01",
              status: "submitted_complete" as const,
              mode: "research" as const,
              draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
              answers: {},
              attempts: safeAttempts,
            },
            setSession: vi.fn(),
            loading: false,
            error: null,
            reload: vi.fn().mockResolvedValue(undefined),
          } as unknown as SessionContextType,
        },
        React.createElement(Review),
      ),
    );

    expect(safeHtml).toContain("100%");
    expect(safeHtml).not.toContain("30%");
    expect(safeHtml).toContain("200");
    expect(safeHtml).toContain("20 / 20");
    expect(safeHtml).toContain("Reported simulated threat · 10 game points");

    // 2) All 20 unsafe choices ("proceed") -> 0 score and 0% accuracy (NOT 200 fallback!)
    const unsafeAttempts = scenarios.map((sc, idx) =>
      makeAttempt({
        scenarioId: sc.id,
        primaryIV: sc.primaryIV,
        selectedAction: "proceed",
        correct: false,
        points: 0,
        unsafe: true,
        presentedOrder: idx + 1,
      }),
    );

    const zeroHtml = renderToString(
      React.createElement(
        SessionContext.Provider,
        {
          value: {
            session: {
              code: "01",
              status: "submitted_complete" as const,
              mode: "research" as const,
              draftExpiresAt: new Date(Date.now() + 86400000).toISOString(),
              answers: {},
              attempts: unsafeAttempts,
            },
            setSession: vi.fn(),
            loading: false,
            error: null,
            reload: vi.fn().mockResolvedValue(undefined),
          } as unknown as SessionContextType,
        },
        React.createElement(Review),
      ),
    );

    expect(zeroHtml).toContain("0%");
    expect(zeroHtml).not.toContain(">200<");
    expect(zeroHtml).toContain("20 / 20");

    // 3) Empty attempts (0 completed) -> 0%, 0 score, 0 / 20 (NOT 20% and NOT hardcoded 20 / 20!)
    const emptyHtml = renderToString(
      React.createElement(
        SessionContext.Provider,
        {
          value: {
            session: {
              code: "01",
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
          } as unknown as SessionContextType,
        },
        React.createElement(Review),
      ),
    );

    expect(emptyHtml).toContain("0%");
    expect(emptyHtml).not.toContain("20%");
    expect(emptyHtml).toContain("0 / 20");
    expect(emptyHtml).not.toContain("20 / 20");
  });
});
