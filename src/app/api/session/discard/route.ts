import { NextRequest } from "next/server";
import { discardDraft } from "@/lib/repository.server";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/discard");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    await discardDraft();
    return json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
