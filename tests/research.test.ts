import { describe, it, expect } from "vitest";
import { questions, sections } from "@/content/questionnaire";
import original from "./fixtures/questionnaire.json";
import { blankAnswers, answersSchema, startSchema } from "@/lib/validation";
import { filterSessions, aggregateQuestion } from "@/lib/analytics";
import { scoreDecision, scoreSummary } from "@/lib/scoring";
import { exportCsv, csvCell } from "@/lib/csv";
import { syntheticSessions } from "@/lib/fixtures.server";
import { scenarios, answerKeys } from "@/content/scenarios.server";
import { missions } from "@/content/missions";
describe("authoritative research instrument", () => {
  it("matches the frozen import of the supplied question wording, options and introductions", () => {
    expect(questions).toEqual(original.questions);
    expect(sections).toEqual(original.sections);
    expect(questions.map((q) => q.id)).toEqual([
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      ...Array.from({ length: 20 }, (_, i) => "Q" + (i + 6)),
    ]);
  });
  it("keeps exactly four IVs and demographic profile apart", () => {
    expect(sections.map((s) => s.questions.length)).toEqual([4, 5, 5, 5, 5]);
    expect(sections.map((s) => s.role)).toEqual([
      "Profile",
      "IV1",
      "IV2",
      "IV3",
      "IV4",
    ]);
    expect(questions.filter((q) => q.role === "IV4").map((q) => q.id)).toEqual([
      "Q21",
      "Q22",
      "Q23",
      "Q24",
      "Q25",
    ]);
  });
  it("starts with no selected answers and accepts skipped/null, not zero or neutral", () => {
    const a = blankAnswers();
    expect(answersSchema.safeParse(a).success).toBe(true);
    a.Q6 = { value: null, status: "skipped" };
    expect(answersSchema.safeParse(a).success).toBe(true);
    a.Q6.value = 0;
    expect(answersSchema.safeParse(a).success).toBe(false);
    a.Q6.value = 3;
    expect(answersSchema.safeParse(a).success).toBe(false);
  });
  it("rejects fabricated questions and non-original options", () => {
    const a = blankAnswers();
    a.Q26 = { value: 1, status: "answered" };
    expect(answersSchema.safeParse(a).success).toBe(false);
    delete a.Q26;
    a.Q2 = { value: 5, status: "answered" };
    expect(answersSchema.safeParse(a).success).toBe(false);
  });
  it("validates startSchema with clientLastCode as string, number, null, or undefined", () => {
    const base = {
      consented: true,
      eligible: true,
      priorExposure: false,
      practice: false,
      token: "a".repeat(64),
    };
    expect(startSchema.safeParse({ ...base, clientLastCode: null }).success).toBe(true);
    expect(startSchema.safeParse({ ...base, clientLastCode: "001" }).success).toBe(true);
    expect(startSchema.safeParse({ ...base, clientLastCode: 10 }).success).toBe(true);
    expect(startSchema.safeParse(base).success).toBe(true);
    expect(startSchema.safeParse({ ...base, unknownField: true }).success).toBe(false);
  });
});
describe("descriptive statistics and filters", () => {
  const records = syntheticSessions();
  it.each(questions.map((q) => [q.id, q] as const))(
    "%s uses nonmissing denominators, original category order and zero-count options",
    (_, q) => {
      const s = filterSessions(records, { Q3: "1" }),
        a = aggregateQuestion(q, s);
      expect(a.rows.map((r) => r.code)).toEqual(q.options.map((o) => o.code));
      expect(a.rows.reduce((n, r) => n + r.count, 0)).toBe(a.validN);
      expect(a.validN + a.missingN).toBe(s.length);
      expect(a.rows.reduce((n, r) => n + r.percentage, 0)).toBeCloseTo(
        a.validN ? 100 : 0,
      );
    },
  );
  it("retains Not sure as a valid experience category", () => {
    const s = records[0];
    s.answers.Q11 = { value: 4, status: "answered" };
    const q11 = questions.find((q) => q.id === "Q11")!;
    const a = aggregateQuestion(q11, [s]);
    expect(a.rows[3]).toMatchObject({
      label: "Not sure",
      count: 1,
      percentage: 100,
    });
    expect(a.missingN).toBe(0);
  });
  it("uses Sri Lankan midnight boundaries, not string comparisons or UTC days", () => {
    const s = { ...records[0], submittedAt: "2026-09-01T19:00:00.000Z" };
    expect(
      filterSessions([s], { from: "2026-09-02", to: "2026-09-02" }),
    ).toHaveLength(1);
    expect(filterSessions([s], { to: "2026-09-01" })).toHaveLength(0);
  });
  it("excludes drafts and practice from default charts", () => {
    expect(filterSessions(records, {})).toHaveLength(42);
    expect(
      filterSessions([{ ...records[0], mode: "practice" }], {}),
    ).toHaveLength(0);
  });
});
describe("game integrity", () => {
  it("authors exactly 5 scenarios per IV across the 4 active missions (20 total active scenarios)", () => {
    expect(scenarios).toHaveLength(20);
    const activeMissions = missions.filter((m) => !m.proposed);
    for (const m of activeMissions) {
      const ss = scenarios.filter((s) => s.primaryIV === m.iv);
      expect(ss).toHaveLength(5);
    }
  });
  it("uses only authored reserved-domain links and complete rationales", () => {
    for (const s of scenarios) {
      expect(s.choices.some((c) => c.id === answerKeys[s.id].action)).toBe(
        true,
      );
      expect(answerKeys[s.id].consequence.length).toBeGreaterThan(30);
      for (const e of s.evidence)
        if (e.url)
          expect(new URL(e.url).hostname.endsWith(".example")).toBe(true);
    }
  });
  it("awards points only for the first decision; skip is not incorrect", () => {
    expect(scoreDecision("verify", "verify", true)).toMatchObject({
      correct: true,
      points: 10,
    });
    expect(scoreDecision("verify", "verify", false).points).toBe(0);
    expect(scoreDecision(null, "verify", true)).toMatchObject({
      correct: null,
      points: 0,
    });
  });
  it("has a 190 maximum for 20 scenarios (1 skipped) and excludes skipped first decisions from accuracy", () => {
    const a = syntheticSessions()[1].attempts.map((x, i) => ({
      ...x,
      correct: i === 0 ? null : true,
      selectedAction: i === 0 ? null : "verify",
      points: i === 0 ? 0 : 10,
    }));
    const sum = scoreSummary(a);
    expect(sum).toMatchObject({
      points: 190,
      completed: 20,
      attempted: 19,
      skipped: 1,
      accuracy: 100,
    });
    expect(
      scoreSummary([
        ...a,
        {
          ...a[0],
          attemptNumber: 2,
          correct: true,
          selectedAction: "verify",
          points: 0,
        },
      ]),
    ).toEqual(sum);
  });
});
describe("research CSV", () => {
  it("preserves numeric codes, quotes and line breaks and blocks text formulas", () => {
    expect(csvCell(3)).toBe("3");
    expect(csvCell('A, "B"\nC')).toBe('"A, ""B""\nC"');
    expect(csvCell(' =HYPERLINK("x")')).toContain("\"'");
    expect(csvCell(null)).toBe("");
  });
  it("exports metadata and explicit missing statuses without private identifiers", () => {
    const s = syntheticSessions()[0];
    s.answers.Q1 = { value: null, status: "skipped" };
    const csv = exportCsv("responses-wide", [s], { Q3: "1" }, true);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("Q25_code");
    expect(csv).toContain("synthetic_demo");
    expect(csv).toContain("skipped");
    expect(csv).not.toMatch(
      /withdrawal_hash|tokenHash|owner_id|idempotencyKey/,
    );
  });
  it("exports all questionnaire questions, every category, and no invented composite", () => {
    const csv = exportCsv("codebook", [], {});
    expect(csv).toContain("nominal category");
    expect(csv).toContain("ordered category, not exact count");
    expect(csv).not.toContain("privacy_score");
    expect(csv).toContain("Not sure");
  });
});
