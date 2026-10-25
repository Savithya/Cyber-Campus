import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getResearcherSession } from "./researcher-auth.server";
import { isResearch } from "./config.server";

export async function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error(
      "Research database is not configured. Set the Supabase URL and publishable key.",
    );
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        for (const { name, value, options } of values) {
          try {
            jar.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          } catch {
            /* Read-only server components cannot refresh cookies. API requests refresh them. */
          }
        }
      },
    },
  });
}

/**
 * Creates a server-only Supabase client using the service role key if configured.
 * This key is strictly server-side and never exposed to the browser.
 */
export function serverAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServerClient(url, serviceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: { persistSession: false },
  });
}

/**
 * Server-side authorisation check protecting all researcher routes and APIs.
 * Requires a valid, unexpired researcher session established via PIN authentication.
 */
export async function requireResearcher() {
  const session = await getResearcherSession();
  if (!session) {
    throw new Error("Researcher authentication required.");
  }

  // In local/demo mode, return actual submitted participant sessions (excluding synthetic mock fixtures)
  if (!isResearch()) {
    return {
      rpc: async (name: string) => {
        if (name === "research_dataset") {
          const { getDemoSubmissions } = await import("./repository.server");
          const demoSubs = await getDemoSubmissions();
          const cleanSubs = demoSubs.filter(
            (s) =>
              !s.id?.includes("synthetic") &&
              !s.submissionId?.includes("synthetic") &&
              !s.code?.includes("synthetic") &&
              !s.id?.includes("mock") &&
              !s.submissionId?.includes("mock") &&
              s.mode !== "practice",
          );
          return { data: cleanSubs, error: null };
        }
        if (name === "audit_export") {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { user_id: session.sessionId },
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof supabase>>;
  }

  // In research mode, use server admin client if service role key is configured
  const adminClient = serverAdminSupabase();
  if (adminClient) {
    return adminClient as unknown as Awaited<ReturnType<typeof supabase>>;
  }

  // Otherwise, use standard Supabase SSR client
  const db = await supabase();
  return db;
}
