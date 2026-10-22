import "server-only";
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

async function nextLocalParticipantCode(): Promise<string> {
  const counterPath = ".demo-data/participant_counter.json";
  try {
    const raw = await readFile(counterPath, "utf-8");
    const parsed = JSON.parse(raw);
    const nextVal = (typeof parsed.counter === "number" ? parsed.counter : 0) + 1;
    await writeFile(counterPath, JSON.stringify({ counter: nextVal }), "utf-8");
    return String(nextVal).padStart(3, "0");
  } catch {
    try {
      await mkdir(".demo-data", { recursive: true });
      await writeFile(counterPath, JSON.stringify({ counter: 1 }), "utf-8");
      return "001";
    } catch {
      return "001";
    }
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

export async function saveDemoSubmission(session: Session) {
  if (session.mode === "practice" && session.code !== "001") return;
  const subPath = ".demo-data/submissions.json";
  try {
    await mkdir(".demo-data", { recursive: true });
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
  const subPath = ".demo-data/submissions.json";
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
        active.code === "001"
      ) {
        await writeFile(subPath, JSON.stringify(list, null, 2), "utf-8").catch(() => {});
      }
    }
  } catch {
    // Outside request context or no cookie available
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
  const subPath = ".demo-data/submissions.json";
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
    const moduleOrders = [
      ["phishing", "pretexting", "impersonation", "links"],
      ["pretexting", "impersonation", "links", "phishing"],
      ["impersonation", "links", "phishing", "pretexting"],
      ["links", "phishing", "pretexting", "impersonation"],
    ];
    const assignedModuleOrder = moduleOrders[Math.floor(Math.random() * moduleOrders.length)];
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
export async function saveDraft(answers: Answers) {
  const s = await getSession();
  if (!s) throw new Error("Session not found. Please begin with consent.");
  if (s.status !== "draft") return s;
  if (isResearch() && s.mode === "research")
    return rpc<Session>("save_draft", { p_answers: answers });
  const local = (await readLocal())!;
  local.session.answers = answers;
  await writeLocal(local);
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
  await writeLocal(local);
  await saveDemoSubmission(local.session);
  return { session: local.session, attempt, feedback: key };
}
export async function discardDraft() {
  const s = await getSession();
  if (s && s.status !== "draft" && s.mode !== "practice")
    throw new Error(
      "Use your private withdrawal token to delete a submitted response.",
    );
  if (s?.mode === "research") await rpc("discard_draft");
  await writeLocal(null);
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
