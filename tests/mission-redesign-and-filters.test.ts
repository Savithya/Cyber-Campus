import { describe, it, expect } from "vitest";
import { getScenarioEmailData } from "@/components/cyber-mission-challenge";
import { scenarios } from "@/content/scenarios.server";
import { filterSessions } from "@/lib/analytics";
import type { Session } from "@/lib/types";

describe("Cyber Mission Redesign — Realistic University Email Simulator (All 20 Challenges)", () => {
  const activeIds = [
    "PH01", "PH02", "PH03", "PH04", "PH05",
    "PT01", "PT02", "PT03", "PT04", "PT05",
    "IM01", "IM02", "IM03", "IM04", "IM05",
    "SC01", "SC02", "SC03", "SC04", "SC05",
  ];

  it("should have all 20 active challenges in scenarios definition", () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(20);
    for (const id of activeIds) {
      const found = scenarios.find((s) => s.id === id);
      expect(found, `Scenario ${id} must exist`).toBeDefined();
    }
  });

  it("should generate realistic email simulator data for all 20 challenges", () => {
    for (const id of activeIds) {
      const scenario = scenarios.find((s) => s.id === id)!;
      const email = getScenarioEmailData(scenario);

      // Verify essential email attributes
      expect(email.senderInitials).toBeTruthy();
      expect(email.senderName).toBeTruthy();
      expect(email.senderEmail).toContain("@");
      expect(email.recipient).toContain("@");
      expect(email.subject).toBeTruthy();
      expect(email.timestamp).toBeTruthy();
      expect(email.department).toBeTruthy();

      // Verify email body
      expect(email.bodyParagraphs.length).toBeGreaterThanOrEqual(2);
      expect(email.bodyParagraphs.some((p) => p.includes("Dear"))).toBe(true);

      // Verify scenario introduction (concise, <= 3 sentences)
      expect(email.scenarioIntro).toBeTruthy();
      const sentenceCount = email.scenarioIntro.split(/[.?!]\s+/).filter(Boolean).length;
      expect(sentenceCount).toBeLessThanOrEqual(3);

      // Verify RFC security headers
      expect(email.rfcHeaders.returnPath).toBeTruthy();
      expect(email.rfcHeaders.spfResult).toBeTruthy();
      expect(email.rfcHeaders.messageId).toBeTruthy();
    }
  });

  it("should provide safe link previews for link-based challenges without external navigation", () => {
    const linkChallengeIds = ["PH01", "PH02", "PH05", "SC01", "SC03", "SC04"];
    for (const id of linkChallengeIds) {
      const scenario = scenarios.find((s) => s.id === id)!;
      const email = getScenarioEmailData(scenario);
      expect(email.linkCta, `Link challenge ${id} must provide linkCta`).toBeDefined();
      expect(email.linkCta?.destinationUrl).toBeTruthy();
      expect(email.linkCta?.hostDomain).toBeTruthy();
    }
  });

  it("should provide safe attachment inspection for attachment challenge PH04", () => {
    const scenario = scenarios.find((s) => s.id === "PH04")!;
    const email = getScenarioEmailData(scenario);
    expect(email.attachment).toBeDefined();
    expect(email.attachment?.name).toContain("Contract");
    expect(email.attachment?.type).toBeTruthy();
    expect(email.attachment?.size).toBeTruthy();
  });
});

describe("Simplified Global Research Filters", () => {
  const mockSessions = [
    {
      id: "sess-01",
      code: "PART-101",
      submissionId: "SUB-2026-001",
      status: "submitted_complete",
      mode: "research",
      createdAt: "2026-10-18T10:00:00+05:30",
      submittedAt: "2026-10-18T10:30:00+05:30",
      priorExposure: false,
      answers: {
        Q1: { value: 1, label: "18–20 years", status: "answered" },
        Q2: { value: 2, label: "Female", status: "answered" },
        Q3: { value: 2, label: "2nd Year", status: "answered" },
        Q4: { value: 1, label: "Computing / IT", status: "answered" },
        Q5: { value: 1, label: "State University", status: "answered" },
      },
      attempts: [
        {
          id: "att-1",
          runId: "sess-01",
          scenarioId: "PH01",
          scenarioVersion: "2.0.0",
          scoringVersion: "2.0.0",
          primaryIV: "IV1",
          attemptNumber: 1,
          selectedAction: "report",
          points: 10,
          unsafe: false,
          sensitiveDataDisclosed: false,
          reportedToAuthority: true,
          verifiedAuthenticity: false,
          educationalFeedbackShown: true,
          elapsedMs: 8500,
          presentedOrder: 1,
          createdAt: "2026-10-18T10:15:00+05:30",
          practice: false,
          idempotencyKey: "idem-1",
        },
      ],
    },
    {
      id: "sess-02",
      code: "PART-102",
      submissionId: "SUB-2026-002",
      status: "submitted_complete",
      mode: "research",
      createdAt: "2026-10-20T14:00:00+05:30",
      submittedAt: "2026-10-20T14:45:00+05:30",
      priorExposure: true,
      answers: {
        Q1: { value: 2, label: "21–23 years", status: "answered" },
        Q2: { value: 1, label: "Male", status: "answered" },
        Q3: { value: 3, label: "3rd Year", status: "answered" },
        Q4: { value: 2, label: "Engineering", status: "answered" },
        Q5: { value: 2, label: "Private University", status: "answered" },
      },
      attempts: [
        {
          id: "att-2",
          runId: "sess-02",
          scenarioId: "PT01",
          scenarioVersion: "2.0.0",
          scoringVersion: "2.0.0",
          primaryIV: "IV2",
          attemptNumber: 1,
          selectedAction: "verify",
          points: 10,
          unsafe: false,
          sensitiveDataDisclosed: false,
          reportedToAuthority: false,
          verifiedAuthenticity: true,
          educationalFeedbackShown: true,
          elapsedMs: 7200,
          presentedOrder: 1,
          createdAt: "2026-10-20T14:20:00+05:30",
          practice: false,
          idempotencyKey: "idem-2",
        },
      ],
    },
    {
      id: "sess-03",
      code: "PART-103",
      submissionId: "SUB-2026-003",
      status: "draft",
      mode: "research",
      createdAt: "2026-10-21T09:00:00+05:30",
      submittedAt: null,
      priorExposure: false,
      answers: {},
      attempts: [],
    },
  ] as unknown as Session[];

  it("should filter by participant search (code or submission ID)", () => {
    const res1 = filterSessions(mockSessions, { code: "PART-101" });
    expect(res1).toHaveLength(1);
    expect(res1[0].code).toBe("PART-101");

    const res2 = filterSessions(mockSessions, { code: "SUB-2026-002" });
    expect(res2).toHaveLength(1);
    expect(res2[0].code).toBe("PART-102");

    const resNone = filterSessions(mockSessions, { code: "NON-EXISTENT" });
    expect(resNone).toHaveLength(0);
  });

  it("should filter by status (completed vs in_progress vs all)", () => {
    // Completed only
    const completed = filterSessions(mockSessions, { status: "completed" });
    expect(completed).toHaveLength(2);
    expect(completed.every((s) => s.status !== "draft")).toBe(true);

    // In progress (drafts)
    const inProgress = filterSessions(mockSessions, { status: "in_progress" });
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].status).toBe("draft");

    // All
    const all = filterSessions(mockSessions, { status: "all" }, false);
    expect(all).toHaveLength(3);
  });

  it("should filter by demographic variables (Q1..Q5)", () => {
    // Q5: 1 (State) vs 2 (Private)
    const stateUni = filterSessions(mockSessions, { Q5: "1" });
    expect(stateUni).toHaveLength(1);
    expect(stateUni[0].code).toBe("PART-101");

    const privateUni = filterSessions(mockSessions, { Q5: "2" });
    expect(privateUni).toHaveLength(1);
    expect(privateUni[0].code).toBe("PART-102");
  });

  it("should filter by cyber mission (IV1 vs IV2)", () => {
    const iv1 = filterSessions(mockSessions, { mission: "IV1" });
    expect(iv1).toHaveLength(1);
    expect(iv1[0].code).toBe("PART-101");

    const iv2 = filterSessions(mockSessions, { mission: "IV2" });
    expect(iv2).toHaveLength(1);
    expect(iv2[0].code).toBe("PART-102");
  });

  it("should filter by date range in Asia/Colombo", () => {
    const res = filterSessions(mockSessions, {
      from: "2026-10-19",
      to: "2026-10-21",
    });
    expect(res).toHaveLength(1);
    expect(res[0].code).toBe("PART-102");
  });
});
