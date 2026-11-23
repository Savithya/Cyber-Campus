import { NextRequest } from "next/server";
import {
  clearActiveSession,
  discardDraft,
  recordSessionToWorkspace,
  startNewParticipantSession,
} from "@/lib/repository.server";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";
import type { Answers } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ path: string[] }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const segments = (await ctx.params).path;
    const subpath = segments.join("/");
    const parsedReq = await parseGuardedPostBody(req, `session/${subpath}`);
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const body = parsedReq.body;

    if (subpath === "submit-answers" || subpath === "record-workspace") {
      const answers = body?.answers && typeof body.answers === "object" ? (body.answers as Answers) : undefined;
      return json(await recordSessionToWorkspace(answers));
    }
    if (subpath === "new-participant") {
      const clientToken = typeof body?.token === "string" ? body.token : undefined;
      const clientLastCode =
        typeof body?.clientLastCode === "string" || typeof body?.clientLastCode === "number"
          ? body.clientLastCode
          : undefined;
      const resetToStart = Boolean(body?.resetToStart);
      return json({
        session: await startNewParticipantSession({
          token: clientToken,
          clientLastCode,
          resetToStart,
        }),
      });
    }
    if (subpath === "discard") {
      await discardDraft();
      return json({ ok: true });
    }
    if (subpath === "clear" || subpath === "reset") {
      await clearActiveSession();
      return json({ ok: true });
    }

    return json({ error: "Not found." }, 404);
  } catch (e) {
    return handleApiError(e);
  }
}
