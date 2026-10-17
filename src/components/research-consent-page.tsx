"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  HeartHandshake,
  Clock,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Info,
  Check,
  Gamepad2,
  RefreshCw,
} from "lucide-react";
import {
  api,
  randomToken,
  putDraft,
  clearParticipationStorage,
  useSession,
} from "@/lib/client";
import type { StudyConfig } from "@/lib/config.server";
import type { Session } from "@/lib/types";

interface ResearchConsentPageProps {
  initialConfig?: StudyConfig | null;
}

export function ResearchConsentPage({ initialConfig }: ResearchConsentPageProps) {
  const router = useRouter();
  const state = useSession();
  const shouldReduceMotion = useReducedMotion();

  const [config, setConfig] = useState<StudyConfig | null>(initialConfig ?? null);
  const [mode, setMode] = useState<string>("demo");
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [prior, setPrior] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [mountTime] = useState(() => Date.now());

  // Accordion state
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [openSubsections, setOpenSubsections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });

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
        router.push("/demographics");
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Safe discard draft handler for returning participants
  async function handleDiscardDraft() {
    if (
      !window.confirm(
        "Are you sure you want to discard your saved draft and start fresh? All unsubmitted answers in this session will be cleared."
      )
    ) {
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

  const toggleSubsection = (idx: number) => {
    setOpenSubsections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const setAllSubsections = (open: boolean) => {
    const updated: Record<number, boolean> = {};
    for (let i = 0; i < 8; i++) {
      updated[i] = open;
    }
    setOpenSubsections(updated);
  };

  // Determine participant session state
  const hasSession = Boolean(state.session);
  const sessionData = state.session;

  const isCompleted =
    hasSession &&
    sessionData?.mode !== "practice" &&
    (sessionData?.status === "submitted_complete" ||
      sessionData?.status === "submitted_with_missing");

  const isResumable =
    hasSession &&
    !isCompleted &&
    (sessionData?.status === "draft" || sessionData?.mode === "practice");

  const isInvalidOrExpired =
    Boolean(state.error) ||
    (hasSession &&
      sessionData?.status === "draft" &&
      Date.parse(sessionData.draftExpiresAt) < mountTime);

  // Research accordion content specifications
  const accordionSections = [
    {
      title: "1. Research Purpose",
      content: (
        <>
          <p>
            <strong>Research Title:</strong>{" "}
            {config?.title ??
              "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka"}
          </p>
          <p>
            This empirical academic study investigates how social engineering threats—including
            deceptive phishing communications, spoofed campus announcements, pretexting, and
            identity impersonation—relate to user privacy and personal data protection among
            undergraduates across higher education institutions in Sri Lanka.
          </p>
          <p>
            The research aims to establish foundational empirical evidence regarding threat
            recognition, lived encounter experiences, online interaction habits, and protective
            privacy behaviours to inform educational and institutional cyber safety strategies.
          </p>
        </>
      ),
    },
    {
      title: "2. What Participation Involves",
      content: (
        <>
          <p>
            Participation involves completing a standardized academic questionnaire containing 25
            structured multiple-choice items organized into five core thematic areas:
          </p>
          <ul className="consent-accordion-list">
            <li>Threat Awareness (Q1–Q5)</li>
            <li>Encounter Experiences (Q6–Q10)</li>
            <li>Online Interaction Behaviours (Q11–Q15)</li>
            <li>Privacy Protection Practices (Q16–Q20)</li>
            <li>Perceived User Privacy Risks & Concerns (Q21–Q25)</li>
          </ul>
          <p>
            The questionnaire takes approximately 5–7 minutes to finish and is self-paced. There are
            no right or wrong answers to the survey questions—please answer honestly according to
            your genuine experience.
          </p>
          <div className="p-3 my-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs">
            <strong>Participation Policy:</strong> Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
          </div>
          <p>
            Interactive practice missions in the optional Cyber Challenge Zone are educational
            sandboxes and do not form part of the research dataset.
          </p>
        </>
      ),
    },
    {
      title: "3. Information Collected",
      content: (
        <>
          <p>The academic study records only the following research parameters:</p>
          <ul className="consent-accordion-list">
            <li>Your responses to the 25 survey questions</li>
            <li>A randomly generated anonymous participant code (e.g. 001, 002, 003...)</li>
            <li>Consent version ({config?.consentVersion ?? "1.0.0"})</li>
            <li>Completion timestamps</li>
            <li>Prior exposure to practice activities (yes/no)</li>
          </ul>
          <p>
            <strong>Zero Personal Identification:</strong> No participant name, national identity
            card (NIC) number, university index number, student email address, phone number, or
            network IP address is requested or stored.
          </p>
        </>
      ),
    },
    {
      title: "4. Confidentiality and Data Protection",
      content: (
        <>
          <p>
            All submitted research responses are strictly confidential and cryptographically
            dissociated from participant identities. Answers cannot be linked back to individual
            students or institutional records.
          </p>
          <p>
            {mode === "demo" ? (
              <>
                <strong>Demonstration Mode:</strong> Responses entered in demo mode remain strictly
                within this local browser session and are never transmitted to central research
                databases or analytical datasets.
              </>
            ) : (
              <>
                <strong>Research Mode:</strong> Responses are transmitted via TLS 1.3 encrypted
                connections and stored within a secured database protected by strict Row Level
                Security (RLS) policies.
              </>
            )}
          </p>
        </>
      ),
    },
    {
      title: "5. Who Can Access Research Data",
      content: (
        <>
          <p>
            Access to anonymized research responses is limited strictly to authorized academic
            researchers conducting this university computing study for statistical aggregation,
            peer-reviewed academic publication, and scientific dissemination.
          </p>
          <p>
            Cloud database services (Supabase) and application hosting providers process technical
            requests solely to deliver infrastructure operation and may maintain standard technical
            server logs.
          </p>
          <p>
            The platform does not employ commercial trackers, third-party analytics cookies, or
            advertising networks. Data is never monetized or shared with commercial entities.
          </p>
        </>
      ),
    },
    {
      title: "6. Data Storage and Retention",
      content: (
        <>
          <p>
            An encrypted browser session and temporary local draft support page refresh and network
            recovery while completing the questionnaire. Drafts expire after{" "}
            {config?.draftDays ?? 7} days and are cleared upon confirmed submission or explicit
            draft discard.
          </p>
          <p>
            {mode === "demo" ? (
              <>
                <strong>Retention Policy:</strong> Demonstration records stay in this browser for up
                to 7 days. No research data is collected or permanently archived.
              </>
            ) : (
              <>
                <strong>Retention Policy:</strong>{" "}
                {config?.retention ??
                  "Responses are securely retained in an encrypted repository for academic analysis, peer-reviewed publication, and research reproducibility."}
              </>
            )}
          </p>
        </>
      ),
    },
    {
      title: "7. Voluntary Participation and Withdrawal",
      content: (
        <>
          <p>
            Participation is 100% voluntary. You are free to skip optional questions using the
            designated skip control, take breaks, or exit the study at any time without penalty or
            academic disadvantage.
          </p>
          <p>
            <strong>Right to Withdraw:</strong> Upon confirmed questionnaire submission, you will
            receive your unique anonymous participant code (e.g. 001, 002, 003...) and a private deletion token. You may use
            this token on our withdrawal portal (
            <Link href="/withdraw" className="text-link inline">
              /withdraw
            </Link>
            ) within {config?.withdrawalDays ?? 7} days of consent to permanently delete your
            submitted response from the research database.
          </p>
        </>
      ),
    },
    {
      title: "8. Researcher Contact Information",
      content: (
        <>
          <p>
            <strong>Study Coordinator:</strong>{" "}
            {config?.contact ?? "Study Coordinator · Cyber Campus Research Initiative"}
          </p>
          <p>
            If you have questions regarding the research objectives, participant rights, or ethical
            procedures, or wish to exercise your withdrawal rights, please contact the study
            coordinator or visit the withdrawal portal.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="rcp-page">
      {/* Background Cyber Grid */}
      <div className="rcp-ambient-layer" aria-hidden="true">
        <div className="rcp-grid-pattern" />
        <div className="rcp-glow-orb rcp-orb-top" />
        <div className="rcp-glow-orb rcp-orb-bottom" />
      </div>

      <main id="main-content" className="rcp-container">
        {/* =========================================================================
            STATE BANNERS: Active Draft, Completed, Expired, or Server Error
            ========================================================================= */}
        {error && (
          <div className="rcp-banner rcp-banner-error" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <div className="rcp-banner-text">
              <strong>Notice:</strong> {error}
            </div>
            <button
              type="button"
              className="button secondary small"
              onClick={() => {
                setError("");
                state.reload();
              }}
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {isResumable && (
          <div className="rcp-banner rcp-banner-info" role="status">
            <BookOpen size={18} className="text-primary" aria-hidden="true" />
            <div className="rcp-banner-text">
              <strong>Saved Session Detected:</strong> You have an active questionnaire draft in this
              browser (Participant Code: <code className="font-mono">{sessionData?.code}</code>).
            </div>
            <div className="rcp-banner-actions">
              <Link
                href={
                  sessionData?.status === "draft"
                    ? "/survey"
                    : sessionData?.mode === "practice"
                    ? "/play"
                    : "/survey/complete"
                }
                className="button primary small"
              >
                <span>Continue Draft</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="button secondary small"
                onClick={handleDiscardDraft}
                disabled={discarding}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>{discarding ? "Discarding…" : "Discard Draft"}</span>
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="rcp-banner rcp-banner-success" role="status">
            <CheckCircle2 size={18} className="text-teal" aria-hidden="true" />
            <div className="rcp-banner-text">
              <strong>Previous Response Recorded:</strong> Participant Code: <code className="font-mono">{sessionData?.code}</code>.
              <p className="mt-1 text-xs opacity-90">
                Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
              </p>
            </div>
            <div className="rcp-banner-actions">
              <Link href="/survey/complete" className="button secondary small">
                <span>View Confirmation</span>
                <FileCheck2 size={14} aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="button primary small"
                onClick={() => {
                  const elem = document.getElementById("eligibility-checkbox");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>Submit Another Response</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {isInvalidOrExpired && !error && (
          <div className="rcp-banner rcp-banner-warning" role="alert">
            <AlertTriangle size={18} className="text-amber" aria-hidden="true" />
            <div className="rcp-banner-text">
              <strong>Session Expired:</strong> Your previous temporary draft has expired or could not
              be verified. You can start fresh with a new anonymous participant session.
            </div>
            <button type="button" className="button secondary small" onClick={handleResetSession}>
              <RotateCcw size={14} aria-hidden="true" />
              <span>Start Fresh</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            SECTION 01 : PAGE HEADER
            ========================================================================= */}
        <header className="rcp-header">
          {/* Progress Indicator */}
          <div className="rcp-progress-tracker" aria-label="Study progress: Step 2 of 4">
            <div className="rcp-progress-steps">
              <span className="rcp-step-dot completed" title="Step 1: Study Overview">
                1
              </span>
              <span className="rcp-step-line active" />
              <span className="rcp-step-dot active" title="Step 2: Consent & Eligibility">
                2
              </span>
              <span className="rcp-step-line" />
              <span className="rcp-step-dot" title="Step 3: Questionnaire">
                3
              </span>
              <span className="rcp-step-line" />
              <span className="rcp-step-dot" title="Step 4: Submission Confirmation">
                4
              </span>
            </div>
            <span className="rcp-step-badge">STEP 02 OF 04</span>
          </div>

          <h1 className="rcp-title">Research Information &amp; Consent</h1>
          <p className="rcp-subtitle">
            Please review the study information and confirm your participation.
          </p>

          {/* Demonstration Mode Notice (Section 7) */}
          {mode === "demo" && (
            <div className="rcp-demo-notice" role="status">
              <Info size={15} aria-hidden="true" />
              <span>Demonstration Mode : Responses are not submitted as research data.</span>
            </div>
          )}
        </header>

        {/* =========================================================================
            SECTION 02 : ABOUT THIS RESEARCH
            ========================================================================= */}
        <section className="rcp-section" aria-labelledby="section-about-title">
          <div className="rcp-card rcp-about-card">
            <div className="rcp-card-header">
              <span className="rcp-card-label">ACADEMIC STUDY</span>
              <h2 id="section-about-title" className="rcp-about-heading">
                About This Research
              </h2>
            </div>

            <div className="rcp-study-title-box">
              <GraduationCap size={18} className="rcp-accent-icon" aria-hidden="true" />
              <h3 className="rcp-study-full-title">
                {config?.title ??
                  "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka"}
              </h3>
            </div>

            <p className="rcp-about-desc">
              This academic study explores university students&apos; awareness and experiences of social
              engineering threats, their online behaviours, privacy protection practices and concerns
              about personal information.
            </p>

            <div className="rcp-indicators-grid" aria-label="Research Parameters">
              <div className="rcp-indicator-item">
                <Clock size={16} className="text-cyan" aria-hidden="true" />
                <div className="rcp-indicator-copy">
                  <span className="rcp-indicator-label">Questionnaire Duration</span>
                  <strong className="rcp-indicator-value">Approximately 5–7 minutes</strong>
                </div>
              </div>

              <div className="rcp-indicator-item">
                <HeartHandshake size={16} className="text-primary" aria-hidden="true" />
                <div className="rcp-indicator-copy">
                  <span className="rcp-indicator-label">Participation</span>
                  <strong className="rcp-indicator-value">Voluntary</strong>
                </div>
              </div>

              <div className="rcp-indicator-item">
                <GraduationCap size={16} className="text-teal" aria-hidden="true" />
                <div className="rcp-indicator-copy">
                  <span className="rcp-indicator-label">Research Type</span>
                  <strong className="rcp-indicator-value">Academic Study</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 03 : PARTICIPATION & PRIVACY INFORMATION
            ========================================================================= */}
        <section className="rcp-section" aria-label="Participation and Privacy Summary">
          <div className="rcp-tiles-grid">
            {/* Tile 1: Voluntary Participation */}
            <article className="rcp-tile">
              <div className="rcp-tile-icon-box lavender-glow">
                <HeartHandshake size={22} className="text-primary" aria-hidden="true" />
              </div>
              <div className="rcp-tile-content">
                <h3 className="rcp-tile-title">Voluntary Participation</h3>
                <p className="rcp-tile-desc">
                  Participation is optional. You may skip optional questions or stop at any time.
                </p>
              </div>
            </article>

            {/* Tile 2: Privacy Protection */}
            <article className="rcp-tile">
              <div className="rcp-tile-icon-box teal-glow">
                <ShieldCheck size={22} className="text-teal" aria-hidden="true" />
              </div>
              <div className="rcp-tile-content">
                <h3 className="rcp-tile-title">Privacy Protection</h3>
                <p className="rcp-tile-desc">
                  No participant name, contact details or student ID is requested.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* =========================================================================
            SECTION 04 : STUDY INFORMATION & PARTICIPANT RIGHTS
            ========================================================================= */}
        <section className="rcp-section" aria-labelledby="accordion-toggle-btn">
          <div className="rcp-accordion-card">
            {/* Accordion Master Trigger */}
            <button
              id="accordion-toggle-btn"
              type="button"
              className={`rcp-accordion-trigger ${accordionOpen ? "open" : ""}`}
              onClick={() => setAccordionOpen(!accordionOpen)}
              aria-expanded={accordionOpen}
              aria-controls="study-info-accordion-panel"
            >
              <div className="rcp-accordion-title-col">
                <BookOpen size={20} className="text-primary" aria-hidden="true" />
                <span className="rcp-accordion-heading-text">
                  Read Study Information &amp; Privacy Details
                </span>
              </div>
              <div className="rcp-accordion-trigger-meta">
                <span className="rcp-accordion-badge">8 Sections</span>
                <ChevronDown
                  size={18}
                  className={`rcp-chevron-icon ${accordionOpen ? "rotate" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>

            {/* Accordion Expandable Panel */}
            <AnimatePresence initial={false}>
              {accordionOpen && (
                <motion.div
                  id="study-info-accordion-panel"
                  className="rcp-accordion-panel"
                  role="region"
                  aria-labelledby="accordion-toggle-btn"
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, height: "auto" }
                  }
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, height: 0 }
                  }
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="rcp-accordion-panel-inner">
                    <div className="rcp-accordion-controls">
                      <span className="rcp-controls-note">
                        Please review each topic before consenting.
                      </span>
                      <div className="rcp-controls-btns">
                        <button
                          type="button"
                          className="rcp-link-btn"
                          onClick={() => setAllSubsections(true)}
                        >
                          Expand All
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          className="rcp-link-btn"
                          onClick={() => setAllSubsections(false)}
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    <div className="rcp-subsections-stack">
                      {accordionSections.map((sec, idx) => {
                        const isOpen = openSubsections[idx] ?? true;
                        const subId = `study-subsection-${idx}`;
                        return (
                          <div key={idx} className="rcp-subsection-item">
                            <button
                              type="button"
                              className="rcp-subsection-header"
                              onClick={() => toggleSubsection(idx)}
                              aria-expanded={isOpen}
                              aria-controls={subId}
                            >
                              <span className="rcp-subsection-title">{sec.title}</span>
                              <ChevronDown
                                size={15}
                                className={`rcp-subchevron ${isOpen ? "rotate" : ""}`}
                                aria-hidden="true"
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  id={subId}
                                  className="rcp-subsection-body"
                                  initial={
                                    shouldReduceMotion
                                      ? { opacity: 1 }
                                      : { opacity: 0, height: 0 }
                                  }
                                  animate={
                                    shouldReduceMotion
                                      ? { opacity: 1 }
                                      : { opacity: 1, height: "auto" }
                                  }
                                  exit={
                                    shouldReduceMotion
                                      ? { opacity: 0 }
                                      : { opacity: 0, height: 0 }
                                  }
                                  transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                                  {sec.content}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* =========================================================================
            SECTION 05 : ELIGIBILITY & INFORMED CONSENT
            ========================================================================= */}
        <section className="rcp-section" aria-labelledby="section-consent-title">
          <div className="rcp-card rcp-consent-card">
            <div className="rcp-card-header">
              <span className="rcp-card-label">PARTICIPANT AGREEMENT</span>
              <h2 id="section-consent-title" className="rcp-consent-heading">
                Before You Begin
              </h2>
              <p className="rcp-consent-subtitle">
                Confirm your eligibility and voluntary agreement.
              </p>
            </div>

            <div className="rcp-checkboxes-group" role="group" aria-label="Eligibility and Consent">
              {/* Checkbox 1 : Eligibility */}
              <label
                htmlFor="eligibility-checkbox"
                className={`rcp-checkbox-row ${eligible ? "checked" : ""}`}
              >
                <div className="rcp-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="eligibility-checkbox"
                    checked={eligible}
                    onChange={(e) => setEligible(e.target.checked)}
                    className="rcp-native-checkbox"
                  />
                  <span className="rcp-custom-checkbox" aria-hidden="true">
                    {eligible && <Check size={13} strokeWidth={3} className="text-white" />}
                  </span>
                </div>
                <span className="rcp-checkbox-label">
                  I am 18 or older and currently study at a Sri Lankan higher education institution.
                </span>
              </label>

              {/* Checkbox 2 : Informed Consent */}
              <label
                htmlFor="consent-checkbox"
                className={`rcp-checkbox-row ${consent ? "checked" : ""}`}
              >
                <div className="rcp-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="consent-checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="rcp-native-checkbox"
                  />
                  <span className="rcp-custom-checkbox" aria-hidden="true">
                    {consent && <Check size={13} strokeWidth={3} className="text-white" />}
                  </span>
                </div>
                <span className="rcp-checkbox-label">
                  I have read the study information and voluntarily consent to participate.
                </span>
              </label>
            </div>

            {/* =========================================================================
                SECTION 06 : PREVIOUS PRACTICE EXPOSURE
                ========================================================================= */}
            <div className="rcp-prior-exposure-section">
              <fieldset className="rcp-practice-fieldset">
                <legend className="rcp-practice-legend">
                  Have you completed the practice activities before?
                </legend>
                <p className="rcp-practice-hint">
                  Optional participation history. Does not affect your eligibility or consent.
                </p>

                <div
                  className="rcp-radio-group"
                  role="radiogroup"
                  aria-label="Have you completed the practice activities before?"
                >
                  <label className={`rcp-radio-option ${prior === true ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="practice-exposure"
                      value="yes"
                      checked={prior === true}
                      onChange={() => setPrior(true)}
                      className="rcp-native-radio"
                    />
                    <span className="rcp-custom-radio" aria-hidden="true">
                      {prior === true && <span className="rcp-radio-inner-dot" />}
                    </span>
                    <span className="rcp-radio-label-text">Yes</span>
                  </label>

                  <label className={`rcp-radio-option ${prior === false ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="practice-exposure"
                      value="no"
                      checked={prior === false}
                      onChange={() => setPrior(false)}
                      className="rcp-native-radio"
                    />
                    <span className="rcp-custom-radio" aria-hidden="true">
                      {prior === false && <span className="rcp-radio-inner-dot" />}
                    </span>
                    <span className="rcp-radio-label-text">No</span>
                  </label>
                </div>
              </fieldset>

              {/* Hidden backwards-compatibility checkbox for end-to-end testing */}
              <input
                type="checkbox"
                id="prior-exposure-checkbox"
                name="prior-exposure-checkbox"
                checked={prior}
                onChange={(e) => setPrior(e.target.checked)}
                className="sr-only"
                aria-label="I have previously played these practice activities."
                tabIndex={-1}
                readOnly
              />
            </div>

            {/* =========================================================================
                SECTION 07 — CONTINUE BUTTON
                ========================================================================= */}
            <div className="rcp-action-section">
              <div className="p-3.5 mb-4 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-teal shrink-0" aria-hidden="true" />
                <span>
                  Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
                </span>
              </div>

              <button
                type="button"
                className="button primary large w-full rcp-continue-btn"
                disabled={
                  !eligible ||
                  !consent ||
                  busy ||
                  !config ||
                  (mode === "research" && !config.collectionOpen)
                }
                onClick={() => handleStart(false)}
                aria-label={
                  isCompleted
                    ? "Start New Research Mission (Consent and begin student profile)"
                    : "Continue to Student Profile (Consent and begin student profile)"
                }
              >
                <span>
                  {busy
                    ? "Starting…"
                    : isCompleted
                    ? "Start New Research Mission"
                    : "Continue to Student Profile"}
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>

              {isCompleted && (
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
                  <span>
                    Previous response recorded:{" "}
                    <code className="font-mono text-teal-400">{sessionData?.code}</code>
                  </span>
                  <Link href="/survey/complete" className="text-teal-400 hover:underline">
                    View Confirmation →
                  </Link>
                </div>
              )}

              <div className="rcp-voluntary-note">
                <span>Your participation is voluntary.</span>
              </div>

              {mode === "research" && config && !config.collectionOpen && (
                <p className="rcp-collection-closed-notice">
                  Research collection is currently closed by the study coordinator.
                </p>
              )}
            </div>
          </div>

          {/* Respectful Practice-Only Exit Option */}
          <div className="rcp-decline-strip">
            <div className="rcp-decline-copy">
              <span>Prefer not to participate in the research study?</span>
            </div>
            <button
              type="button"
              className="button secondary small rcp-decline-btn"
              disabled={busy}
              onClick={() => handleStart(true)}
            >
              <Gamepad2 size={15} aria-hidden="true" />
              <span>Decline &amp; practise only</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ResearchConsentPage;
