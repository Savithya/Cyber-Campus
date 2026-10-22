import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { SessionProvider, SessionContext, useSession, api, clearParticipationStorage } from "@/lib/client";

describe("Session Context & Client-Side Navigation Performance", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearParticipationStorage();
  });

  it("exports SessionProvider, SessionContext, and useSession hook", () => {
    expect(SessionProvider).toBeDefined();
    expect(useSession).toBeDefined();
    expect(SessionContext).toBeDefined();
  });

  it("caches static config calls in memory to prevent network roundtrips during navigation", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => ({
      ok: true,
      json: async () => ({
        config: { title: "Cyber Campus", version: "1.0.0" },
      }),
    } as unknown as Response));

    // First fetch: hits network
    const res1 = await api<{ config: { title: string } }>("config");
    expect(res1.config.title).toBe("Cyber Campus");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second fetch: served from memory cache
    const res2 = await api<{ config: { title: string } }>("config");
    expect(res2.config.title).toBe("Cyber Campus");
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Not called again!

    // Clear storage clears memory cache
    clearParticipationStorage();

    // Third fetch after clear: hits network again
    const res3 = await api<{ config: { title: string } }>("config");
    expect(res3.config.title).toBe("Cyber Campus");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

