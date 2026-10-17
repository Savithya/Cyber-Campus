import { Suspense } from "react";
import { notFound } from "next/navigation";
import Admin from "@/components/admin";
import { syntheticSessions } from "@/lib/fixtures.server";
import { getDemoSubmissions } from "@/lib/repository.server";
import { isResearch } from "@/lib/config.server";
import { Loading } from "@/components/ui";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  if (isResearch()) notFound();
  const demoSubmissions = await getDemoSubmissions();
  const allSessions = [...demoSubmissions, ...syntheticSessions()];
  return (
    <Suspense fallback={<Loading />}>
      <Admin
        sessions={allSessions}
        demo
        path={(await params).path ?? []}
      />
    </Suspense>
  );
}
