import { NextRequest, NextResponse } from "next/server";
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
import { isResearch } from "@/lib/config.server";
import {
  handleApiError,
  json,
  parseGuardedPostBody,
} from "@/lib/api-utils.server";
import type { ExportKind } from "@/lib/csv";
import type { Session, Filters } from "@/lib/types";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Ctx = { params: Promise<{ path: string[] }> };
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
      const { scenarios } = await import("@/content/scenarios.server");
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
        data = demoSubs.filter((s) => s.mode !== "practice");
      } else {
        const { requireResearcher } = await import("@/lib/supabase.server");
        const db = await requireResearcher();
        const result = await db.rpc("research_dataset");
        if (result.error)
          throw new Error("The database is unavailable. Please retry.");
        data = (result.data as Session[]).filter((s) => s.mode !== "practice");
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
      const csvMod = statKinds.includes(kind) ? null : await import("@/lib/csv");
      if (csvMod && !csvMod.exportKinds.includes(kind as ExportKind))
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
        const { requireResearcher } = await import("@/lib/supabase.server");
        const db = await requireResearcher();
        const { error } = await db.rpc("audit_export", { p_kind: kind });
        if (error)
          throw new Error("The export audit could not be saved. Please retry.");
      }

      const { filterSessions } = await import("@/lib/analytics");
      const filteredData = filterSessions(data, filters);

      if (csvMod) {
        return new NextResponse(
          csvMod.exportCsv(kind as ExportKind, filteredData, filters, demo),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="' + kind + '.csv"',
              "Cache-Control": "no-store, private",
            },
          },
        );
      }

      const {
        exportDescriptiveStatsCsv,
        exportCorrelationMatrixCsv,
        exportHypothesisSummaryCsv,
        exportRegressionResultsCsv,
        exportReliabilityCsv,
        exportExcelXmlWorkbook,
      } = await import("@/lib/statistics-export");

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
    return json({ error: "Not found." }, 404);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Request failed.";
    return json(
      { error: m },
      m.includes("authentication") ? 401 : m.includes("denied") ? 403 : 503,
    );
  }
}
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const path = (await ctx.params).path.join("/");
    const parsedReq = await parseGuardedPostBody(req, path);
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const body = parsedReq.body;
    if (path === "session/start") {
      const parsed = startSchema.parse(body);
      const clientLastCode =
        typeof parsed.clientLastCode === "string" || typeof parsed.clientLastCode === "number"
          ? parsed.clientLastCode
          : undefined;
      return json({ session: await startSession({ ...parsed, clientLastCode }) });
    }
    if (path === "session/new-participant") {
      const clientToken = typeof body?.token === "string" ? body.token : undefined;
      const clientLastCode =
        typeof body?.clientLastCode === "string" || typeof body?.clientLastCode === "number"
          ? body.clientLastCode
          : undefined;
      const resetToStart = Boolean(body?.resetToStart);
      return json({ session: await startNewParticipantSession({ token: clientToken, clientLastCode, resetToStart }) });
    }
    if (path === "session/clear" || path === "session/reset") {
      await clearActiveSession();
      return json({ ok: true });
    }
    if (path === "admin/reset" || path === "admin/reset-workspace") {
      const { requireResearcher } = await import("@/lib/supabase.server");
      await requireResearcher();
      const { resetResearchData } = await import("@/lib/repository.server");
      const res = await resetResearchData();
      return json(res);
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
      const {
        checkPinRateLimit,
        recordFailedAttempt,
        recordSuccessfulAttempt,
        setResearcherSession,
        verifyPinConstantTime,
      } = await import("@/lib/researcher-auth.server");
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
      const { clearResearcherSession } = await import("@/lib/researcher-auth.server");
      await clearResearcherSession();
      if (isResearch()) {
        try {
          const { supabase } = await import("@/lib/supabase.server");
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
    return handleApiError(e);
  }
}
