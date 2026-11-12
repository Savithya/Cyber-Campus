import { NextRequest } from "next/server";
import { recordAttempt } from "@/lib/repository.server";
import { attemptSchema } from "@/lib/validation";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "game/attempt");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    return json(await recordAttempt(attemptSchema.parse(parsedReq.body)));
  } catch (e) {
    return handleApiError(e);
  }
}
