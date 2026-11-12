import { Suspense } from "react";
import Link from "next/link";
import Admin from "@/components/admin";
import { requireResearcher } from "@/lib/supabase.server";
import { scenarios } from "@/content/scenarios.server";
import { Loading } from "@/components/ui";
import type { Session } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  let sessions: Session[];
  try {
    const db = await requireResearcher();
    const { data, error } = await db.rpc("research_dataset");
    if (error) throw Error("Database unavailable");
    // Exclude practice-only sessions from Research Workspace
    sessions = (data as Session[]).filter((s) => s.mode !== "practice");
  } catch {
    return (
      <div className="narrow page-space">
        <h1>Researcher access required</h1>
        <p>
          Enter your authorised Researcher Access PIN to securely access the
          research dashboard.
        </p>
        <Link className="button primary" href="/admin/login">
          Access Research Dashboard
        </Link>
      </div>
    );
  }
  const resolvedPath = (await params).path ?? [];
  return (
    <Suspense fallback={<Loading />}>
      <Admin
        sessions={sessions}
        demo={false}
        path={resolvedPath}
        scenarios={scenarios}
      />
    </Suspense>
  );
}
