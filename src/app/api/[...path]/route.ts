import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getConfig,
  getSession,
  startSession,
  startNewParticipantSession,
  clearActiveSession,
  saveDraft,
  submitBaseline,
  recordAttempt,
  recordSessionToWorkspace,
  discardDraft,
  withdraw,
} from "@/lib/repository.server";
import {
  startSchema,
  saveSchema,
  submitSchema,
  attemptSchema,
  withdrawalSchema,
} from "@/lib/validation";
import { scenarios } from "@/content/scenarios.server";
import { isResearch } from "@/lib/config.server";
import { requireResearcher, supabase } from "@/lib/supabase.server";
import {
  checkPinRateLimit,
  clearResearcherSession,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  setResearcherSession,
  verifyPinConstantTime,
} from "@/lib/researcher-auth.server";
import { syntheticSessions } from "@/lib/fixtures.server";
import { exportCsv, exportKinds, type ExportKind } from "@/lib/csv";
import {
  exportDescriptiveStatsCsv,
  exportCorrelationMatrixCsv,
  exportHypothesisSummaryCsv,
  exportRegressionResultsCsv,
  exportReliabilityCsv,
  exportExcelXmlWorkbook,
} from "@/lib/statistics-export";
import { filterSessions } from "@/lib/analytics";
import type { Session, Filters } from "@/lib/types";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
type Ctx = { params: Promise<{ path: string[] }> };
const rate = new Map<string, { time: number; count: number }>();
function limit(key: string) {
  const now = Date.now(),
    r = rate.get(key);
  if (!r || now - r.time > 60000) rate.set(key, { time: now, count: 1 });
  else if (++r.count > 120)
    throw new Error("Too many requests. Please wait one minute.");
  if (rate.size > 5000) rate.clear();
}
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const path = (await ctx.params).path.join("/");
    if (path === "config")
      return json({
        config: await getConfig(),
        mode: isResearch() ? "research" : "demo",
      });
    if (path === "session") return json({ session: await getSession() });
    if (path === "scenarios") {
      const s = await getSession();
      if (!s)
        return json(
          {
            error:
              "Research consent required before accessing cyber missions, or choose practice mode.",
          },
          403,
        );
      if (s.mode !== "practice" && s.status === "draft")
        return json(
          {
            error:
              "Complete and submit your demographic profile before accessing research missions, or choose practice mode.",
          },
          403,
        );
      return json({ scenarios });
    }
    if (path === "debrief") {
      const s = await getSession();
      if (!s)
        return json(
          { error: "Active research session required." },
          403,
        );
      const { answerKeys } = await import("@/content/scenarios.server");
      return json({ debrief: answerKeys });
    }
    if (
      path === "admin/data" ||
      path === "demo/data" ||
      path === "admin/export" ||
      path === "demo/export"
    ) {
      const demo = path.startsWith("demo/");
      let data: Session[];
      if (demo) {
        if (isResearch())
          return json(
            { error: "Demo fixtures are disabled in research mode." },
            404,
          );
        const { getDemoSubmissions } = await import("@/lib/repository.server");
        const demoSubs = await getDemoSubmissions();
        data = [...demoSubs, ...syntheticSessions()];
      } else {
        const db = await requireResearcher();
        const result = await db.rpc("research_dataset");
        if (result.error)
          throw new Error("The database is unavailable. Please retry.");
        data = (result.data as Session[]).filter(
          (s) =>
            !s.id?.includes("synthetic") &&
            !s.submissionId?.includes("synthetic") &&
            !s.code?.includes("synthetic"),
        );
      }
      if (path.endsWith("/data")) return json({ sessions: data });
      const kind = req.nextUrl.searchParams.get("kind") as string;
      const statKinds = [
        "stats-descriptive",
        "stats-correlations",
        "stats-hypotheses",
        "stats-regression",
        "stats-reliability",
        "stats-excel",
      ];
      if (
        !exportKinds.includes(kind as ExportKind) &&
        !statKinds.includes(kind)
      )
        return json({ error: "Unknown export format." }, 400);
      const filters = Object.fromEntries(
        [...req.nextUrl.searchParams.entries()].filter(([k]) =>
          [
            "from",
            "to",
            "code",
            "Q1",
            "Q2",
            "Q3",
            "Q4",
            "Q5",
            "exposure",
            "status",
          ].includes(k),
        ),
      ) as Filters;
      if (!demo) {
        const db = await requireResearcher();
        const { error } = await db.rpc("audit_export", { p_kind: kind });
        if (error)
          throw new Error("The export audit could not be saved. Please retry.");
      }

      const filteredData = filterSessions(data, filters);

      if (kind === "stats-excel") {
        return new NextResponse(exportExcelXmlWorkbook(filteredData, demo), {
          headers: {
            "Content-Type": "application/vnd.ms-excel; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="CyberCampus_Statistical_Report.xls"',
            "Cache-Control": "no-store, private",
          },
        });
      }

      if (kind === "stats-descriptive") {
        return new NextResponse(
          exportDescriptiveStatsCsv(filteredData, filters, demo),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="descriptive-statistics.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      if (kind === "stats-correlations") {
        return new NextResponse(
          exportCorrelationMatrixCsv(filteredData, "spearman", filters, demo),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="correlation-matrix.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      if (kind === "stats-hypotheses") {
        return new NextResponse(
          exportHypothesisSummaryCsv(filteredData, 0.05, "none", "spearman", filters, demo),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="hypothesis-testing-results.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      if (kind === "stats-regression") {
        return new NextResponse(
          exportRegressionResultsCsv(filteredData, "DV_COMPOSITE", ["IV1_COMPOSITE", "IV2_COMPOSITE", "IV3_COMPOSITE", "IV4_COMPOSITE"], filters, demo),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="regression-analysis-results.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      if (kind === "stats-reliability") {
        return new NextResponse(
          exportReliabilityCsv(filteredData),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="scale-reliability-results.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      return new NextResponse(
        exportCsv(kind as ExportKind, filteredData, filters, demo),
        {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="' + kind + '.csv"',
            "Cache-Control": "no-store, private",
          },
        },
      );
    }
    return json({ error: "Not found." }, 404);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Request failed.";
    return json(
      { error: m },
      m.includes("authentication") ? 401 : m.includes("denied") ? 403 : 503,
    );
  }
}
function isAllowedOrigin(origin: string | null, req: NextRequest): boolean {
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

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const origin = req.headers.get("origin");
    if (!isAllowedOrigin(origin, req))
      return json({ error: "This request must come from this site." }, 403);
    if (Number(req.headers.get("content-length") ?? 0) > 40000)
      return json({ error: "Request too large." }, 413);
    const path = (await ctx.params).path.join("/");
    // Best-effort per-instance limiter; PostgreSQL separately limits authenticated writes.
    limit(
      path +
        ":" +
        (req.cookies.get("cc_local")?.value.slice(-24) ??
          req.headers.get("x-forwarded-for")?.split(",")[0] ??
          "unknown"),
    );
    const raw = await req.text();
    if (raw.length > 40000) return json({ error: "Request too large." }, 413);
    const body = raw ? JSON.parse(raw) : {};
    if (path === "session/start") {
      const parsed = startSchema.parse(body);
      const clientLastCode =
        typeof body?.clientLastCode === "string" || typeof body?.clientLastCode === "number"
          ? body.clientLastCode
          : undefined;
      return json({ session: await startSession({ ...parsed, clientLastCode }) });
    }
    if (path === "session/new-participant") {
      const clientToken = typeof body?.token === "string" ? body.token : undefined;
      const clientLastCode =
        typeof body?.clientLastCode === "string" || typeof body?.clientLastCode === "number"
          ? body.clientLastCode
          : undefined;
      return json({ session: await startNewParticipantSession({ token: clientToken, clientLastCode }) });
    }
    if (path === "session/clear" || path === "session/reset") {
      await clearActiveSession();
      return json({ ok: true });
    }
    if (path === "session/draft")
      return json({ session: await saveDraft(saveSchema.parse(body).answers) });
    if (path === "session/submit") {
      const d = submitSchema.parse(body);
      return json({
        session: await submitBaseline(d.answers, d.idempotencyKey),
      });
    }
    if (path === "session/discard") {
      await discardDraft();
      return json({ ok: true });
    }
    if (path === "session/submit-answers" || path === "session/record-workspace") {
      return json(await recordSessionToWorkspace());
    }
    if (path === "game/attempt")
      return json(await recordAttempt(attemptSchema.parse(body)));
    if (path === "withdraw") {
      const d = withdrawalSchema.parse(body);
      await withdraw(d.code, d.token);
      return json({ ok: true });
    }
    if (path === "auth/login") {
      const pin = typeof body.pin === "string" ? body.pin.trim() : "";
      if (!pin) {
        return json(
          { error: "Enter your researcher access PIN." },
          400,
        );
      }

      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";

      const rateCheck = checkPinRateLimit(clientIp);
      if (!rateCheck.allowed) {
        const remainingMinutes = rateCheck.remainingMinutes ?? 15;
        return json(
          {
            error: `Too many failed attempts. Temporary lockout in effect. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}.`,
          },
          429,
        );
      }

      const isValid = verifyPinConstantTime(pin);
      if (!isValid) {
        const attempt = recordFailedAttempt(clientIp);
        if (attempt.locked) {
          return json(
            {
              error: `Too many failed attempts. Temporary lockout in effect. Please try again in ${attempt.remainingMinutes ?? 15} minutes.`,
            },
            429,
          );
        }
        return json(
          { error: "Invalid Researcher Access PIN. Please try again." },
          401,
        );
      }

      recordSuccessfulAttempt(clientIp);
      await setResearcherSession();
      return json({ ok: true });
    }
    if (path === "auth/logout") {
      await clearResearcherSession();
      if (isResearch()) {
        try {
          const db = await supabase();
          await db.auth.signOut();
        } catch {
          /* ignore */
        }
      }
      return json({ ok: true });
    }
    return json({ error: "Not found." }, 404);
  } catch (e) {
    if (e instanceof ZodError)
      return json(
        {
          error:
            "Please check the submitted fields. Invalid or missing responses were rejected.",
        },
        400,
      );
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
}
