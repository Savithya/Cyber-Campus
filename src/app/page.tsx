import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  HeartHandshake,
  LockKeyhole,
  Check,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Clock,
  Database,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { HeroCyberVisual } from "@/components/hero-cyber-visual";
import { HomeThreatCards } from "@/components/home-threat-cards";
import { CyberChallengeZone } from "@/components/cyber-challenge-zone";

export default function Home() {
  return (
    <div className="home-page-container">
      {/* =========================================================================
          3.1 HERO SECTION
          ========================================================================= */}
      <section id="home" className="hero-section container" aria-label="Interactive Cybersecurity Research Platform">
        <div className="hero-two-col-grid">
          {/* Left Column: Hero Content */}
          <div className="hero-content-col">
            <div className="eyebrow">
              <span className="live-pulse-dot" aria-hidden="true" />
              <span>INTERACTIVE CYBERSECURITY RESEARCH PLATFORM</span>
            </div>

            <h1 className="hero-main-heading">
              Explore Cyber Threats.
              <br />
              Make Smarter Decisions.
              <br />
              Protect Your <span>Privacy</span>.
            </h1>

            <p className="hero-subtitle-text">
              Discover how social engineering threats influence online privacy through realistic cybersecurity scenarios. Take part in academic research involving university students in Sri Lanka.
            </p>

            <p className="hero-body-description">
              Investigating how deceptive manipulation vectors—including phishing, pretexting, impersonation,
              and online link scams—affect personal data protection and digital privacy.
              Your voluntary participation provides valuable empirical evidence for cybersecurity science and higher education.
            </p>

            {/* Research Highlights Metrics Bar */}
            <div className="hero-research-highlights" aria-label="Research Highlights">
              <div className="highlight-metric-item">
                <span className="highlight-metric-value">4</span>
                <span className="highlight-metric-label">Threat Categories</span>
              </div>
              <div className="highlight-metric-divider" aria-hidden="true" />
              <div className="highlight-metric-item">
                <span className="highlight-metric-value">20</span>
                <span className="highlight-metric-label">Interactive Scenarios</span>
              </div>
              <div className="highlight-metric-divider" aria-hidden="true" />
              <div className="highlight-metric-item">
                <span className="highlight-metric-value">15–20 Min</span>
                <span className="highlight-metric-label">Estimated Participation</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="hero-actions-row">
              <Link
                className="button primary large hero-cta-btn"
                href="/consent"
                aria-label="Join the Research"
              >
                <span>Join the Research</span>
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
            <div className="hero-reassurance-row">
              <span className="reassurance-pill">
                <Check size={14} className="text-emerald" aria-hidden="true" /> 100% Voluntary Participation
              </span>
              <span className="reassurance-pill">
                <LockKeyhole size={14} className="text-primary" aria-hidden="true" /> Anonymous Session · No Credentials Collected
              </span>
              <span className="reassurance-pill">
                <GraduationCap size={14} className="text-cyan" aria-hidden="true" /> University Students in Sri Lanka (18+)
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Composition */}
          <div className="hero-visual-col">
            <HeroCyberVisual />
          </div>
        </div>
      </section>

      {/* =========================================================================
          3.2 HOW CYBER CAMPUS WORKS (3-STEP SECTION)
          ========================================================================= */}
      <section className="how-it-works-section container" aria-label="How Cyber Campus Works">
        <div className="section-header-centered">
          <span className="mini-label">PARTICIPATION JOURNEY</span>
          <h2>How Cyber Campus Works</h2>
          <p>
            A simple, self-paced 3-step experience designed for university students from all academic disciplines.
          </p>
        </div>

        <div className="how-it-works-grid">
          {/* Step 1 */}
          <div className="workflow-card">
            <div className="workflow-step-badge">STEP 01</div>
            <div className="workflow-icon-tile lavender">
              <BookOpen size={24} className="text-primary" aria-hidden="true" />
            </div>
            <h3>Join Research</h3>
            <p>
              Read the research information and provide informed consent. Answer five quick demographic questions to establish your anonymous academic profile.
            </p>
            <div className="workflow-card-footer">
              <span className="workflow-tag">Voluntary &amp; Anonymous</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="workflow-card highlighted">
            <div className="workflow-step-badge">STEP 02</div>
            <div className="workflow-icon-tile cyan">
              <ShieldAlert size={24} className="text-cyan" aria-hidden="true" />
            </div>
            <h3>Complete Cyber Missions</h3>
            <p>
              Explore 20 realistic scenarios across four categories of social engineering threats. Inspect simulated evidence and choose how you would respond.
            </p>
            <div className="workflow-card-footer">
              <span className="workflow-tag">20 Interactive Challenges</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="workflow-card">
            <div className="workflow-step-badge">STEP 03</div>
            <div className="workflow-icon-tile emerald">
              <CheckCircle2 size={24} className="text-emerald" aria-hidden="true" />
            </div>
            <h3>Complete Participation</h3>
            <p>
              Submit your research responses securely, receive your participation confirmation, and explore the complete educational debrief and threat insights.
            </p>
            <div className="workflow-card-footer">
              <span className="workflow-tag">Certificate &amp; Debrief</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3.3 EXPLORE THE FOUR SOCIAL ENGINEERING THREATS
          ========================================================================= */}
      <section className="explore-threats-section container" aria-label="Explore Four Social Engineering Threats">
        <div className="section-header-centered">
          <span className="mini-label">RESEARCH VARIABLES (IV1–IV4)</span>
          <h2>Explore the Four Social Engineering Threats</h2>
          <p>
            Learn how each category operates through realistic simulated scenarios. No technical cybersecurity expertise required.
          </p>
        </div>

        <HomeThreatCards />
      </section>

      {/* =========================================================================
          3.4 WHY PARTICIPATE? (RESEARCH INFORMATION & PRINCIPLES)
          ========================================================================= */}
      <section className="why-participate-section container" aria-label="Why Participate in Research">
        <div className="section-header-centered">
          <span className="mini-label">RESEARCH INFORMATION &amp; ETHICS</span>
          <h2>Why Participate in This Study?</h2>
          <p>
            Your voluntary participation helps researchers understand how undergraduate students navigate social engineering threats and protect their privacy.
          </p>
        </div>

        <div className="why-participate-grid">
          <article className="why-card">
            <div className="why-icon-box lavender">
              <GraduationCap size={24} className="text-primary" aria-hidden="true" />
            </div>
            <h3>Academic Purpose</h3>
            <p>
              This empirical study investigates which category of social engineering threats has the most significant impact on user privacy among university students in Sri Lanka.
            </p>
          </article>

          <article className="why-card">
            <div className="why-icon-box cyan">
              <BookOpen size={24} className="text-cyan" aria-hidden="true" />
            </div>
            <h3>Relevance to Students</h3>
            <p>
              University students are frequent targets of scholarship phishing, urgent IT pretexts, fake lecturer accounts, and rental deposit scams across digital platforms.
            </p>
          </article>

          <article className="why-card">
            <div className="why-icon-box teal">
              <ShieldCheck size={24} className="text-teal" aria-hidden="true" />
            </div>
            <h3>Realistic Privacy Scenarios</h3>
            <p>
              Instead of answering abstract questionnaires, you will evaluate interactive simulated situations in a safe, controlled browser environment.
            </p>
          </article>

          <article className="why-card">
            <div className="why-icon-box peach">
              <HeartHandshake size={24} className="text-peach-text" aria-hidden="true" />
            </div>
            <h3>100% Voluntary</h3>
            <p>
              Your involvement is entirely voluntary. You may skip questions or exit the platform at any time before final submission without penalty.
            </p>
          </article>

          <article className="why-card">
            <div className="why-icon-box blue">
              <LockKeyhole size={24} className="text-blue-500" aria-hidden="true" />
            </div>
            <h3>Privacy &amp; Confidentiality</h3>
            <p>
              An anonymous participant code identifies your answers. We never request real passwords, national identity numbers, student IDs, or bank accounts.
            </p>
          </article>

          <article className="why-card">
            <div className="why-icon-box amber">
              <Database size={24} className="text-amber" aria-hidden="true" />
            </div>
            <h3>Rigorous Data Governance</h3>
            <p>
              Research responses are recorded for academic statistical analysis. All unsubmitted drafts remain stored in your private browser session.
            </p>
          </article>
        </div>
      </section>

      {/* =========================================================================
          3.5 FINAL CALL TO ACTION BANNER
          ========================================================================= */}
      <section className="final-cta-section container" aria-label="Final Call to Action">
        <div className="final-cta-banner">
          <div className="final-cta-glow" aria-hidden="true" />
          <div className="final-cta-content">
            <span className="final-cta-eyebrow">CONTRIBUTE TO CYBERSECURITY RESEARCH</span>
            <h2>Ready to Explore Cybersecurity in Action?</h2>
            <p>
              Your participation can contribute to understanding social engineering threats and student privacy.
            </p>
            <div className="final-cta-actions">
              <Link href="/consent" className="button primary large">
                <span>Start Research Participation</span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href="#challenges" className="button secondary large">
                <span>Explore Cyber Challenges</span>
                <Gamepad2 size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECONDARY SECTION: CYBER CHALLENGE ZONE (EDUCATIONAL LAB)
          ========================================================================= */}
      <CyberChallengeZone />
    </div>
  );
}
