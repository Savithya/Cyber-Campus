import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  LockKeyhole,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
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
          SECTION 1 — HERO (SPLIT-SCREEN HYBRID CYBER RESEARCH LAB LAYOUT)
          ========================================================================= */}
      <section
        id="home"
        className="hero-split-section container"
        aria-label="Interactive Cybersecurity Research Platform"
      >
        <div className="hero-split-layout">
          {/* Left Column: Heading, Supporting Description, Buttons, Reassurance */}
          <div className="hero-split-left">
            <div className="eyebrow inline-flex items-center gap-2 mb-4">
              <span className="live-pulse-dot" aria-hidden="true" />
              <span>ACADEMIC CYBERSECURITY RESEARCH PLATFORM · SRI LANKA</span>
            </div>

            <h1 className="hero-main-heading">
              Explore Cyber Threats.
              <br />
              Protect Your <span>Digital Privacy</span>.
            </h1>

            <p className="hero-subtitle-text mt-4">
              Participate in interactive cybersecurity scenarios investigating how social
              engineering threats relate to user privacy among university students in Sri Lanka.
            </p>

            <p className="hero-body-description mt-2 text-sm text-muted leading-relaxed">
              Investigate realistic digital threats across four independent categories: phishing,
              pretexting, impersonation, and online scams. Make informed decisions in a safe,
              controlled simulation environment to contribute essential data for student privacy research.
            </p>

            {/* Hero Action Buttons */}
            <div className="hero-actions-row mt-6">
              <Link
                className="button primary large hero-cta-btn"
                href="/consent"
                prefetch={true}
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

            {/* Reassurance Badges */}
            <div className="hero-reassurance-row mt-6 flex-wrap">
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

          {/* Right Column: Futuristic Cyber Lab Artwork */}
          <div className="hero-split-right">
            <HeroCyberVisual />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — RESEARCH OVERVIEW (4 METRIC CARDS)
          ========================================================================= */}
      <section className="research-overview-section container my-12" aria-label="Research Scope & Overview">
        <HeroScopeMetrics />
      </section>

      {/* =========================================================================
          SECTION 3 — FOUR THREAT CATEGORIES (IV1–IV4)
          ========================================================================= */}
      <section className="explore-threats-section container my-16 lg:my-24" aria-labelledby="threats-heading">
        <div className="section-header-centered text-center max-w-3xl mx-auto">
          <span className="mini-label">RESEARCH VARIABLES (IV1–IV4)</span>
          <h2 id="threats-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mt-2">
            Explore the Four Social Engineering Threats
          </h2>
          <p className="text-muted mt-3 text-base md:text-lg leading-relaxed">
            Examine how each category operates through realistic simulated scenarios. No technical
            cybersecurity background required.
          </p>
        </div>

        <HomeThreatCards />
      </section>

      {/* =========================================================================
          SECTION 4 — HOW CYBER CAMPUS WORKS (4-STEP PARTICIPATION JOURNEY)
          ========================================================================= */}
      <ParticipationJourney />

      {/* =========================================================================
          SECTION 5 — CYBER LAB PREVIEW (EDUCATIONAL SIMULATION SHOWCASE)
          ========================================================================= */}
      <div id="cyber-lab-preview">
        <CyberInvestigatorShowcase />
      </div>

      {/* =========================================================================
          SECTION 6 — RESEARCH ETHICS & PRIVACY
          ========================================================================= */}
      <StudyEthicsPrinciples />

      {/* =========================================================================
          SECTION 7 — RESEARCH CTA (HIGH-IMPACT RESEARCH INVITATION)
          ========================================================================= */}
      <section className="research-final-cta-section container my-16 lg:my-24" aria-label="Research Call to Action">
        <div className="research-cta-card p-8 lg:p-12 rounded-3xl border border-primary/30 bg-gradient-to-r from-card/90 via-card/70 to-card/90 backdrop-blur-xl shadow-2xl text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <span className="mini-label inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary/10 border border-primary/20 text-primary">
              <Sparkles size={14} className="animate-pulse" />
              Empirical Research Participation · Sri Lanka
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Help Improve Digital Privacy Awareness in Sri Lanka
            </h2>
            <p className="text-muted text-base max-w-2xl mx-auto leading-relaxed">
              Join university students from across Sri Lanka in this vital cybersecurity study. Your voluntary input provides critical data to enhance national digital privacy curricula and student cyber protection.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/consent"
                prefetch={true}
                className="button primary large text-base px-8 py-3.5 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40"
                aria-label="Start Research Participation"
              >
                <span>Start Research Participation</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="pt-2 flex items-center justify-center gap-4 text-xs text-muted flex-wrap">
              <span>100% Anonymous</span>
              <span>•</span>
              <span>15–20 Minutes Estimated</span>
              <span>•</span>
              <span>IRB Protocol Governed</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
