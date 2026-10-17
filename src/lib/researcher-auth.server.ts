import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { cookies } from "next/headers";

export const RESEARCHER_COOKIE_NAME = "cc_researcher_session";
export const RESEARCHER_SESSION_MAX_AGE_SECONDS = 8 * 3600; // 8 hours

export interface ResearcherSession {
  role: "researcher";
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

interface AttemptTracker {
  failedAttempts: number;
  lockedUntil: number | null;
  firstAttemptAt: number;
}

const attemptTrackerMap = new Map<string, AttemptTracker>();
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Resets the in-memory rate limiter tracking. Primarily used for unit testing.
 */
export function resetRateLimiter(): void {
  attemptTrackerMap.clear();
}

/**
 * Retrieves the configured Researcher Access PIN from the server environment.
 * The PIN is never sent to the browser or exposed in frontend bundles.
 */
export function getTargetPin(): string | null {
  const pin = process.env.RESEARCHER_ACCESS_PIN;
  if (!pin || typeof pin !== "string" || pin.trim().length === 0) {
    return null;
  }
  return pin.trim();
}

/**
 * Performs a constant-time comparison between the submitted PIN and configured PIN.
 * Hashing both values to SHA-256 fixed-length buffers guarantees identical buffer lengths
 * to timingSafeEqual and prevents character-by-character or length timing leaks.
 */
export function verifyPinConstantTime(submittedPin: string): boolean {
  const configured = getTargetPin();
  if (!configured || !submittedPin) {
    return false;
  }

  const submittedDigest = createHash("sha256").update(submittedPin).digest();
  const configuredDigest = createHash("sha256").update(configured).digest();

  return timingSafeEqual(submittedDigest, configuredDigest);
}

/**
 * Checks if the client identifier (IP address) is currently rate-limited or locked out.
 */
export function checkPinRateLimit(clientKey: string): {
  allowed: boolean;
  locked: boolean;
  remainingMinutes?: number;
} {
  const now = Date.now();
  const tracker = attemptTrackerMap.get(clientKey);

  if (!tracker) {
    return { allowed: true, locked: false };
  }

  // Check active lockout
  if (tracker.lockedUntil) {
    if (now < tracker.lockedUntil) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((tracker.lockedUntil - now) / 60000),
      );
      return { allowed: false, locked: true, remainingMinutes };
    }
    // Lockout period has elapsed; clear state
    attemptTrackerMap.delete(clientKey);
    return { allowed: true, locked: false };
  }

  // Check if sliding window has elapsed
  if (now - tracker.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    attemptTrackerMap.delete(clientKey);
    return { allowed: true, locked: false };
  }

  return { allowed: true, locked: false };
}

/**
 * Records an incorrect PIN attempt. Triggers a 15-minute temporary lockout
 * after 5 consecutive failed attempts.
 */
export function recordFailedAttempt(clientKey: string): {
  locked: boolean;
  remainingAttempts: number;
  remainingMinutes?: number;
} {
  const now = Date.now();
  let tracker = attemptTrackerMap.get(clientKey);

  if (!tracker || now - tracker.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    tracker = {
      failedAttempts: 1,
      lockedUntil: null,
      firstAttemptAt: now,
    };
    attemptTrackerMap.set(clientKey, tracker);
    return {
      locked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
    };
  }

  tracker.failedAttempts += 1;

  if (tracker.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    tracker.lockedUntil = now + LOCKOUT_DURATION_MS;
    return {
      locked: true,
      remainingAttempts: 0,
      remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000),
    };
  }

  // Prevent memory unbounded growth
  if (attemptTrackerMap.size > 5000) {
    attemptTrackerMap.clear();
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - tracker.failedAttempts),
  };
}

/**
 * Clears the failed attempt history upon a successful login.
 */
export function recordSuccessfulAttempt(clientKey: string): void {
  attemptTrackerMap.delete(clientKey);
}

/**
 * Resolves the 32-byte key used for AES-256-GCM encryption of researcher session cookies.
 */
function getSessionEncryptionKey(): Buffer {
  const raw = process.env.LOCAL_SESSION_SECRET;
  if (raw && /^[a-f0-9]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  // Deterministic 32-byte key derived from secret or application salt
  return createHash("sha256")
    .update(raw || "cyber-campus-researcher-session-salt")
    .digest();
}

/**
 * Encrypts a ResearcherSession into an authenticated base64url token.
 */
export function encryptResearcherSession(session: ResearcherSession): string {
  const key = getSessionEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const compressed = deflateRawSync(
    Buffer.from(JSON.stringify(session), "utf8"),
  );
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

/**
 * Decrypts and validates a researcher session token.
 * Returns null if the token is tampered, corrupted, expired, or invalid.
 */
export function decryptResearcherSession(
  token: string,
): ResearcherSession | null {
  try {
    const key = getSessionEncryptionKey();
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 28) return null; // iv (12) + tag (16)

    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    const decompressed = inflateRawSync(decrypted, { maxOutputLength: 10000 });
    const session = JSON.parse(
      decompressed.toString("utf8"),
    ) as ResearcherSession;

    if (session.role !== "researcher") return null;
    if (typeof session.expiresAt !== "number" || Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Issues a secure, HttpOnly, SameSite cookie establishing a researcher session.
 */
export async function setResearcherSession(): Promise<ResearcherSession> {
  const now = Date.now();
  const session: ResearcherSession = {
    role: "researcher",
    sessionId: randomUUID(),
    createdAt: now,
    expiresAt: now + RESEARCHER_SESSION_MAX_AGE_SECONDS * 1000,
  };

  const token = encryptResearcherSession(session);
  const jar = await cookies();

  jar.set(RESEARCHER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: RESEARCHER_SESSION_MAX_AGE_SECONDS,
  });

  return session;
}

/**
 * Clears the researcher session cookie.
 */
export async function clearResearcherSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(RESEARCHER_COOKIE_NAME);
}

/**
 * Reads and verifies the active researcher session from request cookies.
 */
export async function getResearcherSession(): Promise<ResearcherSession | null> {
  try {
    const jar = await cookies();
    const cookie = jar.get(RESEARCHER_COOKIE_NAME);
    if (!cookie?.value) return null;
    return decryptResearcherSession(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Checks whether the current request is authenticated as an authorised researcher.
 */
export async function isResearcherAuthenticated(): Promise<boolean> {
  const session = await getResearcherSession();
  return session !== null;
}
