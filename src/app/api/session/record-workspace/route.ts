import { NextRequest } from "next/server";
import { recordSessionToWorkspace } from "@/lib/repository.server";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";
import type { Answers } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/record-workspace");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const body = parsedReq.body;
    const answers = body?.answers && typeof body.answers === "object" ? (body.answers as Answers) : undefined;
    return json(await recordSessionToWorkspace(answers));
  } catch (e) {
    return handleApiError(e);
  }
}
