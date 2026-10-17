import { beforeEach, describe, expect, it, vi } from "vitest";

const TEST_PIN = "pR3xMfl3UUCTA2n1";
process.env.RESEARCHER_ACCESS_PIN = TEST_PIN;
process.env.LOCAL_SESSION_SECRET =
  "sb_secret_nl3zEMWOFyoBuKV9Yvo81w_5RoV9qOp";

// Mock next/headers cookies
const cookieStore = new Map<string, { value: string; options?: Record<string, unknown> }>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookieStore.set(name, { value, options });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
    getAll: () =>
      Array.from(cookieStore.entries()).map(([name, { value }]) => ({
        name,
        value,
      })),
  }),
}));

import {
  checkPinRateLimit,
  clearResearcherSession,
  decryptResearcherSession,
  encryptResearcherSession,
  getResearcherSession,
  isResearcherAuthenticated,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  resetRateLimiter,
  setResearcherSession,
  verifyPinConstantTime,
  type ResearcherSession,
} from "@/lib/researcher-auth.server";
import { requireResearcher } from "@/lib/supabase.server";

describe("Researcher PIN Authentication", () => {
  beforeEach(() => {
    cookieStore.clear();
    resetRateLimiter();
    process.env.RESEARCHER_ACCESS_PIN = TEST_PIN;
  });

  describe("Valid PIN authentication", () => {
    it("validates the configured 16-character PIN successfully", () => {
      expect(verifyPinConstantTime(TEST_PIN)).toBe(true);
    });

    it("creates a secure session upon successful authentication", async () => {
      const session = await setResearcherSession();
      expect(session.role).toBe("researcher");
      expect(typeof session.sessionId).toBe("string");
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      const activeSession = await getResearcherSession();
      expect(activeSession).not.toBeNull();
      expect(activeSession?.role).toBe("researcher");
      expect(activeSession?.sessionId).toBe(session.sessionId);
      expect(await isResearcherAuthenticated()).toBe(true);
    });

    it("resets failed attempt counter upon successful login", () => {
      const ip = "192.168.1.100";
      recordFailedAttempt(ip);
      recordFailedAttempt(ip);
      expect(checkPinRateLimit(ip).allowed).toBe(true);

      recordSuccessfulAttempt(ip);
      const after = recordFailedAttempt(ip);
      // If reset, remaining attempts start fresh from 4 (MAX 5 - 1)
      expect(after.remainingAttempts).toBe(4);
    });
  });

  describe("Invalid PIN authentication", () => {
    it("rejects incorrect PINs", () => {
      expect(verifyPinConstantTime("wrongpassword123")).toBe(false);
      expect(verifyPinConstantTime("pR3xMfl3UUCTA2n0")).toBe(false); // 1 char difference
      expect(verifyPinConstantTime("")).toBe(false);
    });

    it("enforces case-sensitive PIN comparison", () => {
      expect(verifyPinConstantTime(TEST_PIN.toLowerCase())).toBe(false);
      expect(verifyPinConstantTime(TEST_PIN.toUpperCase())).toBe(false);
    });

    it("fails closed when server PIN environment variable is missing", () => {
      delete process.env.RESEARCHER_ACCESS_PIN;
      expect(verifyPinConstantTime(TEST_PIN)).toBe(false);
    });
  });

  describe("Rate limiting and temporary lockout", () => {
    it("tracks failed attempts and triggers lockout after 5 consecutive failures", () => {
      const ip = "10.0.0.42";

      // Attempts 1 to 4 should be allowed without lockout
      for (let i = 1; i <= 4; i++) {
        const attempt = recordFailedAttempt(ip);
        expect(attempt.locked).toBe(false);
        expect(attempt.remainingAttempts).toBe(5 - i);
        expect(checkPinRateLimit(ip).allowed).toBe(true);
      }

      // 5th attempt triggers lockout
      const fifthAttempt = recordFailedAttempt(ip);
      expect(fifthAttempt.locked).toBe(true);
      expect(fifthAttempt.remainingAttempts).toBe(0);

      // Subsequent checks report lockout
      const status = checkPinRateLimit(ip);
      expect(status.allowed).toBe(false);
      expect(status.locked).toBe(true);
      expect(status.remainingMinutes).toBeGreaterThan(0);
    });

    it("isolates rate limiting per client IP", () => {
      const attackerIp = "198.51.100.1";
      const legitimateIp = "198.51.100.2";

      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(attackerIp);
      }

      expect(checkPinRateLimit(attackerIp).allowed).toBe(false);
      expect(checkPinRateLimit(legitimateIp).allowed).toBe(true);
    });
  });

  describe("Session encryption, integrity, and expiry", () => {
    it("rejects expired sessions", async () => {
      const expiredSession: ResearcherSession = {
        role: "researcher",
        sessionId: "test-uuid",
        createdAt: Date.now() - 10 * 3600 * 1000,
        expiresAt: Date.now() - 2 * 3600 * 1000, // 2 hours in the past
      };

      const token = encryptResearcherSession(expiredSession);
      const decoded = decryptResearcherSession(token);
      expect(decoded).toBeNull();
    });

    it("rejects tampered session tokens with authentication tag failure", async () => {
      const validSession: ResearcherSession = {
        role: "researcher",
        sessionId: "valid-uuid",
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600 * 1000,
      };

      const token = encryptResearcherSession(validSession);
      // Tamper with ciphertext by flipping characters in the token
      const tamperedToken =
        token.slice(0, 15) +
        (token[15] === "A" ? "B" : "A") +
        token.slice(16);

      const decoded = decryptResearcherSession(tamperedToken);
      expect(decoded).toBeNull();
    });

    it("clears researcher session on logout", async () => {
      await setResearcherSession();
      expect(await isResearcherAuthenticated()).toBe(true);

      await clearResearcherSession();
      expect(await isResearcherAuthenticated()).toBe(false);
      expect(await getResearcherSession()).toBeNull();
    });
  });

  describe("Unauthorised access protection", () => {
    it("denies access to protected researcher resources without authentication", async () => {
      await clearResearcherSession();
      await expect(requireResearcher()).rejects.toThrow(
        "Researcher authentication required.",
      );
    });

    it("allows access to researcher resources with valid PIN session", async () => {
      await setResearcherSession();
      const client = await requireResearcher();
      expect(client).toBeDefined();
    });

    it("denies access after session expiration", async () => {
      const expiredSession: ResearcherSession = {
        role: "researcher",
        sessionId: "expired-uuid",
        createdAt: Date.now() - 10 * 3600 * 1000,
        expiresAt: Date.now() - 1000, // expired
      };
      const token = encryptResearcherSession(expiredSession);
      cookieStore.set("cc_researcher_session", { value: token });

      await expect(requireResearcher()).rejects.toThrow(
        "Researcher authentication required.",
      );
    });
  });
});
