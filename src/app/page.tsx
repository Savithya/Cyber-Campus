import { SpotHero } from "@/components/spot-hero";
import { SpotTrustBar } from "@/components/spot-trust-bar";
import { SpotMissionSteps } from "@/components/spot-mission-steps";
import { SpotResearchVariables } from "@/components/spot-research-variables";
import { SpotPurposeCard } from "@/components/spot-purpose-card";

export default function Home() {
  return (
    <div id="home" className="spot-page-wrapper">
      {/* SECTION 1 — HERO (SPOT THE THREAT EDITORIAL LAYOUT) */}
      <SpotHero />

      {/* SECTION 2 — TRUST SAFEGUARDS (3-ITEM HORIZONTAL STRIP) */}
      <SpotTrustBar />

      {/* SECTION 3 — YOUR MISSION, SHOULD YOU ACCEPT IT (3 NUMBERED CARDS) */}
      <SpotMissionSteps />

      {/* SECTION 4 — RESEARCH VARIABLES (IV1–IV4) & USER PRIVACY (DV) */}
      <SpotResearchVariables />

      {/* SECTION 5 — RESEARCH PURPOSE CALLOUT BANNER */}
      <SpotPurposeCard />
    </div>
  );
}
