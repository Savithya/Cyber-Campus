import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

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
  getSession,
  submitBaseline,
  resetResearchData,
  getDemoSubmissions,
} from "@/lib/repository.server";
import { blankAnswers } from "@/lib/validation";

describe("Cross-Device Participant ID Synchronization & Monotonic Sequence (01 -> 02 -> 03)", () => {
  const subPath = path.join(process.cwd(), ".demo-data", "submissions.json");
  const counterPath = path.join(process.cwd(), ".demo-data", "participant_counter.json");

  beforeEach(async () => {
    try {
      await mkdir(path.join(process.cwd(), ".demo-data"), { recursive: true });
      await writeFile(subPath, "[]\n", "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 0 }) + "\n", "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
      globalThis.__CYBER_CAMPUS_COUNTER__ = 0;
      cookieStore.clear();
    } catch {}
  });

  afterAll(async () => {
    try {
      await writeFile(subPath, "[]\n", "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 0 }) + "\n", "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
      globalThis.__CYBER_CAMPUS_COUNTER__ = 0;
      cookieStore.clear();
    } catch {}
  });

  it("increments Participant ID sequentially across different devices (01 -> 02 -> 03 -> 04) without resetting to 01", async () => {
    // -------------------------------------------------------------
    // DEVICE 1 (Laptop)
    // -------------------------------------------------------------
    cookieStore.clear(); // Fresh device
    const laptopSession = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "1".repeat(64),
    });

    expect(laptopSession.code).toBe("01");
    expect(laptopSession.status).toBe("draft");

    // Re-accessing on laptop while in draft must NOT change Participant ID
    const laptopRecheck = await getSession();
    expect(laptopRecheck?.code).toBe("01");

    // Calling startSession again on same device in draft keeps code 01
    const laptopReStart = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "1".repeat(64),
    });
    expect(laptopReStart.code).toBe("01");

    // Laptop submits questionnaire baseline
    const laptopAnswers = blankAnswers();
    laptopAnswers.Q1 = { value: 2, status: "answered" };
    laptopAnswers.Q2 = { value: 1, status: "answered" };
    laptopAnswers.Q3 = { value: 3, status: "answered" };
    laptopAnswers.Q4 = { value: 1, status: "answered" };
    const laptopSubmitted = await submitBaseline(laptopAnswers, "laptop-idemp-001");
    expect(laptopSubmitted.code).toBe("01");
    expect(laptopSubmitted.status).toBe("submitted_complete");

    // -------------------------------------------------------------
    // DEVICE 2 (Mobile Phone - completely separate browser/cookies)
    // -------------------------------------------------------------
    cookieStore.clear(); // Simulates a mobile phone browser with no laptop cookies
    const mobileSession = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "2".repeat(64),
    });

    // CRITICAL REQUIREMENT: Mobile phone MUST be 02 (NEVER resetting to 01!)
    expect(mobileSession.code).toBe("02");
    expect(mobileSession.status).toBe("draft");

    // Mobile re-accessing must stay 02
    const mobileRecheck = await getSession();
    expect(mobileRecheck?.code).toBe("02");

    // Mobile submits questionnaire
    const mobileAnswers = blankAnswers();
    mobileAnswers.Q1 = { value: 3, status: "answered" };
    mobileAnswers.Q2 = { value: 2, status: "answered" };
    mobileAnswers.Q3 = { value: 4, status: "answered" };
    mobileAnswers.Q4 = { value: 2, status: "answered" };
    const mobileSubmitted = await submitBaseline(mobileAnswers, "mobile-idemp-002");
    expect(mobileSubmitted.code).toBe("02");
    expect(mobileSubmitted.status).toBe("submitted_complete");

    // -------------------------------------------------------------
    // DEVICE 3 (Tablet - third distinct device)
    // -------------------------------------------------------------
    cookieStore.clear();
    const tabletSession = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "3".repeat(64),
    });

    // Tablet MUST be 03
    expect(tabletSession.code).toBe("03");
    expect(tabletSession.status).toBe("draft");

    const tabletAnswers = blankAnswers();
    tabletAnswers.Q1 = { value: 1, status: "answered" };
    tabletAnswers.Q2 = { value: 1, status: "answered" };
    tabletAnswers.Q3 = { value: 2, status: "answered" };
    tabletAnswers.Q4 = { value: 3, status: "answered" };
    await submitBaseline(tabletAnswers, "tablet-idemp-003");

    // -------------------------------------------------------------
    // DEVICE 4 (Fourth distinct device)
    // -------------------------------------------------------------
    cookieStore.clear();
    const device4Session = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "4".repeat(64),
    });

    // Device 4 MUST be 04
    expect(device4Session.code).toBe("04");

    // Verify all 4 submissions exist in workspace in sequential order
    const allSubs = await getDemoSubmissions();
    const codes = allSubs.map((s) => s.code);
    expect(codes).toContain("01");
    expect(codes).toContain("02");
    expect(codes).toContain("03");
    expect(codes).toContain("04");
  });

  it("resets sequence to 01 after admin workspace reset", async () => {
    // 1. Advance to 01 and 02
    cookieStore.clear();
    const s1 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "a".repeat(64),
    });
    expect(s1.code).toBe("01");

    cookieStore.clear();
    const s2 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "b".repeat(64),
    });
    expect(s2.code).toBe("02");

    // 2. Admin resets research workspace
    const resetRes = await resetResearchData();
    expect(resetRes.ok).toBe(true);

    // 3. Next new device starts at 01 again
    cookieStore.clear();
    const postResetSession = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "c".repeat(64),
    });
    expect(postResetSession.code).toBe("01");
  });
});
