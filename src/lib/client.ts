"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, Answers } from "./types";

// Client-side in-memory cache for static GET responses
const getCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<T> {
  const isMutation =
    path === "session/discard" ||
    path === "session/new-participant" ||
    path === "session/clear" ||
    path === "session/reset" ||
    path === "auth/logout";
  const method = body !== undefined || isMutation ? "POST" : "GET";

  // Serve static read-only GET requests from memory cache when available
  if (method === "GET" && path === "config") {
    const cached = getCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

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

  if (method === "GET" && path === "config") {
    getCache.set(path, { data, timestamp: Date.now() });
  }

  return data;
}

export interface SessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ session: Session | null }>("session");
      setSession(res.session);
    } catch (e) {
      setError((e as Error).message);
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
}
