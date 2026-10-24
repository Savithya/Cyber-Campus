"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Heart,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  Check,
  Lock,
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
import { ResearchJourneyFrame } from "./research-journey-frame";

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

  const hasSession = Boolean(state.session);
  const sessionData = state.session;
  const isResumable =
    hasSession &&
    (sessionData?.status === "draft" || sessionData?.mode === "practice");

  const studyTitle =
    config?.title ||
    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka";

  return (
    <ResearchJourneyFrame
      currentStep="consent"
      progressPercent={0}
      missionKicker="STEP 1 OF 6"
      title="A little context. Your choice to take part."
      subtitle="Read the study information, then decide whether you'd like to participate."
      noticePill="Voluntary Academic Research · University Students in Sri Lanka (18+)"
      backHref="/"
      backLabel="Home"
      onContinue={() => handleStart(false)}
      continueLabel="I Agree & Continue"
      continueDisabled={!consent || !eligible}
      continueLoading={busy}
    >
      <div className="spot-join-container">
        {/* Step Progression Bar */}
        <div className="spot-join-stepper-card">
          <ResearchProgressStepper currentStep={1} />
        </div>

        {/* Resumable draft banner matching user screenshot */}
        {isResumable && sessionData?.status === "draft" && (
          <div className="spot-draft-banner-wrap mb-6">
            <div className="spot-draft-banner" role="region" aria-label="Resume Draft">
              <div className="spot-draft-left">
                <div className="spot-draft-icon-box" aria-hidden="true">
                  <RotateCcw size={20} />
                </div>
                <div className="spot-draft-info">
                  <div className="spot-draft-title-row">
                    <span className="spot-draft-heading">Draft Session In Progress</span>
                    <span className="spot-draft-status-pill">SAVED DRAFT</span>
                  </div>
                  <p className="spot-draft-subtext">
                    Anonymous Code: <span className="spot-draft-code-tag">{sessionData?.code}</span> · Unsubmitted responses saved in browser
                  </p>
                </div>
              </div>
              <div className="spot-draft-actions">
                <Link href="/demographics" prefetch={true} className="spot-draft-btn-resume">
                  <span>Resume Participation</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  className="spot-draft-btn-discard"
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
          <div className="spot-draft-banner-wrap mb-6">
            <div className="spot-draft-banner completed-mode" role="region" aria-label="Completed Research">
              <div className="spot-draft-left">
                <div className="spot-draft-icon-box completed-icon" aria-hidden="true">
                  <CheckCircle2 size={20} />
                </div>
                <div className="spot-draft-info">
                  <div className="spot-draft-title-row">
                    <span className="spot-draft-heading">Previous Research Completed</span>
                    <span className="spot-draft-status-pill completed-pill">RECORDED</span>
                  </div>
                  <p className="spot-draft-subtext">
                    Anonymous ID: <span className="spot-draft-code-tag">{sessionData.code}</span> · Your previous answers are safely saved. You can join as a new participant with a new ID below.
                  </p>
                </div>
              </div>
              <div className="spot-draft-actions">
                <button
                  type="button"
                  className="spot-draft-btn-resume"
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
                      <ArrowRight size={15} aria-hidden="true" />
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

        {/* Editorial Page Header matching Spot the Phish template */}
        <div className="spot-join-header">
          <span className="spot-join-eyebrow">BEFORE WE BEGIN</span>
          <h1 className="spot-join-title">
            A little context.
            <br />
            Your choice to take part.
          </h1>
          <p className="spot-join-subtitle">
            Read the study information, then decide whether you&apos;d like to participate.
          </p>
        </div>

        {/* Main White Card matching Image 1 & Topic */}
        <div className="spot-join-card" id="consent-compact-card">
          {/* Card Top Eyebrow Badge */}
          <div className="spot-join-card-badge">
            <ShieldCheck size={16} className="spot-join-badge-icon" aria-hidden="true" />
            <span>RESEARCH INFORMATION</span>
          </div>

          {/* Research Topic Headline */}
          <h2 className="spot-join-card-title">
            Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka
          </h2>

          {/* Research Purpose Lead Paragraph covering IV1–IV4 and DV */}
          <p className="spot-join-card-lead">
            The purpose of this Computing Research Project is to examine the impact of social engineering threats—specifically Phishing (IV1), Pretexting (IV2), Impersonation (IV3), and Online Scams &amp; Malicious Links (IV4)—on user privacy (DV) among university students in Sri Lanka. Please answer honestly based on your own knowledge, experience, and opinions.
          </p>

          {/* 4-Item Information Grid (2 columns x 2 rows) */}
          <div className="spot-join-grid">
            {/* 1. Time estimate */}
            <div className="spot-join-grid-item">
              <div className="spot-join-item-header">
                <Clock size={19} className="spot-join-item-icon" aria-hidden="true" />
                <h3 className="spot-join-item-title">Around 12–15 minutes</h3>
              </div>
              <p className="spot-join-item-desc">
                A short student profile, followed by 20 fictional email scenarios across IV1–IV4. Take as long as you need.
              </p>
            </div>

            {/* 2. Voluntary choice */}
            <div className="spot-join-grid-item">
              <div className="spot-join-item-header">
                <Heart size={19} className="spot-join-item-icon" aria-hidden="true" />
                <h3 className="spot-join-item-title">Always your choice</h3>
              </div>
              <p className="spot-join-item-desc">
                Participation is voluntary. You can stop without giving a reason before final submission.
              </p>
            </div>

            {/* 3. Confidential research */}
            <div className="spot-join-grid-item">
              <div className="spot-join-item-header">
                <Lock size={19} className="spot-join-item-icon" aria-hidden="true" />
                <h3 className="spot-join-item-title">Confidential research</h3>
              </div>
              <p className="spot-join-item-desc">
                We do not request your name, student number, passwords, banking details, or private credentials. Responses are accessible only to authorized researchers and used for academic research.
              </p>
            </div>

            {/* 4. A controlled simulation */}
            <div className="spot-join-grid-item">
              <div className="spot-join-item-header">
                <ShieldCheck size={19} className="spot-join-item-icon" aria-hidden="true" />
                <h3 className="spot-join-item-title">A controlled simulation</h3>
              </div>
              <p className="spot-join-item-desc">
                No real phishing attacks are performed. Links and attachments are inert. Scenario decision time is recorded as an additional game metric.
              </p>
            </div>
          </div>

          {/* Mint Highlight Callout Box: How your responses are saved */}
          <div className="spot-join-saved-callout">
            <h4 className="spot-saved-title">How your responses are saved</h4>
            <p className="spot-saved-desc">
              Draft answers stay in this browser tab. At the end of the questionnaire, you explicitly save your responses before starting the game. &apos;Leave study&apos; removes a saved incomplete response. After final submission, anonymous responses cannot be withdrawn through the participant interface. Game points do not alter your questionnaire answers.
            </p>
          </div>

          {/* Consent Checkboxes */}
          <div className="spot-join-consent-block">
            {/* Student Eligibility Checkbox */}
            <label htmlFor="eligibility-checkbox" className="spot-join-checkbox-label">
              <input
                id="eligibility-checkbox"
                type="checkbox"
                checked={eligible}
                onChange={(e) => setEligible(e.target.checked)}
                className="spot-join-checkbox-input"
                aria-required="true"
              />
              <span className="spot-join-checkbox-custom" aria-hidden="true">
                {eligible && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="spot-join-checkbox-text">
                I confirm that I am <strong>18 years of age or older</strong> and currently enrolled in a higher education institution in <strong>Sri Lanka</strong>.
              </span>
            </label>

            {/* Voluntary Agreement Checkbox */}
            <label htmlFor="consent-checkbox" className="spot-join-checkbox-label">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConsent(val);
                  if (val && !eligible) {
                    setEligible(true);
                  }
                }}
                className="spot-join-checkbox-input"
                aria-required="true"
              />
              <span className="spot-join-checkbox-custom" aria-hidden="true">
                {consent && <Check size={13} strokeWidth={3} />}
              </span>
              <span className="spot-join-checkbox-text">
                I have read the information above and voluntarily agree to participate in this research study.
              </span>
            </label>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="spot-join-actions">
            <button
              type="button"
              className="spot-join-btn-agree"
              onClick={() => handleStart(false)}
              disabled={!consent || !eligible || busy}
              aria-label="I Agree & Continue · Continue to Student Profile · Consent and begin questionnaire"
              title="Agree and continue to student profile"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Starting Session…</span>
                </>
              ) : (
                <>
                  <span>I Agree &amp; Continue</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>

            <button
              type="button"
              className="spot-join-btn-disagree"
              onClick={() => router.push("/")}
              disabled={busy}
              aria-label="I Do Not Agree"
            >
              <span>I Do Not Agree</span>
            </button>
          </div>

          {/* Optional Practice Link */}
          <div className="spot-join-practice-row">
            <span>Prefer to explore without recording research data?</span>
            <button
              type="button"
              className="spot-join-practice-link"
              onClick={() => handleStart(true)}
              disabled={busy}
              aria-label="Explore Practice Challenges Only · Decline & practise only"
            >
              Explore practice challenges only →
            </button>
          </div>

          {/* Expandable Ethics & Governance Details */}
          <div className="mt-6 pt-4 border-t border-slate-200/70">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              onClick={() => setExpandedDetails(!expandedDetails)}
              aria-expanded={expandedDetails}
            >
              <span>Research Ethics, Data Privacy &amp; Participant Rights</span>
              {expandedDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedDetails && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-2">
                <p>
                  <strong>Study Protocol:</strong> &ldquo;{studyTitle}&rdquo;
                </p>
                <p>
                  <strong>Research Variables:</strong> IV1 Phishing, IV2 Pretexting, IV3 Impersonation, IV4 Online Scams &amp; Malicious Links. Dependent Variable: User Privacy Impact &amp; Protective Behaviors.
                </p>
                <p>
                  <strong>Ethics Compliance:</strong> Conducted under academic research guidelines and adheres to Sri Lanka Personal Data Protection Act No. 9 of 2022 principles of data minimization and purpose specification.
                </p>
                <p>
                  <strong>Self-Service Data Rights:</strong> A unique cryptographic session token manages your participation. You can manage or delete your data at any time via the <Link href="/withdraw" className="underline font-medium text-indigo-600">Withdrawal page</Link>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResearchJourneyFrame>
  );
}
