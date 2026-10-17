"use client";
import { useEffect, useState } from "react";
import type { Session, Answers } from "./types";
export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<T> {
  const isMutation = path === "session/discard" || path === "auth/logout";
  const method = body !== undefined || isMutation ? "POST" : "GET";
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
  return data;
}
export function useSession() {
  const [session, setSession] = useState<Session | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setSession((await api<{ session: Session | null }>("session")).session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, []);
  return { session, setSession, loading, error, reload };
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
  localStorage.setItem(draftKey, JSON.stringify(d));
}
export function clearDraft() {
  localStorage.removeItem(draftKey);
}
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function clearParticipationStorage() {
  clearDraft();
  sessionStorage.removeItem("cc-receipt");
}
