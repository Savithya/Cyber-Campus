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
  Check,
  Gamepad2,
  Lock,
  Sparkles,
  AlertCircle,
  Trash2,
  Loader2,
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
        state.setSession(session);
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
        state.setSession(session);
        await state.reload();
        router.push("/demographics");
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Safe discard draft handler for returning participants: generates new Anonymous ID
  async function handleDiscardDraft() {
    if (
      !window.confirm(
        "Are you sure you want to discard your saved draft and start fresh? A new Anonymous ID will be assigned."
      )
    ) {
      return;
    }
    setDiscarding(true);
    setError("");
    try {
      clearParticipationStorage();
      const res = await api<{ session: Session }>("session/new-participant", {});
      if (res.session) {
        state.setSession(res.session);
        putDraft({
          code: res.session.code,
          expires: res.session.draftExpiresAt,
          answers: res.session.answers,
          token: randomToken(),
          submitKey: crypto.randomUUID(),
        });
        await state.reload();
        router.push("/demographics");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDiscarding(false);
    }
  }

  // Start fresh research session as a new participant from completed notice
  async function handleJoinNewParticipant() {
    setBusy(true);
    setError("");
    try {
      clearParticipationStorage();
      const token = randomToken();
      const res = await api<{ session: Session; token?: string }>("session/new-participant", {
        token,
      });
      if (res?.session) {
        state.setSession(res.session);
        putDraft({
          code: res.session.code,
          expires: res.session.draftExpiresAt,
          answers: res.session.answers,
          token: res.token || token,
          submitKey: crypto.randomUUID(),
        });
        await state.reload();
        router.push("/demographics");
      } else {
        throw new Error("Unable to create a new participant session. Please retry.");
      }
    } catch (e) {
      setError((e as Error).message || "Failed to start new participant session. Please retry.");
      setBusy(false);
    }
  }

  // Safe reset returning participant session to review consent briefing
  async function handleResetSessionToConsent() {
    setDiscarding(true);
    setError("");
    try {
      clearParticipationStorage();
      await api("session/clear", {}).catch(() => api("session/discard", {}));
      state.setSession(null);
      await state.reload();
      setTimeout(() => {
        const el = document.getElementById("consent-compact-card") || document.querySelector(".consent-compact-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
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
        <div className="draft-session-banner-wrapper">
          <div className="draft-session-banner" role="region" aria-label="Resume Draft">
            <div className="draft-session-left">
              <div className="draft-icon-box" aria-hidden="true">
                <RotateCcw size={20} />
              </div>
              <div className="draft-info-content">
                <div className="draft-title-row">
                  <span className="draft-title-text">Draft Session In Progress</span>
                  <span className="draft-status-pill">Saved Draft</span>
                </div>
                <p className="draft-meta-text">
                  Anonymous Code: <span className="draft-id-tag">{sessionData?.code}</span> · Unsubmitted responses saved in browser
                </p>
              </div>
            </div>
            <div className="draft-session-actions">
              <Link href="/demographics" prefetch={true} className="btn-resume-primary">
                <span>Resume Participation</span>
                <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="btn-discard-secondary"
                onClick={handleDiscardDraft}
                disabled={discarding}
                title="Discard this draft and start over with a new Anonymous ID"
              >
                {discarding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    <span>Discarding...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} aria-hidden="true" />
                    <span>Discard Draft (Start New ID)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed research notice */}
      {hasSession &&
        (sessionData?.status === "submitted_complete" ||
          sessionData?.status === "submitted_with_missing") && (
        <div className="draft-session-banner-wrapper">
          <div className="draft-session-banner completed-mode" role="region" aria-label="Completed Research">
            <div className="draft-session-left">
              <div className="draft-icon-box completed-icon" aria-hidden="true">
                <CheckCircle2 size={20} />
              </div>
              <div className="draft-info-content">
                <div className="draft-title-row">
                  <span className="draft-title-text">Previous Research Completed</span>
                  <span className="draft-status-pill completed-pill">Recorded</span>
                </div>
                <p className="draft-meta-text">
                  Anonymous ID: <span className="draft-id-tag">{sessionData.code}</span> · Your previous answers are safely saved. You can join as a new participant with a new ID below.
                </p>
              </div>
            </div>
            <div className="draft-session-actions">
              <button
                type="button"
                className="btn-join-fresh-primary"
                onClick={handleJoinNewParticipant}
                disabled={busy || discarding}
                aria-label="Join as New Participant"
              >
                {busy ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    <span>Starting New Session...</span>
                  </>
                ) : (
                  <>
                    <span>Join as New Participant</span>
                    <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner mb-6" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Modern, Compact & User-Friendly Briefing Card */}
      <div className="consent-compact-wrapper">
        <div className="consent-compact-card" id="consent-compact-card">
          {/* Card Header */}
          <div className="consent-compact-header">
            <div className="hero-pill-badge mb-2">
              <Sparkles size={13} className="text-primary" aria-hidden="true" />
              <span>STUDENT RESEARCH BRIEFING · STEP 01 OF 04</span>
            </div>
            <h1 className="consent-compact-title">Before You Begin</h1>
            <p className="consent-compact-subtitle">
              Welcome! Please review the study briefing below and confirm your eligibility to participate in the Cyber Campus research study on social engineering awareness.
            </p>
          </div>

          {/* 4 Glanceable Stat Highlights */}
          <div className="consent-glance-grid">
            <div className="glance-item">
              <div className="glance-icon-box cyan">
                <Clock size={16} aria-hidden="true" />
              </div>
              <div className="glance-text">
                <strong>15–20 Mins</strong>
                <span>Self-paced · 20 missions</span>
              </div>
            </div>

            <div className="glance-item">
              <div className="glance-icon-box primary">
                <Lock size={16} aria-hidden="true" />
              </div>
              <div className="glance-text">
                <strong>100% Anonymous</strong>
                <span>No IDs or personal data</span>
              </div>
            </div>

            <div className="glance-item">
              <div className="glance-icon-box emerald">
                <ShieldCheck size={16} aria-hidden="true" />
              </div>
              <div className="glance-text">
                <strong>Safe Sandbox</strong>
                <span>Zero real passwords</span>
              </div>
            </div>

            <div className="glance-item">
              <div className="glance-icon-box purple">
                <GraduationCap size={16} aria-hidden="true" />
              </div>
              <div className="glance-text">
                <strong>Sri Lankan Students</strong>
                <span>Age 18+ university enrolled</span>
              </div>
            </div>
          </div>

          {/* Crisp 3-Step Walkthrough */}
          <div className="consent-quick-steps">
            <div className="quick-step-card">
              <span className="step-badge-mini">1</span>
              <div>
                <strong>Student Profile</strong>
                <p>5 quick non-identifying academic background questions</p>
              </div>
            </div>
            <div className="quick-step-card">
              <span className="step-badge-mini">2</span>
              <div>
                <strong>20 Cyber Missions</strong>
                <p>Simulated phishing, pretexting &amp; scam scenarios in an inert sandbox</p>
              </div>
            </div>
            <div className="quick-step-card">
              <span className="step-badge-mini">3</span>
              <div>
                <strong>Immediate Debrief</strong>
                <p>Instant educational safety feedback &amp; protective best practices</p>
              </div>
            </div>
          </div>

          {/* Collapsible Research Ethics & Governance Accordion */}
          <div className="consent-ethics-accordion">
            <button
              type="button"
              className="consent-ethics-toggle"
              onClick={() => setExpandedDetails(!expandedDetails)}
              aria-expanded={expandedDetails}
            >
              <div className="flex items-center gap-2">
                <HeartHandshake size={16} className="text-primary shrink-0" aria-hidden="true" />
                <span className="font-semibold text-xs sm:text-sm text-ink">
                  Research Ethics, Data Privacy &amp; Participant Rights
                </span>
              </div>
              <span className="ethics-accordion-status">
                {expandedDetails ? "Hide Protocol" : "View Protocol"}
                {expandedDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>

            {expandedDetails && (
              <div className="consent-ethics-body" role="region" aria-label="Detailed Research Terms">
                <div className="ethics-study-title-pill">
                  <span className="label">RESEARCH STUDY:</span>
                  <span className="val">&ldquo;{studyTitle}&rdquo;</span>
                </div>
                <div className="ethics-points-grid">
                  <div className="ethics-point-item">
                    <CheckCircle2 size={15} className="text-emerald shrink-0 mt-0.5" />
                    <div>
                      <strong>Voluntary Participation</strong>
                      <p>Participation is entirely voluntary. You may pause your session, skip scenarios, or withdraw completely at any point prior to final submission without any academic, institutional, or personal consequence.</p>
                    </div>
                  </div>
                  <div className="ethics-point-item">
                    <CheckCircle2 size={15} className="text-cyan shrink-0 mt-0.5" />
                    <div>
                      <strong>Privacy Act Compliance</strong>
                      <p>Conducted under academic research ethics standards and adheres to Sri Lanka Personal Data Protection Act No. 9 of 2022 principles of data minimization and purpose specification.</p>
                    </div>
                  </div>
                  <div className="ethics-point-item">
                    <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong>Anonymous Token &amp; Self-Service Withdrawal</strong>
                      <p>An isolated random token governs your session. You can use this token anytime to review or permanently delete your unsubmitted or submitted data via the <Link href="/withdraw" className="underline font-semibold hover:text-primary">Withdrawal page</Link>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consent Checkboxes & Action Section */}
          <div className="consent-decision-box" id="consent-decision-box">
            <div className="consent-decision-header">
              <span className="step-chip">STEP 1 OF 4</span>
              <span className="ssl-chip">
                <ShieldCheck size={13} className="text-emerald" aria-hidden="true" />
                Secure &amp; Anonymous Consent
              </span>
            </div>

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
                    I have read and reviewed the research information and <strong>voluntarily agree to participate</strong> in this study.
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
              aria-label="Decline & practise only · Explore Practice Challenges Only"
              title="Explore scenarios in educational mode without recording research data"
            >
              <Gamepad2 size={16} aria-hidden="true" />
              <span>Explore Practice Challenges Only</span>
            </button>
            <span className="practice-subtext-v2">Purely educational simulation · no research data saved</span>

            <div className="action-footer-row">
              <Link href="/" prefetch={true} className="back-home-link">
                ← Return Home
              </Link>
              <span className="irb-safe-label">
                <Lock size={12} className="text-emerald inline mr-1" aria-hidden="true" />
                IRB Protocol Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
