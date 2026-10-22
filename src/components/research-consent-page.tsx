"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  HeartHandshake,
  Clock,
  GraduationCap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Check,
  Gamepad2,
  Lock,
  Layers,
  AlertCircle,
  Sparkles,
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
import { ResearchProgressStepper } from "./research-progress-stepper";

interface ResearchConsentPageProps {
  initialConfig?: StudyConfig | null;
}

export function ResearchConsentPage({ initialConfig }: ResearchConsentPageProps) {
  const router = useRouter();
  const state = useSession();

  const [config, setConfig] = useState<StudyConfig | null>(initialConfig ?? null);
  const [, setMode] = useState<string>("demo");
  const [eligible, setEligible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [prior, setPrior] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  // Load config & check practice exposure flag
  useEffect(() => {
    router.prefetch("/demographics");
    router.prefetch("/play");

    api<{ config: StudyConfig; mode: string }>("config")
      .then((d) => {
        setConfig(d.config);
        setMode(d.mode);
      })
      .catch((e) => setError(e.message));

    if (typeof window !== "undefined") {
      setPrior(localStorage.getItem("cc-practice-exposure") === "yes");
    }
  }, [router]);

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
        await state.reload();
        router.push("/play");
      } else {
        clearParticipationStorage();
        putDraft({
          code: session.code,
          expires: session.draftExpiresAt,
          answers: session.answers,
          token,
          submitKey: crypto.randomUUID(),
        });
        await state.reload();
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

  const hasSession = Boolean(state.session);
  const sessionData = state.session;
  const isResumable =
    hasSession &&
    (sessionData?.status === "draft" || sessionData?.mode === "practice");

  const studyTitle =
    config?.title ??
    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka";

  return (
    <div className="consent-page-container container page-space">
      {/* 4-Stage Reusable Stepper */}
      <ResearchProgressStepper currentStep={1} />

      {/* Resumable draft banner if user already started */}
      {isResumable && sessionData?.status === "draft" && (
        <div className="previous-response-compact-card resumable" role="region" aria-label="Resume Draft">
          <div className="previous-response-left">
            <RotateCcw size={18} className="text-primary" aria-hidden="true" />
            <div>
              <strong>Draft Session In Progress</strong>
              <p>
                Anonymous Code: <span className="font-mono">{sessionData?.code}</span> · Unsubmitted responses saved
              </p>
            </div>
          </div>
          <div className="previous-response-actions">
            <Link href="/demographics" prefetch={true} className="button primary small">
              <span>Resume Participation</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="button ghost small text-red"
              onClick={handleDiscardDraft}
              disabled={discarding}
            >
              <span>Discard Draft</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner mb-6" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Hero Header */}
      <header className="consent-page-header">
        <div className="consent-hero-badge">
          <Sparkles size={14} className="text-primary" aria-hidden="true" />
          <span>STEP 01 OF 04 · INFORMED CONSENT &amp; BRIEFING</span>
        </div>
        <h1 className="consent-main-heading">Before You Begin</h1>
        <p className="consent-subtitle">
          Explore real-world social engineering scenarios, test your privacy reflexes, and contribute to national academic cyber safety research in Sri Lanka.
        </p>

        {/* Quick Highlights Strip */}
        <div className="consent-stats-strip">
          <div className="strip-item">
            <div className="strip-icon-circle cyan">
              <Clock size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="strip-title">15–20 Mins</strong>
              <span className="strip-desc">Self-paced completion</span>
            </div>
          </div>

          <div className="strip-item">
            <div className="strip-icon-circle emerald">
              <HeartHandshake size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="strip-title">100% Voluntary</strong>
              <span className="strip-desc">Skip or exit anytime</span>
            </div>
          </div>

          <div className="strip-item">
            <div className="strip-icon-circle primary">
              <Lock size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="strip-title">Zero Credentials</strong>
              <span className="strip-desc">No passwords or OTPs</span>
            </div>
          </div>

          <div className="strip-item">
            <div className="strip-icon-circle purple">
              <GraduationCap size={16} aria-hidden="true" />
            </div>
            <div>
              <strong className="strip-title">University Students</strong>
              <span className="strip-desc">Sri Lanka Higher Ed (18+)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Modern 2-Column Workspace Grid */}
      <div className="consent-split-grid">
        {/* Left Column: Context, Journey & Ethical Safeguards */}
        <div className="consent-left-col">
          {/* Card 1: Study Background */}
          <section className="consent-card" aria-labelledby="heading-study-topic">
            <div className="card-header-row">
              <div className="card-icon-bubble primary">
                <BookOpen size={18} aria-hidden="true" />
              </div>
              <div>
                <span className="card-eyebrow">RESEARCH OBJECTIVE</span>
                <h2 id="heading-study-topic" className="card-heading">
                  About This Study
                </h2>
              </div>
            </div>

            <div className="study-topic-highlight-box">
              <span className="topic-tag">ACADEMIC RESEARCH TOPIC</span>
              <p className="study-topic-title">&ldquo;{studyTitle}&rdquo;</p>
            </div>

            <p className="card-body-text">
              This academic research investigates how university students across Sri Lanka recognize and respond to four key social engineering threat vectors: <strong>phishing</strong>, <strong>pretexting</strong>, <strong>impersonation</strong>, and <strong>deceptive online links</strong>. Your responses help build evidence-based privacy training and institutional cyber defense guidelines.
            </p>
          </section>

          {/* Card 2: Interactive Journey */}
          <section className="consent-card" aria-labelledby="heading-study-journey">
            <div className="card-header-row">
              <div className="card-icon-bubble cyan">
                <Layers size={18} aria-hidden="true" />
              </div>
              <div>
                <span className="card-eyebrow">WHAT YOU WILL DO</span>
                <h2 id="heading-study-journey" className="card-heading">
                  Your Research Experience
                </h2>
              </div>
            </div>

            <div className="journey-steps-timeline">
              <div className="journey-step-item">
                <div className="journey-step-badge">1</div>
                <div className="journey-step-content">
                  <div className="step-title-row">
                    <h3>Academic Profile</h3>
                    <span className="time-pill">~2 Mins</span>
                  </div>
                  <p>Answer 5 quick demographic questions (field of study, academic year, university type). No names or student IDs are ever requested.</p>
                </div>
              </div>

              <div className="journey-step-item">
                <div className="journey-step-badge">2</div>
                <div className="journey-step-content">
                  <div className="step-title-row">
                    <h3>20 Interactive Scenarios</h3>
                    <span className="time-pill">~12 Mins</span>
                  </div>
                  <p>Evaluate realistic digital scenarios (suspicious university emails, fake dean&apos;s audits, spoofed union messages, discount scams) and choose your response.</p>
                </div>
              </div>

              <div className="journey-step-item">
                <div className="journey-step-badge">3</div>
                <div className="journey-step-content">
                  <div className="step-title-row">
                    <h3>Instant Debrief &amp; Insights</h3>
                    <span className="time-pill">~2 Mins</span>
                  </div>
                  <p>Submit your decisions securely and immediately receive educational cybersecurity debrief insights and your simulated privacy risk score.</p>
                </div>
              </div>
            </div>

            <div className="safe-simulation-callout">
              <CheckCircle2 size={18} className="text-emerald flex-shrink-0" aria-hidden="true" />
              <p>
                <strong>Safe Synthetic Simulation:</strong> All scenarios operate inside a secure, fictional sandbox. You will never be asked to input real passwords, banking OTPs, or access live malicious websites.
              </p>
            </div>
          </section>

          {/* Card 3: Privacy & Safeguards */}
          <section className="consent-card" aria-labelledby="heading-trust-safeguards">
            <div className="card-header-row">
              <div className="card-icon-bubble emerald">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
              <div>
                <span className="card-eyebrow">ETHICAL RESEARCH STANDARDS</span>
                <h2 id="heading-trust-safeguards" className="card-heading">
                  Privacy &amp; Participant Safeguards
                </h2>
              </div>
            </div>

            <div className="safeguards-compact-grid">
              <div className="safeguard-mini-card">
                <HeartHandshake size={18} className="text-emerald shrink-0" aria-hidden="true" />
                <div>
                  <strong>Voluntary Participation</strong>
                  <p>Participation is optional. Skip questions or close the browser anytime before final submission.</p>
                </div>
              </div>

              <div className="safeguard-mini-card">
                <Lock size={18} className="text-primary shrink-0" aria-hidden="true" />
                <div>
                  <strong>No Real Credentials</strong>
                  <p>We never collect index numbers, passwords, OTPs, or financial account details.</p>
                </div>
              </div>

              <div className="safeguard-mini-card">
                <FileCheck2 size={18} className="text-cyan shrink-0" aria-hidden="true" />
                <div>
                  <strong>Academic Research Only</strong>
                  <p>Responses are analysed exclusively for peer-reviewed academic research and university policy.</p>
                </div>
              </div>

              <div className="safeguard-mini-card">
                <RotateCcw size={18} className="text-amber shrink-0" aria-hidden="true" />
                <div>
                  <strong>Private Receipt &amp; Withdrawal</strong>
                  <p>Your session generates a private receipt token allowing you to withdraw your record anytime.</p>
                </div>
              </div>
            </div>

            {/* Expandable Ethics Accordion */}
            <div className="ethics-accordion-wrapper">
              <button
                type="button"
                className="ethics-toggle-button"
                onClick={() => setExpandedDetails(!expandedDetails)}
                aria-expanded={expandedDetails}
              >
                <span>{expandedDetails ? "Hide Institutional Ethics Protocol" : "View Detailed Institutional Ethics & Governance Protocol"}</span>
                {expandedDetails ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              </button>

              {expandedDetails && (
                <div className="ethics-content-drawer" role="region" aria-label="Detailed Research Terms">
                  <div className="drawer-item">
                    <h4>Research Protocol &amp; Ethics Standards</h4>
                    <p>
                      This project adheres to ethical research principles for human participant studies.
                      Participation involves low risk, evaluating fictional scenarios depicting common digital communications.
                    </p>
                  </div>
                  <div className="drawer-item">
                    <h4>Storage and Anonymity Limits</h4>
                    <p>
                      While no names, email addresses, or phone numbers are recorded, combinations of demographic fields
                      could theoretically reduce anonymity in small subgroups. Researchers enforce strict aggregation thresholds
                      in all published tables to protect respondent confidentiality.
                    </p>
                  </div>
                  <div className="drawer-item">
                    <h4>Researcher Contact</h4>
                    <p>
                      For inquiries regarding study methodology, data governance, or research rights, please use the
                      Researcher Access channel or institutional supervisory office.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Action & Consent Card */}
        <aside className="consent-right-col" aria-label="Consent and Study Launch">
          <div className="consent-action-sticky-card">
            <div className="action-card-header">
              <div className="action-card-header-top">
                <span className="badge-required">STEP 1 OF 4</span>
                <span className="secure-badge">
                  <ShieldCheck size={13} className="text-emerald" aria-hidden="true" />
                  SSL Encrypted
                </span>
              </div>
              <h2 className="action-card-title">Consent Confirmation</h2>
              <p className="action-card-desc">
                Confirm your student eligibility and voluntary agreement below to begin:
              </p>
            </div>

            <div className="consent-interactive-checks">
              {/* Mandatory Checkbox 1: Eligibility */}
              <label
                htmlFor="eligibility-checkbox"
                className={`consent-check-item ${eligible ? "is-checked" : ""}`}
              >
                <input
                  id="eligibility-checkbox"
                  type="checkbox"
                  checked={eligible}
                  onChange={(e) => setEligible(e.target.checked)}
                  className="sr-only"
                  aria-required="true"
                />
                <span className="custom-check-box" aria-hidden="true">
                  {eligible && <Check size={14} strokeWidth={3} className="text-white" />}
                </span>
                <div className="check-label-body">
                  <strong className="check-item-title">Age &amp; Student Eligibility</strong>
                  <span className="check-item-sub">
                    I confirm that I am <strong>18 years or older</strong> and currently enrolled at a higher education institution in <strong>Sri Lanka</strong>.
                  </span>
                </div>
              </label>

              {/* Mandatory Checkbox 2: Consent */}
              <label
                htmlFor="consent-checkbox"
                className={`consent-check-item ${consent ? "is-checked" : ""}`}
              >
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="sr-only"
                  aria-required="true"
                />
                <span className="custom-check-box" aria-hidden="true">
                  {consent && <Check size={14} strokeWidth={3} className="text-white" />}
                </span>
                <div className="check-label-body">
                  <strong className="check-item-title">Voluntary Consent</strong>
                  <span className="check-item-sub">
                    I have read the research information and <strong>voluntarily agree to participate</strong> in this study.
                  </span>
                </div>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="button primary large consent-cta-button"
              onClick={() => handleStart(false)}
              disabled={!eligible || !consent || busy}
              aria-label="Agree & Continue · Continue to Student Profile · Consent and begin questionnaire"
            >
              <span>{busy ? "Starting Research Session…" : "Agree & Continue"}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            {(!eligible || !consent) && (
              <p className="consent-unlock-hint">
                <AlertCircle size={13} className="inline mr-1 text-primary" aria-hidden="true" />
                Check both items above to unlock research participation.
              </p>
            )}

            <div className="action-card-divider">
              <span>OR TRY WITHOUT RESEARCH DATA</span>
            </div>

            {/* Practice Mode Alternative */}
            <button
              type="button"
              className="button secondary consent-practice-btn"
              onClick={() => handleStart(true)}
              disabled={busy}
              title="Explore scenarios in educational mode without recording research data"
            >
              <Gamepad2 size={16} aria-hidden="true" />
              <span>Explore Practice Challenges Only</span>
            </button>
            <span className="practice-subtext">Purely educational simulation · no research data recorded</span>

            <div className="action-card-footer">
              <Link href="/" prefetch={true} className="return-home-link">
                Return Home
              </Link>
              <span className="trust-footer-tag">
                <Lock size={12} className="text-emerald inline mr-1" aria-hidden="true" />
                Anonymous IRB Protocol
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
