import { NextResponse } from "next/server";
import { getConfig } from "@/lib/repository.server";
import { isResearch } from "@/lib/config.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      {
        config: await getConfig(),
        mode: isResearch() ? "research" : "demo",
      },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Temporary configuration issue. Please retry." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
