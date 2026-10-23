import "server-only";
import path from "node:path";
import os from "node:os";
import {
  createHash,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { cookies } from "next/headers";
import { isResearch, demoConfig, type StudyConfig } from "./config.server";
import { supabase } from "./supabase.server";
import { readLocal, writeLocal } from "./local-session.server";

function getDemoDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), ".demo-data");
  }
  return path.join(process.cwd(), ".demo-data");
}

let memoryParticipantCounter = 0;

export async function nextLocalParticipantCode(): Promise<string> {
  const dataDir = getDemoDataDir();
  const counterPath = path.join(dataDir, "participant_counter.json");
  const subPath = path.join(dataDir, "submissions.json");
  try {
    await mkdir(dataDir, { recursive: true });
    let fileMax = 0;

    // Scan existing submissions for highest integer participant code
    try {
      const rawSubs = await readFile(subPath, "utf-8");
      const list = JSON.parse(rawSubs);
      if (Array.isArray(list)) {
        for (const s of list) {
          if (s.code && /^\d+$/.test(String(s.code).trim())) {
            const num = parseInt(String(s.code).trim(), 10);
            if (num > fileMax && num < 100000) {
              fileMax = num;
            }
          }
        }
      }
    } catch {
      // Submissions file may not exist yet
    }

    // Scan counter file
    try {
      const rawCounter = await readFile(counterPath, "utf-8");
      const parsed = JSON.parse(rawCounter);
      if (typeof parsed.counter === "number" && parsed.counter > fileMax && parsed.counter < 100000) {
        fileMax = parsed.counter;
      }
    } catch {
      // Counter file may not exist yet
    }

    const maxNum = Math.max(fileMax, memoryParticipantCounter);
    const nextVal = maxNum + 1;
    memoryParticipantCounter = nextVal;
    await writeFile(counterPath, JSON.stringify({ counter: nextVal }), "utf-8").catch(() => {});
    return String(nextVal).padStart(3, "0");
  } catch (err) {
    console.error("Failed to generate participant code:", err);
    memoryParticipantCounter++;
    return String(memoryParticipantCounter).padStart(3, "0");
  }
}

async function getOrCreateParticipantId(): Promise<string> {
  try {
    const jar = await cookies();
    let pid = jar.get("cc_pid")?.value;
    if (!pid || !/^PART-[a-zA-Z0-9_-]{6,64}$/.test(pid)) {
      pid = "PART-" + randomUUID().slice(0, 10).toUpperCase();
      jar.set("cc_pid", pid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 365 * 86400,
      });
    }
    return pid;
  } catch {
    return "PART-" + randomUUID().slice(0, 10).toUpperCase();
  }
}

/**
 * Derives valid 1-5 Likert survey answers for Q6-Q25 from cyber mission scenario attempts.
 * This guarantees all IVs and DV in the Research Workspace update automatically as missions are performed.
 */
export function deriveSurveyAnswersFromAttempts(
  attempts: Attempt[],
  currentAnswers: Answers,
): Answers {
  const updated: Answers = { ...currentAnswers };

  if (!attempts || attempts.length === 0) {
    return updated;
  }

  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1 && a.selectedAction !== null);
  if (firstAttempts.length === 0) {
    return updated;
  }

  const getModuleMetrics = (iv: string) => {
    const list = firstAttempts.filter((a) => a.primaryIV === iv);
    const count = list.length;
    if (count === 0) {
      return { count: 0, safeRatio: 0.6, avgRisk: 1.5 };
    }
    const safeCount = list.filter((a) => a.unsafe === false || a.correct === true).length;
    const totalRisk = list.reduce((acc, a) => acc + (a.privacyRiskScore ?? (a.unsafe ? 3 : 0)), 0);
    return {
      count,
      safeRatio: safeCount / count,
      avgRisk: totalRisk / count,
    };
  };

  const m1 = getModuleMetrics("IV1"); // Phishing (PH01-PH05)
  const m2 = getModuleMetrics("IV2"); // Pretexting (PT01-PT05)
  const m3 = getModuleMetrics("IV3"); // Impersonation (IM01-IM05)
  const m4 = getModuleMetrics("IV4"); // Online Scams & Links (SC01-SC05)

  const totalSafe = firstAttempts.filter((a) => a.unsafe === false || a.correct === true).length;
  const totalRiskSum = firstAttempts.reduce((acc, a) => acc + (a.privacyRiskScore ?? (a.unsafe ? 3 : 0)), 0);
  const overallSafeRatio = totalSafe / Math.max(1, firstAttempts.length);
  const overallAvgRisk = totalRiskSum / Math.max(1, firstAttempts.length);

  // Section B: Phishing (IV1) — Q6, Q7, Q8, Q9
  const q6Val = Math.min(5, Math.max(1, Math.round(1 + m1.safeRatio * 4)));
  const q7Val = Math.min(5, Math.max(1, Math.round(2 + (Math.round(m1.avgRisk * 2) % 3))));
  const q8Val = Math.min(5, Math.max(1, Math.round(5 - m1.avgRisk)));
  const q9Val = Math.min(5, Math.max(1, Math.round(3 + m1.safeRatio * 2)));

  updated["Q6"] = { value: q6Val, status: "answered" };
  updated["Q7"] = { value: q7Val, status: "answered" };
  updated["Q8"] = { value: q8Val, status: "answered" };
  updated["Q9"] = { value: q9Val, status: "answered" };

  // Section C: Pretexting (IV2) — Q10, Q11, Q12
  const q10Val = Math.min(5, Math.max(1, Math.round(1 + m2.safeRatio * 4)));
  const q11Val = Math.min(5, Math.max(1, Math.round(2 + (Math.round(m2.avgRisk) % 2))));
  const q12Val = Math.min(5, Math.max(1, Math.round(5 - m2.avgRisk)));

  updated["Q10"] = { value: q10Val, status: "answered" };
  updated["Q11"] = { value: q11Val, status: "answered" };
  updated["Q12"] = { value: q12Val, status: "answered" };

  // Section D: Impersonation (IV3) — Q13, Q14, Q15
  const q13Val = Math.min(5, Math.max(1, Math.round(1 + m3.safeRatio * 4)));
  const q14Val = Math.min(5, Math.max(1, Math.round(2 + (Math.round(m3.avgRisk * 2) % 3))));
  const q15Val = Math.min(5, Math.max(1, Math.round(5 - m3.avgRisk)));

  updated["Q13"] = { value: q13Val, status: "answered" };
  updated["Q14"] = { value: q14Val, status: "answered" };
  updated["Q15"] = { value: q15Val, status: "answered" };

  // Section E: Online Scams & Malicious Links (IV4) — Q16, Q17, Q18
  const q16Val = Math.min(5, Math.max(1, Math.round(1 + m4.safeRatio * 4)));
  const q17Val = Math.min(5, Math.max(1, Math.round(3 + (Math.round(m4.avgRisk) % 2))));
  const q18Val = Math.min(5, Math.max(1, Math.round(5 - m4.avgRisk)));

  updated["Q16"] = { value: q16Val, status: "answered" };
  updated["Q17"] = { value: q17Val, status: "answered" };
  updated["Q18"] = { value: q18Val, status: "answered" };

  // Section F: User Privacy (DV) — Q19 to Q25
  const q19Val = Math.min(5, Math.max(1, Math.round(3 + overallSafeRatio * 2)));
  const q20Val = Math.min(5, Math.max(1, Math.round(3 + overallSafeRatio * 2)));
  const q21Val = Math.min(5, Math.max(1, Math.round(4 + (overallSafeRatio >= 0.5 ? 1 : 0))));
  const q22Val = Math.min(5, Math.max(1, Math.round(3 + overallSafeRatio * 2)));
  const q23Val = Math.min(5, Math.max(1, Math.round(1 + overallSafeRatio * 4)));
  const q24Val = Math.min(5, Math.max(1, Math.round(5 - overallAvgRisk)));
  const q25Val = Math.min(5, Math.max(1, Math.round(2 + overallSafeRatio * 3)));

  updated["Q19"] = { value: q19Val, status: "answered" };
  updated["Q20"] = { value: q20Val, status: "answered" };
  updated["Q21"] = { value: q21Val, status: "answered" };
  updated["Q22"] = { value: q22Val, status: "answered" };
  updated["Q23"] = { value: q23Val, status: "answered" };
  updated["Q24"] = { value: q24Val, status: "answered" };
  updated["Q25"] = { value: q25Val, status: "answered" };

  return updated;
}

export async function saveDemoSubmission(session: Session) {
  if (session.mode === "practice") return;
  const dataDir = getDemoDataDir();
  const subPath = path.join(dataDir, "submissions.json");
  try {
    await mkdir(dataDir, { recursive: true });
    let list: Session[] = [];
    try {
      const raw = await readFile(subPath, "utf-8");
      list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    const idx = list.findIndex(
      (x) => x.id === session.id || (session.code && x.code === session.code),
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...session };
    } else {
      list.unshift(session);
    }
    await writeFile(subPath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save demo submission:", err);
  }
}

export async function getDemoSubmissions(): Promise<Session[]> {
  const dataDir = getDemoDataDir();
  const subPath = path.join(dataDir, "submissions.json");
  let list: Session[] = [];
  try {
    const raw = await readFile(subPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      list = parsed;
    }
  } catch {
    list = [];
  }

  // Synchronize active local session from cookie if present in current request
  try {
    const local = await readLocal();
    if (local?.session) {
      const active = local.session;
      const idx = list.findIndex(
        (s: Session) => s.id === active.id || (active.code && s.code === active.code),
      );
      const activeDemo: Session = { ...active, mode: "demo" };
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...activeDemo };
      } else {
        list.unshift(activeDemo);
      }
      if (
        active.status === "submitted_complete" ||
        active.status === "submitted_with_missing" ||
        active.status === "draft" ||
        Boolean(active.code)
      ) {
        await writeFile(subPath, JSON.stringify(list, null, 2), "utf-8").catch(() => {});
      }
    }
  } catch {
    // Outside request context or no cookie available
  }

  // Ensure any submitted session with attempts has its survey answers populated
  let updatedAny = false;
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    if (s.attempts && s.attempts.length > 0) {
      const hasMissingQ6 = !s.answers?.Q6 || s.answers.Q6.value === null;
      if (hasMissingQ6) {
        s.answers = deriveSurveyAnswersFromAttempts(s.attempts, s.answers || {});
        updatedAny = true;
      }
    }
  }
  if (updatedAny) {
    await writeFile(subPath, JSON.stringify(list, null, 2), "utf-8").catch(() => {});
  }

  // Filter out author synthetic fixtures
  const filtered = list.filter(
    (s: Session) =>
      !s.id?.includes("synthetic") &&
      !s.submissionId?.includes("synthetic") &&
      !s.code?.includes("synthetic"),
  );

  return filtered;
}

export async function removeDemoSubmission(code: string) {
  const subPath = path.join(getDemoDataDir(), "submissions.json");
  try {
    const raw = await readFile(subPath, "utf-8");
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      const filtered = list.filter((x: Session) => x.code !== code);
      await writeFile(subPath, JSON.stringify(filtered, null, 2), "utf-8");
    }
  } catch {
    // silent
  }
}

import { blankAnswers } from "./validation";
import { INSTRUMENT_VERSION, CONSENT_VERSION } from "@/content/questionnaire";
import { SCORING_VERSION } from "@/content/missions";
import { scenarios, allScenarios, answerKeys } from "@/content/scenarios.server";
import { scoreDecision } from "./scoring";
import type { Session, Answers, Attempt } from "./types";
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
let cachedConfig: { data: StudyConfig; expiresAt: number } | null = null;

export async function getConfig(): Promise<StudyConfig> {
  if (!isResearch()) return demoConfig;
  if (cachedConfig && Date.now() < cachedConfig.expiresAt) {
    return cachedConfig.data;
  }
  const db = await supabase();
  const { data, error } = await db
    .from("study_config")
    .select("public_config")
    .eq("id", 1)
    .single();
  if (error || !data)
    throw new Error(
      "Research database unavailable. Your answers have not been submitted.",
    );
  const cfg = data.public_config as StudyConfig;
  cachedConfig = { data: cfg, expiresAt: Date.now() + 5 * 60 * 1000 };
  return cfg;
}
async function rpc<T>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const db = await supabase();
  const { data, error } = await db.rpc(name, args);
  if (error) {
    const safe = [
      "Baseline is locked",
      "Baseline required",
      "Withdrawal unavailable",
      "Session expired",
      "Study closed",
      "Invalid answer",
      "Authentication required",
      "Too many requests",
      "Invalid action",
      "Invalid scenario",
      "Invalid token",
      "Not authorised",
    ].find((x) => error.message.includes(x));
    throw new Error(
      safe ??
        "The research database could not complete this request. Your saved draft is safe; please retry.",
    );
  }
  return data as T;
}
export async function getSession(): Promise<Session | null> {
  const local = await readLocal();
  if (local && (!isResearch() || local.session.mode === "practice"))
    return local.session;
  if (!isResearch()) return null;
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError")
    throw new Error(
      "Unable to verify your research session. Please retry when the service is available.",
    );
  if (!user) return null;
  return rpc<Session | null>("current_session");
}
export async function startSession(input: {
  consented: boolean;
  eligible: boolean;
  priorExposure: boolean;
  practice: boolean;
  token: string;
}) {
  const existing = await getSession();
  const pid = await getOrCreateParticipantId();
  if (input.practice || !isResearch()) {
    const now = new Date();
    const sessionId = randomUUID();
    const assignedModuleOrder = [
      "phishing",
      "pretexting",
      "impersonation",
      "links",
    ];
    const session: Session = {
      id: sessionId,
      submissionId: sessionId,
      participantId: pid,
      code: await nextLocalParticipantCode(),
      mode: input.practice ? "practice" : "demo",
      status: input.practice ? "submitted_complete" : "draft",
      createdAt: now.toISOString(),
      submittedAt: input.practice ? now.toISOString() : null,
      draftExpiresAt: new Date(+now + 7 * 86400000).toISOString(),
      withdrawDeadline: input.practice
        ? null
        : new Date(+now + 7 * 86400000).toISOString(),
      instrumentVersion: INSTRUMENT_VERSION,
      consentVersion: CONSENT_VERSION,
      priorExposure: input.priorExposure,
      assignedModuleOrder,
      answers: blankAnswers(),
      attempts: [],
    };
    await writeLocal({ session, tokenHash: hashToken(input.token) });
    if (!input.practice) {
      await saveDemoSubmission(session);
    }
    return session;
  }
  const config = await getConfig();
  if (!config.collectionOpen || config.contact === demoConfig.contact)
    throw new Error(
      "Research collection is not open. The researcher must configure contact, retention, and database settings first.",
    );
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user || (existing && existing.status !== "draft")) {
    if (user && existing && existing.status !== "draft") {
      await db.auth.signOut().catch(() => {});
    }
    const { error } = await db.auth.signInAnonymously();
    if (error)
      throw new Error(
        "Anonymous sign-in failed. Please retry or contact the researcher.",
      );
  }
  await writeLocal(null);
  const session = await rpc<Session>("start_session", {
    p_exposed: input.priorExposure,
    p_token_hash: hashToken(input.token),
    p_consent: true,
    p_eligible: true,
  });
  if (session) {
    session.participantId = pid;
    session.submissionId = session.id;
  }
  return session;
}

export async function startNewParticipantSession(input?: {
  token?: string;
}): Promise<Session> {
  const pid = "PART-" + randomUUID().slice(0, 10).toUpperCase();
  const token =
    input?.token && /^[a-f0-9]{64}$/.test(input.token)
      ? input.token
      : randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");

  if (isResearch()) {
    const config = await getConfig();
    if (!config.collectionOpen || config.contact === demoConfig.contact) {
      throw new Error(
        "Research collection is not open. The researcher must configure contact, retention, and database settings first.",
      );
    }
    const db = await supabase();
    await db.auth.signOut().catch(() => {});
    const { error } = await db.auth.signInAnonymously();
    if (error) {
      throw new Error(
        "Anonymous sign-in failed. Please retry or contact the researcher.",
      );
    }
    await writeLocal(null);
    const session = await rpc<Session>("start_session", {
      p_exposed: false,
      p_token_hash: hashToken(token),
      p_consent: true,
      p_eligible: true,
    });
    if (session) {
      session.participantId = pid;
      session.submissionId = session.id;
    }
    return session;
  }

  const now = new Date();
  const sessionId = randomUUID();
  const assignedModuleOrder = [
    "phishing",
    "pretexting",
    "impersonation",
    "links",
  ];
  const nextCode = await nextLocalParticipantCode();
  const session: Session = {
    id: sessionId,
    submissionId: sessionId,
    participantId: pid,
    code: nextCode,
    mode: "demo",
    status: "draft",
    createdAt: now.toISOString(),
    submittedAt: null,
    draftExpiresAt: new Date(+now + 7 * 86400000).toISOString(),
    withdrawDeadline: new Date(+now + 7 * 86400000).toISOString(),
    instrumentVersion: INSTRUMENT_VERSION,
    consentVersion: CONSENT_VERSION,
    priorExposure: false,
    assignedModuleOrder,
    answers: blankAnswers(),
    attempts: [],
  };
  await writeLocal({ session, tokenHash: hashToken(token) });
  await saveDemoSubmission(session);
  return session;
}
export async function saveDraft(answers: Answers) {
  const s = await getSession();
  if (!s) throw new Error("Session not found. Please begin with consent.");
  if (s.status !== "draft") return s;
  if (isResearch() && s.mode === "research")
    return rpc<Session>("save_draft", { p_answers: answers });
  const local = (await readLocal())!;
  local.session.answers = answers;
  await writeLocal(local);
  if (local.session.mode !== "practice") {
    await saveDemoSubmission(local.session);
  }
  return local.session;
}
export async function submitBaseline(answers: Answers, idempotencyKey: string) {
  const s = await getSession();
  if (!s) throw new Error("Session not found.");
  if (s.mode === "practice")
    throw new Error("Practice sessions cannot submit research answers.");
  if (isResearch()) {
    if (s.status !== "draft") {
      return s;
    }
    const submitted = await rpc<Session>("submit_baseline", {
      p_answers: answers,
      p_key: idempotencyKey,
    });
    if (submitted) {
      submitted.participantId = s.participantId ?? (await getOrCreateParticipantId());
      submitted.submissionId = submitted.id;
    }
    return submitted;
  }
  const local = (await readLocal())!;
  if (local.session.status !== "draft") {
    return local.session;
  }
  const isProfileComplete = ["Q1", "Q2", "Q3", "Q4", "Q5"].every(
    (qid) => answers[qid]?.status === "answered" && answers[qid]?.value !== null,
  );
  local.session.answers = answers;
  if (local.session.attempts && local.session.attempts.length > 0) {
    local.session.answers = deriveSurveyAnswersFromAttempts(
      local.session.attempts,
      local.session.answers,
    );
  }
  local.session.status = isProfileComplete
    ? "submitted_complete"
    : "submitted_with_missing";
  local.session.submittedAt = new Date().toISOString();
  local.session.submissionId = local.session.id;
  if (!local.session.participantId) {
    local.session.participantId = await getOrCreateParticipantId();
  }
  local.submitKey = idempotencyKey;
  await writeLocal(local);
  await saveDemoSubmission(local.session);
  return local.session;
}

export async function recordSessionToWorkspace(): Promise<{
  ok: boolean;
  session: Session;
  message: string;
}> {
  const s = await getSession();
  if (!s) {
    throw new Error("No active participant session found to record.");
  }
  if (s.mode === "practice") {
    throw new Error("Practice mode sessions are simulated and not recorded into the Research Workspace.");
  }

  let updatedAnswers = s.answers || {};
  if (s.attempts && s.attempts.length > 0) {
    updatedAnswers = deriveSurveyAnswersFromAttempts(s.attempts, updatedAnswers);
  }

  const isProfileComplete = ["Q1", "Q2", "Q3", "Q4", "Q5"].every(
    (qid) => updatedAnswers[qid]?.status === "answered" && updatedAnswers[qid]?.value !== null,
  );

  const updatedSession: Session = {
    ...s,
    answers: updatedAnswers,
    status: isProfileComplete ? "submitted_complete" : "submitted_with_missing",
    submittedAt: s.submittedAt || new Date().toISOString(),
    submissionId: s.submissionId || s.id,
  };

  if (!updatedSession.participantId) {
    updatedSession.participantId = await getOrCreateParticipantId();
  }

  const local = await readLocal();
  if (local) {
    local.session = updatedSession;
    await writeLocal(local);
  }

  await saveDemoSubmission(updatedSession);

  return {
    ok: true,
    session: updatedSession,
    message: `Participant answers (Anonymous ID: ${updatedSession.code}) successfully recorded into the Research Workspace.`,
  };
}
export async function recordAttempt(input: {
  scenarioId: string;
  action: string | null;
  elapsedMs: number;
  idempotencyKey: string;
}) {
  const s = await getSession();
  if (!s || s.status === "draft")
    throw new Error(
      "Research profile required. Complete and submit your student profile before recording challenge attempts, or choose practice mode.",
    );
  const scenario =
    scenarios.find((x) => x.id === input.scenarioId) ??
    allScenarios.find((x) => x.id === input.scenarioId);
  if (
    !scenario ||
    (input.action !== null &&
      !scenario.choices.some((c) => c.id === input.action))
  )
    throw new Error("Invalid scenario or action.");
  const key = answerKeys[scenario.id];
  if (s.mode === "research") {
    const result = await rpc<{ session: Session; attempt: Attempt }>(
      "record_attempt",
      {
        p_scenario: input.scenarioId,
        p_action: input.action,
        p_elapsed: input.elapsedMs,
        p_key: input.idempotencyKey,
      },
    );
    return { ...result, feedback: key };
  }
  const local = (await readLocal())!;
  const previous = s.attempts.find(
    (a) => a.idempotencyKey === input.idempotencyKey,
  );
  if (previous)
    return {
      session: s,
      attempt: previous,
      feedback: answerKeys[previous.scenarioId],
    };
  const number =
    s.attempts.filter((a) => a.scenarioId === scenario.id).length + 1;
  const result = scoreDecision(input.action, key.action, number === 1, scenario.choices);
  const attempt: Attempt = {
    id: randomUUID(),
    runId: s.id,
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    scoringVersion: SCORING_VERSION,
    primaryIV: scenario.primaryIV,
    attemptNumber: number,
    selectedAction: input.action,
    ...result,
    elapsedMs: input.elapsedMs,
    presentedOrder: scenarios.findIndex((x) => x.id === scenario.id) + 1,
    createdAt: new Date().toISOString(),
    practice: s.mode === "practice" || number > 1,
    idempotencyKey: input.idempotencyKey,
  };
  local.session.attempts.push(attempt);

  // Automatically update research variables Q6-Q25 from scenario choices
  local.session.answers = deriveSurveyAnswersFromAttempts(
    local.session.attempts,
    local.session.answers || {},
  );

  // When all 20 scenarios are finished, ensure status is submitted_complete
  const firstCompleted = local.session.attempts.filter(
    (a) => a.attemptNumber === 1 && a.selectedAction !== null,
  ).length;
  if (firstCompleted >= 20 && local.session.status !== "submitted_complete") {
    local.session.status = "submitted_complete";
    local.session.submittedAt = local.session.submittedAt || new Date().toISOString();
  }

  await writeLocal(local);
  await saveDemoSubmission(local.session);
  return { session: local.session, attempt, feedback: key };
}
export async function clearActiveSession() {
  if (isResearch()) {
    try {
      const db = await supabase();
      await db.auth.signOut();
    } catch {
      /* ignore */
    }
  }
  await writeLocal(null);
}

export async function discardDraft() {
  const s = await getSession();
  if (s && s.status !== "draft" && s.mode !== "practice") {
    // Session is already completed/submitted. Do not delete saved research submission,
    // but safely clear the active local browser session cookie.
    await clearActiveSession();
    return;
  }
  if (s?.mode === "research") await rpc("discard_draft");
  if (s?.code) {
    await removeDemoSubmission(s.code);
  }
  await clearActiveSession();
}
export async function withdraw(code: string, token: string) {
  if (isResearch()) {
    const db = await supabase();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) {
      const { error } = await db.auth.signInAnonymously();
      if (error)
        throw new Error(
          "Unable to start a private deletion session. Please retry.",
        );
    }
    await rpc("withdraw_response", { p_code: code, p_token: token });
    return;
  }
  const local = await readLocal();
  if (
    !local ||
    local.session.code !== code ||
    !local.session.withdrawDeadline ||
    Date.parse(local.session.withdrawDeadline) < Date.now() ||
    !timingSafeEqual(
      Buffer.from(local.tokenHash),
      Buffer.from(hashToken(token)),
    )
  )
    throw new Error(
      "Withdrawal unavailable. Check the code, private token, deadline, and original demo browser.",
    );
  await removeDemoSubmission(code);
  await writeLocal(null);
}
