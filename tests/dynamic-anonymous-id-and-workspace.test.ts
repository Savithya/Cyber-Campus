import { describe, it, expect, vi, beforeEach } from "vitest";
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
  startSession,
  startNewParticipantSession,
  submitBaseline,
  recordAttempt,
  recordSessionToWorkspace,
  getDemoSubmissions,
} from "@/lib/repository.server";
import { setResearcherSession } from "@/lib/researcher-auth.server";
import { requireResearcher } from "@/lib/supabase.server";
import { scenarios, answerKeys } from "@/content/scenarios.server";
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
      const raw0 = await readFile(subPath, "utf-8");
      const list0: Session[] = JSON.parse(raw0);
      const cleaned = list0.filter((s) => s.code === "001");
      await writeFile(subPath, JSON.stringify(cleaned, null, 2), "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 1 }), "utf-8");
    } catch {}
  });

  it("changes Anonymous ID when user joins research and updates all 9 Research Workspace parts automatically", async () => {
    // Verify 001 exists as baseline
    const listBefore = await getDemoSubmissions();
    expect(listBefore.some((s) => s.code === "001")).toBe(true);

    // 1. User joins research via startNewParticipantSession -> Anonymous ID MUST change from 001 to 002
    cookieStore.clear();
    const newParticipant = await startNewParticipantSession();
    expect(newParticipant.code).not.toBe("001");
    expect(newParticipant.code).toBe("002");
    expect(newParticipant.status).toBe("draft");

    // 2. User completes Demographic Profile (Q1-Q5)
    const profileAnswers: Answers = {
      Q1: { value: 3, status: "answered" }, // 24-26 years
      Q2: { value: 2, status: "answered" }, // Female
      Q3: { value: 4, status: "answered" }, // Year 4
      Q4: { value: 2, status: "answered" }, // Engineering
      Q5: { value: 2, status: "answered" }, // Private University
    };
    const submittedBaseline = await submitBaseline(profileAnswers, "idemp-part002-profile");
    expect(submittedBaseline.code).toBe("002");
    expect(submittedBaseline.status).toBe("submitted_complete");

    // Verify Demographics in Research Workspace immediately includes Participant 002
    const subsAfterDemo = await getDemoSubmissions();
    const p002InWorkspace = subsAfterDemo.find((s) => s.code === "002");
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
    expect(workspaceSync.session.code).toBe("002");
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
    expect(submitted.some((s) => s.code === "002")).toBe(true);

    // Part 2: Responses Audit
    const participant002 = submitted.find((s) => s.code === "002");
    expect(participant002).toBeDefined();
    expect(Object.keys(participant002!.answers).length).toBe(25);

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

    // Part 5: User Privacy (DV)
    const dvVals = extractVariableValues(STANDARD_VARIABLES[4], submitted);
    const validDv = dvVals.filter((v): v is number => v !== null);
    expect(validDv.length).toBeGreaterThanOrEqual(2);

    // Part 6: Statistical Analysis (Correlations, Regression, Reliability)
    const matrixVars = STANDARD_VARIABLES.slice(0, 5).map((v) => ({
      id: v.id,
      label: v.name,
      values: extractVariableValues(v, submitted),
    }));
    const matrix = calculateCorrelationMatrix(matrixVars, "spearman");
    expect(matrix.variableLabels.length).toBe(5);
    const outcome = {
      name: STANDARD_VARIABLES[4].name,
      values: extractVariableValues(STANDARD_VARIABLES[4], submitted),
    };
    const predictors = STANDARD_VARIABLES.slice(0, 4).map((v) => ({
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

    // Part 8: Data Export includes 002
    expect(workspaceSessions.some((s) => s.code === "002")).toBe(true);

    // Part 9: Submission History includes 002
    expect(submitted.some((s) => s.code === "002" && s.status === "submitted_complete")).toBe(true);

    // 5. Another user joins research -> Anonymous ID increments to 003
    cookieStore.clear();
    const participant3 = await startNewParticipantSession();
    expect(participant3.code).toBe("003");
  });
});
