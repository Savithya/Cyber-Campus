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
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  Info,
  Check,
  Gamepad2,
  Lock,
  Layers,
  Building,
  AlertCircle,
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
  const [mode, setMode] = useState<string>("demo");
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

  const studyTitle =
    config?.title ??
    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka";

  return (
    <div className="consent-page-container container page-space">
      {/* 4-Stage Reusable Stepper */}
      <ResearchProgressStepper currentStep={1} />

      {/* Demo Mode Notice */}
      {mode === "demo" && (
        <div className="demo-mode-compact-banner" role="status">
          <Info size={16} className="text-cyan" aria-hidden="true" />
          <span>Demo Mode — Your activity will not be included in research data.</span>
        </div>
      )}

      {/* Previous Session / Completion Compact Notice */}
      {isCompleted && (
        <div className="previous-response-compact-card" role="region" aria-label="Previous Research Response">
          <div className="previous-response-left">
            <CheckCircle2 size={18} className="text-emerald" aria-hidden="true" />
            <div>
              <strong>Previous Research Participation Recorded</strong>
              <p>
                Anonymous Code: <span className="font-mono">{sessionData?.code}</span> · Status: Submitted
              </p>
            </div>
          </div>
          <div className="previous-response-actions">
            <Link href="/results" prefetch={true} className="button secondary small">
              <span>View Confirmation</span>
            </Link>
            <button
              type="button"
              className="button ghost small"
              onClick={handleDiscardDraft}
              disabled={discarding}
            >
              <span>Start New Attempt</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Page Header */}
      <header className="consent-page-header">
        <div className="eyebrow">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>STEP 01 OF 04 · INFORMED CONSENT</span>
        </div>
        <h1 className="consent-main-heading">Before You Begin</h1>
        <p className="consent-subtitle">
          Please review the study information before participating.
        </p>
      </header>

      {/* Main Central Information Panel */}
      <div className="consent-central-panel">
        {/* Section A — About This Study */}
        <section className="consent-panel-section" aria-labelledby="section-about-study">
          <div className="section-label-chip">SECTION A</div>
          <h2 id="section-about-study" className="consent-section-title">
            About This Study
          </h2>
          <div className="study-title-callout">
            <GraduationCap size={20} className="text-primary flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="study-callout-eyebrow">RESEARCH TOPIC</span>
              <h3 className="study-callout-title">{studyTitle}</h3>
            </div>
          </div>
          <p className="consent-section-desc">
            This academic study investigates which category of social engineering threats—phishing,
            pretexting, impersonation, or online link scams—has the most significant impact on user privacy
            among university students in Sri Lanka. The findings provide empirical evidence to inform
            institutional cyber safety guidelines and privacy curricula.
          </p>

          <div className="study-key-meta-grid">
            <div className="meta-item">
              <Clock size={16} className="text-cyan" aria-hidden="true" />
              <div>
                <span className="meta-label">Estimated Participation Time</span>
                <strong className="meta-value">15–20 Minutes</strong>
              </div>
            </div>
            <div className="meta-item">
              <HeartHandshake size={16} className="text-emerald" aria-hidden="true" />
              <div>
                <span className="meta-label">Participation Type</span>
                <strong className="meta-value">100% Voluntary</strong>
              </div>
            </div>
            <div className="meta-item">
              <Building size={16} className="text-primary" aria-hidden="true" />
              <div>
                <span className="meta-label">Target Participants</span>
                <strong className="meta-value">Higher Education in Sri Lanka (18+)</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Section B — What You Will Do */}
        <section className="consent-panel-section" aria-labelledby="section-what-you-do">
          <div className="section-label-chip">SECTION B</div>
          <h2 id="section-what-you-do" className="consent-section-title">
            What You Will Do
          </h2>
          <p className="consent-section-desc">
            Unlike traditional questionnaires, Cyber Campus uses structured interactive cybersecurity scenarios:
          </p>

          <div className="three-part-overview-grid">
            <div className="overview-card">
              <div className="overview-num">01</div>
              <h4>Basic Demographics</h4>
              <p>
                Provide basic academic profile details (age group, study year, field of study, university type).
              </p>
            </div>

            <div className="overview-card">
              <div className="overview-num">02</div>
              <h4>20 Interactive Scenarios</h4>
              <p>
                Interact with simulated threats (5 phishing, 5 pretexting, 5 impersonation, 5 malicious link scenarios) and choose how you would respond.
              </p>
            </div>

            <div className="overview-card">
              <div className="overview-num">03</div>
              <h4>Submit Responses</h4>
              <p>
                Submit your decisions securely for quantitative analysis and receive your completion confirmation and debrief.
              </p>
            </div>
          </div>
          <p className="overview-notice">
            <ShieldCheck size={15} className="text-emerald inline-block mr-1.5" aria-hidden="true" />
            All scenarios use safe, synthetic simulations. You will never be asked to enter real passwords or access actual external links.
          </p>
        </section>

        {/* Section C — Participation and Privacy */}
        <section className="consent-panel-section" aria-labelledby="section-privacy-info">
          <div className="section-label-chip">SECTION C</div>
          <h2 id="section-privacy-info" className="consent-section-title">
            Participation &amp; Privacy Safeguards
          </h2>

          <div className="privacy-safeguards-grid">
            <div className="safeguard-tile">
              <HeartHandshake size={20} className="text-emerald" aria-hidden="true" />
              <div>
                <strong>Voluntary Involvement</strong>
                <p>Participation is optional. You may skip questions or exit the platform at any time before final submission.</p>
              </div>
            </div>

            <div className="safeguard-tile">
              <Lock size={20} className="text-primary" aria-hidden="true" />
              <div>
                <strong>No Real Credentials Requested</strong>
                <p>We never collect student index numbers, passwords, OTPs, or bank account credentials.</p>
              </div>
            </div>

            <div className="safeguard-tile">
              <FileCheck2 size={20} className="text-cyan" aria-hidden="true" />
              <div>
                <strong>Academic Research Only</strong>
                <p>Collected responses are used exclusively for academic statistical analysis and publications.</p>
              </div>
            </div>

            <div className="safeguard-tile">
              <Layers size={20} className="text-amber" aria-hidden="true" />
              <div>
                <strong>Data Handling &amp; Withdrawal</strong>
                <p>Draft responses are stored in your local session. You may withdraw responses before the configured research deadline using your private receipt token.</p>
              </div>
            </div>
          </div>

          {/* Expandable Full Ethics & Governance Notice */}
          <div className="expandable-ethics-wrap">
            <button
              type="button"
              className="expand-ethics-btn"
              onClick={() => setExpandedDetails(!expandedDetails)}
              aria-expanded={expandedDetails}
            >
              <span>{expandedDetails ? "Hide Detailed Data Governance Terms" : "View Detailed Research & Governance Terms"}</span>
              {expandedDetails ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
            </button>

            {expandedDetails && (
              <div className="ethics-details-expanded" role="region" aria-label="Detailed Research Terms">
                <h4>Research Protocol &amp; Ethics Standards</h4>
                <p>
                  This project adheres to ethical research principles for human participant studies.
                  Participation involves low risk, evaluating fictional scenarios depicting common digital communications.
                </p>
                <h4>Storage and Anonymity Limits</h4>
                <p>
                  While no names, email addresses, or phone numbers are recorded, combinations of demographic fields
                  could theoretically reduce anonymity in small subgroups. Researchers enforce strict aggregation thresholds
                  in all published tables to protect respondent confidentiality.
                </p>
                <h4>Researcher Contact</h4>
                <p>
                  For inquiries regarding study methodology, data governance, or research rights, please use the
                  Researcher Access channel or institutional supervisory office.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section D — Consent Confirmation */}
        <section className="consent-panel-section consent-confirmation-panel" aria-labelledby="section-consent-confirm">
          <div className="section-label-chip highlight">SECTION D</div>
          <h2 id="section-consent-confirm" className="consent-section-title">
            Consent Confirmation
          </h2>
          <p className="consent-section-desc">
            To proceed to the student profile and scenarios, please confirm your eligibility and agreement:
          </p>

          <div className="consent-checkboxes-list">
            {/* Mandatory Checkbox 1 */}
            <label className={`consent-checkbox-card ${eligible ? "checked" : ""}`} htmlFor="eligibility-checkbox">
              <input
                id="eligibility-checkbox"
                type="checkbox"
                checked={eligible}
                onChange={(e) => setEligible(e.target.checked)}
                className="sr-only"
                aria-required="true"
              />
              <span className="custom-checkbox" aria-hidden="true">
                {eligible && <Check size={15} strokeWidth={3} className="text-white" />}
              </span>
              <span className="checkbox-text">
                I confirm that I am <strong>18 years or older</strong> and currently studying at a higher education institution in <strong>Sri Lanka</strong>.
              </span>
            </label>

            {/* Mandatory Checkbox 2 */}
            <label className={`consent-checkbox-card ${consent ? "checked" : ""}`} htmlFor="consent-checkbox">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="sr-only"
                aria-required="true"
              />
              <span className="custom-checkbox" aria-hidden="true">
                {consent && <Check size={15} strokeWidth={3} className="text-white" />}
              </span>
              <span className="checkbox-text">
                I have read and understood the research information and <strong>voluntarily agree to participate</strong>.
              </span>
            </label>
          </div>

          {/* Navigation Actions */}
          <div className="consent-nav-actions">
            <button
              type="button"
              className="button primary large consent-submit-btn"
              onClick={() => handleStart(false)}
              disabled={!eligible || !consent || busy}
              aria-label="Agree & Continue · Continue to Student Profile · Consent and begin questionnaire"
            >
              <span>{busy ? "Starting Research Session…" : "Agree & Continue"}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            <Link href="/" prefetch={true} className="button ghost large">
              <span>Return Home</span>
            </Link>

            <button
              type="button"
              className="button secondary small practice-alt-btn"
              onClick={() => handleStart(true)}
              disabled={busy}
              title="Explore scenarios in educational mode without recording research data"
            >
              <Gamepad2 size={16} aria-hidden="true" />
              <span>Explore Practice Challenges Only</span>
            </button>
          </div>

          {(!eligible || !consent) && (
            <p className="consent-hint-text">
              * Both confirmations above are required to unlock research participation.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
