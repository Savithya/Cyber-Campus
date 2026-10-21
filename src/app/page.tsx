import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  LockKeyhole,
  Check,
  ShieldCheck,
} from "lucide-react";
import { HomeThreatCards } from "@/components/home-threat-cards";
import { CyberInvestigatorShowcase } from "@/components/cyber-investigator-showcase";
import { HeroScopeMetrics } from "@/components/hero-scope-metrics";
import { HeroCyberVisual } from "@/components/hero-cyber-visual";
import { ParticipationJourney } from "@/components/participation-journey";
import { StudyEthicsPrinciples } from "@/components/study-ethics-principles";

export default function Home() {
  return (
    <div className="home-page-container">
      {/* =========================================================================
          04 — HERO SECTION (FULL-WIDTH PANORAMIC CYBER RESEARCH PLATFORM)
          ========================================================================= */}
      <section
        id="home"
        className="hero-section hero-panoramic-section container"
        aria-label="Interactive Cybersecurity Research Platform"
      >
        {/* Top Header Block (Centered & High-Impact) */}
        <div className="hero-header-block max-w-4xl mx-auto">
          <div className="eyebrow inline-flex items-center gap-2 justify-center mb-4">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>ACADEMIC CYBERSECURITY RESEARCH PLATFORM · SRI LANKA</span>
          </div>

          <h1 className="hero-main-heading">
            Explore Cyber Threats.
            <br />
            Protect Your <span>Digital Privacy</span>.
          </h1>

          <p className="hero-subtitle-text max-w-3xl mx-auto">
            Participate in interactive cybersecurity scenarios investigating the impact of social
            engineering threats on user privacy among university students in Sri Lanka.
          </p>

          <p className="hero-body-description max-w-3xl mx-auto">
            Investigate realistic digital threats across four independent categories: phishing,
            pretexting, impersonation, and malicious links. Make informed decisions in a safe,
            controlled simulation environment to contribute essential data for student privacy research.
          </p>

          {/* Hero CTAs */}
          <div className="hero-actions-row justify-center mt-6">
            <Link
              className="button primary large hero-cta-btn"
              href="/consent"
              aria-label="Start Research Participation"
            >
              <span>Start Research</span>
              <ClipboardList size={19} aria-hidden="true" />
            </Link>

            <a
              className="button secondary large hero-cta-btn"
              href="#challenges"
              aria-label="Explore Cyber Challenges"
            >
              <span>Explore Cyber Challenges</span>
              <Gamepad2 size={19} aria-hidden="true" />
            </a>
          </div>

          {/* Reassurance Chips */}
          <div className="hero-reassurance-row justify-center mt-4">
            <span className="reassurance-pill">
              <Check size={14} className="text-emerald" aria-hidden="true" /> 100% Voluntary Participation
            </span>
            <span className="reassurance-pill">
              <LockKeyhole size={14} className="text-cyan" aria-hidden="true" /> Anonymous Research ID · No Real Passwords
            </span>
            <span className="reassurance-pill">
              <ShieldCheck size={14} className="text-purple" aria-hidden="true" /> 4 Threat Vectors · User Privacy (DV)
            </span>
          </div>
        </div>

        {/* Center: Full-Width Panoramic Animated Cyber Visual */}
        <div className="hero-panoramic-visual-wrapper">
          <HeroCyberVisual />
        </div>

        {/* Bottom: 3 UI/UX Metric Cards in a Wide, Spacious Full-Width Grid */}
        <div className="hero-panoramic-metrics-deck">
          <HeroScopeMetrics />
        </div>
      </section>

      {/* =========================================================================
          04.B — PARTICIPATION JOURNEY (INTERACTIVE 4-STEP TIMELINE)
          ========================================================================= */}
      <ParticipationJourney />

      {/* =========================================================================
          04.C — RESEARCH VARIABLES (IV1–IV4)
          ========================================================================= */}
      <section className="explore-threats-section container my-16" aria-labelledby="threats-heading">
        <div className="section-header-centered">
          <span className="mini-label">RESEARCH VARIABLES (IV1–IV4)</span>
          <h2 id="threats-heading" className="text-3xl font-extrabold tracking-tight">
            Explore the Four Social Engineering Threats
          </h2>
          <p className="text-muted max-w-2xl mx-auto mt-2 text-base leading-relaxed">
            Learn how each category operates through realistic simulated scenarios. No technical
            cybersecurity background required.
          </p>
        </div>

        <HomeThreatCards />
      </section>

      {/* =========================================================================
          04.D — RESEARCH INFORMATION & ETHICS (ACCESSIBLE CONTENT CARDS)
          ========================================================================= */}
      <StudyEthicsPrinciples />

      {/* =========================================================================
          04.E — INTERACTIVE MISSION SHOWCASE ("Think Like a Cyber Investigator")
          ========================================================================= */}
      <CyberInvestigatorShowcase />
    </div>
  );
}
