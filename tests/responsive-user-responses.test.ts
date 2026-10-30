import { describe, it, expect, vi } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import Admin from "@/components/admin";
import Review from "@/components/review";
import { ThemeProvider } from "@/components/theme-provider";
import type { Session, Scenario, Attempt, Answers } from "@/lib/types";
import { questions } from "@/content/questionnaire";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/admin/responses",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/client", () => ({
  api: vi.fn().mockResolvedValue({ ok: true }),
  useSession: () => ({
    session: {
      id: "session-test-01",
      participantId: "PART-001",
      code: "01",
      status: "submitted_complete",
      createdAt: "2026-10-30T10:00:00Z",
      submittedAt: "2026-10-30T10:25:00Z",
      draftExpiresAt: "2026-11-06T10:00:00Z",
      withdrawDeadline: "2026-11-29T10:00:00Z",
      mode: "research",
      instrumentVersion: "1.0.0",
      consentVersion: "1.0.0",
      priorExposure: false,
      assignedModuleOrder: ["phishing", "pretexting", "impersonation", "links"],
      answers: {
        Q1: { value: 1, status: "answered" },
        Q2: { value: 2, status: "answered" },
      },
      attempts: [
        {
          id: "att-1",
          runId: "session-test-01",
          scenarioId: "PH01",
          scenarioVersion: "1.0.0",
          scoringVersion: "1.0.0",
          primaryIV: "IV1",
          attemptNumber: 1,
          selectedAction: "report",
          correct: true,
          points: 10,
          privacyRiskScore: 0,
          unsafe: false,
          disclosedInfoCategory: "None",
          elapsedMs: 12500,
          presentedOrder: 1,
          createdAt: "2026-10-30T10:05:00Z",
          practice: false,
          idempotencyKey: "idem-1",
        },
      ],
    },
    reload: vi.fn().mockResolvedValue(undefined),
  }),
  loadDraft: () => null,
  putDraft: vi.fn(),
  clearDraft: vi.fn(),
  clearParticipationStorage: vi.fn(),
}));

describe("Comprehensive Multi-Device Responsiveness for All User Responses", () => {
  const cssPath = path.resolve(__dirname, "../src/app/globals.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  const MOCK_ATTEMPTS: Attempt[] = [
    {
      id: "att-01-PH01",
      runId: "sess-01",
      scenarioId: "PH01",
      scenarioVersion: "1.0.0",
      scoringVersion: "1.0.0",
      primaryIV: "IV1",
      attemptNumber: 1,
      selectedAction: "Report email to IT Security Helpdesk immediately without opening attachments.",
      correct: true,
      points: 10,
      privacyRiskScore: 0,
      unsafe: false,
      disclosedInfoCategory: "None",
      elapsedMs: 11400,
      presentedOrder: 1,
      createdAt: "2026-10-30T09:15:00Z",
      practice: false,
      idempotencyKey: "key-01",
    },
    {
      id: "att-01-PT01",
      runId: "sess-01",
      scenarioId: "PT01",
      scenarioVersion: "1.0.0",
      scoringVersion: "1.0.0",
      primaryIV: "IV2",
      attemptNumber: 1,
      selectedAction: "Directly send your student registration number and faculty ID.",
      correct: false,
      points: 0,
      privacyRiskScore: 3,
      unsafe: true,
      disclosedInfoCategory: "Student ID & Faculty Credentials",
      elapsedMs: 8200,
      presentedOrder: 2,
      createdAt: "2026-10-30T09:18:00Z",
      practice: false,
      idempotencyKey: "key-02",
    },
  ];

  const MOCK_SESSIONS: Session[] = [
    {
      id: "sess-01",
      submissionId: "sess-01",
      participantId: "PART-001",
      code: "001",
      mode: "research",
      status: "submitted_complete",
      createdAt: "2026-10-30T09:00:00Z",
      submittedAt: "2026-10-30T09:25:00Z",
      draftExpiresAt: "2026-11-06T09:00:00Z",
      withdrawDeadline: "2026-11-29T09:00:00Z",
      instrumentVersion: "1.0.0",
      consentVersion: "1.0.0",
      priorExposure: false,
      assignedModuleOrder: ["phishing", "pretexting", "impersonation", "links"],
      answers: {
        Q1: { value: 1, status: "answered" },
        Q2: { value: 2, status: "answered" },
      },
      attempts: MOCK_ATTEMPTS,
    },
  ];

  describe("1. CSS Multi-Device Coverage for User Responses", () => {
    it("includes responsive rules covering the complete device spectrum for user responses", () => {
      // Micro mobile (320px - 360px)
      expect(css).toContain("@media (max-width: 360px)");

      // Standard mobile (375px - 480px)
      expect(css).toContain("@media (max-width: 480px)");

      // Phablets & small tablets (640px)
      expect(css).toContain("@media (max-width: 640px)");

      // Portrait tablets (768px)
      expect(css).toContain("@media (max-width: 768px)");

      // Tablet landscape & laptops (1024px)
      expect(css).toContain("@media (min-width: 769px) and (max-width: 1024px)");

      // Desktops & Ultrawide (1441px+)
      expect(css).toContain("@media (min-width: 1441px)");
    });

    it("verifies single column challenge card grid on mobile to eliminate horizontal blowout", () => {
      expect(css).toContain("grid-template-columns: 1fr !important");
      expect(css).toContain(".challenges-grid");
      expect(css).toContain(".challenge-decision-card");
    });

    it("verifies mobile touch target compliance (min-height >= 44px) for controls", () => {
      expect(css).toContain("min-height: 44px !important");
      expect(css).toContain(".view-mode-pill-btn");
      expect(css).toContain(".dossier-tab-btn");
      expect(css).toContain("select.workspace-select");
    });

    it("verifies iOS Safari zoom prevention (16px font-size on mobile inputs)", () => {
      expect(css).toContain("font-size: 16px !important");
      expect(css).toContain(".workspace-search-box input");
    });

    it("verifies responsive sticky column table styles and mobile swipe hint", () => {
      expect(css).toContain(".table-mobile-hint");
      expect(css).toContain(".sticky-col-header");
      expect(css).toContain(".sticky-col-cell");
      expect(css).toContain("min-width: 860px !important");
    });
  });

  describe("2. Admin Responses Tab Rendering & Multi-Device Elements", () => {
    it("renders the Responses tab with responsive stat strip, filter bar, and participant view", () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Admin, {
            sessions: MOCK_SESSIONS,
            demo: false,
            path: ["responses"],
            scenarios: [],
          })
        )
      );

      // Stat banner
      expect(html).toContain("workspace-stat-strip");
      expect(html).toContain("Total Decisions Recorded");
      expect(html).toContain("Unique Participants");
      expect(html).toContain("Protective Decision Rate");

      // Title & View mode switcher
      expect(html).toContain("Original Participant Responses");
      expect(html).toContain("view-mode-pill-group");
      expect(html).toContain("By Participant");
      expect(html).toContain("Audit Table");

      // Toolbar & Inputs
      expect(html).toContain("workspace-toolbar");
      expect(html).toContain("workspace-filter-inputs");
      expect(html).toContain("workspace-search-box");
      expect(html).toContain("workspace-select");

      // Participant group card & header
      expect(html).toContain("participant-group-card");
      expect(html).toContain("participant-group-header");
      expect(html).toContain("participant-header-meta");
      expect(html).toContain("participant-header-actions");
      expect(html).toContain("participant-summary-bar");

      // Challenges & decisions
      expect(html).toContain("challenges-container");
      expect(html).toContain("challenges-grid");
      expect(html).toContain("challenge-decision-card");
      expect(html).toContain("challenge-card-header");
      expect(html).toContain("challenge-title-text");
      expect(html).toContain("challenge-action-quote");
      expect(html).toContain("challenge-card-footer");
    });

    it("renders the Submission History tab with responsive dossier and mobile hint", () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Admin, {
            sessions: MOCK_SESSIONS,
            demo: false,
            path: ["history"],
            scenarios: [],
          })
        )
      );

      expect(html).toContain("Participant Submission History");
      expect(html).toContain("table-mobile-hint");
      expect(html).toContain("table-scroll");
      expect(html).toContain("sticky-col-header");
      expect(html).toContain("sticky-col-cell");
    });
  });

  describe("3. Participant Review & Debrief Screen Responsiveness", () => {
    it("renders Review screen with responsive layout and touch-accessible actions", () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Review)
        )
      );

      // Challenge Complete debrief view
      expect(html).toContain("Challenge Complete!");
      expect(html).toContain("Your Game Performance");
      expect(html).toContain("A CLOSER LOOK");
      expect(html).toContain("Every email tells a story");

      // Responsive touch actions
      expect(html).toContain("Return to Cyber Campus Home");
      expect(html).toContain("Submit Responses");
    });
  });
});
