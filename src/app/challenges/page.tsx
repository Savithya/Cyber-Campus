import { Suspense } from "react";
import { CyberChallengeZone } from "@/components/cyber-challenge-zone";
import { Loading } from "@/components/ui";

export const metadata = {
  title: "Explore Cybersecurity Challenges · Cyber Campus",
  description:
    "Discover realistic social engineering scenarios and practice identifying suspicious digital interactions across four threat categories.",
};

export default function ChallengesPage() {
  return (
    <div className="challenges-page-wrapper page-space">
      <Suspense fallback={<Loading />}>
        <CyberChallengeZone />
      </Suspense>
    </div>
  );
}
