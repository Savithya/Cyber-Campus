import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const resolvedPath = (await params).path ?? [];
  const target = resolvedPath.length > 0 ? `/admin/${resolvedPath.join("/")}` : "/admin";
  redirect(target);
}
