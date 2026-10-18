import "server-only";
import { questions } from "@/content/questionnaire";
import { blankAnswers } from "./validation";
import type { Session, Attempt } from "./types";
import { scenarios } from "@/content/scenarios.server";

export function syntheticSessions(): Session[] {
  const moduleOrders = [
    ["phishing", "pretexting", "impersonation", "links"],
    ["pretexting", "impersonation", "links", "phishing"],
    ["impersonation", "links", "phishing", "pretexting"],
    ["links", "phishing", "pretexting", "impersonation"],
  ];

  return Array.from({ length: 48 }, (_, i) => {
    const complete = i < 42;
    const answers = blankAnswers();

    // Populate demographic questions Q1-Q5 and remaining questions
    for (const q of questions) {
      if (complete || q.number < 8) {
        answers[q.id] =
          i % 7 === 0 && q.number % 6 === 0
            ? { value: null, status: "skipped" }
            : {
                value:
                  ((i * 7 + q.number * 3 + Math.floor(i / 5)) %
                    q.options.length) +
                  1,
                status: "answered",
              };
      }
    }

    const created = new Date(Date.UTC(2026, 8, 1 + (i % 28), 4, i));
    const scenarioCount = complete
      ? 20
      : i % 4 === 0
        ? 8
        : i % 3 === 0
          ? 12
          : 16;

    const attempts: Attempt[] =
      i < 44
        ? scenarios.slice(0, scenarioCount).map((sc, j) => {
            const isSkipped = (i + j) % 17 === 0;
            // Realistic accuracy: ~62% safe across student sample
            const isCorrect = !isSkipped && (i * 3 + j * 5) % 10 < 6;
            const points = isCorrect ? 10 : 0;

            let privacyRiskScore = 0;
            let unsafe = false;
            let disclosedInfoCategory = "None";
            let selectedAction: string | null = null;

            if (isSkipped) {
              selectedAction = null;
              privacyRiskScore = 0;
              unsafe = false;
              disclosedInfoCategory = "None";
            } else if (isCorrect) {
              const safeChoice = sc.choices.find((c) => c.privacyRiskScore === 0);
              selectedAction = safeChoice ? safeChoice.id : "verify";
              privacyRiskScore = 0;
              unsafe = false;
              disclosedInfoCategory = "None";
            } else {
              // Unsafe response
              const riskyChoices = sc.choices.filter((c) => c.privacyRiskScore > 0);
              const chosen =
                riskyChoices.length > 0
                  ? riskyChoices[(i + j) % riskyChoices.length]
                  : null;
              selectedAction = chosen ? chosen.id : "disclose_credentials";
              privacyRiskScore = chosen ? chosen.privacyRiskScore : 3;
              unsafe = true;
              disclosedInfoCategory = chosen
                ? chosen.disclosedInfoCategory
                : sc.primaryIV === "IV1"
                  ? "Account Credentials"
                  : sc.primaryIV === "IV2"
                    ? "Personal Identification"
                    : sc.primaryIV === "IV3"
                      ? "Academic Research Data"
                      : sc.primaryIV === "IV4"
                        ? "Financial Payment Cards"
                        : "Biometric & NIC Scans";
            }

            return {
              id: "synthetic-" + i + "-" + j,
              runId: "demo-run-" + i,
              scenarioId: sc.id,
              scenarioVersion: sc.version,
              scoringVersion: "2.0.0",
              primaryIV: sc.primaryIV,
              attemptNumber: 1,
              selectedAction,
              correct: isSkipped ? null : isCorrect,
              points,
              privacyRiskScore,
              unsafe,
              disclosedInfoCategory,
              elapsedMs: 12000 + ((i * 17 + j * 29) % 35000),
              presentedOrder: j + 1,
              createdAt: new Date(+created + 600000 + j * 30000).toISOString(),
              practice: false,
              idempotencyKey: "synthetic-" + i + "-" + j,
            };
          })
        : [];

    return {
      id: "synthetic-" + i,
      code: String(i + 1).padStart(3, "0"),
      mode: "demo",
      status: !complete
        ? "draft"
        : i % 7 === 0
          ? "submitted_with_missing"
          : "submitted_complete",
      createdAt: created.toISOString(),
      submittedAt: complete ? new Date(+created + 500000).toISOString() : null,
      draftExpiresAt: new Date(+created + 7 * 86400000).toISOString(),
      withdrawDeadline: new Date(+created + 30 * 86400000).toISOString(),
      instrumentVersion: "1.0.0",
      consentVersion: "1.0.0",
      priorExposure: i % 8 === 0,
      assignedModuleOrder: moduleOrders[i % moduleOrders.length],
      answers,
      attempts,
    };
  });
}
