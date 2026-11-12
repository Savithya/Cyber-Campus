import path from "node:path";
import os from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@/lib/types";

const virtualFiles = vi.hoisted(() => new Map<string, string>());
const cookieStore = vi.hoisted(() => ({ current: null as unknown }));
const mocks = vi.hoisted(() => ({
  readLocal: vi.fn(async () => cookieStore.current),
  writeLocal: vi.fn(async (next: unknown) => {
    cookieStore.current = next;
  }),
}));

vi.mock("fs/promises", () => {
  const api = {
    readFile: vi.fn(async (filePath: string) => {
      const normalized = path.normalize(String(filePath));
      if (!virtualFiles.has(normalized)) {
        const err = new Error(`ENOENT: no such file or directory, open '${normalized}'`) as NodeJS.ErrnoException;
        err.code = "ENOENT";
        throw err;
      }
      return virtualFiles.get(normalized)!;
    }),
    writeFile: vi.fn(async (filePath: string, data: string) => {
      virtualFiles.set(path.normalize(String(filePath)), String(data));
    }),
    mkdir: vi.fn(async () => undefined),
  };
  return { ...api, default: api };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  })),
}));

vi.mock("@/lib/local-session.server", () => ({
  readLocal: mocks.readLocal,
  writeLocal: mocks.writeLocal,
}));

vi.mock("@/lib/config.server", () => ({
  isResearch: () => false,
  demoConfig: {
    instrumentVersion: "v1.0",
    consentVersion: "c1.0",
    questions: [],
    scenarios: [],
  },
}));

import { getDemoSubmissions, removeDemoSubmission } from "@/lib/repository.server";

function makeSession(code: string): Session {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: `sess-${code}`,
    code,
    mode: "demo",
    status: "submitted_complete",
    createdAt: now,
    submittedAt: now,
    draftExpiresAt: "2026-01-08T00:00:00.000Z",
    withdrawDeadline: "2026-01-15T00:00:00.000Z",
    instrumentVersion: "v1.0",
    consentVersion: "c1.0",
    priorExposure: false,
    answers: {},
    attempts: [],
  };
}

describe("getDemoSubmissions and removeDemoSubmission reset guarantees", () => {
  const cwdDataDir = path.join(process.cwd(), ".demo-data");
  const tmpDataDir = path.join(os.tmpdir(), ".demo-data");
  const prevVercel = process.env.VERCEL;

  beforeEach(() => {
    vi.clearAllMocks();
    virtualFiles.clear();
    cookieStore.current = null;
    if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
      globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
    }
    globalThis.__CYBER_CAMPUS_COUNTER__ = 0;
    delete process.env.VERCEL;
  });

  afterEach(() => {
    if (prevVercel === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = prevVercel;
    }
  });

  it("does not resurrect zombie RAM or cookie sessions on a reset workspace", async () => {
    const stale = makeSession("PART-001");
    globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.set(stale.code, stale);
    cookieStore.current = { session: stale, tokenHash: "stale-hash" };

    virtualFiles.set(path.normalize(path.join(cwdDataDir, "submissions.json")), "[]");
    virtualFiles.set(
      path.normalize(path.join(cwdDataDir, "participant_counter.json")),
      JSON.stringify({ counter: 0 }),
    );

    const submissions = await getDemoSubmissions();

    expect(submissions).toEqual([]);
    expect(globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.size).toBe(0);
    expect(mocks.readLocal).not.toHaveBeenCalled();
    expect(mocks.writeLocal).toHaveBeenCalledWith(null);
  });

  it("falls back to cwd participant_counter.json during serverless cold starts so stale cookies are not resurrected", async () => {
    process.env.VERCEL = "1";
    const stale = makeSession("PART-001");
    cookieStore.current = { session: stale, tokenHash: "stale-hash" };

    // Only cwd files exist (runtime /tmp/.demo-data has not been written yet)
    virtualFiles.set(path.normalize(path.join(cwdDataDir, "submissions.json")), "[]");
    virtualFiles.set(
      path.normalize(path.join(cwdDataDir, "participant_counter.json")),
      JSON.stringify({ counter: 0 }),
    );

    const submissions = await getDemoSubmissions();

    expect(submissions).toEqual([]);
    expect(virtualFiles.has(path.normalize(path.join(tmpDataDir, "submissions.json")))).toBe(false);
    expect(mocks.readLocal).not.toHaveBeenCalled();
    expect(mocks.writeLocal).toHaveBeenCalledWith(null);
  });

  it("purges a removed participant across RAM cache, disk files, and active cookie session", async () => {
    const first = makeSession("PART-001");
    const second = makeSession("PART-002");

    globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.set(first.code, first);
    globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.set(second.code, second);
    virtualFiles.set(
      path.normalize(path.join(cwdDataDir, "submissions.json")),
      JSON.stringify([first, second]),
    );
    virtualFiles.set(
      path.normalize(path.join(cwdDataDir, "participant_counter.json")),
      JSON.stringify({ counter: 2 }),
    );
    cookieStore.current = { session: first, tokenHash: "active-hash" };

    await removeDemoSubmission("PART-001");

    expect(globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.has("PART-001")).toBe(false);
    expect(globalThis.__CYBER_CAMPUS_SUBMISSIONS__?.has("PART-002")).toBe(true);
    expect(mocks.writeLocal).toHaveBeenCalledWith(null);

    const remaining = await getDemoSubmissions();
    expect(remaining.map((s) => s.code)).toEqual(["PART-002"]);
  });
});
