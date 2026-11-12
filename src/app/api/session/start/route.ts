import { NextRequest } from "next/server";
import { startSession } from "@/lib/repository.server";
import { startSchema } from "@/lib/validation";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/start");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const parsed = startSchema.parse(parsedReq.body);
    const clientLastCode =
      typeof parsed.clientLastCode === "string" || typeof parsed.clientLastCode === "number"
        ? parsed.clientLastCode
        : undefined;
    return json({ session: await startSession({ ...parsed, clientLastCode }) });
  } catch (e) {
    return handleApiError(e);
  }
}
