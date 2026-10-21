import Link from "next/link";
import {
  ClipboardList,
  Gamepad2,
  HeartHandshake,
  LockKeyhole,
  Check,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Database,
  CheckCircle2,
  FileText,
  UserCheck,
} from "lucide-react";
import { HomeThreatCards } from "@/components/home-threat-cards";
import { CyberInvestigatorShowcase } from "@/components/cyber-investigator-showcase";
import { HeroScopeMetrics } from "@/components/hero-scope-metrics";
import { HeroCyberVisual } from "@/components/hero-cyber-visual";

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
      <section className="how-it-works-section container my-16" aria-labelledby="journey-heading">
        <div className="section-header-centered">
          <span className="mini-label">PARTICIPATION JOURNEY</span>
          <h2 id="journey-heading" className="text-3xl font-extrabold tracking-tight">
            How Cyber Campus Works
          </h2>
          <p className="text-muted max-w-2xl mx-auto mt-2 text-base leading-relaxed">
            A structured, self-paced 4-step research experience designed for undergraduate students
            across all disciplines in Sri Lanka.
          </p>
        </div>

        <div className="journey-stepper-grid mt-10" role="list" aria-label="Four Participation Steps">
          {/* Step 01 */}
          <div className="journey-card" role="listitem">
            <div className="journey-card-top">
              <span className="journey-step-badge">STEP 01</span>
              <div className="journey-icon-wrap lavender">
                <BookOpen size={22} className="text-primary" aria-hidden="true" />
              </div>
            </div>
            <h3 className="journey-card-title mt-4">Research Information &amp; Consent</h3>
            <p className="journey-card-desc mt-2">
              Read the study details, understand your participant rights, and confirm your eligibility
              and voluntary consent to participate.
            </p>
            <div className="journey-card-footer mt-4 pt-3 border-t">
              <span className="journey-tag">Voluntary &amp; Informed</span>
            </div>
          </div>

          {/* Step 02 */}
          <div className="journey-card" role="listitem">
            <div className="journey-card-top">
              <span className="journey-step-badge">STEP 02</span>
              <div className="journey-icon-wrap cyan">
                <UserCheck size={22} className="text-cyan" aria-hidden="true" />
              </div>
            </div>
            <h3 className="journey-card-title mt-4">Participant Demographics</h3>
            <p className="journey-card-desc mt-2">
              Provide five non-identifying academic background answers (age group, year of study,
              faculty discipline, university sector) to establish your student profile.
            </p>
            <div className="journey-card-footer mt-4 pt-3 border-t">
              <span className="journey-tag">5 Quick Profile Items</span>
            </div>
          </div>

          {/* Step 03 */}
          <div className="journey-card highlighted" role="listitem">
            <div className="journey-card-top">
              <span className="journey-step-badge active">STEP 03</span>
              <div className="journey-icon-wrap emerald">
                <ShieldAlert size={22} className="text-emerald" aria-hidden="true" />
              </div>
            </div>
            <h3 className="journey-card-title mt-4">Cyber Investigation Missions</h3>
            <p className="journey-card-desc mt-2">
              Complete 20 realistic interactive challenges (5 per threat category) investigating
              phishing emails, pretexting stories, fake faculty profiles, and malicious links.
            </p>
            <div className="journey-card-footer mt-4 pt-3 border-t">
              <span className="journey-tag active">20 Research Challenges</span>
            </div>
          </div>

          {/* Step 04 */}
          <div className="journey-card" role="listitem">
            <div className="journey-card-top">
              <span className="journey-step-badge">STEP 04</span>
              <div className="journey-icon-wrap peach">
                <CheckCircle2 size={22} className="text-peach-text" aria-hidden="true" />
              </div>
            </div>
            <h3 className="journey-card-title mt-4">Complete &amp; Review</h3>
            <p className="journey-card-desc mt-2">
              Submit your responses securely, confirm participation, and review all your answers
              alongside the safest recommended cybersecurity actions.
            </p>
            <div className="journey-card-footer mt-4 pt-3 border-t">
              <span className="journey-tag">Answer Review &amp; Safe Defenses</span>
            </div>
          </div>
        </div>

        {/* Dynamic Journey Callout */}
        <div className="journey-cta-banner mt-10 p-6 rounded-xl border bg-card/60 text-center">
          <p className="text-sm text-muted">
            Ready to participate in the empirical study? You can start with Step 01 at any time.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/consent" className="button primary">
              <span>Start Research Participation</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

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
      <section id="about-study" className="why-participate-section container my-16" aria-labelledby="ethics-heading">
        <div className="section-header-centered">
          <span className="mini-label">RESEARCH INFORMATION &amp; ETHICS</span>
          <h2 id="ethics-heading" className="text-3xl font-extrabold tracking-tight">
            Study Information &amp; Ethical Principles
          </h2>
          <p className="text-muted max-w-2xl mx-auto mt-2 text-base leading-relaxed">
            Cyber Campus operates under rigorous academic research governance, protecting participant
            privacy and ensuring full transparency.
          </p>
        </div>

        <div className="why-participate-grid mt-10">
          {/* Card 1: Academic Purpose */}
          <article className="why-card">
            <div className="why-icon-box lavender">
              <GraduationCap size={24} className="text-primary" aria-hidden="true" />
            </div>
            <h3>Purpose of the Study</h3>
            <p>
              Investigating which social engineering threat category—phishing, pretexting,
              impersonation, or online scams—has the strongest observed association with user privacy
              risks among participating university students in Sri Lanka.
            </p>
          </article>

          {/* Card 2: Who Can Participate */}
          <article className="why-card">
            <div className="why-icon-box cyan">
              <BookOpen size={24} className="text-cyan" aria-hidden="true" />
            </div>
            <h3>Who Can Participate</h3>
            <p>
              Undergraduate and postgraduate students aged 18 and above currently enrolled at any
              state university, private higher education institute, or foreign branch campus in Sri Lanka.
            </p>
          </article>

          {/* Card 3: 100% Voluntary */}
          <article className="why-card">
            <div className="why-icon-box peach">
              <HeartHandshake size={24} className="text-peach-text" aria-hidden="true" />
            </div>
            <h3>Voluntary Participation</h3>
            <p>
              Your involvement is entirely voluntary. You may pause, skip challenges, or exit the
              platform at any time before final submission without any academic or personal penalty.
            </p>
          </article>

          {/* Card 4: Information Collected */}
          <article className="why-card">
            <div className="why-icon-box teal">
              <FileText size={24} className="text-teal" aria-hidden="true" />
            </div>
            <h3>Information Collected</h3>
            <p>
              Only aggregated non-identifying demographic indicators (age group, faculty, year of study)
              and your interactive challenge decisions. We never ask for or collect real passwords,
              student registration IDs, or banking details.
            </p>
          </article>

          {/* Card 5: Data Confidentiality */}
          <article className="why-card">
            <div className="why-icon-box blue">
              <LockKeyhole size={24} className="text-blue-500" aria-hidden="true" />
            </div>
            <h3>Data Confidentiality</h3>
            <p>
              All submissions are associated solely with an anonymous participant code. Research data is
              stored securely, separated from identifying contact information, and used exclusively for
              scholarly statistical analysis.
            </p>
          </article>

          {/* Card 6: Withdrawal & Researcher Contact */}
          <article className="why-card">
            <div className="why-icon-box amber">
              <Database size={24} className="text-amber" aria-hidden="true" />
            </div>
            <h3>Withdrawal &amp; Governance</h3>
            <p>
              You may withdraw your unsubmitted draft at any time. For questions regarding the research
              protocol or ethics clearance, you may consult our published information documents or contact
              the research team directly.
            </p>
          </article>
        </div>

        {/* Visible Links to Legal & Ethical Documents */}
        <div className="ethics-links-strip mt-8 flex items-center justify-center gap-4 flex-wrap text-sm text-muted">
          <Link href="/consent" className="ethics-doc-link flex items-center gap-1.5 text-cyan hover:underline">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>View Full Consent Protocol</span>
          </Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link href="/privacy" className="ethics-doc-link flex items-center gap-1.5 text-cyan hover:underline">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>Participant Privacy Policy</span>
          </Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link href="/withdraw" className="ethics-doc-link flex items-center gap-1.5 text-cyan hover:underline">
            <HeartHandshake size={16} aria-hidden="true" />
            <span>Withdrawal Information</span>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          04.E — INTERACTIVE MISSION SHOWCASE ("Think Like a Cyber Investigator")
          ========================================================================= */}
      <CyberInvestigatorShowcase />
    </div>
  );
}
