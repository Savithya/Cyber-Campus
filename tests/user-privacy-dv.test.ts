import { describe, it, expect } from "vitest";
import { questions } from "@/content/questionnaire";
import { aggregateQuestion } from "@/lib/analytics";
import type { Session } from "@/lib/types";

describe("User Privacy (DV) Construct & Questionnaire Items", () => {
  const dvQuestions = questions.filter((q) =>
    ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"].includes(q.id),
  );

  it("includes all 7 Section F Dependent Variable questions (Q19-Q25)", () => {
    expect(dvQuestions.length).toBe(7);
    const ids = dvQuestions.map((q) => q.id);
    expect(ids).toEqual(["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"]);
  });

  it("ensures each DV question has valid options where Option 1 is the primary threat recognition", () => {
    dvQuestions.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.options[0].code).toBe(1);
      expect(q.options[0].label.length).toBeGreaterThan(10);
    });
  });

  it("correctly aggregates DV question responses without missing items", () => {
    const mockSessions: Session[] = [
      {
        id: "sess_01",
        code: "PART_01",
        mode: "research",
        status: "submitted_complete",
        createdAt: "2026-03-01T10:00:00Z",
        submittedAt: "2026-03-01T10:15:00Z",
        draftExpiresAt: "2026-03-08T10:00:00Z",
        withdrawDeadline: "2026-03-22T10:00:00Z",
        instrumentVersion: "1.0",
        consentVersion: "1.0",
        priorExposure: false,
        answers: {
          Q19: { value: 1, status: "answered" },
          Q20: { value: 1, status: "answered" },
          Q21: { value: 1, status: "answered" },
          Q22: { value: 1, status: "answered" },
          Q23: { value: 1, status: "answered" },
          Q24: { value: 1, status: "answered" },
          Q25: { value: 1, status: "answered" },
        },
        attempts: [],
        submissionId: "sub_01",
        participantId: "PART_01",
      },
    ];

    dvQuestions.forEach((q) => {
      const agg = aggregateQuestion(q, mockSessions);
      expect(agg.validN).toBe(1);
      expect(agg.missingN).toBe(0);
      const opt1 = agg.rows.find((r) => r.code === 1);
      expect(opt1?.percentage).toBe(100);
      expect(opt1?.count).toBe(1);
    });
  });
});
