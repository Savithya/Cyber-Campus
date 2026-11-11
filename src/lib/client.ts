"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Session, Answers } from "./types";

// Client-side in-memory cache and in-flight deduplication for read-only GET responses
const getCache = new Map<string, { data: unknown; timestamp: number }>();
const inflightGets = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHEABLE_GET_PATHS = new Set(["config", "scenarios", "debrief"]);

export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<T> {
  const isMutation =
    path === "session/discard" ||
    path === "session/new-participant" ||
    path === "session/clear" ||
    path === "session/reset" ||
    path === "admin/reset" ||
    path === "admin/reset-workspace" ||
    path === "auth/logout";
  const method = body !== undefined || isMutation ? "POST" : "GET";
  const cacheableGet = method === "GET" && CACHEABLE_GET_PATHS.has(path);

  // Serve static read-only GET requests from memory cache when available
  if (cacheableGet) {
    const cached = getCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
    const existing = inflightGets.get(path);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const runFetch = async () => {
    const r = await fetch("/api/" + path, {
      method,
      headers:
        body === undefined && !isMutation
          ? {}
          : { "Content-Type": "application/json" },
      body:
        body === undefined && isMutation
          ? "{}"
          : body === undefined
          ? undefined
          : JSON.stringify(body),
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok)
      throw new Error(
        data.error ?? "Unable to save. Check your connection and retry.",
      );

    if (cacheableGet) {
      getCache.set(path, { data, timestamp: Date.now() });
    }

    return data as T;
  };

  if (cacheableGet) {
    const p = runFetch().finally(() => {
      inflightGets.delete(path);
    });
    inflightGets.set(path, p);
    return p;
  }

  return runFetch();
}

export interface SessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

let inflightSessionPromise: Promise<{ session: Session | null }> | null = null;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSettledRef = useRef(false);
  const errorRef = useRef("");

  const setSession = useCallback(
    (next: React.SetStateAction<Session | null>) => {
      hasSettledRef.current = true;
      errorRef.current = "";
      setSessionState(next);
      setLoading(false);
      setError("");
    },
    [],
  );

  const reload = useCallback(async () => {
    if (!hasSettledRef.current || errorRef.current) {
      setLoading(true);
    }
    errorRef.current = "";
    setError("");
    try {
      if (!inflightSessionPromise) {
        inflightSessionPromise = api<{ session: Session | null }>("session").finally(() => {
          inflightSessionPromise = null;
        });
      }
      const res = await inflightSessionPromise;
      hasSettledRef.current = true;
      setSessionState(res.session);
    } catch (e) {
      const msg = (e as Error).message;
      errorRef.current = msg;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return React.createElement(
    SessionContext.Provider,
    { value: { session, setSession, loading, error, reload } },
    children,
  );
}

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
export const draftKey = "cc-private-draft-v1";
type LocalDraft = {
  code: string;
  expires: string;
  answers: Answers;
  token?: string;
  submitKey?: string;
};
export function loadDraft(code: string): LocalDraft | null {
  try {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return null;
    const d = JSON.parse(raw) as LocalDraft;
    if (Date.parse(d.expires) < Date.now()) {
      localStorage.removeItem(draftKey);
      return null;
    }
    return d.code === code ? d : null;
  } catch {
    return null;
  }
}
export function putDraft(d: LocalDraft) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(draftKey, JSON.stringify(d));
    } catch {}
  }
}
export function clearDraft() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
  }
}
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function clearParticipationStorage() {
  clearDraft();
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("cc-receipt");
    } catch {}
  }
  getCache.clear();
  inflightGets.clear();
  inflightSessionPromise = null;
}
