import { HeroSection } from "@/components/hero-section";
import { ResearchMetrics } from "@/components/research-metrics";
import { ThreatCategories } from "@/components/threat-categories";
import { ParticipationJourney } from "@/components/participation-journey";
import { ResearchEthics } from "@/components/research-ethics";
import { ResearchCTA } from "@/components/research-cta";

export default function Home() {
  return (
    <div id="home" className="cyber-campus-home-wrapper">
      {/* 1. Split-Screen Hero Section */}
      <HeroSection />

      {/* 2. Research Overview Metrics (4 Cards) */}
      <ResearchMetrics />

      {/* 3. Four Social Engineering Threat Cards (IV1–IV4) */}
      <ThreatCategories />

      {/* 4. Four-Step Participation Journey */}
      <ParticipationJourney />

      {/* 5. Research Ethics & Privacy Section */}
      <ResearchEthics />

      {/* 6. Final Research Call-to-Action Banner */}
      <ResearchCTA />
    </div>
  );
}
