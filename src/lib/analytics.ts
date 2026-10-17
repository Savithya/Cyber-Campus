import { questions } from "@/content/questionnaire";
import type { Filters, Question, Session } from "./types";
export function filterSessions(
  sessions: Session[],
  f: Filters,
  submittedOnly = true,
) {
  return sessions.filter(
    (s) =>
      (!submittedOnly || s.status !== "draft") &&
      s.mode !== "practice" &&
      (!f.code ||
        s.code.toLowerCase().includes(f.code.toLowerCase()) ||
        (s.submissionId ?? s.id).toLowerCase().includes(f.code.toLowerCase())) &&
      (!f.from ||
        Date.parse(s.submittedAt ?? s.createdAt) >=
          Date.parse(f.from + "T00:00:00+05:30")) &&
      (!f.to ||
        Date.parse(s.submittedAt ?? s.createdAt) <=
          Date.parse(f.to + "T23:59:59.999+05:30")) &&
      (!f.exposure || String(s.priorExposure) === f.exposure) &&
      (!f.status || s.status === f.status) &&
      (["Q1", "Q2", "Q3", "Q4", "Q5"] as const).every(
        (q) => !f[q] || s.answers[q]?.value === Number(f[q]),
      ),
  );
}
export const describeFilters = (f: Filters) =>
  Object.entries(f)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const q = questions.find((q) => q.id === k);
      return q
        ? q.variable +
            ": " +
            (q.options.find((o) => o.code === Number(v))?.label ?? v)
        : k + ": " + v;
    })
    .join("; ") || "All submitted participants";
export function aggregateQuestion(q: Question, sessions: Session[]) {
  const valid = sessions.filter(
    (s) =>
      s.answers[q.id]?.status === "answered" &&
      q.options.some((o) => o.code === s.answers[q.id]?.value),
  );
  const missing = sessions.length - valid.length;
  return {
    validN: valid.length,
    missingN: missing,
    totalN: sessions.length,
    rows: q.options.map((o) => {
      const count = valid.filter(
        (s) => s.answers[q.id].value === o.code,
      ).length;
      return {
        ...o,
        count,
        percentage: valid.length ? (100 * count) / valid.length : 0,
      };
    }),
  };
}
export const colomboTime = (s: string | null) =>
  s
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Colombo",
      }).format(new Date(s))
    : "—";
