import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  readLocal: vi.fn(),
}));
vi.mock("@/lib/supabase.server", () => ({
  supabase: async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc }),
}));
vi.mock("@/lib/local-session.server", () => ({
  readLocal: mocks.readLocal,
  writeLocal: vi.fn(),
}));
vi.mock("@/lib/config.server", () => ({
  isResearch: () => true,
  demoConfig: {},
}));
import { getSession, startSession } from "@/lib/repository.server";
describe("research mode fails closed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readLocal.mockResolvedValue(null);
  });
  it("an unauthenticated browser has no research session", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthSessionMissingError" },
    });
    expect(await getSession()).toBeNull();
  });
  it("a failed authentication service is not treated as a new participant", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError" },
    });
    await expect(getSession()).rejects.toThrow("Unable to verify");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("practice cannot bypass an unverifiable research session", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: { name: "AuthRetryableFetchError" },
    });
    await expect(
      startSession({
        consented: false,
        eligible: false,
        practice: true,
        priorExposure: false,
        token: "a".repeat(64),
      }),
    ).rejects.toThrow("Unable to verify");
  });
  it("a research RPC failure never returns synthetic data", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "test" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "Database offline" },
    });
    await expect(getSession()).rejects.toThrow("research database");
  });
});
