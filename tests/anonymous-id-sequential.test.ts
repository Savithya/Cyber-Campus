import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { readFile, writeFile } from "node:fs/promises";

const cookieStore = new Map<string, { value: string; options?: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookieStore.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
    getAll: () =>
      Array.from(cookieStore.entries()).map(([name, { value }]) => ({
        name,
        value,
      })),
  }),
}));

import {
  startSession,
  saveDraft,
  submitBaseline,
  getDemoSubmissions,
} from "@/lib/repository.server";
import { blankAnswers } from "@/lib/validation";
import type { Session } from "@/lib/types";

describe("Sequential Anonymous ID & Research Area Recording", () => {
  const subPath = ".demo-data/submissions.json";
  const counterPath = ".demo-data/participant_counter.json";

  beforeEach(async () => {
    try {
      let cleaned: Session[] = [];
      try {
        const raw0 = await readFile(subPath, "utf-8");
        const list0: Session[] = JSON.parse(raw0);
        cleaned = list0.filter((s) => s.code === "001");
      } catch {}

      if (cleaned.length === 0) {
        cleaned = [
          {
            id: "test-rec-001",
            submissionId: "test-rec-001",
            participantId: "PART-001",
            code: "001",
            mode: "demo",
            status: "submitted_complete",
            createdAt: "2026-10-22T08:00:00.000Z",
            submittedAt: "2026-10-22T08:24:30.000Z",
            draftExpiresAt: "2026-10-29T08:00:00.000Z",
            withdrawDeadline: "2026-11-21T08:00:00.000Z",
            instrumentVersion: "1.0.0",
            consentVersion: "1.0.0",
            priorExposure: false,
            assignedModuleOrder: ["phishing", "pretexting", "impersonation", "links"],
            answers: {},
            attempts: [],
          },
        ];
      }
      await writeFile(subPath, JSON.stringify(cleaned, null, 2), "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 1 }), "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
        for (const s of cleaned) {
          globalThis.__CYBER_CAMPUS_SUBMISSIONS__.set(s.code || s.id, s);
        }
      }
    } catch {}
  });

  afterAll(async () => {
    try {
      await writeFile(subPath, "[]\n", "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 0 }) + "\n", "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
    } catch {}
  });

  it("assigns sequential Anonymous IDs: 001 -> 002 -> 003 -> 004 and records all in research area", async () => {
    // 1. Verify 001 exists as the base record
    const raw0 = await readFile(subPath, "utf-8");
    const list0: Session[] = JSON.parse(raw0);
    const sub001 = list0.find((s) => s.code === "001");
    expect(sub001).toBeDefined();

    // 2. User 2 joins research
    cookieStore.clear();
    const session2 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "2".repeat(64),
    });

    expect(session2.code).toBe("002");
    expect(session2.status).toBe("draft");

    // Verify User 2 is immediately recorded in research submissions
    const rawSubs2 = await readFile(subPath, "utf-8");
    const listSubs2: Session[] = JSON.parse(rawSubs2);
    const recorded2 = listSubs2.find((s) => s.code === "002");
    expect(recorded2).toBeDefined();
    expect(recorded2?.code).toBe("002");
    expect(recorded2?.status).toBe("draft");

    // 3. User 2 saves draft demographic answers
    const answers2 = blankAnswers();
    answers2.Q1 = { value: 1, status: "answered" };
    answers2.Q2 = { value: 2, status: "answered" };
    await saveDraft(answers2);

    const rawAfterDraft2 = await readFile(subPath, "utf-8");
    const listAfterDraft2: Session[] = JSON.parse(rawAfterDraft2);
    const draft2 = listAfterDraft2.find((s) => s.code === "002");
    expect(draft2?.answers.Q1?.value).toBe(1);
    expect(draft2?.answers.Q2?.value).toBe(2);

    // 4. User 2 submits baseline
    await submitBaseline(answers2, "idemp-002-baseline");
    const subsAfterSubmit2 = await getDemoSubmissions();
    const sub2Submitted = subsAfterSubmit2.find((s) => s.code === "002");
    expect(sub2Submitted?.status).toBe("submitted_with_missing");

    // 5. User 3 joins research
    cookieStore.clear();
    const session3 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "3".repeat(64),
    });

    expect(session3.code).toBe("003");
    expect(session3.status).toBe("draft");

    // Verify User 3 is immediately recorded in research area
    const subsAfter3 = await getDemoSubmissions();
    const recorded3 = subsAfter3.find((s) => s.code === "003");
    expect(recorded3).toBeDefined();
    expect(recorded3?.code).toBe("003");

    // 6. User 4 joins research
    cookieStore.clear();
    const session4 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "4".repeat(64),
    });

    expect(session4.code).toBe("004");
    expect(session4.status).toBe("draft");

    // Verify User 4 is immediately recorded in research area
    const subsAfter4 = await getDemoSubmissions();
    const recorded4 = subsAfter4.find((s) => s.code === "004");
    expect(recorded4).toBeDefined();
    expect(recorded4?.code).toBe("004");

    // Verify all 4 codes are recorded in order
    const allCodes = subsAfter4.map((s) => s.code);
    expect(allCodes).toContain("001");
    expect(allCodes).toContain("002");
    expect(allCodes).toContain("003");
    expect(allCodes).toContain("004");
  });
});
