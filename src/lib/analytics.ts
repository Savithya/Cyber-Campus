import { questions } from "@/content/questionnaire";
import type { Filters, Question, Session } from "./types";
export function filterSessions(
  sessions: Session[],
  f: Filters,
  submittedOnly = true,
) {
  return sessions.filter((s) => {
    if (s.mode === "practice") return false;

    // Status filter
    const isDraft = s.status === "draft";
    if (f.status === "completed") {
      if (isDraft) return false;
    } else if (f.status === "in_progress" || f.status === "draft") {
      if (!isDraft) return false;
    } else if (f.status && f.status !== "" && f.status !== "all") {
      if (s.status !== f.status) return false;
    } else {
      // Default: when submittedOnly is true and status isn't specified, exclude drafts
      if (submittedOnly && isDraft) return false;
    }

    // Participant code or submission ID search
    if (f.code && f.code.trim()) {
      const q = f.code.trim().toLowerCase();
      const codeMatch = s.code.toLowerCase().includes(q);
      const subIdMatch = (s.submissionId ?? s.id).toLowerCase().includes(q);
      const partIdMatch = (s.participantId ?? "").toLowerCase().includes(q);
      if (!codeMatch && !subIdMatch && !partIdMatch) return false;
    }

    // Date range filter in Asia/Colombo
    const timestamp = Date.parse(s.submittedAt ?? s.createdAt);
    if (f.from && !isNaN(timestamp)) {
      if (timestamp < Date.parse(f.from + "T00:00:00+05:30")) return false;
    }
    if (f.to && !isNaN(timestamp)) {
      if (timestamp > Date.parse(f.to + "T23:59:59.999+05:30")) return false;
    }

    // Known prior practice
    if (f.exposure && f.exposure !== "" && f.exposure !== "all") {
      if (String(s.priorExposure) !== f.exposure) return false;
    }

    // Demographic questions Q1..Q5 (supports historical Q5 filters)
    const demoQuestions = ["Q1", "Q2", "Q3", "Q4", "Q5"] as const;
    for (const q of demoQuestions) {
      if (f[q] && f[q] !== "" && f[q] !== "all") {
        if (s.answers[q]?.value !== Number(f[q])) return false;
      }
    }

    // Cyber Mission filter
    if (f.mission && f.mission !== "" && f.mission !== "all") {
      const missionIvMap: Record<string, string> = {
        phishing: "IV1",
        pretexting: "IV2",
        impersonation: "IV3",
        links: "IV4",
        IV1: "IV1",
        IV2: "IV2",
        IV3: "IV3",
        IV4: "IV4",
      };
      const targetIv = missionIvMap[f.mission] || f.mission;
      const hasMission = (s.attempts || []).some(
        (a) => a.primaryIV === targetIv && a.selectedAction !== null,
      );
      if (!hasMission) return false;
    }

    return true;
  });
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
