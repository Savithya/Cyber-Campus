import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TEST_PIN = "CyberSec1234";
process.env.RESEARCHER_ACCESS_PIN = TEST_PIN;
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
  startNewParticipantSession,
  submitBaseline,
  recordAttempt,
  recordSessionToWorkspace,
  getDemoSubmissions,
} from "@/lib/repository.server";
import { setResearcherSession } from "@/lib/researcher-auth.server";
import { requireResearcher } from "@/lib/supabase.server";
import { scenarios, answerKeys } from "@/content/scenarios.server";
import { questions } from "@/content/questionnaire";
import { filterSessions } from "@/lib/analytics";
import {
  STANDARD_VARIABLES,
  extractVariableValues,
  calculateCorrelationMatrix,
  calculateLinearRegression,
  calculateReliability,
} from "@/lib/statistics";
import { computeThreatMetrics } from "@/lib/scoring";
import type { Session, Answers } from "@/lib/types";

describe("Dynamic Anonymous ID & Automatic 9-Part Research Workspace Synchronization", () => {
  const subPath = path.join(process.cwd(), ".demo-data", "submissions.json");
  const counterPath = path.join(process.cwd(), ".demo-data", "participant_counter.json");

  beforeEach(async () => {
    try {
      let cleaned: Session[] = [];
      try {
        const raw0 = await readFile(subPath, "utf-8");
        const list0: Session[] = JSON.parse(raw0);
        cleaned = list0.filter((s) => s.code === "01");
      } catch {}

      if (cleaned.length === 0) {
        const dummyAnswers: Answers = {};
        for (const q of questions) {
          let val = 4;
          if (q.id === "Q1") val = 2;
          else if (q.id === "Q2") val = 1;
          else if (q.id === "Q3") val = 3;
          else if (q.id === "Q4") val = 1;
          else val = (q.number % 3) + 3;
          dummyAnswers[q.id] = { value: val, status: "answered" };
        }
        cleaned = [
          {
            id: "test-rec-001",
            submissionId: "test-rec-001",
            participantId: "PART-001",
            code: "01",
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
            answers: dummyAnswers,
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

  it("changes Anonymous ID when user joins research and updates all 9 Research Workspace parts automatically", async () => {
    // Verify 01 exists as baseline
    const listBefore = await getDemoSubmissions();
    expect(listBefore.some((s) => s.code === "01")).toBe(true);

    // 1. User joins research via startNewParticipantSession -> Anonymous ID MUST change from 01 to 02
    cookieStore.clear();
    const newParticipant = await startNewParticipantSession();
    expect(newParticipant.code).not.toBe("01");
    expect(newParticipant.code).toBe("02");
    expect(newParticipant.status).toBe("draft");

    // 2. User completes Demographic Profile (Q1-Q4)
    const profileAnswers: Answers = {
      Q1: { value: 3, status: "answered" }, // 24-26 years
      Q2: { value: 2, status: "answered" }, // Female
      Q3: { value: 4, status: "answered" }, // Year 4
      Q4: { value: 2, status: "answered" }, // Engineering
    };
    const submittedBaseline = await submitBaseline(profileAnswers, "idemp-part002-profile");
    expect(submittedBaseline.code).toBe("02");
    expect(submittedBaseline.status).toBe("submitted_complete");

    // Verify Demographics in Research Workspace immediately includes Participant 02
    const subsAfterDemo = await getDemoSubmissions();
    const p002InWorkspace = subsAfterDemo.find((s) => s.code === "02");
    expect(p002InWorkspace).toBeDefined();
    expect(p002InWorkspace?.answers.Q1?.value).toBe(3);
    expect(p002InWorkspace?.answers.Q2?.value).toBe(2);

    // 3. User plays and completes cyber missions
    for (let i = 0; i < 20; i++) {
      const sc = scenarios[i];
      const key = answerKeys[sc.id];
      const choice = sc.choices.find((c) => c.id === key.action) || sc.choices[0];
      await recordAttempt({
        scenarioId: sc.id,
        action: choice.id,
        elapsedMs: 3200 + i * 200,
        idempotencyKey: `idemp-part002-sc-${sc.id}`,
      });
    }

    // Automatically record & sync complete dataset
    const workspaceSync = await recordSessionToWorkspace();
    expect(workspaceSync.ok).toBe(true);
    expect(workspaceSync.session.code).toBe("02");
    expect(workspaceSync.session.attempts.length).toBe(20);

    // Verify all 20 derived Likert survey answers (Q6-Q25) were automatically populated from mission attempts
    for (let q = 6; q <= 25; q++) {
      const qKey = `Q${q}`;
      expect(workspaceSync.session.answers[qKey]?.status).toBe("answered");
      expect(workspaceSync.session.answers[qKey]?.value).toBeGreaterThanOrEqual(1);
      expect(workspaceSync.session.answers[qKey]?.value).toBeLessThanOrEqual(5);
    }

    // 4. Verify ALL 9 Research Workspace parts are updated:
    await setResearcherSession();
    const db = await requireResearcher();
    const res = await db.rpc("research_dataset");
    const workspaceSessions = (res.data as Session[]).filter(
      (s) => !s.id?.includes("synthetic") && !s.submissionId?.includes("synthetic"),
    );

    // Part 1: Overview
    const submitted = filterSessions(workspaceSessions, {});
    expect(submitted.length).toBeGreaterThanOrEqual(2);
    expect(submitted.some((s) => s.code === "02")).toBe(true);

    // Part 2: Responses Audit
    const participant002 = submitted.find((s) => s.code === "02");
    expect(participant002).toBeDefined();
    expect(Object.keys(participant002!.answers).length).toBe(24);

    // Part 3: Demographics
    const q1Values = submitted.map((s) => s.answers.Q1?.value);
    expect(q1Values).toContain(3);

    // Part 4: Threat Analysis (IV1-IV4)
    const attempts = submitted.flatMap((s) => s.attempts);
    const threats = computeThreatMetrics(attempts);
    expect(threats.metrics.find((m) => m.primaryIV === "IV1")).toBeDefined();
    expect(threats.metrics.find((m) => m.primaryIV === "IV2")).toBeDefined();
    expect(threats.metrics.find((m) => m.primaryIV === "IV3")).toBeDefined();
    expect(threats.metrics.find((m) => m.primaryIV === "IV4")).toBeDefined();

    // Part 5: Demographic Variables
    const demoVals = extractVariableValues(STANDARD_VARIABLES[3], submitted);
    const validDemo = demoVals.filter((v): v is number => v !== null);
    expect(validDemo.length).toBeGreaterThanOrEqual(2);

    // Part 6: Statistical Analysis (Correlations, Regression, Reliability)
    const matrixVars = STANDARD_VARIABLES.slice(0, 4).map((v) => ({
      id: v.id,
      label: v.name,
      values: extractVariableValues(v, submitted),
    }));
    const matrix = calculateCorrelationMatrix(matrixVars, "spearman");
    expect(matrix.variableLabels.length).toBe(4);
    const outcome = {
      name: STANDARD_VARIABLES[3].name,
      values: extractVariableValues(STANDARD_VARIABLES[3], submitted),
    };
    const predictors = STANDARD_VARIABLES.slice(0, 3).map((v) => ({
      name: v.name,
      values: extractVariableValues(v, submitted),
    }));
    const regression = calculateLinearRegression(outcome, predictors);
    expect(regression.rSquared).toBeGreaterThanOrEqual(0);
    const relItems = ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"].map((qid) => ({
      id: qid,
      name: qid,
      values: submitted.map((s) => s.answers[qid]?.value),
    }));
    const rel = calculateReliability(relItems);
    expect(rel.cronbachAlpha).toBeDefined();

    // Part 7: Game Performance
    const p002Attempts = participant002!.attempts;
    expect(p002Attempts.length).toBe(20);

    // Part 8: Data Export includes 02
    expect(workspaceSessions.some((s) => s.code === "02")).toBe(true);

    // Part 9: Submission History includes 02
    expect(submitted.some((s) => s.code === "02" && s.status === "submitted_complete")).toBe(true);

    // 5. Another user joins research -> Anonymous ID increments to 03
    cookieStore.clear();
    const participant3 = await startNewParticipantSession();
    expect(participant3.code).toBe("03");
  });
});
