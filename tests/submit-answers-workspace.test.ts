import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

process.env.LOCAL_SESSION_SECRET = "8e2e2e6934dd06259576327f3d6884c9df70fb6bcd5778a63fb0b92e8dd94680";

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
  recordAttempt,
  recordSessionToWorkspace,
  getDemoSubmissions,
} from "../src/lib/repository.server";
import { scenarios } from "../src/content/scenarios.server";
import type { Session } from "../src/lib/types";

describe("Submit Answers to Research Workspace Integration", () => {
  const submissionsFile = path.join(process.cwd(), ".demo-data", "submissions.json");
  const counterFile = path.join(process.cwd(), ".demo-data", "participant_counter.json");
  let backupData: string | null = null;
  let backupCounter: string | null = null;

  beforeEach(async () => {
    try {
      backupData = await readFile(submissionsFile, "utf-8");
    } catch {
      backupData = null;
    }
    try {
      backupCounter = await readFile(counterFile, "utf-8");
    } catch {
      backupCounter = null;
    }
  });

  afterEach(async () => {
    if (backupData !== null) {
      await writeFile(submissionsFile, backupData, "utf-8").catch(() => {});
    }
    if (backupCounter !== null) {
      await writeFile(counterFile, backupCounter, "utf-8").catch(() => {});
    }
  });

  it("submits answers and automatically records them into the Research Workspace dataset", async () => {
    // 1. Start session
    const started = await startSession({
      eligible: true,
      consented: true,
      priorExposure: false,
      practice: false,
      token: "test-participant-token-1234",
    });
    expect(started.code).toBeDefined();

    // 2. Fill demographic profile Q1-Q4
    await saveDraft({
      Q1: { status: "answered", value: 2 },
      Q2: { status: "answered", value: 1 },
      Q3: { status: "answered", value: 3 },
      Q4: { status: "answered", value: 4 },
    });

    await submitBaseline(
      {
        Q1: { status: "answered", value: 2 },
        Q2: { status: "answered", value: 1 },
        Q3: { status: "answered", value: 3 },
        Q4: { status: "answered", value: 4 },
      },
      "test-idemp-workspace",
    );

    // 3. Record an attempt
    await recordAttempt({
      scenarioId: scenarios[0].id,
      action: scenarios[0].choices[0].id,
      elapsedMs: 2500,
      idempotencyKey: "test-att-ws-01",
    });

    // 4. Trigger explicit record to workspace
    const res = await recordSessionToWorkspace();
    expect(res.ok).toBe(true);
    expect(res.session.status).toBe("submitted_complete");
    expect(res.session.answers.Q6).toBeDefined();
    expect(res.session.answers.Q6.status).toBe("answered");

    // 5. Verify the Research Workspace data source (.demo-data/submissions.json) contains this participant
    const demoSubmissions = await getDemoSubmissions();
    const found = demoSubmissions.find((s: Session) => s.code === started.code);
    expect(found).toBeDefined();
    expect(found?.status).toBe("submitted_complete");
    expect(found?.answers.Q1.value).toBe(2);
    expect(found?.answers.Q6.status).toBe("answered");
  });

  afterAll(async () => {
    try {
      await writeFile(submissionsFile, "[]\n", "utf-8");
      await writeFile(counterFile, JSON.stringify({ counter: 0 }) + "\n", "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
    } catch {}
  });
});
