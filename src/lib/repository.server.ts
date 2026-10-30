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

declare global {
  // eslint-disable-next-line no-var
  var __CYBER_CAMPUS_COUNTER__: number | undefined;
  // eslint-disable-next-line no-var
  var __CYBER_CAMPUS_SUBMISSIONS__: Map<string, Session> | undefined;
}

if (!globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
  globalThis.__CYBER_CAMPUS_SUBMISSIONS__ = new Map<string, Session>();
}

function getDemoDataDir(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), ".demo-data");
  }
  return path.join(process.cwd(), ".demo-data");
}

function getCwdDataDir(): string {
  return path.join(process.cwd(), ".demo-data");
}

function getSeedFilePath(): string {
  return path.join(process.cwd(), "src", "data", "seed-submissions.json");
}

async function readSubmissionsFromFile(filePath: string): Promise<Session[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const list = JSON.parse(raw);
    if (Array.isArray(list)) return list;
  } catch {}
  return [];
}

let memoryParticipantCounter = 0;

export async function nextLocalParticipantCode(options?: {
  existingCode?: string | number | null;
  clientHintCode?: string | number | null;
  resetToStart?: boolean;
}): Promise<string> {
  if (options?.resetToStart) {
    memoryParticipantCounter = 1;
    globalThis.__CYBER_CAMPUS_COUNTER__ = 1;
    const counterPayload = JSON.stringify({ counter: 1 });
    try {
      await mkdir(getDemoDataDir(), { recursive: true });
      await writeFile(path.join(getDemoDataDir(), "participant_counter.json"), counterPayload, "utf-8").catch(() => {});
    } catch {}
    try {
      await mkdir(getCwdDataDir(), { recursive: true });
      await writeFile(path.join(getCwdDataDir(), "participant_counter.json"), counterPayload, "utf-8").catch(() => {});
    } catch {}
    try {
      const jar = await cookies();
      jar.set("cc_last_code", "01", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 86400,
      });
    } catch {}
    return "01";
  }

  let highestCodeFound = 0;
  let hasRealSubmissions = false;

  // 1. Scan bundled seed submissions
  const seedList = await readSubmissionsFromFile(getSeedFilePath());
  for (const s of seedList) {
    if (s.code && /^\d+$/.test(String(s.code).trim())) {
      const n = parseInt(String(s.code).trim(), 10);
      if (n > highestCodeFound && n < 100000) highestCodeFound = n;
      hasRealSubmissions = true;
    }
  }

  // 2. Scan cwd submissions (repository baseline)
  const cwdList = await readSubmissionsFromFile(path.join(getCwdDataDir(), "submissions.json"));
  for (const s of cwdList) {
    if (s.code && /^\d+$/.test(String(s.code).trim())) {
      const n = parseInt(String(s.code).trim(), 10);
      if (n > highestCodeFound && n < 100000) highestCodeFound = n;
      hasRealSubmissions = true;
    }
  }

  // 3. Scan runtime demo data directory (e.g. /tmp on Vercel)
  const demoList = await readSubmissionsFromFile(path.join(getDemoDataDir(), "submissions.json"));
  for (const s of demoList) {
    if (s.code && /^\d+$/.test(String(s.code).trim())) {
      const n = parseInt(String(s.code).trim(), 10);
      if (n > highestCodeFound && n < 100000) highestCodeFound = n;
      hasRealSubmissions = true;
    }
  }

  // 4. Scan in-memory store
  if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
    for (const s of globalThis.__CYBER_CAMPUS_SUBMISSIONS__.values()) {
      if (s.code && /^\d+$/.test(String(s.code).trim())) {
        const n = parseInt(String(s.code).trim(), 10);
        if (n > highestCodeFound && n < 100000) highestCodeFound = n;
        hasRealSubmissions = true;
      }
    }
  }

  // 5. Scan counter files in demo and cwd directories
  let counterFileSpecified = false;
  let counterFileVal = 0;
  const counterPaths = [
    path.join(getDemoDataDir(), "participant_counter.json"),
    path.join(getCwdDataDir(), "participant_counter.json"),
  ];
  for (const cp of counterPaths) {
    try {
      const raw = await readFile(cp, "utf-8");
      const parsed = JSON.parse(raw);
      if (typeof parsed?.counter === "number" && parsed.counter < 100000) {
        counterFileSpecified = true;
        if (parsed.counter > counterFileVal) {
          counterFileVal = parsed.counter;
        }
      }
    } catch {}
  }

  if (counterFileSpecified) {
    if (counterFileVal > highestCodeFound) {
      highestCodeFound = counterFileVal;
    } else if (counterFileVal === 0 && !hasRealSubmissions) {
      highestCodeFound = 0;
      globalThis.__CYBER_CAMPUS_COUNTER__ = 0;
      memoryParticipantCounter = 0;
    }
  }

  // Only consider memory/client hints if we haven't explicitly reset to 0 with no submissions
  if (highestCodeFound > 0 || hasRealSubmissions || !counterFileSpecified) {
    // 6. Check global and module memory counters
    if (globalThis.__CYBER_CAMPUS_COUNTER__ && globalThis.__CYBER_CAMPUS_COUNTER__ > highestCodeFound) {
      highestCodeFound = globalThis.__CYBER_CAMPUS_COUNTER__;
    }
    if (memoryParticipantCounter > highestCodeFound) {
      highestCodeFound = memoryParticipantCounter;
    }

    // 7. Check existing code from current session
    if (options?.existingCode && /^\d+$/.test(String(options.existingCode).trim())) {
      const n = parseInt(String(options.existingCode).trim(), 10);
      if (n > highestCodeFound && n < 100000) highestCodeFound = n;
    }

    // 8. Check client hint code (from browser localStorage)
    if (options?.clientHintCode && /^\d+$/.test(String(options.clientHintCode).trim())) {
      const n = parseInt(String(options.clientHintCode).trim(), 10);
      if (n > highestCodeFound && n < 100000) highestCodeFound = n;
    }

    // 9. Check long-lived cookie cc_last_code
    try {
      const jar = await cookies();
      const lastCodeCookie = jar.get("cc_last_code")?.value;
      if (lastCodeCookie && /^\d+$/.test(lastCodeCookie.trim())) {
        const n = parseInt(lastCodeCookie.trim(), 10);
        if (n > highestCodeFound && n < 100000) highestCodeFound = n;
      }
    } catch {}
  }

  const nextVal = highestCodeFound + 1;
  memoryParticipantCounter = nextVal;
  globalThis.__CYBER_CAMPUS_COUNTER__ = nextVal;

  const nextCodeStr = String(nextVal).padStart(2, "0");

  // Persist counter to files
  const counterPayload = JSON.stringify({ counter: nextVal });
  try {
    await mkdir(getDemoDataDir(), { recursive: true });
    await writeFile(path.join(getDemoDataDir(), "participant_counter.json"), counterPayload, "utf-8").catch(() => {});
  } catch {}
  try {
    await mkdir(getCwdDataDir(), { recursive: true });
    await writeFile(path.join(getCwdDataDir(), "participant_counter.json"), counterPayload, "utf-8").catch(() => {});
  } catch {}

  // Update cookie cc_last_code for the browser
  try {
    const jar = await cookies();
    jar.set("cc_last_code", nextCodeStr, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 365 * 86400,
    });
  } catch {}

  return nextCodeStr;
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

  // Scenario to Question Map (STEP 03 - STEP 06: Q6 - Q25)
  const scenarioToQuestionMap: Record<string, { qid: string; iv: string }> = {
    // STEP 03: Phishing Investigation (IV1) -> Q6 - Q10
    PH01: { qid: "Q6", iv: "IV1" },
    PH02: { qid: "Q7", iv: "IV1" },
    PH03: { qid: "Q8", iv: "IV1" },
    PH04: { qid: "Q9", iv: "IV1" },
    PH05: { qid: "Q10", iv: "IV1" },
    // STEP 04: Pretexting Detection (IV2) -> Q11 - Q15
    PT01: { qid: "Q11", iv: "IV2" },
    PT02: { qid: "Q12", iv: "IV2" },
    PT03: { qid: "Q13", iv: "IV2" },
    PT04: { qid: "Q14", iv: "IV2" },
    PT05: { qid: "Q15", iv: "IV2" },
    // STEP 05: Impersonation Investigation (IV3) -> Q16 - Q20
    IM01: { qid: "Q16", iv: "IV3" },
    IM02: { qid: "Q17", iv: "IV3" },
    IM03: { qid: "Q18", iv: "IV3" },
    IM04: { qid: "Q19", iv: "IV3" },
    IM05: { qid: "Q20", iv: "IV3" },
    // STEP 06: Scam & Malicious Link Investigation (IV4) -> Q21 - Q25
    SC01: { qid: "Q21", iv: "IV4" },
    SC02: { qid: "Q22", iv: "IV4" },
    SC03: { qid: "Q23", iv: "IV4" },
    SC04: { qid: "Q24", iv: "IV4" },
    SC05: { qid: "Q25", iv: "IV4" },
  };

  for (const [scId, meta] of Object.entries(scenarioToQuestionMap)) {
    const att = firstAttempts.find((a) => a.scenarioId === scId);
    if (att && att.selectedAction !== null) {
      let code = 1; // Option 1: Identified threat accurately
      if (att.selectedAction === "proceed" || att.unsafe) {
        code = 2; // Mistaken for legitimate or complied
      } else if (att.selectedAction === "ignore") {
        code = 4; // Ignored or not sure
      } else {
        code = 1;
      }
      updated[meta.qid] = { value: code, status: "answered" };
    } else if (!updated[meta.qid] || updated[meta.qid].value === null) {
      // Derive based on IV metrics if scenario not individually completed yet
      const m = meta.iv === "IV1" ? m1 : meta.iv === "IV2" ? m2 : meta.iv === "IV3" ? m3 : m4;
      const derivedCode = m.safeRatio >= 0.5 ? 1 : 2;
      updated[meta.qid] = { value: derivedCode, status: "answered" };
    }
  }

  return updated;
}

export async function saveDemoSubmission(session: Session) {
  if (session.mode === "practice") return;

  // 1. Update in-memory store
  const key = session.code || session.id;
  if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
    globalThis.__CYBER_CAMPUS_SUBMISSIONS__.set(key, session);
  }

  // 2. Save to demo data directory
  const dataDir = getDemoDataDir();
  const subPath = path.join(dataDir, "submissions.json");
  try {
    await mkdir(dataDir, { recursive: true });
    const list = await readSubmissionsFromFile(subPath);
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

  // 3. Save to cwd data directory if different and writable
  if (getCwdDataDir() !== dataDir) {
    const cwdPath = path.join(getCwdDataDir(), "submissions.json");
    try {
      await mkdir(getCwdDataDir(), { recursive: true });
      const cwdList = await readSubmissionsFromFile(cwdPath);
      const idx = cwdList.findIndex(
        (x) => x.id === session.id || (session.code && x.code === session.code),
      );
      if (idx >= 0) {
        cwdList[idx] = { ...cwdList[idx], ...session };
      } else {
        cwdList.unshift(session);
      }
      await writeFile(cwdPath, JSON.stringify(cwdList, null, 2), "utf-8").catch(() => {});
    } catch {}
  }
}

export async function getDemoSubmissions(): Promise<Session[]> {
  const mergedMap = new Map<string, Session>();

  // 1. Bundled seed submissions (always present across all lambdas & cold starts)
  const seedList = await readSubmissionsFromFile(getSeedFilePath());
  for (const s of seedList) {
    const k = s.code || s.id;
    mergedMap.set(k, s);
  }

  // 2. Repository cwd submissions
  const cwdList = await readSubmissionsFromFile(path.join(getCwdDataDir(), "submissions.json"));
  for (const s of cwdList) {
    const k = s.code || s.id;
    const existing = mergedMap.get(k);
    if (!existing || (s.attempts?.length ?? 0) >= (existing.attempts?.length ?? 0)) {
      mergedMap.set(k, { ...existing, ...s });
    }
  }

  // 3. Runtime demo data directory (tmp in Vercel lambdas)
  const demoList = await readSubmissionsFromFile(path.join(getDemoDataDir(), "submissions.json"));
  for (const s of demoList) {
    const k = s.code || s.id;
    const existing = mergedMap.get(k);
    if (!existing || (s.attempts?.length ?? 0) >= (existing.attempts?.length ?? 0)) {
      mergedMap.set(k, { ...existing, ...s });
    }
  }

  // 4. In-memory submissions for warm lambda processes
  if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
    for (const [k, s] of globalThis.__CYBER_CAMPUS_SUBMISSIONS__.entries()) {
      const existing = mergedMap.get(k);
      if (!existing || (s.attempts?.length ?? 0) >= (existing.attempts?.length ?? 0)) {
        mergedMap.set(k, { ...existing, ...s });
      }
    }
  }

  // 5. Synchronize active local session from cookie if present in current request
  try {
    let counterIsZero = false;
    try {
      const raw = await readFile(path.join(getDemoDataDir(), "participant_counter.json"), "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed?.counter === 0) counterIsZero = true;
    } catch {}

    const hasStoredSubmissions = seedList.length > 0 || cwdList.length > 0 || demoList.length > 0;

    // Do NOT resurrect stale cookie sessions if the workspace has been reset to zero with no stored submissions
    if (!counterIsZero || hasStoredSubmissions) {
      const local = await readLocal();
      if (local?.session && local.session.mode !== "practice") {
        const active = local.session;
        const k = active.code || active.id;
        const existing = mergedMap.get(k);
        const activeDemo: Session = { ...existing, ...active, mode: "demo" };
        mergedMap.set(k, activeDemo);
      }
    } else {
      // Data was reset to zero. Clean stale local cookie so ghost session is not resurrected.
      await writeLocal(null);
    }
  } catch {
    // Outside request context or no cookie available
  }

  const list = Array.from(mergedMap.values());

  // 6. Ensure any submitted session with attempts has its survey answers populated
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

  // 7. Update in-memory map & sync file
  if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
    for (const s of list) {
      globalThis.__CYBER_CAMPUS_SUBMISSIONS__.set(s.code || s.id, s);
    }
  }

  const subPath = path.join(getDemoDataDir(), "submissions.json");
  try {
    await mkdir(getDemoDataDir(), { recursive: true });
    await writeFile(subPath, JSON.stringify(list, null, 2), "utf-8").catch(() => {});
  } catch {}

  // 8. Filter out mock records and synthetic fixtures
  const filtered = list.filter(
    (s: Session) =>
      !s.id?.includes("synthetic") &&
      !s.submissionId?.includes("synthetic") &&
      !s.code?.includes("synthetic") &&
      !s.id?.includes("mock") &&
      !s.submissionId?.includes("mock") &&
      s.mode !== "practice",
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

export async function resetResearchData(): Promise<{ ok: boolean; message: string }> {
  // 1. Reset in-memory stores
  if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
    globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
  }
  globalThis.__CYBER_CAMPUS_COUNTER__ = 0;
  memoryParticipantCounter = 0;

  // 2. Clear disk submissions and counter files
  const emptyList = "[]\n";
  const zeroCounter = JSON.stringify({ counter: 0 }, null, 2) + "\n";

  try {
    await mkdir(getDemoDataDir(), { recursive: true });
    await writeFile(path.join(getDemoDataDir(), "submissions.json"), emptyList, "utf-8");
    await writeFile(path.join(getDemoDataDir(), "participant_counter.json"), zeroCounter, "utf-8");
  } catch {}

  try {
    await mkdir(getCwdDataDir(), { recursive: true });
    await writeFile(path.join(getCwdDataDir(), "submissions.json"), emptyList, "utf-8");
    await writeFile(path.join(getCwdDataDir(), "participant_counter.json"), zeroCounter, "utf-8");
  } catch {}

  try {
    await writeFile(getSeedFilePath(), emptyList, "utf-8");
  } catch {}

  // 3. Clear active browser session cookie & tracking identifiers
  await clearActiveSession();
  try {
    const jar = await cookies();
    jar.delete("cc_last_code");
    jar.delete("cc_pid");
  } catch {}

  // 4. In research mode, clear remote Supabase participant tables if configured
  if (isResearch()) {
    const { serverAdminSupabase } = await import("./supabase.server");
    const admin = serverAdminSupabase();
    if (admin) {
      try {
        await admin.from("questionnaire_answers").delete().neq("missing_status", "none");
        await admin.from("questionnaire_submissions").delete().neq("status", "none");
        await admin.from("game_attempts").delete().neq("primary_iv", "none");
        await admin.from("game_runs").delete().neq("scoring_version", "none");
        await admin.from("participant_sessions").delete().neq("mode", "none");
        await admin.from("admin_audit_events").delete().eq("event", "participant_withdrawal");
      } catch (err) {
        console.error("Supabase reset error:", err);
      }
    }
  }

  return {
    ok: true,
    message: "All participant responses have been permanently removed and Research Workspace statistics reset to zero.",
  };
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
  if (local && (!isResearch() || local.session.mode === "practice")) {
    let s = local.session;
    if (s.code && /^\d+$/.test(String(s.code).trim())) {
      const num = parseInt(String(s.code).trim(), 10);
      const cwdList = await readSubmissionsFromFile(path.join(getCwdDataDir(), "submissions.json"));
      const demoList = await readSubmissionsFromFile(path.join(getDemoDataDir(), "submissions.json"));
      let counterIsZero = false;
      try {
        const raw = await readFile(path.join(getDemoDataDir(), "participant_counter.json"), "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed?.counter === 0) counterIsZero = true;
      } catch {}

      if (counterIsZero && cwdList.length === 0 && demoList.length === 0 && s.status === "draft") {
        if (s.code !== "01") {
          s = { ...s, code: "01" };
          await writeLocal({ ...local, session: s });
          try {
            const jar = await cookies();
            jar.set("cc_last_code", "01", {
              httpOnly: false,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 365 * 86400,
            });
          } catch {}
        }
      } else {
        const normalized = String(num).padStart(2, "0");
        if (s.code !== normalized) {
          s = { ...s, code: normalized };
          await writeLocal({ ...local, session: s });
        }
      }
    }
    return s;
  }
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
  clientLastCode?: string | number;
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
    const nextCode = await nextLocalParticipantCode({
      existingCode: existing?.code,
      clientHintCode: input.clientLastCode,
    });
    const session: Session = {
      id: sessionId,
      submissionId: sessionId,
      participantId: pid,
      code: nextCode,
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
  clientLastCode?: string | number;
  resetToStart?: boolean;
}): Promise<Session> {
  const existing = await getSession();
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
  const nextCode = await nextLocalParticipantCode({
    existingCode: input?.resetToStart ? undefined : existing?.code,
    clientHintCode: input?.resetToStart ? undefined : input?.clientLastCode,
    resetToStart: input?.resetToStart,
  });
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
  const isProfileComplete = ["Q1", "Q2", "Q3", "Q4"].every(
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

  // In research mode, participant data is already persisted to Supabase via
  // submit_baseline and record_attempt RPCs. Sync any derived survey answers
  // (Q6–Q25 from game attempts) back to Supabase if the session is still a draft,
  // then return the live session so the completion page reflects the real state.
  if (isResearch() && s.mode === "research") {
    let updatedAnswers = s.answers || {};
    if (s.attempts && s.attempts.length > 0) {
      updatedAnswers = deriveSurveyAnswersFromAttempts(s.attempts, updatedAnswers);
    }

    // Persist derived answers back to Supabase when the session is still in draft
    if (s.status === "draft") {
      try {
        await rpc<Session>("save_draft", { p_answers: updatedAnswers });
      } catch {
        // save_draft may reject if the session is already submitted — that is fine.
      }
    }

    // Re-fetch the authoritative session state from Supabase
    const liveSession = (await rpc<Session | null>("current_session")) ?? s;

    return {
      ok: true,
      session: liveSession,
      message: `Participant answers (Anonymous ID: ${liveSession.code}) successfully recorded into the Research Workspace.`,
    };
  }

  // Demo / local mode: derive answers from attempts and persist to local storage.
  let updatedAnswers = s.answers || {};
  if (s.attempts && s.attempts.length > 0) {
    updatedAnswers = deriveSurveyAnswersFromAttempts(s.attempts, updatedAnswers);
  }

  const isProfileComplete = ["Q1", "Q2", "Q3", "Q4"].every(
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
  try {
    const jar = await cookies();
    jar.delete("cc_last_code");
  } catch {}
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
