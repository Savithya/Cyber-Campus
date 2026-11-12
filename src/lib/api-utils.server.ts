import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export const json = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });

const rate = new Map<string, { time: number; count: number }>();

export function limit(key: string) {
  const now = Date.now(),
    r = rate.get(key);
  if (!r || now - r.time > 60000) rate.set(key, { time: now, count: 1 });
  else if (++r.count > 120)
    throw new Error("Too many requests. Please wait one minute.");
  if (rate.size > 5000) rate.clear();
}

export function isAllowedOrigin(origin: string | null, req: NextRequest): boolean {
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const hostHeader =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host")?.trim();

    const appOrigin = process.env.APP_ORIGIN?.trim();

    // 1. Direct match with Host header (exact same-origin request)
    if (hostHeader && originUrl.host.toLowerCase() === hostHeader.toLowerCase()) {
      return true;
    }

    // 2. Direct match with configured APP_ORIGIN
    if (appOrigin && origin.toLowerCase() === appOrigin.toLowerCase()) {
      return true;
    }

    // 3. Localhost <-> 127.0.0.1 equivalence in development
    const originHostname = originUrl.hostname.toLowerCase();
    const isLocalOrigin = originHostname === "localhost" || originHostname === "127.0.0.1";

    if (isLocalOrigin) {
      const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");

      if (hostHeader) {
        const [hostName, hostPort = "80"] = hostHeader.toLowerCase().split(":");
        const isLocalHost = hostName === "localhost" || hostName === "127.0.0.1";
        if (isLocalHost && (originPort === hostPort || !originUrl.port)) {
          return true;
        }
      }

      if (appOrigin) {
        try {
          const appUrl = new URL(appOrigin);
          const appHostname = appUrl.hostname.toLowerCase();
          const isAppLocal = appHostname === "localhost" || appHostname === "127.0.0.1";
          const appPort = appUrl.port || (appUrl.protocol === "https:" ? "443" : "80");
          if (isAppLocal && originPort === appPort) {
            return true;
          }
        } catch {
          // ignore malformed appOrigin
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function getRateKey(req: NextRequest, routeKey: string): string {
  return (
    routeKey +
    ":" +
    (req.cookies.get("cc_local")?.value.slice(-24) ??
      req.headers.get("x-forwarded-for")?.split(",")[0] ??
      "unknown")
  );
}

export async function parseGuardedPostBody(
  req: NextRequest,
  routeKey: string,
): Promise<{ body: Record<string, unknown> } | { errorResponse: NextResponse }> {
  const origin = req.headers.get("origin");
  if (!isAllowedOrigin(origin, req)) {
    return {
      errorResponse: json({ error: "This request must come from this site." }, 403),
    };
  }
  if (Number(req.headers.get("content-length") ?? 0) > 40000) {
    return { errorResponse: json({ error: "Request too large." }, 413) };
  }
  limit(getRateKey(req, routeKey));
  const raw = await req.text();
  if (raw.length > 40000) {
    return { errorResponse: json({ error: "Request too large." }, 413) };
  }
  const body = (raw ? JSON.parse(raw) : {}) as Record<string, unknown>;
  return { body };
}

export function handleApiError(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    return json(
      {
        error:
          "Please check the submitted fields. Invalid or missing responses were rejected.",
      },
      400,
    );
  }
  const message =
    e instanceof Error
      ? e.message
      : "Request failed. Retry when your connection returns.";
  return json(
    { error: message },
    message.includes("locked")
      ? 409
      : message.includes("required")
        ? 403
        : 400,
  );
}
