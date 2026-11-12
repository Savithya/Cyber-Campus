import { NextRequest } from "next/server";
import { saveDraft } from "@/lib/repository.server";
import { saveSchema } from "@/lib/validation";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "session/draft");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    return json({ session: await saveDraft(saveSchema.parse(parsedReq.body).answers) });
  } catch (e) {
    return handleApiError(e);
  }
}
