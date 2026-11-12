import { NextRequest } from "next/server";
import {
  checkPinRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  setResearcherSession,
  verifyPinConstantTime,
} from "@/lib/researcher-auth.server";
import { handleApiError, json, parseGuardedPostBody } from "@/lib/api-utils.server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const parsedReq = await parseGuardedPostBody(req, "auth/login");
    if ("errorResponse" in parsedReq) return parsedReq.errorResponse;
    const body = parsedReq.body;
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";
    if (!pin) {
      return json({ error: "Enter your researcher access PIN." }, 400);
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
  } catch (e) {
    return handleApiError(e);
  }
}
