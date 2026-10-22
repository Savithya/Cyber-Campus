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
  Check,
  Gamepad2,
  Lock,
  Sparkles,
  Award,
  AlertCircle,
  ExternalLink,
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

      {/* Friendly Hero Banner */}
      <div className="consent-friendly-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} className="text-primary" aria-hidden="true" />
          <span>STUDENT RESEARCH BRIEFING · STEP 01 OF 04</span>
        </div>
        <h1 className="consent-friendly-title">Welcome to Cyber Campus Research</h1>
        <p className="consent-friendly-subtitle">
          Help advance digital privacy and cyber defense for Sri Lankan university students.
          Explore 20 interactive simulations in <strong>15 minutes</strong> and get an instant personal awareness report.
        </p>

        {/* 4 Quick Stat Pills */}
        <div className="consent-quick-pills">
          <div className="quick-pill">
            <Clock size={15} className="text-cyan" aria-hidden="true" />
            <span><strong>15–20 Mins</strong> · Self-paced</span>
          </div>
          <div className="quick-pill">
            <Lock size={15} className="text-primary" aria-hidden="true" />
            <span><strong>100% Anonymous</strong> · Zero passwords</span>
          </div>
          <div className="quick-pill">
            <HeartHandshake size={15} className="text-emerald" aria-hidden="true" />
            <span><strong>Voluntary</strong> · Skip or exit anytime</span>
          </div>
          <div className="quick-pill">
            <GraduationCap size={15} className="text-purple" aria-hidden="true" />
            <span><strong>Sri Lankan Undergraduates</strong> (18+)</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="consent-split-grid">
        {/* Left Column: Easy-to-Digest Experience & Protections */}
        <div className="consent-left-col">
          {/* Card 1: 3-Step Experience Journey */}
          <div className="consent-feature-card">
            <div className="feature-card-header">
              <span className="feature-icon-badge cyan">
                <Clock size={18} aria-hidden="true" />
              </span>
              <div>
                <span className="card-kicker">WHAT TO EXPECT</span>
                <h2 className="feature-card-heading">Your 15-Minute Research Journey</h2>
              </div>
            </div>

            <div className="journey-steps-v2">
              <div className="step-item-v2">
                <div className="step-num-v2">1</div>
                <div className="step-body-v2">
                  <div className="step-head-row">
                    <h3>Academic Profile</h3>
                    <span className="time-badge">~2 Mins</span>
                  </div>
                  <p>Answer 5 brief demographic questions (field of study, year, university type). No names, student IDs, or emails are ever requested.</p>
                </div>
              </div>

              <div className="step-item-v2">
                <div className="step-num-v2">2</div>
                <div className="step-body-v2">
                  <div className="step-head-row">
                    <h3>20 Interactive Threat Scenarios</h3>
                    <span className="time-badge">~11 Mins</span>
                  </div>
                  <p>Encounter simulated emails, fake portal alerts, impersonated messages, and online shopping scams. Choose what action you would take.</p>
                </div>
              </div>

              <div className="step-item-v2">
                <div className="step-num-v2">3</div>
                <div className="step-body-v2">
                  <div className="step-head-row">
                    <h3>Personal Debrief &amp; Score</h3>
                    <span className="time-badge">~2 Mins</span>
                  </div>
                  <p>Submit your decisions to receive an instant cybersecurity awareness breakdown, key risk explanations, and practical defense tips.</p>
                </div>
              </div>
            </div>

            <div className="safe-sandbox-banner">
              <CheckCircle2 size={16} className="text-emerald shrink-0" aria-hidden="true" />
              <span>
                <strong>Safe Synthetic Sandbox:</strong> All scenarios are fictional simulations. You will never be asked to enter real passwords or access real external links.
              </span>
            </div>
          </div>

          {/* Card 2: Privacy Safeguards Grid */}
          <div className="consent-feature-card">
            <div className="feature-card-header">
              <span className="feature-icon-badge emerald">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              <div>
                <span className="card-eyebrow">YOUR RIGHTS &amp; TRUST</span>
                <h2 className="feature-card-heading">Privacy &amp; Ethical Guarantees</h2>
              </div>
            </div>

            <div className="safeguards-grid-v2">
              <div className="safeguard-box">
                <div className="box-top">
                  <Lock size={16} className="text-primary" aria-hidden="true" />
                  <strong>Zero Personal Data</strong>
                </div>
                <p>No student IDs, passwords, phone numbers, or emails are ever recorded.</p>
              </div>

              <div className="safeguard-box">
                <div className="box-top">
                  <HeartHandshake size={16} className="text-emerald" aria-hidden="true" />
                  <strong>100% Voluntary</strong>
                </div>
                <p>Participation is optional. Skip any question or stop whenever you like.</p>
              </div>

              <div className="safeguard-box">
                <div className="box-top">
                  <FileCheck2 size={16} className="text-cyan" aria-hidden="true" />
                  <strong>Purely Academic</strong>
                </div>
                <p>Findings inform higher education cyber safety curricula and published research.</p>
              </div>

              <div className="safeguard-box">
                <div className="box-top">
                  <RotateCcw size={16} className="text-amber" aria-hidden="true" />
                  <strong>Self-Service Delete</strong>
                </div>
                <p>Your session generates a private receipt token to withdraw anytime.</p>
              </div>
            </div>

            {/* Expandable Ethics Protocol */}
            <div className="ethics-accordion-box">
              <button
                type="button"
                className="ethics-toggle-btn"
                onClick={() => setExpandedDetails(!expandedDetails)}
                aria-expanded={expandedDetails}
              >
                <span>{expandedDetails ? "Hide Institutional Ethics Protocol" : "View Detailed Institutional Ethics & Governance Protocol"}</span>
                {expandedDetails ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              </button>

              {expandedDetails && (
                <div className="ethics-expanded-drawer" role="region" aria-label="Detailed Research Terms">
                  <div className="drawer-topic">
                    <span className="drawer-label">ACADEMIC RESEARCH TOPIC:</span>
                    <strong className="block text-ink text-sm mt-0.5">&ldquo;{studyTitle}&rdquo;</strong>
                  </div>
                  <div className="drawer-item">
                    <h4>Ethical Research Standards</h4>
                    <p>
                      This study adheres to international ethical research principles for human participant studies.
                      Participation involves low risk, evaluating fictional scenarios depicting common digital communications.
                    </p>
                  </div>
                  <div className="drawer-item">
                    <h4>Anonymity &amp; Aggregation Thresholds</h4>
                    <p>
                      No names, emails, or phone numbers are recorded. Demographic fields are strictly aggregated in all published tables
                      to guarantee participant confidentiality.
                    </p>
                  </div>
                  <div className="drawer-item">
                    <h4>Researcher Contact</h4>
                    <p>
                      For methodological or supervisory inquiries, access the Researcher Access channel or institutional supervisory office.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Action & Quick Consent Card */}
        <aside className="consent-right-col" aria-label="Consent Confirmation">
          <div className="consent-action-card-v2">
            <div className="action-card-top-badge">
              <span className="step-chip">STEP 1 OF 4</span>
              <span className="ssl-chip">
                <ShieldCheck size={13} className="text-emerald" aria-hidden="true" />
                Secure &amp; Anonymous
              </span>
            </div>

            <h2 className="action-title-v2">Consent Confirmation</h2>
            <p className="action-subtitle-v2">
              Please confirm your eligibility and agreement below to unlock the study:
            </p>

            <div className="consent-checks-container">
              {/* Mandatory Checkbox 1: Age & University Eligibility */}
              <label
                htmlFor="eligibility-checkbox"
                className={`consent-toggle-card ${eligible ? "is-selected" : ""}`}
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
                <div className="toggle-text-block">
                  <span className="toggle-main-title">Age &amp; Student Eligibility</span>
                  <span className="toggle-sub-copy">
                    I confirm that I am <strong>18 years or older</strong> and currently enrolled at a higher education institution in <strong>Sri Lanka</strong>.
                  </span>
                </div>
              </label>

              {/* Mandatory Checkbox 2: Voluntary Agreement */}
              <label
                htmlFor="consent-checkbox"
                className={`consent-toggle-card ${consent ? "is-selected" : ""}`}
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
                <div className="toggle-text-block">
                  <span className="toggle-main-title">Voluntary Agreement</span>
                  <span className="toggle-sub-copy">
                    I have reviewed the research information and <strong>voluntarily agree to participate</strong> in this study.
                  </span>
                </div>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="button primary large consent-launch-button"
              onClick={() => handleStart(false)}
              disabled={!eligible || !consent || busy}
              aria-label="Agree & Continue · Continue to Student Profile · Consent and begin questionnaire"
            >
              <span>{busy ? "Starting Research Session…" : "Agree & Begin Study"}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>

            {(!eligible || !consent) && (
              <p className="consent-hint-v2">
                <AlertCircle size={13} className="inline mr-1 text-primary" aria-hidden="true" />
                Check both boxes above to unlock research participation.
              </p>
            )}

            <div className="action-divider-v2">
              <span>OR EXPLORE WITHOUT RECORDING</span>
            </div>

            {/* Practice Mode Alternative */}
            <button
              type="button"
              className="button secondary consent-alt-btn"
              onClick={() => handleStart(true)}
              disabled={busy}
              title="Explore scenarios in educational mode without recording research data"
            >
              <Gamepad2 size={16} aria-hidden="true" />
              <span>Explore Practice Challenges Only</span>
            </button>
            <span className="practice-subtext-v2">Purely educational simulation · no research data saved</span>

            <div className="action-footer-row">
              <Link href="/" prefetch={true} className="back-home-link">
                Return Home
              </Link>
              <span className="irb-safe-label">
                <Lock size={12} className="text-emerald inline mr-1" aria-hidden="true" />
                IRB Protocol Protected
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
