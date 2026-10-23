import { beforeEach, describe, expect, it, vi } from "vitest";
import { blankAnswers } from "@/lib/validation";
import type { Session } from "@/lib/types";

const mockStore = vi.hoisted(() => ({
  localRecord: null as { session: Session; tokenHash: string; submitKey?: string } | null,
  submissions: [] as Session[],
  cookies: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (mockStore.cookies.has(name) ? { value: mockStore.cookies.get(name)! } : undefined),
    set: (name: string, value: string) => mockStore.cookies.set(name, value),
    delete: (name: string) => mockStore.cookies.delete(name),
  }),
}));

vi.mock("@/lib/local-session.server", () => ({
  readLocal: async () => mockStore.localRecord,
  writeLocal: async (rec: { session: Session; tokenHash: string; submitKey?: string } | null) => {
    mockStore.localRecord = rec;
  },
}));

vi.mock("@/lib/config.server", () => ({
  isResearch: () => false,
  demoConfig: {
    title: "Test Study",
    contact: "demo@test.example",
    retention: "7 days",
    withdrawalDays: 7,
    draftDays: 7,
    collectionOpen: true,
    consentVersion: "1.0.0",
    instrumentVersion: "1.0.0",
  },
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(async (path: string) => {
    if (String(path).includes("participant_counter")) {
      return JSON.stringify({ counter: mockStore.submissions.length });
    }
    return JSON.stringify(mockStore.submissions);
  }),
  writeFile: vi.fn(async (path: string, content: string) => {
    if (String(path).includes("submissions")) {
      try {
        mockStore.submissions = JSON.parse(content);
      } catch {}
    }
  }),
  mkdir: vi.fn(async () => {}),
}));

import { startSession, submitBaseline } from "@/lib/repository.server";

describe("Unlimited Research Submissions", () => {
  beforeEach(() => {
    mockStore.localRecord = null;
    mockStore.submissions = [];
    mockStore.cookies.clear();
  });

  it("allows a participant to submit multiple times without restriction", async () => {
    // 1. Participant starts first session
    const s1 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "a".repeat(64),
    });

    expect(s1.status).toBe("draft");
    expect(s1.id).toBeDefined();
    expect(s1.participantId).toBeDefined();

    // 2. Participant submits first response
    const answers1 = blankAnswers();
    answers1.Q1 = { value: 1, status: "answered" };
    const sub1 = await submitBaseline(answers1, "idemp-key-1");
    expect(sub1.status).toBe("submitted_with_missing");
    expect(sub1.submittedAt).toBeDefined();
    expect(sub1.submissionId).toBe(s1.id);

    // 3. Participant starts a second session without clearing browser data or errors
    const s2 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "b".repeat(64),
    });

    expect(s2.status).toBe("draft");
    expect(s2.id).not.toBe(s1.id); // distinct session ID
    expect(s2.participantId).toBe(s1.participantId); // same participant identified

    // 4. Participant submits second response
    const answers2 = blankAnswers();
    answers2.Q1 = { value: 2, status: "answered" };
    const sub2 = await submitBaseline(answers2, "idemp-key-2");
    expect(sub2.status).toBe("submitted_with_missing");
    expect(sub2.submissionId).toBe(s2.id);
    expect(sub2.submissionId).not.toBe(sub1.submissionId);

    // 5. Test metric calculations: 2 total submissions from 1 unique participant
    const allSubmitted = [sub1, sub2];
    const totalSubmissions = allSubmitted.length;
    const uniqueParticipants = new Set(allSubmitted.map((s) => s.participantId || s.code)).size;

    expect(totalSubmissions).toBe(2);
    expect(uniqueParticipants).toBe(1);
  });

  it("protects against duplicate requests using idempotencyKey", async () => {
    const s = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "c".repeat(64),
    });
    expect(s.id).toBeDefined();

    const answers = blankAnswers();
    const firstCall = await submitBaseline(answers, "retry-key");
    // Duplicate retry with same key returns existing session without error
    const retryCall = await submitBaseline(answers, "retry-key");
    expect(retryCall.id).toBe(firstCall.id);
  });
});
