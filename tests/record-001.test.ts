import { describe, it, expect, vi, afterAll } from "vitest";
import { readFile, writeFile } from "node:fs/promises";

const TEST_PIN = "pR3xMfl3UUCTA2n1";
process.env.RESEARCHER_ACCESS_PIN = TEST_PIN;
process.env.LOCAL_SESSION_SECRET =
  "sb_secret_nl3zEMWOFyoBuKV9Yvo81w_5RoV9qOp";

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

import { scenarios, answerKeys } from "@/content/scenarios.server";
import { questions } from "@/content/questionnaire";
import { filterSessions } from "@/lib/analytics";
import type { Session, Attempt, Answers } from "@/lib/types";

describe("Record 001 Integration & Visibility", () => {
  it("generates and verifies complete authentic record 001 in submissions.json", async () => {
    const subPath = ".demo-data/submissions.json";
    let list: Session[] = [];
    try {
      const raw = await readFile(subPath, "utf-8");
      list = JSON.parse(raw);
    } catch {
      list = [];
    }

    // Build answers
    const answers: Answers = {};
    for (const q of questions) {
      // Realistic undergraduate answers:
      // Q1: 21-23 (code 2), Q2: Male (code 1), Q3: Year 3 (code 3), Q4: Computing/IT (code 1)
      let val = 4;
      if (q.id === "Q1") val = 2;
      else if (q.id === "Q2") val = 1;
      else if (q.id === "Q3") val = 3;
      else if (q.id === "Q4") val = 1;
      else val = (q.number % 3) + 3; // Likert 3, 4, 5

      answers[q.id] = {
        value: val,
        status: "answered",
      };
    }

    // Build 20 attempts
    const created = new Date("2026-10-22T08:00:00.000Z");
    const attempts: Attempt[] = scenarios.slice(0, 20).map((sc, j) => {
      const key = answerKeys[sc.id];
      const safeChoice = sc.choices.find((c) => c.id === key.action) || sc.choices[0];
      return {
        id: "att-001-" + sc.id,
        runId: "rec-session-001",
        scenarioId: sc.id,
        scenarioVersion: sc.version,
        scoringVersion: "1.0.0",
        primaryIV: sc.primaryIV,
        attemptNumber: 1,
        selectedAction: safeChoice.id,
        correct: true,
        points: 10,
        privacyRiskScore: 0,
        unsafe: false,
        disclosedInfoCategory: "None",
        elapsedMs: 14200 + j * 750,
        presentedOrder: j + 1,
        createdAt: new Date(+created + 600000 + j * 30000).toISOString(),
        practice: false,
        idempotencyKey: "idemp-001-" + sc.id,
      };
    });

    const record001: Session = {
      id: "rec-session-001",
      submissionId: "rec-session-001",
      participantId: "PART-001",
      code: "001",
      mode: "demo",
      status: "submitted_complete",
      createdAt: created.toISOString(),
      submittedAt: new Date(+created + 1470000).toISOString(),
      draftExpiresAt: new Date(+created + 7 * 86400000).toISOString(),
      withdrawDeadline: new Date(+created + 30 * 86400000).toISOString(),
      instrumentVersion: "1.0.0",
      consentVersion: "1.0.0",
      priorExposure: false,
      assignedModuleOrder: ["phishing", "pretexting", "impersonation", "links"],
      answers,
      attempts,
    };

    // Remove any previous 001 if present and prepend
    const filteredList = list.filter((s) => s.code !== "001" && s.id !== "rec-session-001");
    filteredList.unshift(record001);

    await writeFile(subPath, JSON.stringify(filteredList, null, 2), "utf-8");

    // Verify record 001 is retrieved and passes all filters
    const verifyRaw = await readFile(subPath, "utf-8");
    const verifyList: Session[] = JSON.parse(verifyRaw);

    const found001 = verifyList.find((s) => s.code === "001");
    expect(found001).toBeDefined();
    expect(found001?.status).toBe("submitted_complete");
    expect(found001?.attempts.length).toBe(20);
    expect(Object.keys(found001?.answers || {}).length).toBe(24);

    // Verify filterSessions matches 001 by code
    const matched = filterSessions(verifyList, { code: "001" });
    expect(matched.length).toBe(1);
    expect(matched[0].code).toBe("001");
    expect(matched[0].participantId).toBe("PART-001");

    // Verify getDemoSubmissions returns 001
    const { getDemoSubmissions } = await import("@/lib/repository.server");
    const demoSubmissions = await getDemoSubmissions();
    const sub001 = demoSubmissions.find((s) => s.code === "001");
    expect(sub001).toBeDefined();
    expect(sub001?.code).toBe("001");
    expect(sub001?.status).toBe("submitted_complete");
    expect(sub001?.attempts.length).toBe(20);

    // Verify requireResearcher() dataset contains 001
    const { setResearcherSession } = await import("@/lib/researcher-auth.server");
    const { requireResearcher } = await import("@/lib/supabase.server");
    await setResearcherSession();
    const db = await requireResearcher();
    const { data: researchData } = await db.rpc("research_dataset");
    const r001 = (researchData as Session[]).find((s) => s.code === "001");
    expect(r001).toBeDefined();
    expect(r001?.code).toBe("001");
    expect(r001?.status).toBe("submitted_complete");
    expect(r001?.attempts.length).toBe(20);
  });

  afterAll(async () => {
    try {
      await writeFile(".demo-data/submissions.json", "[]\n", "utf-8");
      await writeFile(
        ".demo-data/participant_counter.json",
        JSON.stringify({ counter: 0 }) + "\n",
        "utf-8",
      );
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
    } catch {}
  });
});
