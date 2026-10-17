import type { Attempt, ThreatMetric, ScenarioChoice } from "./types";
import { missions } from "@/content/missions";

export function scoreDecision(
  action: string | null,
  correctActionOrKey: string | { action: string; privacyRiskScore?: number },
  first: boolean,
  choices?: ScenarioChoice[],
) {
  const correctAction =
    typeof correctActionOrKey === "string"
      ? correctActionOrKey
      : correctActionOrKey.action;

  const correct = action === null ? null : action === correctAction;
  const points = first && action === correctAction ? 10 : 0;

  // Determine privacy risk score (0..4), unsafe indicator, and disclosed info category
  let privacyRiskScore = 0;
  let unsafe = false;
  let disclosedInfoCategory = "None";

  if (action === null) {
    // Skipped
    privacyRiskScore = 0;
    unsafe = false;
    disclosedInfoCategory = "None";
  } else if (choices && choices.length > 0) {
    const selected = choices.find((c) => c.id === action);
    if (selected) {
      privacyRiskScore = selected.privacyRiskScore;
      unsafe = selected.unsafe;
      disclosedInfoCategory = selected.disclosedInfoCategory;
    } else {
      privacyRiskScore = correct ? 0 : 3;
      unsafe = !correct;
      disclosedInfoCategory = correct ? "None" : "Unspecified";
    }
  } else {
    // Fallback if choices not supplied directly
    privacyRiskScore = correct ? 0 : 3;
    unsafe = !correct;
    disclosedInfoCategory = correct ? "None" : "Simulated Disclosure";
  }

  return {
    correct,
    points,
    privacyRiskScore,
    unsafe,
    disclosedInfoCategory,
  };
}

export function scoreSummary(attempts: Attempt[]) {
  const first = attempts.filter((a) => a.attemptNumber === 1);
  const attempted = first.filter((a) => a.selectedAction !== null);
  const correct = attempted.filter((a) => a.correct === true).length;
  return {
    points: first.reduce((s, a) => s + (a.points ?? 0), 0),
    completed: first.length,
    attempted: attempted.length,
    skipped: first.length - attempted.length,
    correct,
    accuracy: attempted.length ? (correct / attempted.length) * 100 : null,
  };
}

/**
 * Operative Rank based on educational XP points.
 * XP is awarded for completing research scenarios without biasing privacy-risk measurement.
 */
export function getOperativeRank(xp: number) {
  if (xp >= 200) return { title: "Master Privacy Architect", level: 4, badge: "Master Sentinel" };
  if (xp >= 140) return { title: "Cyber Defense Specialist", level: 3, badge: "Defense Specialist" };
  if (xp >= 70) return { title: "Threat Investigator", level: 2, badge: "Investigator" };
  return { title: "Cyber Recruit", level: 1, badge: "Recruit" };
}

/**
 * Computes threat-level metrics for all 5 threat categories:
 * Threat Privacy Risk Score = (Total Risk Points Obtained / Total Applicable Maximum Risk Points) * 100
 * Higher score = Greater observed simulated privacy-risk behavior.
 */
export function computeThreatMetrics(attempts: Attempt[]): {
  metrics: ThreatMetric[];
  overallPrivacyRiskScore: number;
  highestThreat: ThreatMetric | null;
} {
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);

  const metrics: ThreatMetric[] = missions.map((m) => {
    const missionAttempts = firstAttempts.filter((a) => a.primaryIV === m.iv);
    const attemptedOnly = missionAttempts.filter((a) => a.selectedAction !== null);

    const totalRiskPoints = attemptedOnly.reduce(
      (sum, a) => sum + (a.privacyRiskScore ?? (a.correct === false ? 3 : 0)),
      0,
    );

    // Max risk points is 4 points per applicable attempted or total 5 scenarios in module (5 * 4 = 20)
    const maxRiskPoints = Math.max(1, (attemptedOnly.length || 5) * 4);
    const privacyRiskScore = Math.min(100, Math.round((totalRiskPoints / maxRiskPoints) * 100));

    const unsafeCount = attemptedOnly.filter((a) => a.unsafe === true).length;
    const unsafeRate = attemptedOnly.length
      ? Math.round((unsafeCount / attemptedOnly.length) * 100)
      : 0;

    const meanPrivacyRisk = attemptedOnly.length
      ? Number((totalRiskPoints / attemptedOnly.length).toFixed(2))
      : 0;

    // Standard deviation
    const variance = attemptedOnly.length > 1
      ? attemptedOnly.reduce((sum, a) => {
          const diff = (a.privacyRiskScore ?? 0) - meanPrivacyRisk;
          return sum + diff * diff;
        }, 0) / (attemptedOnly.length - 1)
      : 0;
    const stdDevPrivacyRisk = Number(Math.sqrt(variance).toFixed(2));

    // 95% Confidence Interval for the mean
    const se = attemptedOnly.length > 0 ? stdDevPrivacyRisk / Math.sqrt(attemptedOnly.length) : 0;
    const ciLow = Math.max(0, Number((meanPrivacyRisk - 1.96 * se).toFixed(2)));
    const ciHigh = Math.min(4, Number((meanPrivacyRisk + 1.96 * se).toFixed(2)));

    return {
      threatKey: m.id,
      threatName: m.name,
      primaryIV: m.iv,
      totalAttempts: missionAttempts.length,
      completedAttempts: attemptedOnly.length,
      unsafeCount,
      unsafeRate,
      totalRiskPoints,
      maxRiskPoints,
      privacyRiskScore,
      meanPrivacyRisk,
      stdDevPrivacyRisk,
      confidenceInterval95: [ciLow, ciHigh],
      ciLow,
      ciHigh,
    };
  });

  const totalPointsAll = metrics.reduce((s, m) => s + m.totalRiskPoints, 0);
  const maxPointsAll = metrics.reduce((s, m) => s + m.maxRiskPoints, 0);
  const overallPrivacyRiskScore = maxPointsAll > 0
    ? Math.round((totalPointsAll / maxPointsAll) * 100)
    : 0;

  const validMetrics = metrics.filter((m) => m.completedAttempts > 0);
  const highestThreat = validMetrics.length > 0
    ? [...validMetrics].sort((a, b) => b.privacyRiskScore - a.privacyRiskScore)[0]
    : null;

  return {
    metrics,
    overallPrivacyRiskScore,
    highestThreat,
  };
}
