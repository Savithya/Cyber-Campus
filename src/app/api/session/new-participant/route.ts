import { NextRequest } from "next/server";
import { startNewParticipantSession } from "@/lib/repository.server";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/new-participant");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const body = parsedReq.body;
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
  } catch (e) {
    return handleApiError(e);
  }
}
