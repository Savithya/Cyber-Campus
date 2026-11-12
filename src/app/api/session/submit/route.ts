import { NextRequest } from "next/server";
import { submitBaseline } from "@/lib/repository.server";
import { submitSchema } from "@/lib/validation";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/submit");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const d = submitSchema.parse(parsedReq.body);
    return json({ session: await submitBaseline(d.answers, d.idempotencyKey) });
  } catch (e) {
    return handleApiError(e);
  }
}
