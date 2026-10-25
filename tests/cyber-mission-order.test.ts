import { beforeEach, describe, it, expect, vi, afterAll } from "vitest";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const mocks = vi.hoisted(() => ({
  readLocal: vi.fn(),
  writeLocal: vi.fn(),
}));

vi.mock("@/lib/local-session.server", () => ({
  readLocal: mocks.readLocal,
  writeLocal: mocks.writeLocal,
}));

vi.mock("@/lib/config.server", () => ({
  isResearch: () => false,
  demoConfig: {},
}));

import { getActiveMissions, missions } from "@/content/missions";
import { scenarios } from "@/content/scenarios.server";
import { startSession } from "@/lib/repository.server";

describe("Cyber Mission Canonical Order (IV1 -> IV2 -> IV3 -> IV4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readLocal.mockResolvedValue(null);
  });

  it("verifies active missions are ordered strictly IV1, IV2, IV3, IV4", () => {
    const active = getActiveMissions(false);
    expect(active.map((m) => m.iv)).toEqual(["IV1", "IV2", "IV3", "IV4"]);
    expect(active.map((m) => m.id)).toEqual(["phishing", "pretexting", "impersonation", "links"]);
  });

  it("verifies scenario codes within each mission follow exact 01-05 sequence", () => {
    const active = getActiveMissions(false);

    expect(active[0].ids).toEqual(["PH01", "PH02", "PH03", "PH04", "PH05"]);
    expect(active[1].ids).toEqual(["PT01", "PT02", "PT03", "PT04", "PT05"]);
    expect(active[2].ids).toEqual(["IM01", "IM02", "IM03", "IM04", "IM05"]);
    expect(active[3].ids).toEqual(["SC01", "SC02", "SC03", "SC04", "SC05"]);
  });

  it("verifies scenarios array starts with IV1 Phishing, then IV2 Pretexting, then IV3 Impersonation, then IV4 Online Scams", () => {
    const ids = scenarios.map((s) => s.id);
    expect(ids.slice(0, 5)).toEqual(["PH01", "PH02", "PH03", "PH04", "PH05"]);
    expect(ids.slice(5, 10)).toEqual(["PT01", "PT02", "PT03", "PT04", "PT05"]);
    expect(ids.slice(10, 15)).toEqual(["IM01", "IM02", "IM03", "IM04", "IM05"]);
    expect(ids.slice(15, 20)).toEqual(["SC01", "SC02", "SC03", "SC04", "SC05"]);
  });

  it("assigns canonical module order when starting a practice session", async () => {
    const session = await startSession({
      consented: false,
      eligible: false,
      priorExposure: false,
      practice: true,
      token: "a".repeat(64),
    });

    expect(session.assignedModuleOrder).toEqual([
      "phishing",
      "pretexting",
      "impersonation",
      "links",
    ]);
  });

  afterAll(async () => {
    try {
      const counterFile = path.join(process.cwd(), ".demo-data", "participant_counter.json");
      const subsFile = path.join(process.cwd(), ".demo-data", "submissions.json");
      await writeFile(counterFile, JSON.stringify({ counter: 0 }) + "\n", "utf-8");
      await writeFile(subsFile, "[]\n", "utf-8");
      if (globalThis.__CYBER_CAMPUS_SUBMISSIONS__) {
        globalThis.__CYBER_CAMPUS_SUBMISSIONS__.clear();
      }
    } catch {}
  });
});
