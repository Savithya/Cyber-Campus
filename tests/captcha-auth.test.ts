import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

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
  resetRateLimiter,
  getResearcherSession,
  isResearcherAuthenticated,
} from "@/lib/researcher-auth.server";
import { POST } from "@/app/api/[...path]/route";

function makePostRequest(body: unknown, headers?: Record<string, string>): NextRequest {
  const req = new NextRequest("http://127.0.0.1:3005/api/auth/login", {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:3005",
      Host: "127.0.0.1:3005",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  return req;
}

const loginCtx = {
  params: Promise.resolve({ path: ["auth", "login"] }),
};

describe("Researcher Access Portal — Authentication API Endpoint", () => {
  beforeEach(() => {
    cookieStore.clear();
    resetRateLimiter();
    process.env.RESEARCHER_ACCESS_PIN = TEST_PIN;
  });

  describe("POST /api/auth/login Endpoint", () => {
    it("rejects login attempt with empty PIN", async () => {
      const req = makePostRequest({ pin: "" });
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Enter your researcher access PIN.");
    });

    it("rejects login attempt with whitespace-only PIN", async () => {
      const req = makePostRequest({ pin: "   " });
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Enter your researcher access PIN.");
    });

    it("rejects incorrect PIN with 401 Unauthorized", async () => {
      const req = makePostRequest({ pin: "IncorrectPin999" });
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe("Invalid Researcher Access PIN. Please try again.");
    });

    it("triggers 429 lockout after 5 consecutive failed login attempts", async () => {
      const clientIp = "203.0.113.88";

      // Submit 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        const req = makePostRequest(
          { pin: "WrongPin" + i },
          { "x-forwarded-for": clientIp },
        );
        const res = await POST(req, loginCtx);
        expect(res.status).toBe(401);
      }

      // 5th attempt triggers lockout
      const fifthReq = makePostRequest(
        { pin: "WrongPin5" },
        { "x-forwarded-for": clientIp },
      );
      const fifthRes = await POST(fifthReq, loginCtx);
      expect(fifthRes.status).toBe(429);

      const fifthData = await fifthRes.json();
      expect(fifthData.error).toContain("Temporary lockout in effect");

      // Even with correct PIN, locked IP is rejected
      const lockedReq = makePostRequest(
        { pin: TEST_PIN },
        { "x-forwarded-for": clientIp },
      );
      const lockedRes = await POST(lockedReq, loginCtx);
      expect(lockedRes.status).toBe(429);
    });

    it("isolates rate limiting by client IP address", async () => {
      const attackerIp = "198.51.100.55";
      const legitimateIp = "198.51.100.99";

      // Attacker exhausts attempts
      for (let i = 1; i <= 5; i++) {
        const req = makePostRequest(
          { pin: "WrongPin" + i },
          { "x-forwarded-for": attackerIp },
        );
        await POST(req, loginCtx);
      }

      // Attacker is locked out
      const attackerReq = makePostRequest(
        { pin: TEST_PIN },
        { "x-forwarded-for": attackerIp },
      );
      const attackerRes = await POST(attackerReq, loginCtx);
      expect(attackerRes.status).toBe(429);

      // Legitimate user is unaffected and can login
      const legReq = makePostRequest(
        { pin: TEST_PIN },
        { "x-forwarded-for": legitimateIp },
      );
      const legRes = await POST(legReq, loginCtx);
      expect(legRes.status).toBe(200);
    });

    it("authenticates researcher successfully with correct PIN", async () => {
      const req = makePostRequest({ pin: TEST_PIN });
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.ok).toBe(true);

      // Verify researcher session cookie was set
      const session = await getResearcherSession();
      expect(session).not.toBeNull();
      expect(session?.role).toBe("researcher");
      expect(await isResearcherAuthenticated()).toBe(true);
    });

    it("allows localhost origin when APP_ORIGIN is 127.0.0.1", async () => {
      process.env.APP_ORIGIN = "http://127.0.0.1:3005";
      const req = makePostRequest(
        { pin: TEST_PIN },
        { Origin: "http://localhost:3005", Host: "localhost:3005" },
      );
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(200);
    });

    it("rejects cross-origin requests from unauthorized origins", async () => {
      const req = makePostRequest(
        { pin: TEST_PIN },
        { Origin: "http://malicious-attacker.com", Host: "127.0.0.1:3005" },
      );
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.error).toBe("This request must come from this site.");
    });

    it("rejects POST requests with missing Origin header", async () => {
      const req = new NextRequest("http://127.0.0.1:3005/api/auth/login", {
        method: "POST",
        headers: {
          Host: "127.0.0.1:3005",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: TEST_PIN }),
      });
      const res = await POST(req, loginCtx);
      expect(res.status).toBe(403);
    });
  });
});
