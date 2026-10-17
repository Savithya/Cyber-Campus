import { Suspense } from "react";
import { CyberMissionControl } from "@/components/cyber-mission-control";
import { Loading } from "@/components/ui";

export const metadata = {
  title: "Cyber Mission Control · Cyber Campus Research",
  description: "Interactive scenario-based cybersecurity challenges investigating social engineering threats on user privacy.",
};

export default function PlayPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CyberMissionControl />
    </Suspense>
  );
}
