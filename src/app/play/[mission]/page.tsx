import { Suspense } from "react";
import { CyberMissionControl } from "@/components/cyber-mission-control";
import { Loading } from "@/components/ui";

export const metadata = {
  title: "Cyber Investigation Mission · Cyber Campus Research",
  description: "Interactive scenario-based cybersecurity challenges investigating social engineering threats on user privacy.",
};

export function generateStaticParams() {
  return [
    { mission: "phishing" },
    { mission: "pretexting" },
    { mission: "impersonation" },
    { mission: "links" },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ mission: string }>;
}) {
  const { mission } = await params;
  return (
    <Suspense fallback={<Loading />}>
      <CyberMissionControl initialMissionId={mission} />
    </Suspense>
  );
}
