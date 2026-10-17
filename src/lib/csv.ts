import { questions, INSTRUMENT_VERSION } from "@/content/questionnaire";
import { aggregateQuestion, describeFilters } from "./analytics";
import { computeThreatMetrics } from "./scoring";
import type { Filters, Session } from "./types";
export type Cell = string | number | boolean | null | undefined;
export function csvCell(value: Cell) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  let text = String(value);
  // Prefix potentially executable text; numeric columns remain numeric.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function toCsv(rows: Cell[][]) {
  return (
    "\uFEFF" +
    rows.map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
export const exportKinds = [
  "responses-wide",
  "responses-long",
  "game-attempts",
  "threat-metrics",
  "question-summary",
  "codebook",
] as const;
export type ExportKind = (typeof exportKinds)[number];
export function exportCsv(
  kind: ExportKind,
  sessions: Session[],
  filters: Filters,
  demo = false,
) {
  const source = demo ? "synthetic_demo" : "research";
  const meta = [
    source,
    describeFilters(filters),
    "submitted only; drafts, withdrawn, practice-only excluded",
  ];
  const rows: Cell[][] = [];
  if (kind === "responses-wide") {
    rows.push([
      "participant_code",
      "instrument_version",
      "consent_version",
      "status",
      "created_at_utc",
      "submitted_at_utc",
      "known_prior_exposure",
      ...questions.flatMap((q) => [
        q.id + "_code",
        q.id + "_label",
        q.id + "_missing_status",
      ]),
      "answered_count",
      "missing_count",
      "data_source",
      "active_filters",
      "inclusion_rules",
    ]);
    for (const s of sessions) {
      const answered = Object.values(s.answers).filter(
        (a) => a.status === "answered",
      ).length;
      rows.push([
        s.code,
        s.instrumentVersion,
        s.consentVersion,
        s.status,
        s.createdAt,
        s.submittedAt,
        s.priorExposure,
        ...questions.flatMap((q) => {
          const a = s.answers[q.id];
          return [
            a?.value,
            q.options.find((o) => o.code === a?.value)?.label ?? "",
            a?.status ?? "not_answered",
          ];
        }),
        answered,
        25 - answered,
        ...meta,
      ]);
    }
  } else if (kind === "responses-long") {
    rows.push([
      "participant_code",
      "instrument_version",
      "consent_version",
      "submitted_at_utc",
      "question_id",
      "section",
      "variable_role",
      "variable",
      "dimension",
      "code",
      "label",
      "missing_status",
      "data_source",
      "active_filters",
      "inclusion_rules",
    ]);
    for (const s of sessions)
      for (const q of questions) {
        const a = s.answers[q.id];
        rows.push([
          s.code,
          s.instrumentVersion,
          s.consentVersion,
          s.submittedAt,
          q.id,
          q.section,
          q.role,
          q.variable,
          q.dimension,
          a?.value,
          q.options.find((o) => o.code === a?.value)?.label ?? "",
          a?.status ?? "not_answered",
          ...meta,
        ]);
      }
  } else if (kind === "game-attempts") {
    rows.push([
      "participant_code",
      "run_id",
      "scenario_id",
      "scenario_version",
      "scoring_version",
      "primary_iv",
      "presented_order",
      "attempt_number",
      "selected_action",
      "correct",
      "points",
      "privacy_risk_score",
      "unsafe_decision",
      "disclosed_info_category",
      "elapsed_ms",
      "created_at_utc",
      "practice_or_research",
      "data_source",
      "active_filters",
      "inclusion_rules",
    ]);
    for (const s of sessions)
      for (const a of s.attempts)
        rows.push([
          s.code,
          a.runId,
          a.scenarioId,
          a.scenarioVersion,
          a.scoringVersion,
          a.primaryIV,
          a.presentedOrder,
          a.attemptNumber,
          a.selectedAction,
          a.correct,
          a.points,
          a.privacyRiskScore ?? (a.correct ? 0 : 3),
          a.unsafe ? 1 : 0,
          a.disclosedInfoCategory ?? (a.correct ? "None" : "Simulated Disclosure"),
          a.elapsedMs,
          a.createdAt,
          a.practice ? "practice_retry" : "research_first_attempt",
          ...meta,
        ]);
  } else if (kind === "threat-metrics") {
    rows.push([
      "participant_code",
      "submission_id",
      "status",
      "submitted_at_utc",
      "assigned_module_order",
      "iv1_phishing_risk_score",
      "iv1_phishing_unsafe_rate",
      "iv2_pretexting_risk_score",
      "iv2_pretexting_unsafe_rate",
      "iv3_impersonation_risk_score",
      "iv3_impersonation_unsafe_rate",
      "iv4_scams_risk_score",
      "iv4_scams_unsafe_rate",
      "iv5_deepfake_risk_score",
      "iv5_deepfake_unsafe_rate",
      "overall_simulated_privacy_risk_score",
      "overall_unsafe_decision_rate",
      "challenges_completed",
      "data_source",
      "active_filters",
      "inclusion_rules",
    ]);
    for (const s of sessions) {
      const summary = computeThreatMetrics(s.attempts ?? []);
      const m1 = summary.metrics.find((m) => m.primaryIV === "IV1");
      const m2 = summary.metrics.find((m) => m.primaryIV === "IV2");
      const m3 = summary.metrics.find((m) => m.primaryIV === "IV3");
      const m4 = summary.metrics.find((m) => m.primaryIV === "IV4");
      const m5 = summary.metrics.find((m) => m.primaryIV === "IV5");
      const firstOnly = (s.attempts ?? []).filter((a) => a.attemptNumber === 1 && a.selectedAction !== null);
      const unsafeCount = firstOnly.filter((a) => a.unsafe).length;
      const overallUnsafeRate = firstOnly.length ? Math.round((unsafeCount / firstOnly.length) * 100) : 0;
      rows.push([
        s.code,
        s.submissionId ?? s.id,
        s.status,
        s.submittedAt,
        s.assignedModuleOrder ? s.assignedModuleOrder.join("->") : "default",
        m1?.privacyRiskScore ?? 0,
        m1?.unsafeRate ?? 0,
        m2?.privacyRiskScore ?? 0,
        m2?.unsafeRate ?? 0,
        m3?.privacyRiskScore ?? 0,
        m3?.unsafeRate ?? 0,
        m4?.privacyRiskScore ?? 0,
        m4?.unsafeRate ?? 0,
        m5?.privacyRiskScore ?? 0,
        m5?.unsafeRate ?? 0,
        summary.overallPrivacyRiskScore,
        overallUnsafeRate,
        firstOnly.length,
        ...meta,
      ]);
    }
  } else if (kind === "question-summary") {
    rows.push([
      "question_id",
      "question_text",
      "section",
      "variable_role",
      "dimension",
      "code",
      "label",
      "count",
      "percentage_of_valid",
      "valid_n",
      "missing_n",
      "data_source",
      "active_filters",
      "inclusion_rules",
    ]);
    for (const q of questions) {
      const a = aggregateQuestion(q, sessions);
      for (const r of a.rows)
        rows.push([
          q.id,
          q.text,
          q.section,
          q.role,
          q.dimension ?? q.variable,
          r.code,
          r.label,
          r.count,
          Number(r.percentage.toFixed(4)),
          a.validN,
          a.missingN,
          ...meta,
        ]);
    }
  } else {
    rows.push([
      "instrument_version",
      "question_id",
      "question_text",
      "section",
      "variable_role",
      "variable",
      "dimension",
      "type",
      "scale",
      "code",
      "exact_label",
      "coding_level",
      "missing_rule",
      "text_sanitisation",
    ]);
    for (const q of questions)
      for (const o of q.options)
        rows.push([
          INSTRUMENT_VERSION,
          q.id,
          q.text,
          q.section,
          q.role,
          q.variable,
          q.dimension,
          q.type,
          q.scale,
          o.code,
          o.label,
          q.scale === "EXPERIENCE" || ["Q2", "Q4", "Q5"].includes(q.id)
            ? "nominal category"
            : q.scale === "FREQUENCY"
              ? "ordered category, not exact count"
              : q.type === "scale"
                ? "original 1–5 rating"
                : "ordered category",
          "Blank code and label; separate skipped/not_answered status. Not sure, Other and Prefer not to say are valid.",
          "Formula-like text is prefixed with an apostrophe. Numeric code columns are unchanged.",
        ]);
  }
  return toCsv(rows);
}
