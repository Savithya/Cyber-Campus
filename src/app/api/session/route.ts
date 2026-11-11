import { NextResponse } from "next/server";
import { getSession } from "@/lib/repository.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(
      { session: await getSession() },
      { headers: { "Cache-Control": "no-store, private" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Temporary storage issue. Please retry in a moment." },
      { status: 500, headers: { "Cache-Control": "no-store, private" } },
    );
  }
}
