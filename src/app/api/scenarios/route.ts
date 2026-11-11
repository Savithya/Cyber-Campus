import { NextResponse } from "next/server";
import { scenarios } from "@/content/scenarios.server";
import { getSession } from "@/lib/repository.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const s = await getSession();
    if (!s) {
      return NextResponse.json(
        {
          error:
            "Research consent required before accessing cyber missions, or choose practice mode.",
        },
        { status: 403, headers: { "Cache-Control": "no-store, private" } },
      );
    }
    if (s.mode !== "practice" && s.status === "draft") {
      return NextResponse.json(
        {
          error:
            "Complete and submit your demographic profile before accessing research missions, or choose practice mode.",
        },
        { status: 403, headers: { "Cache-Control": "no-store, private" } },
      );
    }
    return NextResponse.json(
      { scenarios },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Temporary storage issue. Please retry in a moment." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
