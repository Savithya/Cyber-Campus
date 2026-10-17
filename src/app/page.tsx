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
  BookOpen,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Clock,
  Database,
} from "lucide-react";
import { ResearchCyberIllustration } from "@/components/research-cyber-illustration";
import { CyberChallengeZone } from "@/components/cyber-challenge-zone";

export default function Home() {
  return (
    <div className="home">
      {/* =========================================================================
          1. HERO SECTION (RESEARCH-FIRST)
          ========================================================================= */}
      <section id="home" className="hero container" aria-label="Academic Research Introduction">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-pulse-dot" aria-hidden="true" />
            ACADEMIC RESEARCH STUDY · SRI LANKA
          </div>

          <h1 className="hero-research-heading">
            Impact of Social Engineering Threats
            <br />
            on <span>User Privacy</span>
          </h1>

          <p className="hero-study-subheading">
            An Investigation among University Undergraduates in Sri Lanka
          </p>

          <p className="hero-description">
            Investigating how deceptive social engineering manipulation vectors, including phishing,
            pretexting, impersonation, and online link scams, affect digital autonomy, credential
            confidentiality, and personal data exposure. Your voluntary participation provides
            essential academic evidence for cybersecurity education and privacy policy.
          </p>

          <div className="hero-actions">
            <Link
              className="button primary large"
              href="/consent"
              aria-label="Participate in Research (Join the Research)"
            >
              <span>Participate in Research</span>
              <ClipboardList size={19} aria-hidden="true" />
            </Link>

            <a
              className="button secondary large"
              href="#challenges"
              aria-label="Explore Cyber Games (Explore Cyber Challenges)"
            >
              <span>Explore Cyber Games</span>
              <Gamepad2 size={19} aria-hidden="true" />
            </a>
          </div>

          <div className="reassurance">
            <span>
              <Check size={16} aria-hidden="true" /> 100% Voluntary Participation
            </span>
            <span>
              <Clock size={16} aria-hidden="true" /> ~15–20 Min (25 Interactive Challenges)
            </span>
            <span>
              <LockKeyhole size={16} aria-hidden="true" /> Anonymous Research Session · No Credentials Collected
            </span>
            <span>
              <ShieldCheck size={16} aria-hidden="true" /> 5 Threat Modules (IV1–IV5) · Simulated Privacy Risk (DV)
            </span>
          </div>
        </div>

        {/* 3D-style Cybersecurity Illustration */}
        <div className="hero-illustration-col">
          <ResearchCyberIllustration />
        </div>
      </section>

      {/* =========================================================================
          2. ACADEMIC RESEARCH FOUNDATIONS (RESEARCH-FIRST)
          ========================================================================= */}
      <section className="research-framework-section container" aria-label="Academic Research Framework">
        <div className="section-header-centered">
          <span className="mini-label">ACADEMIC RESEARCH MODEL &amp; VARIABLES</span>
          <h2>Impact of Social Engineering Threats on User Privacy</h2>
          <p>
            An empirical investigation into how deceptive manipulation vectors relate to digital
            autonomy, credential confidentiality, and simulated privacy risk among university students in Sri Lanka.
          </p>
        </div>

        <div className="variables-grid">
          {/* IV1 */}
          <article className="variable-card">
            <div className="variable-icon-box purple-glow">
              <Mail size={22} aria-hidden="true" />
            </div>
            <span className="variable-code">INDEPENDENT VARIABLE 1</span>
            <h3>Phishing Threats</h3>
            <p>
              Explores deceptive university emails, SMS scholarship notices, malicious attachments,
              QR code redirects, and fake university login portals.
            </p>
            <span className="variable-survey-ref">Challenges PH01–PH05 · IV1</span>
          </article>

          {/* IV2 */}
          <article className="variable-card">
            <div className="variable-icon-box emerald-glow">
              <MessagesSquare size={22} aria-hidden="true" />
            </div>
            <span className="variable-code">INDEPENDENT VARIABLE 2</span>
            <h3>Pretexting Scenarios</h3>
            <p>
              Analyzes psychological manipulation through fabricated crisis stories, false IT support
              authority, library fine emergencies, and hostel verification pretexts.
            </p>
            <span className="variable-survey-ref">Challenges PT01–PT05 · IV2</span>
          </article>

          {/* IV3 */}
          <article className="variable-card">
            <div className="variable-icon-box amber-glow">
              <UserRoundSearch size={22} aria-hidden="true" />
            </div>
            <span className="variable-code">INDEPENDENT VARIABLE 3</span>
            <h3>Impersonation Threats</h3>
            <p>
              Examines unauthorized representation of university faculty, department heads, student
              council leaders, and batchmates across messaging applications and social channels.
            </p>
            <span className="variable-survey-ref">Challenges IM01–IM05 · IV3</span>
          </article>

          {/* IV4 */}
          <article className="variable-card">
            <div className="variable-icon-box cyan-glow">
              <Link2 size={22} aria-hidden="true" />
            </div>
            <span className="variable-code">INDEPENDENT VARIABLE 4</span>
            <h3>Online Scams &amp; Bad Links</h3>
            <p>
              Investigates counterfeit student laptop discounts, rental accommodation advance-fee schemes,
              fake payment gateways, and event badge phishing links.
            </p>
            <span className="variable-survey-ref">Challenges SC01–SC05 · IV4</span>
          </article>

          {/* Proposed IV5 */}
          <article className="variable-card">
            <div className="variable-icon-box cyan-glow">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <span className="variable-code">PROPOSED VARIABLE 5</span>
            <h3>AI Deepfake Deception</h3>
            <p>
              Investigates synthetic vice-chancellor video announcements, cloned lecturer voice memos,
              fake administrative circulars, and conversational AI phone agents.
            </p>
            <span className="variable-survey-ref">Challenges DF01–DF05 · Proposed IV5</span>
          </article>

          {/* DV */}
          <article className="variable-card dv-featured-card">
            <div className="variable-icon-box blue-glow">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <span className="variable-code highlight-dv">DEPENDENT VARIABLE (DV)</span>
            <h3>Simulated User Privacy</h3>
            <p>
              Operationalized through observed decision-making (0–4 disclosure severity scale) across
              controlled simulation scenarios, evaluating credential and personal data protection.
            </p>
            <span className="variable-survey-ref">Behavioral Risk Index · Core DV</span>
          </article>
        </div>
      </section>

      {/* =========================================================================
          3. PARTICIPATION PRINCIPLES & ETHICAL SAFEGUARDS
          ========================================================================= */}
      <section
        className="feature-grid container"
        aria-label="Participation principles"
      >
        <article>
          <span className="icon-tile teal">
            <HeartHandshake size={24} aria-hidden="true" />
          </span>
          <h3>Always Voluntary</h3>
          <p>
            Participate on your own terms. Skip any question, take a break at any point,
            or withdraw your response before the research deadline without penalty or consequence.
          </p>
        </article>
        <article>
          <span className="icon-tile peach">
            <LockKeyhole size={24} aria-hidden="true" />
          </span>
          <h3>Privacy-Preserving Tokens</h3>
          <p>
            An anonymous participant code (such as 001, 002, 003...) identifies your answers. We never ask for
            student index numbers, real names, national IDs, or personal contact details.
          </p>
        </article>
        <article>
          <span className="icon-tile lavender">
            <Clock size={24} aria-hidden="true" />
          </span>
          <h3>Estimated 5–7 Minutes</h3>
          <p>
            A streamlined 25-question standardized instrument designed for undergraduate respondents,
            with clear multiple-choice options and no complex typing.
          </p>
        </article>
        <article>
          <span className="icon-tile cyan">
            <Database size={24} aria-hidden="true" />
          </span>
          <h3>Strict Data Isolation</h3>
          <p>
            Survey responses are kept strictly separate from gaming scores. Playing challenges is 100%
            voluntary and never alters or is required for research participation.
          </p>
        </article>
      </section>

      {/* =========================================================================
          4. THREE-STEP PARTICIPATION WORKFLOW
          ========================================================================= */}
      <section className="mission-journey-section container" aria-label="Three-step mission journey">
        <div className="journey-card-container">
          <div className="journey-card">
            <div className="journey-top">
              <span className="mini-label">PARTICIPATION WORKFLOW</span>
              <span className="tag">Self-Paced · Voluntary</span>
            </div>

            <div className="journey-title">
              <span className="icon-tile lavender">
                <GraduationCap size={32} aria-hidden="true" />
              </span>
              <div>
                <h2>Your Three-Step Mission Journey</h2>
                <p>Empirical research participation followed by optional threat defense practice.</p>
              </div>
            </div>

            <div className="journey-steps-grid">
              {/* Step 1 */}
              <div className="journey-step-item">
                <div className="step-badge-circle">01</div>
                <div className="step-content">
                  <div className="step-header">
                    <strong>Discover the Research</strong>
                    <BookOpen size={18} className="text-primary" aria-hidden="true" />
                  </div>
                  <p>
                    Read our research background, ethics notice, and data governance policy.
                    Learn how your student perspective drives cybersecurity science.
                  </p>
                  <Link href="/privacy" className="step-link">
                    <span>Read research brief</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="journey-step-item active">
                <div className="step-badge-circle">02</div>
                <div className="step-content">
                  <div className="step-header">
                    <strong>Share Your Experience</strong>
                    <ClipboardList size={18} className="text-primary" aria-hidden="true" />
                  </div>
                  <p>
                    Answer 25 structured questions covering demographics, phishing, pretexting,
                    impersonation, scams, and personal privacy perceptions.
                  </p>
                  <Link href="/consent" className="step-link highlight">
                    <span>Start questionnaire</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="journey-step-item">
                <div className="step-badge-circle">03</div>
                <div className="step-content">
                  <div className="step-header">
                    <strong>Explore Cyber Challenges</strong>
                    <Gamepad2 size={18} className="text-primary" aria-hidden="true" />
                  </div>
                  <p>
                    Enter the optional Cyber Challenge Zone. Inspect 12 realistic scenarios,
                    earn XP points, unlock achievement badges, and review privacy debriefs.
                  </p>
                  <a href="#challenges" className="step-link">
                    <span>Explore challenges</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <div className="journey-footer-bar">
              <div className="journey-note">
                <LockKeyhole size={17} aria-hidden="true" />
                <span>
                  <strong>Academic Survey First:</strong> Questionnaire responses come first. Cyber challenges are optional and never alter survey data.
                </span>
              </div>
              <span className="floating-badge-pill">
                <Sparkles size={15} aria-hidden="true" /> University Students in Sri Lanka
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. OPTIONAL CYBER CHALLENGE ZONE (GAMING COMPONENT)
          ========================================================================= */}
      <CyberChallengeZone />

      {/* =========================================================================
          6. PRACTICE STRIP CALLOUT
          ========================================================================= */}
      <section className="practice-strip container" aria-label="Practice Mode Callout">
        <div>
          <h3>Only here to explore the cyber challenges?</h3>
          <p>
            You can decline research participation and jump straight into the practice challenges.
            Practice scores are stored in your private browser session and are excluded from academic datasets.
          </p>
        </div>
        <Link href="/consent?practice=1" className="button secondary large">
          <span>Explore Practice Mode</span>
          <Gamepad2 size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
