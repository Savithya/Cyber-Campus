"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Lock,
  LockKeyhole,
  Clock,
  GraduationCap,
  ArrowRight,
  BookOpen,
  FileCheck2,
  CheckCircle2,
  BookmarkCheck,
  AlertTriangle,
  Globe,
  KeyRound,
  Database,
  RotateCcw,
  Target,
  Check,
  Gamepad2,
  Eye,
  FileText,
  Home,
  Sparkles,
  ExternalLink,
  Layers,
  HeartHandshake,
  Shield,
  RefreshCw,
} from "lucide-react";
import { api, randomToken, putDraft, clearParticipationStorage, useSession } from "@/lib/client";
import type { StudyConfig } from "@/lib/config.server";
import type { Session } from "@/lib/types";
import { ResearchTitleIllustration } from "./research-title-illustration";

interface JoinResearchPortalProps {
  initialConfig?: StudyConfig | null;
}

export function JoinResearchPortal({ initialConfig }: JoinResearchPortalProps) {
  const router = useRouter();
  const state = useSession();
  const shouldReduceMotion = useReducedMotion();

  const [config, setConfig] = useState<StudyConfig | null>(initialConfig ?? null);
  const [mode, setMode] = useState<string>("demo");
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [prior, setPrior] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [mountTime] = useState(() => Date.now());

  // Load config & check practice exposure flag
  useEffect(() => {
    api<{ config: StudyConfig; mode: string }>("config")
      .then((d) => {
        setConfig(d.config);
        setMode(d.mode);
      })
      .catch((e) => setError(e.message));

    if (typeof window !== "undefined") {
      setPrior(localStorage.getItem("cc-practice-exposure") === "yes");
    }
  }, []);

  // Smooth scroll handler
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
    }
  };

  // Start research session or practice mode
  async function handleStart(practice: boolean) {
    setBusy(true);
    setError("");
    try {
      const token = randomToken();
      const { session } = await api<{ session: Session }>("session/start", {
        consented: consent,
        eligible,
        priorExposure: prior,
        practice,
        token,
      });

      if (practice) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cc-practice-exposure", "yes");
        }
        router.push("/play");
      } else {
        putDraft({
          code: session.code,
          expires: session.draftExpiresAt,
          answers: session.answers,
          token,
          submitKey: crypto.randomUUID(),
        });
        router.push("/survey");
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Safe discard draft handler for returning participants
  async function handleDiscardDraft() {
    if (!window.confirm("Are you sure you want to discard your saved draft and start fresh? All unsubmitted answers in this session will be cleared.")) {
      return;
    }
    setDiscarding(true);
    setError("");
    try {
      await api("session/discard", {});
      clearParticipationStorage();
      await state.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDiscarding(false);
    }
  }

  // Safe reset for error or expired session
  async function handleResetSession() {
    clearParticipationStorage();
    setError("");
    await state.reload();
  }

  // Determine participant session state
  // State A: New participant (no session in browser)
  // State B: Returning participant (valid saved draft or resumable practice)
  // State C: Completed participant (submitted research session)
  // State D: Invalid or expired session
  const isSessionLoading = state.loading;
  const hasSession = Boolean(state.session);
  const sessionData = state.session;

  const isCompleted =
    hasSession &&
    sessionData?.mode !== "practice" &&
    (sessionData?.status === "submitted_complete" || sessionData?.status === "submitted_with_missing");

  const isResumable =
    hasSession &&
    !isCompleted &&
    (sessionData?.status === "draft" || sessionData?.mode === "practice");

  const isInvalidOrExpired =
    Boolean(state.error) ||
    (hasSession &&
      sessionData?.status === "draft" &&
      Date.parse(sessionData.draftExpiresAt) < mountTime);

  // Formatting date helper
  const formatExpiry = (isoString?: string) => {
    if (!isoString) return "7 days from start";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "7 days";
    }
  };

  // Motion variants
  const fadeIn = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" as const },
  };

  return (
    <div className="portal-page">
      {/* Background Animated Cyber Grid & Ambient Lighting */}
      <div className="portal-ambient-layer" aria-hidden="true">
        <div className="portal-grid-pattern" />
        <div className="portal-glow-orb orb-primary" />
        <div className="portal-glow-orb orb-cyan" />
        <div className="portal-glow-orb orb-purple" />
      </div>

      {/* Quick Jump Navigation Strip */}
      <nav className="portal-jump-strip" aria-label="Research Portal navigation">
        <div className="container portal-jump-inner">
          <span className="portal-jump-tag">
            <Layers size={14} aria-hidden="true" /> RESEARCH PORTAL
          </span>
          <div className="portal-jump-links">
            <a href="#hero" onClick={(e) => scrollTo(e, "hero")}>
              Overview
            </a>
            <a href="#research-info" onClick={(e) => scrollTo(e, "research-info")}>
              Study Essentials
            </a>
            <a href="#research-focus" onClick={(e) => scrollTo(e, "research-focus")}>
              Focus Areas
            </a>
            <a href="#participation-flow" onClick={(e) => scrollTo(e, "participation-flow")}>
              Participation Flow
            </a>
            <a href="#consent-form" onClick={(e) => scrollTo(e, "consent-form")}>
              Informed Consent
            </a>
            <a href="#privacy-panel" onClick={(e) => scrollTo(e, "privacy-panel")}>
              Privacy Guarantees
            </a>
            <a href="#practice-lab" onClick={(e) => scrollTo(e, "practice-lab")}>
              Practice Lab
            </a>
          </div>
        </div>
      </nav>

      {/* Error notification banner if any */}
      {(error || state.error) && (
        <div className="container portal-alert-container">
          <div className="error-box portal-alert-box" role="alert">
            <AlertTriangle size={20} aria-hidden="true" />
            <div className="portal-alert-content">
              <strong>Notice:</strong>
              <p>{error || state.error}</p>
            </div>
            <button
              type="button"
              className="button secondary small portal-alert-btn"
              onClick={() => {
                setError("");
                state.reload();
              }}
            >
              <RefreshCw size={14} aria-hidden="true" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: MAIN HERO SECTION (Two-column layout on Desktop, stacked on Mobile)
          ========================================================================= */}
      <section id="hero" className="portal-hero container" aria-label="Research Participation Hero">
        {/* LEFT COLUMN: Academic Presentation */}
        <motion.div
          className="portal-hero-left"
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
        >
          {/* Eyebrow Label */}
          <div className="portal-eyebrow">
            <span className="portal-live-dot" aria-hidden="true" />
            <span>ACADEMIC RESEARCH PARTICIPATION</span>
          </div>

          {/* Main Heading */}
          <h1 className="portal-hero-title">
            Join Our Cybersecurity <span className="portal-gradient-text">Research</span>
          </h1>

          {/* Research Subtitle */}
          <p className="portal-hero-subtitle">
            Help advance understanding of social engineering threats and user privacy among university
            students in Sri Lanka.
          </p>

          {/* Official Research Title Card with Illustration */}
          <article className="portal-title-card" aria-label="Official Research Title">
            <div className="portal-title-card-header">
              <span className="portal-title-badge">
                <GraduationCap size={15} aria-hidden="true" />
                <span>OFFICIAL RESEARCH STUDY</span>
              </span>
              <span className="portal-institution-tag">Higher Education · Sri Lanka</span>
            </div>

            <h2 className="portal-study-title">
              {config?.title ??
                "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka"}
            </h2>

            {/* Professional Cybersecurity & Research Illustration */}
            <ResearchTitleIllustration />

            <div className="portal-title-footer">
              <span className="portal-title-meta">
                <ShieldCheck size={14} className="text-teal" aria-hidden="true" />
                <span>Standardized Academic Instrument · 25 Items</span>
              </span>
              <span className="portal-title-meta">
                <Lock size={14} className="text-purple" aria-hidden="true" />
                <span>Anonymous Cryptographic Token</span>
              </span>
            </div>
          </article>

          {/* Participation Highlights */}
          <div className="portal-highlights-row" aria-label="Participation Highlights">
            <div className="portal-highlight-pill">
              <Clock size={15} className="highlight-icon text-cyan" aria-hidden="true" />
              <span>5–7 Minutes Duration</span>
            </div>
            <div className="portal-highlight-pill">
              <ShieldCheck size={15} className="highlight-icon text-teal" aria-hidden="true" />
              <span>100% Anonymous & Voluntary</span>
            </div>
            <div className="portal-highlight-pill">
              <GraduationCap size={15} className="highlight-icon text-purple" aria-hidden="true" />
              <span>Sri Lankan Undergraduates</span>
            </div>
            <div className="portal-highlight-pill">
              <LockKeyhole size={15} className="highlight-icon text-cyan" aria-hidden="true" />
              <span>Zero Personal Information</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Interactive Research Participation Card */}
        <div className="portal-hero-right">
          <div className="dynamic-participation-card-wrapper">
            <div className="card-glass-glow-effect" aria-hidden="true" />

            {/* DYNAMIC CARD: State A, B, C, or D */}
            {isSessionLoading ? (
              /* Loading State */
              <div className="dynamic-participation-card loading-state" role="status">
                <div className="card-header-badge-row">
                  <span className="portal-status-badge badge-neutral">Checking Session…</span>
                </div>
                <h3 className="card-heading">Connecting to Research Portal</h3>
                <p className="card-description">
                  Verifying local participant session credentials and study configuration…
                </p>
                <div className="card-skeleton-pulse" />
              </div>
            ) : isInvalidOrExpired ? (
              /* STATE D: Invalid or Expired Session */
              <div className="dynamic-participation-card state-d-card">
                <div className="card-header-badge-row">
                  <span className="portal-status-badge badge-warning">
                    <AlertTriangle size={14} aria-hidden="true" /> Session Notice
                  </span>
                </div>

                <h3 className="card-heading">Session Notice</h3>
                <p className="card-description">
                  Your previous research session could not be verified or has expired. Inactive drafts
                  are automatically cleared to protect participant confidentiality.
                </p>

                <div className="card-info-box warning-box">
                  <p>
                    You can start fresh right now. Your answers will be stored under a new anonymous
                    participant code.
                  </p>
                </div>

                <div className="card-actions-stack">
                  <button
                    type="button"
                    className="button primary large w-full portal-btn-touch"
                    onClick={handleResetSession}
                  >
                    <span>Start a New Session</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="button secondary w-full portal-btn-touch"
                    onClick={() => state.reload()}
                  >
                    <span>Retry Connection</span>
                    <RotateCcw size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="card-footnote">
                  <span>Drafts expire after {config?.draftDays ?? 7} days to safeguard privacy.</span>
                </div>
              </div>
            ) : isCompleted ? (
              /* STATE C: Completed Participant */
              <div className="dynamic-participation-card state-c-card">
                <div className="card-header-badge-row">
                  <span className="portal-status-badge badge-success">
                    <CheckCircle2 size={14} aria-hidden="true" /> Participation Completed
                  </span>
                  <span className="portal-mode-chip">Survey Recorded</span>
                </div>

                <h3 className="card-heading">Thank You for Your Contribution</h3>
                <p className="card-description">
                  Thank you for supporting research into social engineering threats and user privacy among
                  university students in Sri Lanka.
                </p>

                <div className="card-session-meta-box success-box">
                  <div className="meta-row">
                    <span className="meta-label">Participant Code:</span>
                    <strong className="meta-value font-mono">{sessionData?.code}</strong>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Status:</span>
                    <span className="text-teal font-semibold">Response Verified & Stored</span>
                  </div>
                  <p className="meta-note">
                    Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
                  </p>
                </div>

                <div className="card-actions-stack">
                  <button
                    type="button"
                    className="button primary large w-full portal-btn-touch inline-flex items-center justify-center gap-2"
                    onClick={() => handleStart(false)}
                    disabled={busy}
                  >
                    <span>{busy ? "Starting…" : "Start Another Submission"}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>

                  <Link
                    href="/survey/complete"
                    className="button secondary w-full portal-btn-touch"
                  >
                    <span>View Submission Confirmation</span>
                    <FileCheck2 size={16} aria-hidden="true" />
                  </Link>

                  <Link href="/" className="button secondary w-full portal-btn-touch">
                    <span>Return to Homepage</span>
                    <Home size={16} aria-hidden="true" />
                  </Link>

                  <a href="#practice-lab" onClick={(e) => scrollTo(e, "practice-lab")} className="button secondary w-full portal-btn-touch">
                    <span>Explore Optional Cyber Challenges</span>
                    <Gamepad2 size={16} aria-hidden="true" />
                  </a>
                </div>

                <div className="card-footnote">
                  <span>You may withdraw your response within {config?.withdrawalDays ?? 7} days using your deletion token.</span>
                </div>
              </div>
            ) : isResumable ? (
              /* STATE B: Returning Participant */
              <div className="dynamic-participation-card state-b-card">
                <div className="card-header-badge-row">
                  <span className="portal-status-badge badge-saved">
                    <BookmarkCheck size={14} aria-hidden="true" /> Session Saved
                  </span>
                  <span className="portal-mode-chip">
                    {sessionData?.mode === "practice" ? "Practice Sandbox" : "Academic Survey"}
                  </span>
                </div>

                <h3 className="card-heading">Welcome Back!</h3>
                <p className="card-description">
                  You have a saved research session in this browser. Continue where you left off.
                </p>

                <div className="card-session-meta-box">
                  <div className="meta-row">
                    <span className="meta-label">Participant Code:</span>
                    <strong className="meta-value font-mono">{sessionData?.code}</strong>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Progress:</span>
                    <span className="meta-value">
                      {sessionData?.mode === "practice" ? "Practice Session Active" : "Survey Draft Saved"}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Draft Expiry:</span>
                    <span className="meta-value">{formatExpiry(sessionData?.draftExpiresAt)}</span>
                  </div>
                </div>

                <div className="card-actions-stack">
                  <Link
                    href={
                      sessionData?.status === "draft"
                        ? "/survey"
                        : sessionData?.mode === "practice"
                          ? "/play"
                          : "/survey/complete"
                    }
                    className="button primary large w-full portal-btn-touch"
                  >
                    <span>Continue Your Session</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>

                  <a
                    href="#research-info"
                    onClick={(e) => scrollTo(e, "research-info")}
                    className="button secondary w-full portal-btn-touch"
                  >
                    <span>Review Study Information</span>
                    <BookOpen size={16} aria-hidden="true" />
                  </a>
                </div>

                <div className="card-footer-controls">
                  <button
                    type="button"
                    className="portal-discard-link"
                    onClick={handleDiscardDraft}
                    disabled={discarding}
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>{discarding ? "Discarding draft…" : "Discard saved draft & start new session"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STATE A: New Participant */
              <div className="dynamic-participation-card state-a-card">
                <div className="card-header-badge-row">
                  <span className="portal-status-badge badge-active">
                    <Sparkles size={14} aria-hidden="true" /> Direct Participation
                  </span>
                  <span className="portal-mode-chip">Open Academic Call</span>
                </div>

                <h3 className="card-heading">Begin Your Research Journey</h3>
                <p className="card-description">
                  Your participation will contribute to understanding cybersecurity awareness, social
                  engineering experiences, online behaviours, and privacy protection practices.
                </p>

                <div className="card-feature-list">
                  <div className="card-feature-item">
                    <CheckCircle2 size={16} className="text-cyan" aria-hidden="true" />
                    <span>Takes only 5 to 7 minutes to complete</span>
                  </div>
                  <div className="card-feature-item">
                    <CheckCircle2 size={16} className="text-cyan" aria-hidden="true" />
                    <span>Strictly anonymous cryptographic participant token</span>
                  </div>
                  <div className="card-feature-item">
                    <CheckCircle2 size={16} className="text-cyan" aria-hidden="true" />
                    <span>No personal identification, email, or passwords required</span>
                  </div>
                </div>

                <div className="card-actions-stack">
                  <a
                    href="#consent-form"
                    onClick={(e) => scrollTo(e, "consent-form")}
                    className="button primary large w-full portal-btn-touch"
                  >
                    <span>Start Research Participation</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </a>

                  <a
                    href="#research-info"
                    onClick={(e) => scrollTo(e, "research-info")}
                    className="button secondary w-full portal-btn-touch"
                  >
                    <span>Learn About the Study</span>
                    <BookOpen size={16} aria-hidden="true" />
                  </a>
                </div>

                <div className="card-footnote">
                  <Lock size={12} aria-hidden="true" />
                  <span>No user account required · Automatic temporary draft preservation</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FOUR RESEARCH INFORMATION CARDS
          ========================================================================= */}
      <section
        id="research-info"
        className="portal-section container"
        aria-labelledby="research-info-heading"
      >
        <div className="section-header-centered">
          <span className="portal-section-mini-tag">STUDY PARAMETERS</span>
          <h2 id="research-info-heading" className="portal-section-title">
            Research Essentials
          </h2>
          <p className="portal-section-subtitle">
            Foundational information regarding this academic study on undergraduate cybersecurity and digital
            privacy in Sri Lanka.
          </p>
        </div>

        <div className="portal-info-cards-grid">
          {/* Card 1 – Research Purpose */}
          <article className="portal-info-card">
            <div className="portal-info-icon-box lavender-glow">
              <Target size={26} aria-hidden="true" />
            </div>
            <span className="portal-card-category">CORE OBJECTIVE</span>
            <h3 className="portal-card-headline">Research Purpose</h3>
            <p className="portal-card-body">
              Explore how social engineering threats relate to user privacy among university students in Sri
              Lanka.
            </p>
          </article>

          {/* Card 2 – University Students */}
          <article className="portal-info-card">
            <div className="portal-info-icon-box cyan-glow">
              <GraduationCap size={26} aria-hidden="true" />
            </div>
            <span className="portal-card-category">ELIGIBILITY</span>
            <h3 className="portal-card-headline">Who Can Participate?</h3>
            <p className="portal-card-body">
              University students in Sri Lanka who meet the study&apos;s eligibility and consent requirements.
            </p>
          </article>

          {/* Card 3 – Estimated Duration */}
          <article className="portal-info-card">
            <div className="portal-info-icon-box teal-glow">
              <Clock size={26} aria-hidden="true" />
            </div>
            <span className="portal-card-category">TIME COMMITMENT</span>
            <h3 className="portal-card-headline">5–7 Minutes</h3>
            <p className="portal-card-body">
              Complete a short academic questionnaire about cybersecurity awareness, experiences, online
              behaviours, and privacy protection.
            </p>
          </article>

          {/* Card 4 – Privacy & Confidentiality */}
          <article className="portal-info-card">
            <div className="portal-info-icon-box purple-glow">
              <ShieldCheck size={26} aria-hidden="true" />
            </div>
            <span className="portal-card-category">DATA ETHICS</span>
            <h3 className="portal-card-headline">Privacy Matters</h3>
            <p className="portal-card-body">
              Participation is voluntary. Review how your responses are collected, used and protected before
              proceeding.
            </p>
          </article>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: RESEARCH FOCUS SECTION (4 IV Cards + DV User Privacy)
          ========================================================================= */}
      <section
        id="research-focus"
        className="portal-section container"
        aria-labelledby="research-focus-heading"
      >
        <div className="section-header-centered">
          <span className="portal-section-mini-tag">THEORETICAL FRAMEWORK</span>
          <h2 id="research-focus-heading" className="portal-section-title">
            What Does This Research Explore?
          </h2>
          <p className="portal-section-subtitle">
            Our conceptual framework investigates four core independent dimensions of social engineering threats
            and examines how they relate to undergraduate user privacy.
          </p>
        </div>

        {/* Four Independent Variable Cards */}
        <div className="portal-focus-grid">
          {/* IV1 – Awareness of Social Engineering Threats */}
          <article className="portal-focus-card">
            <div className="focus-card-top">
              <span className="focus-variable-code">INDEPENDENT VARIABLE 1</span>
              <div className="focus-icon-pill cyan-pill">
                <Eye size={20} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-card-title">Awareness of Social Engineering Threats</h3>
            <p className="focus-card-desc">
              Understanding how students recognise phishing, impersonation, scams and other deceptive online
              threats.
            </p>
            <div className="focus-card-meta">
              <span className="focus-item-tag">Survey Items Q6–Q9 · IV1</span>
              <span className="focus-sub-tag">Threat Recognition</span>
            </div>
          </article>

          {/* IV2 – Experience with Social Engineering Threats */}
          <article className="portal-focus-card">
            <div className="focus-card-top">
              <span className="focus-variable-code">INDEPENDENT VARIABLE 2</span>
              <div className="focus-icon-pill amber-pill">
                <AlertTriangle size={20} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-card-title">Experience with Social Engineering Threats</h3>
            <p className="focus-card-desc">
              Exploring students&apos; actual encounters with suspicious messages, fake profiles and other social
              engineering activities.
            </p>
            <div className="focus-card-meta">
              <span className="focus-item-tag">Survey Items Q10–Q12 · IV2</span>
              <span className="focus-sub-tag">Encounter Frequency</span>
            </div>
          </article>

          {/* IV3 – Online Behaviours */}
          <article className="portal-focus-card">
            <div className="focus-card-top">
              <span className="focus-variable-code">INDEPENDENT VARIABLE 3</span>
              <div className="focus-icon-pill purple-pill">
                <Globe size={20} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-card-title">Online Behaviours</h3>
            <p className="focus-card-desc">
              Examining how students interact with online links, messages, social networks and
              information-sharing requests.
            </p>
            <div className="focus-card-meta">
              <span className="focus-item-tag">Survey Items Q13–Q15 · IV3</span>
              <span className="focus-sub-tag">Digital Habits</span>
            </div>
          </article>

          {/* IV4 – Privacy Protection Practices */}
          <article className="portal-focus-card">
            <div className="focus-card-top">
              <span className="focus-variable-code">INDEPENDENT VARIABLE 4</span>
              <div className="focus-icon-pill teal-pill">
                <KeyRound size={20} aria-hidden="true" />
              </div>
            </div>
            <h3 className="focus-card-title">Privacy Protection Practices</h3>
            <p className="focus-card-desc">
              Understanding how students use account security, identity verification and other privacy
              protection measures.
            </p>
            <div className="focus-card-meta">
              <span className="focus-item-tag">Survey Items Q16–Q18 · IV4</span>
              <span className="focus-sub-tag">Security Measures</span>
            </div>
          </article>
        </div>

        {/* Central Dependent Variable Showcase */}
        <article className="portal-dv-showcase-card">
          <div className="dv-showcase-header">
            <div className="dv-badge-group">
              <span className="portal-dv-badge">
                <ShieldCheck size={16} aria-hidden="true" /> DEPENDENT VARIABLE (DV)
              </span>
              <span className="portal-dv-tag">Core Outcome Dimension</span>
            </div>
            <span className="dv-survey-mapping">Survey Items Q19–Q25 · Core DV</span>
          </div>

          <div className="dv-showcase-body">
            <div className="dv-text-col">
              <h3 className="dv-headline">User Privacy</h3>
              <p className="dv-description">
                Examining privacy concerns and potential risks associated with social engineering threats.
              </p>
              <p className="dv-subtext">
                This investigation examines self-reported perceived privacy exposure, unauthorized credential
                compromise, data autonomy, and student protective concerns. Completing the survey reflects your
                lived experiences and habits—it does not technically measure or rate your personal device
                security.
              </p>
            </div>

            <div className="dv-diagram-col" aria-label="Conceptual Framework Flow">
              <div className="dv-diagram-card">
                <span className="diagram-label">CONCEPTUAL RESEARCH RELATIONSHIP</span>
                <div className="dv-flow-box">
                  <div className="dv-flow-iv-node">
                    <strong>Four Threat Dimensions</strong>
                    <small>Awareness · Experience · Habits · Safeguards</small>
                  </div>
                  <div className="dv-flow-arrow">
                    <ArrowRight size={20} aria-hidden="true" />
                    <span className="flow-arrow-text">Direct Impact</span>
                  </div>
                  <div className="dv-flow-dv-node">
                    <ShieldCheck size={22} className="text-teal" aria-hidden="true" />
                    <strong>User Privacy</strong>
                    <small>Dependent Variable</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* =========================================================================
          SECTION 6: CLEAR PARTICIPATION FLOW
          ========================================================================= */}
      <section
        id="participation-flow"
        className="portal-section container"
        aria-labelledby="flow-heading"
      >
        <div className="section-header-centered">
          <span className="portal-section-mini-tag">PARTICIPATION WORKFLOW</span>
          <h2 id="flow-heading" className="portal-section-title">
            Participation Flow
          </h2>
          <p className="portal-section-subtitle">
            A clear, four-step academic process ensuring ethical consent, transparent data collection, and
            verified submission.
          </p>
        </div>

        <div className="portal-flow-pipeline">
          {/* Step 01 */}
          <div className="portal-flow-step">
            <div className="step-number-badge">01</div>
            <div className="step-card-content">
              <div className="step-card-icon cyan-text">
                <BookOpen size={22} aria-hidden="true" />
              </div>
              <h3 className="step-card-title">Review Study Information</h3>
              <p className="step-card-desc">
                Review the research background, focus areas, eligibility requirements, and data governance
                principles outlined on this page.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="portal-flow-step step-highlight">
            <div className="step-number-badge">02</div>
            <div className="step-card-content">
              <div className="step-card-icon purple-text">
                <FileCheck2 size={22} aria-hidden="true" />
              </div>
              <h3 className="step-card-title">Read and Provide Informed Consent</h3>
              <p className="step-card-desc">
                Verify your age (18 or older), confirm university enrollment in Sri Lanka, and voluntarily provide
                informed consent below.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="portal-flow-step">
            <div className="step-number-badge">03</div>
            <div className="step-card-content">
              <div className="step-card-icon teal-text">
                <FileText size={22} aria-hidden="true" />
              </div>
              <h3 className="step-card-title">Complete the Research Questionnaire</h3>
              <p className="step-card-desc">
                Answer 25 multiple-choice questions covering awareness, threat experiences, digital behaviours,
                and privacy concerns at your own pace.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="portal-flow-step">
            <div className="step-number-badge">04</div>
            <div className="step-card-content">
              <div className="step-card-icon cyan-text">
                <CheckCircle2 size={22} aria-hidden="true" />
              </div>
              <h3 className="step-card-title">Submit Responses and View Confirmation</h3>
              <p className="step-card-desc">
                Review your answers, submit your responses securely, and obtain your anonymous participant code
                and private withdrawal token.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INFORMED CONSENT & ELIGIBILITY (FUNCTIONAL CONSENT MECHANISM)
          ========================================================================= */}
      <section
        id="consent-form"
        className="portal-section container"
        aria-labelledby="consent-heading"
      >
        <div className="section-header-centered">
          <span className="portal-section-mini-tag">STEP 02 OF 04</span>
          <h2 id="consent-heading" className="portal-section-title">
            Informed Consent & Eligibility
          </h2>
          <p className="portal-section-subtitle">
            Please read the research information before deciding. You can finish the questionnaire without
            playing any games.
          </p>
        </div>

        {/* Detailed Study Governance Information Box */}
        <div className="portal-study-disclosure-card">
          <div className="disclosure-header">
            <div className="disclosure-icon-title">
              <span className="icon-tile lavender">
                <BookOpen size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>Academic Research Details</h3>
                <p>Read the terms of voluntary participation before providing consent.</p>
              </div>
            </div>
            <span className="disclosure-tag">Version 1.0.0</span>
          </div>

          <div className="disclosure-body">
            <p>
              <strong>Study Title:</strong>{" "}
              {config?.title ??
                "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka."}
            </p>
            <p>
              This study asks about university students&apos; experiences, awareness, concerns, and behaviour
              online. Your responses will help describe these experiences and establish empirical insights for
              academic publication. There are no right or wrong questionnaire answers. Please answer honestly.
            </p>

            <div className="disclosure-grid">
              <div className="disclosure-item">
                <HeartHandshake size={20} className="text-purple" aria-hidden="true" />
                <div>
                  <strong>Participation is voluntary</strong>
                  <p>
                    Skip any question using its separate skip action, or stop at any time without penalty.
                    Consent and eligibility are administrative fields, separate from Q1–Q25.
                  </p>
                </div>
              </div>

              <div className="disclosure-item">
                <LockKeyhole size={20} className="text-cyan" aria-hidden="true" />
                <div>
                  <strong>What we collect</strong>
                  <p>
                    Your questionnaire answers, an anonymous random participant code, consent version, timestamps,
                    and known prior practice exposure. No participant name, contact information, or student ID is
                    requested.
                  </p>
                </div>
              </div>
            </div>

            <div className="disclosure-sub-details">
              <h4>Who can access the information?</h4>
              <p>
                Only authorised academic researchers have access to research responses. Supabase and the hosting
                provider process data to operate the service and may retain operational logs. The study does not use
                commercial tracking, advertising, or participant profiling.
              </p>

              <h4>Saving, retention, and withdrawal rights</h4>
              <p>
                An encrypted browser session and temporary local draft support refresh recovery. Drafts expire
                after {config?.draftDays ?? 7} days and are cleared upon confirmed submission or discard.
              </p>
              <p>
                <strong>Retention Policy:</strong>{" "}
                {config?.retention ?? "Responses are securely retained for academic analysis and publication."}
              </p>
              <p>
                You may delete a submitted response using your participant code and private deletion token within{" "}
                {config?.withdrawalDays ?? 7} days from consent. Save the deletion token displayed on submission.
              </p>

              <h4>Research Contact</h4>
              <p>{config?.contact ?? "Study Coordinator · Cyber Campus Research Initiative"}</p>
            </div>
          </div>
        </div>

        {/* The Actionable Consent Box */}
        <div className="portal-consent-box card">
          <div className="consent-box-header">
            <h3>Decide whether to participate</h3>
            <p>Check the boxes below to confirm your eligibility and voluntary agreement.</p>
          </div>

          {mode === "demo" && (
            <div className="notice" role="status">
              Local demonstration only. Your trial responses are kept in this browser session and are never added to
              research results.
            </div>
          )}

          {error && (
            <div className="error-box" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="consent-checkbox-group">
            {/* Checkbox 1: Age and University Student in Sri Lanka */}
            <label className="checkbox-row portal-checkbox-row">
              <input
                type="checkbox"
                id="eligibility-checkbox"
                checked={eligible}
                onChange={(e) => setEligible(e.target.checked)}
              />
              <span>
                I am 18 or older and currently study at a Sri Lankan higher education institution.
              </span>
            </label>

            {/* Checkbox 2: Read information & Voluntary Consent */}
            <label className="checkbox-row portal-checkbox-row">
              <input
                type="checkbox"
                id="consent-checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I have read the information above and voluntarily consent to participate.
              </span>
            </label>

            {/* Checkbox 3: Prior Practice Activities */}
            <label className="checkbox-row portal-checkbox-row">
              <input
                type="checkbox"
                id="prior-exposure-checkbox"
                checked={prior}
                onChange={(e) => setPrior(e.target.checked)}
                disabled={
                  typeof window !== "undefined" &&
                  localStorage.getItem("cc-practice-exposure") === "yes"
                }
              />
              <span>
                I have previously played these practice activities.{" "}
                <small>
                  Known exposure is recorded; anonymous exposure and duplicate responses across devices cannot be
                  completely detected.
                </small>
              </span>
            </label>
          </div>

          {/* Primary Action Button */}
          <div className="consent-action-row">
            <div className="portal-policy-note mb-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs flex items-center gap-2.5 w-full">
              <CheckCircle2 size={18} className="text-teal shrink-0" aria-hidden="true" />
              <span>
                Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
              </span>
            </div>

            <button
              type="button"
              className="button primary large portal-btn-touch"
              disabled={
                !eligible ||
                !consent ||
                busy ||
                !config ||
                (mode === "research" && !config.collectionOpen)
              }
              onClick={() => handleStart(false)}
            >
              <Check size={18} aria-hidden="true" />
              <span>
                {busy
                  ? "Starting…"
                  : isCompleted
                  ? "Start another submission"
                  : "Consent and begin questionnaire"}
              </span>
            </button>

            {isCompleted && (
              <div className="mt-2 text-xs text-slate-400 text-center w-full">
                Previous response recorded: <code className="font-mono text-teal-300">{sessionData?.code}</code> ·{" "}
                <Link href="/survey/complete" className="text-teal-400 hover:underline">
                  View Confirmation
                </Link>
              </div>
            )}

            {mode === "research" && config && !config.collectionOpen && (
              <p className="small-copy text-amber-400">
                Research collection is currently closed by the study coordinator.
              </p>
            )}
          </div>
        </div>

        {/* Respectful Exit / Decline Option Strip */}
        <div className="practice-strip portal-decline-strip">
          <div className="decline-copy">
            <h3>Prefer not to take part?</h3>
            <p>
              You can decline research participation and explore the interactive practice activities instead.
              Practice decisions stay strictly outside research storage and charts.
            </p>
          </div>
          <button
            type="button"
            className="button secondary portal-btn-touch"
            disabled={busy}
            onClick={() => handleStart(true)}
          >
            <Gamepad2 size={18} aria-hidden="true" />
            <span>Decline & practise only</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: PRIVACY INFORMATION PANEL
          ========================================================================= */}
      <section
        id="privacy-panel"
        className="portal-section container"
        aria-labelledby="privacy-heading"
      >
        <div className="section-header-centered">
          <span className="portal-section-mini-tag">SECURITY & INTEGRITY</span>
          <h2 id="privacy-heading" className="portal-section-title">
            Your Privacy Is Important
          </h2>
          <p className="portal-section-subtitle">
            Ethical safeguards and technical data protections governing research participation.
          </p>
        </div>

        <div className="privacy-panel-card">
          <div className="privacy-panel-grid">
            {/* Principle 1 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box cyan-text">
                <HeartHandshake size={24} aria-hidden="true" />
              </div>
              <h4>Participation is Voluntary</h4>
              <p>
                You are free to skip any questionnaire item, take a break at any point, or withdraw completely
                without penalty or academic consequence.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box purple-text">
                <FileCheck2 size={24} aria-hidden="true" />
              </div>
              <h4>Review Consent Before Proceeding</h4>
              <p>
                Informed consent is explicitly confirmed before any question is displayed. You may review our data
                retention, withdrawal deadlines, and research contacts at any time.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box teal-text">
                <Database size={24} aria-hidden="true" />
              </div>
              <h4>Dedicated Academic Purpose</h4>
              <p>
                Collected responses are used exclusively for university computing research and peer-reviewed
                publication in Sri Lanka. Data is never monetized or shared with third parties.
              </p>
            </div>

            {/* Principle 4 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box cyan-text">
                <RotateCcw size={24} aria-hidden="true" />
              </div>
              <h4>Accessible Withdrawal Conditions</h4>
              <p>
                Upon submitting, you receive a private deletion token. You may withdraw and purge your submitted
                record within {config?.withdrawalDays ?? 7} days directly via our withdrawal portal.
              </p>
            </div>

            {/* Principle 5 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box amber-text">
                <Gamepad2 size={24} aria-hidden="true" />
              </div>
              <h4>Practice Lab Activities Are Optional</h4>
              <p>
                Cybersecurity challenges in the Practice Lab are strictly optional educational sandboxes. You are
                never required to complete a challenge to submit your survey.
              </p>
            </div>

            {/* Principle 6 */}
            <div className="privacy-panel-item">
              <div className="item-icon-box teal-text">
                <ShieldCheck size={24} aria-hidden="true" />
              </div>
              <h4>Gaming Scores & Research Responses Kept Separate</h4>
              <p>
                Scenario decisions, gaming XP, and challenge achievements remain in your private browser sandbox
                and are never commingled with the academic survey dataset.
              </p>
            </div>
          </div>

          <div className="privacy-panel-footer">
            <div className="footer-protection-note">
              <LockKeyhole size={18} className="text-teal" aria-hidden="true" />
              <span>
                <strong>Confidentiality Guarantee:</strong> We never collect student names, national identity
                numbers (NIC), registration IDs, email addresses, or phone numbers.
              </span>
            </div>
            <Link href="/privacy" className="button secondary small portal-btn-touch">
              <span>Read Full Privacy Notice</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: OPTIONAL CYBERSECURITY PRACTICE LAB
          ========================================================================= */}
      <section
        id="practice-lab"
        className="portal-section container"
        aria-labelledby="practice-heading"
      >
        <div className="optional-lab-card">
          <div className="lab-card-left">
            <div className="lab-badge-row">
              <span className="lab-mini-badge">
                <Gamepad2 size={15} aria-hidden="true" /> OPTIONAL PRACTICE ZONE
              </span>
              <span className="lab-tag">Educational Sandbox · Not Academic Research</span>
            </div>

            <h3 id="practice-heading" className="lab-headline">
              Explore Cybersecurity Challenges
            </h3>
            <p className="lab-description">
              Practise identifying phishing attempts, fake websites, impersonation threats and privacy risks
              through optional interactive scenarios.
            </p>

            <div className="lab-reassurances">
              <div className="reassurance-item">
                <CheckCircle2 size={15} className="text-cyan" aria-hidden="true" />
                <span>Optional educational practice</span>
              </div>
              <div className="reassurance-item">
                <CheckCircle2 size={15} className="text-cyan" aria-hidden="true" />
                <span>Excluded from research dataset</span>
              </div>
              <div className="reassurance-item">
                <CheckCircle2 size={15} className="text-cyan" aria-hidden="true" />
                <span>XP scores kept in private session</span>
              </div>
            </div>

            <div className="lab-action-group">
              <Link href="/#challenges" className="button primary large portal-btn-touch">
                <Gamepad2 size={18} aria-hidden="true" />
                <span>Explore Practice Lab</span>
              </Link>
              <Link href="/privacy" className="button secondary portal-btn-touch">
                <span>About the Study</span>
              </Link>
            </div>
          </div>

          <div className="lab-card-right" aria-hidden="true">
            <div className="lab-visual-badge">
              <div className="lab-shield-glow">
                <Shield size={48} className="text-purple" />
              </div>
              <div className="lab-visual-text">
                <strong>12 Scenarios</strong>
                <span>4 Interactive Missions</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default JoinResearchPortal;
