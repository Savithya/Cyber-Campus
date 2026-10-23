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
  submitBaseline,
  recordAttempt,
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
  calculateFriedmanTest,
} from "@/lib/statistics";
import type { Session, Answers } from "@/lib/types";

describe("Dynamic Anonymous ID & Automatic Research Workspace Updates", () => {
  beforeEach(async () => {
    try {
      const subPath = path.join(process.cwd(), ".demo-data", "submissions.json");
      const counterPath = path.join(process.cwd(), ".demo-data", "participant_counter.json");
      const raw0 = await readFile(subPath, "utf-8");
      const list0: Session[] = JSON.parse(raw0);
      const cleaned = list0.filter((s) => s.code === "001");
      await writeFile(subPath, JSON.stringify(cleaned, null, 2), "utf-8");
      await writeFile(counterPath, JSON.stringify({ counter: 1 }), "utf-8");
    } catch {}
  });
  it("changes Anonymous ID when a user joins research and automatically updates all Research Workspace parts upon mission completion", async () => {
    // 1. Initial State: User 1 joins research (or already recorded as base)
    cookieStore.clear();
    const session1 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "1".repeat(64),
    });

    const id1 = session1.code;
    expect(id1).toBeDefined();

    // User 1 fills demographics
    const answers1: Answers = {
      Q1: { value: 2, status: "answered" },
      Q2: { value: 1, status: "answered" },
      Q3: { value: 3, status: "answered" },
      Q4: { value: 1, status: "answered" },
      Q5: { value: 1, status: "answered" },
    };
    await submitBaseline(answers1, "idemp-user1-base");

    // 2. New User joins research -> Anonymous ID MUST CHANGE
    cookieStore.clear();
    const session2 = await startSession({
      consented: true,
      eligible: true,
      practice: false,
      priorExposure: false,
      token: "2".repeat(64),
    });

    const id2 = session2.code;
    expect(id2).not.toBe(id1);
    expect(parseInt(id2, 10)).toBeGreaterThan(parseInt(id1, 10));

    // User 2 fills demographics
    const answers2: Answers = {
      Q1: { value: 1, status: "answered" },
      Q2: { value: 2, status: "answered" },
      Q3: { value: 2, status: "answered" },
      Q4: { value: 3, status: "answered" },
      Q5: { value: 2, status: "answered" },
    };
    await submitBaseline(answers2, "idemp-user2-base");

    // User 2 completes all 20 cyber missions
    for (let i = 0; i < 20; i++) {
      const sc = scenarios[i];
      const key = answerKeys[sc.id];
      const choice = sc.choices.find((c) => c.id === key.action) || sc.choices[0];
      await recordAttempt({
        scenarioId: sc.id,
        action: choice.id,
        elapsedMs: 15000 + i * 500,
        idempotencyKey: `idemp-u2-${sc.id}`,
      });
    }

    // 3. Verify that User 2 has complete survey answers derived automatically
    const submissions = await getDemoSubmissions();
    const sub2 = submissions.find((s) => s.code === id2);
    expect(sub2).toBeDefined();
    expect(sub2?.status).toBe("submitted_complete");
    expect(sub2?.attempts.length).toBe(20);

    // Verify all 25 questions are populated in answers
    for (let q = 1; q <= 25; q++) {
      const qid = `Q${q}`;
      expect(sub2?.answers[qid]?.value).not.toBeNull();
      expect(sub2?.answers[qid]?.status).toBe("answered");
    }

    // 4. Verify all Research Workspace parts are updated
    await setResearcherSession();
    const db = await requireResearcher();
    const { data: researchData } = await db.rpc("research_dataset");
    const workspaceSessions = researchData as Session[];

    // Overview counts
    const filtered = filterSessions(workspaceSessions, {});
    expect(filtered.length).toBeGreaterThanOrEqual(2);
    expect(filtered.some((s) => s.code === id2)).toBe(true);

    // Demographics part: Q1-Q5 are answered
    for (let q = 1; q <= 5; q++) {
      const qid = `Q${q}`;
      const vals = filtered.map((s) => s.answers[qid]?.value);
      expect(vals.filter((v) => v !== null).length).toBe(filtered.length);
    }

    // Threat Analysis part (IV1-IV4): Attempts are recorded
    const u2Attempts = sub2?.attempts ?? [];
    expect(u2Attempts.filter((a) => a.primaryIV === "IV1").length).toBe(5);
    expect(u2Attempts.filter((a) => a.primaryIV === "IV2").length).toBe(5);
    expect(u2Attempts.filter((a) => a.primaryIV === "IV3").length).toBe(5);
    expect(u2Attempts.filter((a) => a.primaryIV === "IV4").length).toBe(5);

    // User Privacy (DV) part: Q19-Q25 are all valid Likert ratings (1-5)
    for (let q = 19; q <= 25; q++) {
      const qid = `Q${q}`;
      const val = sub2?.answers[qid]?.value;
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    }

    // Statistical Analysis part:
    // 1) Correlation Matrix
    const iv1 = STANDARD_VARIABLES.find((v) => v.id === "IV1_COMPOSITE")!;
    const dv = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;
    const matrixVars = [
      { id: iv1.id, label: iv1.name, values: extractVariableValues(iv1, filtered) },
      { id: dv.id, label: dv.name, values: extractVariableValues(dv, filtered) },
    ];
    const corr = calculateCorrelationMatrix(matrixVars, "spearman");
    expect(corr.variableLabels.length).toBe(2);
    expect(corr.matrix.length).toBe(2);

    // 2) Linear Regression
    const iv1Vals = extractVariableValues(iv1, filtered);
    const dvVals = extractVariableValues(dv, filtered);
    const reg = calculateLinearRegression(
      { name: dv.name, values: dvVals },
      [{ name: iv1.name, values: iv1Vals }],
    );
    expect(reg.validN).toBeGreaterThanOrEqual(2);
    expect(typeof reg.rSquared).toBe("number");

    // 3) Scale Reliability
    const relItems = ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"].map((qid) => {
      const v = STANDARD_VARIABLES.find((sv) => sv.id === qid)!;
      return { id: qid, name: v.name, values: extractVariableValues(v, filtered) };
    });
    const rel = calculateReliability(relItems);
    expect(rel.itemCount).toBe(7);
    expect(rel.validN).toBeGreaterThanOrEqual(2);

    // 4) Friedman Test
    const friedman = calculateFriedmanTest(filtered);
    expect(friedman.n).toBeGreaterThanOrEqual(1);

    // Clean up test records
    const subPath = path.join(process.cwd(), ".demo-data", "submissions.json");
    const counterPath = path.join(process.cwd(), ".demo-data", "participant_counter.json");
    const allSubs = await getDemoSubmissions();
    const cleaned = allSubs.filter((s) => s.code === "001");
    await writeFile(subPath, JSON.stringify(cleaned, null, 2), "utf-8");
    await writeFile(counterPath, JSON.stringify({ counter: 1 }), "utf-8");
  });
});
