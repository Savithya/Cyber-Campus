"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Lock,
  Clock,
  UserCheck,
  GraduationCap,
  ArrowRight,
  BookOpen,
  FileCheck2,
  CheckCircle2,
  Eye,
  AlertTriangle,
  Globe,
  KeyRound,
  Database,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCcw,
  Layers,
  Target,
  Award,
  ListChecks,
  Check,
} from "lucide-react";
import { ResearchCyberIllustration } from "./research-cyber-illustration";
import type { StudyConfig } from "@/lib/config.server";

interface ResearchParticipationPageProps {
  config: StudyConfig;
  error?: string;
}

export function ResearchParticipationPage({
  config,
  error,
}: ResearchParticipationPageProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  // Motion variants
  const fadeIn = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  };

  return (
    <div className="research-page">
      {/* Quick Jump Navigation Strip for Fast Access */}
      <nav className="research-nav-strip" aria-label="Research sections navigation">
        <div className="container nav-strip-inner">
          <span className="nav-strip-label">
            <Layers size={14} aria-hidden="true" /> PAGE SECTIONS
          </span>
          <div className="nav-strip-links">
            <a href="#overview" onClick={(e) => scrollToSection(e, "overview")}>
              Overview
            </a>
            <a href="#focus-areas" onClick={(e) => scrollToSection(e, "focus-areas")}>
              Focus Areas
            </a>
            <a href="#dependent-variable" onClick={(e) => scrollToSection(e, "dependent-variable")}>
              User Privacy
            </a>
            <a href="#participant-info" onClick={(e) => scrollToSection(e, "participant-info")}>
              Eligibility
            </a>
            <a href="#process" onClick={(e) => scrollToSection(e, "process")}>
              Process
            </a>
            <a href="#ethics" onClick={(e) => scrollToSection(e, "ethics")}>
              Privacy & Ethics
            </a>
          </div>
        </div>
      </nav>

      {/* Database or configuration error notice if any */}
      {error && (
        <div className="container" style={{ marginTop: "24px" }}>
          <div className="error-box" role="alert">
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section className="research-hero container" aria-label="Hero section">
        <motion.div
          className="research-hero-copy"
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
        >
          {/* Eyebrow badge */}
          <div className="research-hero-eyebrow">
            <span className="pulse-indicator" aria-hidden="true" />
            <span>ACADEMIC COMPUTING RESEARCH · SRI LANKA</span>
          </div>

          {/* Research Title Badge */}
          <div className="research-title-chip">
            <GraduationCap size={15} aria-hidden="true" />
            <span>{config.title || "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka."}</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="research-hero-title">
            Your Voice Matters in{" "}
            <span className="gradient-text">Digital Privacy</span>
          </h1>

          {/* Hero Description */}
          <p className="research-hero-desc">
            Help us understand how social engineering threats affect user privacy
            among university students in Sri Lanka.
          </p>

          {/* Call to Action Buttons */}
          <div className="research-hero-actions">
            <Link
              href="/consent"
              className="button primary large research-cta-btn"
              aria-label="Participate in Survey via consent page"
            >
              Participate in Survey <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <a
              href="#overview"
              onClick={(e) => scrollToSection(e, "overview")}
              className="button secondary large research-explore-btn"
              aria-label="Explore research details"
            >
              Explore Research <ChevronDown size={18} aria-hidden="true" />
            </a>
          </div>

          {/* Reassurance Badges */}
          <div className="research-trust-strip">
            <div className="trust-item">
              <CheckCircle2 size={15} className="text-cyan-400" aria-hidden="true" />
              <span>5–7 Minutes Duration</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={15} className="text-cyan-400" aria-hidden="true" />
              <span>Voluntary & Anonymous</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={15} className="text-cyan-400" aria-hidden="true" />
              <span>Sri Lankan Undergraduates</span>
            </div>
          </div>
        </motion.div>

        {/* 3D Cybersecurity Illustration Column */}
        <div className="research-hero-visual">
          <ResearchCyberIllustration />
        </div>
      </section>

      {/* =========================================================================
          2. RESEARCH OVERVIEW
          ========================================================================= */}
      <section
        id="overview"
        className="research-section container"
        aria-labelledby="overview-heading"
      >
        <div className="section-header-centered">
          <span className="research-mini-label">FOUNDATIONAL STUDY</span>
          <h2 id="overview-heading" className="section-title">
            Research Overview
          </h2>
          <p className="section-subtitle">
            An empirical computing study examining how deceptive social engineering
            manipulation impacts privacy and data autonomy for undergraduates in
            Sri Lanka.
          </p>
        </div>

        <div className="overview-grid">
          {/* Background Card */}
          <motion.article
            className="research-glass-card overview-card"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-icon-box lavender-box">
              <BookOpen size={24} aria-hidden="true" />
            </div>
            <div className="card-meta">CONTEXT & BACKGROUND</div>
            <h3 className="card-headline">Research Background</h3>
            <p className="card-text">
              Higher education institutions in Sri Lanka have rapidly shifted toward
              digital learning management systems, instant messaging groups, and
              cloud resources. While this fosters collaboration, it also exposes
              undergraduates to sophisticated social engineering schemes—such as
              phishing emails, spoofed campus announcements, and manipulative
              messages designed to compromise credentials.
            </p>
          </motion.article>

          {/* Aim Card */}
          <motion.article
            className="research-glass-card overview-card"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35 }}
          >
            <div className="card-icon-box cyan-box">
              <Target size={24} aria-hidden="true" />
            </div>
            <div className="card-meta">PRIMARY GOAL</div>
            <h3 className="card-headline">Research Aim</h3>
            <p className="card-text">
              The primary aim of this study is to empirically evaluate how social
              engineering threats impact user privacy among university students in
              Sri Lanka, establishing foundational evidence on threat awareness,
              vulnerability patterns, and practical protective habits across state
              and private campuses.
            </p>
          </motion.article>

          {/* Objectives Card */}
          <motion.article
            className="research-glass-card overview-card"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-icon-box teal-box">
              <ListChecks size={24} aria-hidden="true" />
            </div>
            <div className="card-meta">CORE MILESTONES</div>
            <h3 className="card-headline">Research Objectives</h3>
            <ul className="overview-bullet-list">
              <li>
                <Check size={14} className="bullet-check" aria-hidden="true" />
                <span>Assess students’ ability to identify social engineering attacks.</span>
              </li>
              <li>
                <Check size={14} className="bullet-check" aria-hidden="true" />
                <span>Measure the frequency and types of deceptive threats encountered.</span>
              </li>
              <li>
                <Check size={14} className="bullet-check" aria-hidden="true" />
                <span>Examine everyday online habits, password reuse, and Wi-Fi usage.</span>
              </li>
              <li>
                <Check size={14} className="bullet-check" aria-hidden="true" />
                <span>Evaluate current privacy protection practices such as 2FA adoption.</span>
              </li>
            </ul>
          </motion.article>

          {/* Importance Card */}
          <motion.article
            className="research-glass-card overview-card"
            initial={fadeIn.initial}
            whileInView={fadeIn.animate}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45 }}
          >
            <div className="card-icon-box peach-box">
              <Award size={24} aria-hidden="true" />
            </div>
            <div className="card-meta">NATIONAL IMPACT</div>
            <h3 className="card-headline">Importance of the Study</h3>
            <p className="card-text">
              Undergraduate students represent tomorrow&apos;s digital workforce.
              Findings from this research provide critical empirical data for
              university administrations, student affairs divisions, and policymakers
              to develop culturally contextualized cybersecurity awareness modules
              and student-centric privacy safeguards across Sri Lanka.
            </p>
          </motion.article>
        </div>
      </section>

      {/* =========================================================================
          3. RESEARCH FOCUS AREAS
          ========================================================================= */}
      <section
        id="focus-areas"
        className="research-section container"
        aria-labelledby="focus-heading"
      >
        <div className="section-header-centered">
          <span className="research-mini-label">ANALYTICAL DIMENSIONS</span>
          <h2 id="focus-heading" className="section-title">
            Research Focus Areas
          </h2>
          <p className="section-subtitle">
            Our theoretical framework investigates four core independent dimensions
            that shape student vulnerability and resilience in digital environments.
          </p>
        </div>

        <div className="focus-grid">
          {/* Card 1: Awareness */}
          <article className="focus-card">
            <div className="focus-card-header">
              <span className="focus-number">01</span>
              <div className="focus-icon-wrap cyan-glow">
                <Eye size={24} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-title">Awareness of Social Engineering Threats</h3>
            <p className="focus-desc">
              Measures students&apos; conceptual familiarity and practical ability
              to recognize deceptive cyber tactics—such as phishing emails, fake
              bursary notices, pretexting calls, and impersonation attempts before
              engaging.
            </p>
            <div className="focus-tags">
              <span className="tag-pill">Phishing Recognition</span>
              <span className="tag-pill">Impersonation</span>
              <span className="tag-pill">Deception Indicators</span>
            </div>
          </article>

          {/* Card 2: Experience */}
          <article className="focus-card">
            <div className="focus-card-header">
              <span className="focus-number">02</span>
              <div className="focus-icon-wrap peach-glow">
                <AlertTriangle size={24} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-title">Experience with Social Engineering Threats</h3>
            <p className="focus-desc">
              Examines real-world threat exposures encountered during university life,
              including suspicious SMS messages, unauthorized account logins,
              malicious links shared in student groups, and fraudulent scholarship schemes.
            </p>
            <div className="focus-tags">
              <span className="tag-pill">Threat Encounters</span>
              <span className="tag-pill">Account Breaches</span>
              <span className="tag-pill">Malicious Links</span>
            </div>
          </article>

          {/* Card 3: Online Behaviours */}
          <article className="focus-card">
            <div className="focus-card-header">
              <span className="focus-number">03</span>
              <div className="focus-icon-wrap purple-glow">
                <Globe size={24} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-title">Online Behaviours</h3>
            <p className="focus-desc">
              Evaluates daily digital habits that influence privacy posture—such as
              connecting to public or unencrypted campus Wi-Fi, sharing credentials,
              device locking routines, and public oversharing on social networks.
            </p>
            <div className="focus-tags">
              <span className="tag-pill">Campus Wi-Fi Habits</span>
              <span className="tag-pill">Credential Hygiene</span>
              <span className="tag-pill">Social Sharing</span>
            </div>
          </article>

          {/* Card 4: Privacy Protection Practices */}
          <article className="focus-card">
            <div className="focus-card-header">
              <span className="focus-number">04</span>
              <div className="focus-icon-wrap teal-glow">
                <KeyRound size={24} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-title">Privacy Protection Practices</h3>
            <p className="focus-desc">
              Quantifies proactive cybersecurity defense measures implemented by students,
              such as enabling Two-Factor Authentication (2FA), reviewing application
              privacy permissions, verifying sender addresses, and reporting scams.
            </p>
            <div className="focus-tags">
              <span className="tag-pill">Two-Factor Authentication</span>
              <span className="tag-pill">Permission Audits</span>
              <span className="tag-pill">Link Verification</span>
            </div>
          </article>
        </div>

        {/* Separate Explanation of the Dependent Variable: User Privacy */}
        <div id="dependent-variable" className="dv-showcase-box">
          <div className="dv-showcase-inner">
            <div className="dv-badge-row">
              <span className="dv-badge">
                <ShieldCheck size={16} aria-hidden="true" /> CORE DEPENDENT VARIABLE (DV)
              </span>
              <span className="dv-sub-tag">Research Theoretical Framework</span>
            </div>

            <div className="dv-content-layout">
              <div className="dv-main-text">
                <h3 className="dv-title">
                  User Privacy: The Central Dependent Variable
                </h3>
                <p className="dv-desc">
                  In this empirical research model, <strong>User Privacy</strong> serves
                  as the primary dependent variable. It represents the degree to which
                  a university student is able to maintain confidentiality over their
                  personal data, prevent unauthorized identity and credential misuse,
                  and assert sovereignty over their digital footprint.
                </p>
                <p className="dv-desc">
                  Our hypothesis tests whether heightened threat awareness, prior
                  incident exposure, conscious behavioral habits, and proactive privacy
                  countermeasures directly influence and reinforce overall user privacy
                  in higher education ecosystems.
                </p>
              </div>

              <div className="dv-diagram-box">
                <div className="dv-diagram-title">RESEARCH MODEL RELATIONSHIP</div>
                <div className="dv-flow-visual">
                  <div className="dv-iv-block">
                    <span>Independent Dimensions</span>
                    <small>Awareness · Experience · Behaviors · Protection</small>
                  </div>
                  <div className="dv-arrow-block">
                    <ArrowRight size={20} className="dv-arrow-icon" aria-hidden="true" />
                    <span className="dv-arrow-label">Impacts</span>
                  </div>
                  <div className="dv-dv-block">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <strong>User Privacy</strong>
                    <small>Dependent Variable</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PARTICIPANT INFORMATION
          ========================================================================= */}
      <section
        id="participant-info"
        className="research-section container"
        aria-labelledby="participant-heading"
      >
        <div className="section-header-centered">
          <span className="research-mini-label">TRANSPARENT PARTICIPATION</span>
          <h2 id="participant-heading" className="section-title">
            Participant Information
          </h2>
          <p className="section-subtitle">
            Essential facts on what taking part involves, participant eligibility,
            and how your responses are protected.
          </p>
        </div>

        {/* 3 Highlighted Metric Cards */}
        <div className="participant-highlight-grid">
          {/* Highlight 1: Duration */}
          <div className="highlight-metric-card">
            <div className="metric-icon-box lavender-glow">
              <Clock size={28} aria-hidden="true" />
            </div>
            <div className="metric-value">5–7 Minutes</div>
            <div className="metric-label">Estimated Survey Duration</div>
            <p className="metric-desc">
              Concise, streamlined questionnaire featuring 25 intuitive multiple-choice
              items. Complete at your own pace without time pressure.
            </p>
          </div>

          {/* Highlight 2: Voluntary & Anonymous */}
          <div className="highlight-metric-card">
            <div className="metric-icon-box cyan-glow">
              <UserCheck size={28} aria-hidden="true" />
            </div>
            <div className="metric-value">Voluntary & Anonymous</div>
            <div className="metric-label">Participation Format</div>
            <p className="metric-desc">
              No account creation or personal login required. Your answers are
              identified solely by an anonymous cryptographic token.
            </p>
          </div>

          {/* Highlight 3: Target Participants */}
          <div className="highlight-metric-card">
            <div className="metric-icon-box teal-glow">
              <GraduationCap size={28} aria-hidden="true" />
            </div>
            <div className="metric-value">University Students</div>
            <div className="metric-label">Target Participants: Sri Lanka</div>
            <p className="metric-desc">
              Enrolled undergraduate and postgraduate students studying at state
              universities, private institutes, or international branch campuses in Sri Lanka.
            </p>
          </div>
        </div>

        {/* Two Explanatory Cards: Eligibility and Response Use */}
        <div className="details-two-column-grid">
          <article className="research-glass-card">
            <div className="card-header-with-badge">
              <span className="card-sub-badge">WHO CAN TAKE PART</span>
              <h3 className="details-card-title">Eligibility Requirements</h3>
            </div>
            <p className="details-card-text">
              To ensure valid statistical representation in our computing research,
              participants must satisfy the following criteria:
            </p>
            <ul className="details-list">
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Age 18 or Older:</strong> Must be at least 18 years of age at
                  the time of survey completion.
                </div>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Enrolled in Sri Lanka:</strong> Currently registered as a student
                  at a Sri Lankan state university, private degree-awarding institute,
                  or international branch campus.
                </div>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Voluntary Consent:</strong> Confirm understanding and consent
                  on the study consent screen before starting.
                </div>
              </li>
            </ul>
          </article>

          <article className="research-glass-card">
            <div className="card-header-with-badge">
              <span className="card-sub-badge">ACADEMIC DATA GOVERNANCE</span>
              <h3 className="details-card-title">How Research Responses Are Used</h3>
            </div>
            <p className="details-card-text">
              Your valuable participation contributes to advancing cybersecurity
              scholarship in Sri Lanka. All submissions are processed as follows:
            </p>
            <ul className="details-list">
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Statistical Analysis:</strong> Data is analyzed in aggregate
                  using statistical modeling (e.g., correlation, regression) to understand
                  threat vulnerabilities.
                </div>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Academic Dissemination:</strong> Results are reported in peer-reviewed
                  academic computing conferences, theses, and journals.
                </div>
              </li>
              <li>
                <CheckCircle2 size={16} className="text-cyan-400" aria-hidden="true" />
                <div>
                  <strong>Zero Commercial Monetization:</strong> Data is never sold, shared
                  with marketing brokers, or used for commercial profiling.
                </div>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* =========================================================================
          5. PARTICIPATION PROCESS
          ========================================================================= */}
      <section
        id="process"
        className="research-section container"
        aria-labelledby="process-heading"
      >
        <div className="section-header-centered">
          <span className="research-mini-label">SEAMLESS WORKFLOW</span>
          <h2 id="process-heading" className="section-title">
            Participation Process
          </h2>
          <p className="section-subtitle">
            A transparent three-step journey designed with student convenience and
            privacy at every stage.
          </p>
        </div>

        <div className="process-horizontal-container">
          {/* Connector Line behind steps */}
          <div className="process-track-line" aria-hidden="true" />

          {/* Step 1 */}
          <div className="process-step-node">
            <div className="step-circle-badge">
              <span className="step-count">01</span>
            </div>
            <div className="step-card">
              <div className="step-icon-header">
                <BookOpen size={22} className="text-cyan-400" aria-hidden="true" />
                <span className="step-tag">STEP ONE</span>
              </div>
              <h3 className="step-title">Read the Research Information</h3>
              <p className="step-desc">
                Review the study background, focus areas, participant rights, and
                data governance principles outlined on this page.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="process-step-node">
            <div className="step-circle-badge active">
              <span className="step-count">02</span>
            </div>
            <div className="step-card">
              <div className="step-icon-header">
                <FileCheck2 size={22} className="text-purple-400" aria-hidden="true" />
                <span className="step-tag">STEP TWO</span>
              </div>
              <h3 className="step-title">Review the Consent Information</h3>
              <p className="step-desc">
                Navigate to the consent page, verify your age and student eligibility,
                and review participant protections before choosing to proceed.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="process-step-node">
            <div className="step-circle-badge">
              <span className="step-count">03</span>
            </div>
            <div className="step-card">
              <div className="step-icon-header">
                <CheckCircle2 size={22} className="text-emerald-400" aria-hidden="true" />
                <span className="step-tag">STEP THREE</span>
              </div>
              <h3 className="step-title">Complete the Research Survey</h3>
              <p className="step-desc">
                Answer 25 questions across six short sections at your own pace.
                Skip optional items if you wish, review your answers, and submit.
              </p>
            </div>
          </div>
        </div>

        {/* Process Next Action Hint */}
        <div className="process-footer-hint">
          <span>Ready to get started with Step 2?</span>
          <Link href="/consent" className="button primary research-inline-btn">
            Proceed to Consent Screen <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          6. PRIVACY AND RESEARCH ETHICS
          ========================================================================= */}
      <section
        id="ethics"
        className="research-section container"
        aria-labelledby="ethics-heading"
      >
        <div className="section-header-centered">
          <span className="research-mini-label">ACADEMIC INTEGRITY</span>
          <h2 id="ethics-heading" className="section-title">
            Privacy and Research Ethics
          </h2>
          <p className="section-subtitle">
            Ethical integrity is foundational to our computing research.
            Review our strict privacy guarantees and data handling policies below.
          </p>
        </div>

        {/* 5 Core Ethics Guarantees Grid */}
        <div className="ethics-guarantees-grid">
          {/* Guarantee 1 */}
          <div className="ethics-card">
            <div className="ethics-icon-box lavender-box">
              <UserCheck size={22} aria-hidden="true" />
            </div>
            <h3 className="ethics-card-title">Voluntary Participation</h3>
            <p className="ethics-card-desc">
              Participation is entirely voluntary. You can exit, take a break, or
              discard an unsubmitted draft at any moment without penalty or
              affecting your academic standing.
            </p>
          </div>

          {/* Guarantee 2 */}
          <div className="ethics-card">
            <div className="ethics-icon-box cyan-box">
              <KeyRound size={22} aria-hidden="true" />
            </div>
            <h3 className="ethics-card-title">Anonymous Data Collection</h3>
            <p className="ethics-card-desc">
              Sessions use randomly generated cryptographic tokens. Responses are
              stored under an anonymous participant code without linkage to your
              device identity or IP logs in exports.
            </p>
          </div>

          {/* Guarantee 3 */}
          <div className="ethics-card">
            <div className="ethics-icon-box peach-box">
              <Lock size={22} aria-hidden="true" />
            </div>
            <h3 className="ethics-card-title">Zero PII Collected</h3>
            <p className="ethics-card-desc">
              We never collect student names, registration numbers, national identity
              card (NIC) numbers, phone numbers, email addresses, passwords, or
              payment credentials.
            </p>
          </div>

          {/* Guarantee 4 */}
          <div className="ethics-card">
            <div className="ethics-icon-box teal-box">
              <Database size={22} aria-hidden="true" />
            </div>
            <h3 className="ethics-card-title">Academic Research Purpose</h3>
            <p className="ethics-card-desc">
              All collected information is used solely for university computing
              scholarship, baseline security analysis, and academic publication. No
              commercial entity has access to your data.
            </p>
          </div>

          {/* Guarantee 5 */}
          <div className="ethics-card">
            <div className="ethics-icon-box lavender-box">
              <CheckCircle2 size={22} aria-hidden="true" />
            </div>
            <h3 className="ethics-card-title">Freedom to Skip Questions</h3>
            <p className="ethics-card-desc">
              You are completely free to skip any question or select &quot;Prefer not
              to say&quot;. There are no right or wrong answers—only your authentic
              personal experience.
            </p>
          </div>
        </div>

        {/* Technical Data Governance & Policy Box */}
        <div className="data-governance-box">
          <div className="governance-grid">
            <div className="governance-col">
              <h4 className="governance-heading">
                <Database size={16} aria-hidden="true" /> Data Retention Policy
              </h4>
              <p className="governance-text">{config.retention}</p>
              <p className="governance-subtext">
                Temporary drafts expire after {config.draftDays} days and are cleared
                upon submission or browser discard.
              </p>
            </div>

            <div className="governance-col">
              <h4 className="governance-heading">
                <RotateCcw size={16} aria-hidden="true" /> Participant Withdrawal Rights
              </h4>
              <p className="governance-text">
                Upon submitting, you receive a private deletion token. You may withdraw
                your response within {config.withdrawalDays} days from consent.
              </p>
              <Link href="/withdraw" className="button secondary small-btn">
                Withdraw a response <RotateCcw size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="governance-col">
              <h4 className="governance-heading">
                <FileText size={16} aria-hidden="true" /> Researcher Contact
              </h4>
              <p className="governance-text">{config.contact}</p>
              <p className="governance-subtext">
                Questions about research ethics or your participation can be directed
                to the study coordinator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION (Student Friendly)
          ========================================================================= */}
      <section className="research-section container" aria-label="Frequently Asked Questions">
        <div className="section-header-centered">
          <span className="research-mini-label">STUDENT QUESTIONS</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Common questions Sri Lankan undergraduates ask about taking part.
          </p>
        </div>

        <div className="faq-accordion-list">
          {[
            {
              q: "Will my lecturers or university know what I answered?",
              a: "No. Absolutely not. The survey is 100% anonymous. We do not ask for your name, student ID, or university email address. Responses cannot be traced back to any individual student.",
            },
            {
              q: "How long does the questionnaire actually take?",
              a: "Most students complete the 25 questions in approximately 5 to 7 minutes. Questions are clear multiple-choice items with no complicated typing required.",
            },
            {
              q: "What if I haven't experienced any cyber attacks?",
              a: "Your answers are equally valuable! Understanding how many students have never encountered a threat helps us establish an accurate baseline of student cyber experiences across Sri Lanka.",
            },
            {
              q: "Can I leave and finish later?",
              a: "Yes. Your progress is saved as an anonymous temporary draft in your local browser storage. As long as you return on the same device within the draft period, your answers will be restored.",
            },
            {
              q: "What happens after I complete the survey?",
              a: "After submitting your responses, you will receive an anonymous participant code and withdrawal token. You then have the option to explore optional gamified campus cybersecurity missions or exit directly.",
            },
          ].map((item, idx) => (
            <div key={idx} className="faq-item">
              <button
                type="button"
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={activeFaq === idx}
              >
                <span>{item.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp size={18} aria-hidden="true" />
                ) : (
                  <ChevronDown size={18} aria-hidden="true" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="faq-answer-pane">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. CALL TO ACTION (CTA)
          ========================================================================= */}
      <section className="research-cta-section container" aria-labelledby="cta-heading">
        <div className="cta-banner-glass">
          {/* Ambient lighting orb inside banner */}
          <div className="cta-glow-orb" aria-hidden="true" />

          <div className="cta-content">
            <span className="cta-eyebrow">CONTRIBUTE TO COMPUTING SCHOLARSHIP</span>
            <h2 id="cta-heading" className="cta-heading">
              Ready to Contribute to Digital Privacy Research?
            </h2>
            <p className="cta-description">
              Take part in our academic survey and contribute valuable insights into
              cybersecurity awareness and digital privacy.
            </p>

            <div className="cta-actions-group">
              <Link
                href="/consent"
                className="button primary large cta-primary-btn"
                aria-label="Start Research Survey by proceeding to consent"
              >
                Start Research Survey <ArrowRight size={20} aria-hidden="true" />
              </Link>

              <Link
                href="/withdraw"
                className="button secondary large"
                aria-label="Withdraw a previously submitted response"
              >
                Withdraw a Response <RotateCcw size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="cta-reassurances">
              <span className="cta-pill">
                <CheckCircle2 size={14} aria-hidden="true" /> 5–7 Minutes
              </span>
              <span className="cta-pill">
                <ShieldCheck size={14} aria-hidden="true" /> 100% Anonymous
              </span>
              <span className="cta-pill">
                <GraduationCap size={14} aria-hidden="true" /> Sri Lankan Students
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
