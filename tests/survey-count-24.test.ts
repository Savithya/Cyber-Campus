import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import Admin from "@/components/admin";
import { questions } from "@/content/questionnaire";
import { exportCsv } from "@/lib/csv";
import type { Answers, Session } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

function buildCompleteAnswers(): Answers {
  const answers: Answers = {};
  for (const q of questions) {
    answers[q.id] = { value: q.options[0].code, status: "answered" };
  }
  return answers;
}

function buildSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "sub-01",
    submissionId: "sub-01",
    participantId: "PART-01",
    code: "01",
    mode: "demo",
    status: "submitted_complete",
    createdAt: "2026-11-11T14:37:29.178Z",
    submittedAt: "2026-11-11T14:37:29.572Z",
    draftExpiresAt: "2026-11-18T14:37:29.178Z",
    withdrawDeadline: "2026-11-18T14:37:29.178Z",
    instrumentVersion: "2.0.0",
    consentVersion: "2.0.0",
    priorExposure: false,
    assignedModuleOrder: ["phishing", "pretexting", "impersonation", "links"],
    answers: buildCompleteAnswers(),
    attempts: [],
    ...overrides,
  };
}

describe("24-question survey counts and reporting", () => {
  const stripComments = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "");

  it("displays 24 / 24 and All 24 answered in submission history when all instrument questions are answered", () => {
    const html = stripComments(
      renderToString(
        React.createElement(Admin, {
          sessions: [buildSession()],
          demo: true,
          path: ["history"],
        }),
      ),
    );

    expect(html).toContain("Survey (24)");
    expect(html).toContain("<strong>24</strong> / 24");
    expect(html).toContain("All 24 answered");
    expect(html).not.toContain("1 missing");
    expect(html).not.toContain("/ 25");
  });

  it("ignores legacy Q5 keys when counting active instrument responses", () => {
    const answersWithQ5: Answers = {
      ...buildCompleteAnswers(),
      Q5: { value: 1, status: "answered" },
    };
    const html = stripComments(
      renderToString(
        React.createElement(Admin, {
          sessions: [buildSession({ answers: answersWithQ5 })],
          demo: true,
          path: ["history"],
        }),
      ),
    );

    expect(html).toContain("<strong>24</strong> / 24");
    expect(html).toContain("All 24 answered");
    expect(html).not.toContain("25</strong> / 24");
  });

  it("reports 1 missing out of 24 only when an active question is skipped", () => {
    const answers = buildCompleteAnswers();
    answers.Q10 = { value: null, status: "skipped" };

    const html = stripComments(
      renderToString(
        React.createElement(Admin, {
          sessions: [
            buildSession({ status: "submitted_with_missing", answers }),
          ],
          demo: true,
          path: ["history"],
        }),
      ),
    );

    expect(html).toContain("<strong>23</strong> / 24");
    expect(html).toContain("1 missing");
  });

  it("renders only Section A (Q1–Q4) on the Demographics view without leaking Q6", () => {
    const html = renderToString(
      React.createElement(Admin, {
        sessions: [buildSession()],
        demo: true,
        path: ["demographics"],
      }),
    );

    expect(html).toContain("Sample Demographics (Q1–Q4)");
    expect(html).toContain("Q4");
    expect(html).not.toContain("Phishing Email Identification");
  });

  it("exports answered_count=24 and missing_count=0 in responses-wide CSV for complete submissions", () => {
    const csv = exportCsv("responses-wide", [buildSession()], {}, true);
    const lines = csv.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    const row = lines[1].split(",");

    const answeredIdx = headers.indexOf('"answered_count"');
    const missingIdx = headers.indexOf('"missing_count"');

    expect(answeredIdx).toBeGreaterThan(-1);
    expect(missingIdx).toBeGreaterThan(-1);
    expect(row[answeredIdx]).toBe("24");
    expect(row[missingIdx]).toBe("0");
  });
});
