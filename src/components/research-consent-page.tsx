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
  Check,
  Lock,
  AlertCircle,
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
      const lastCode = typeof window !== "undefined" ? localStorage.getItem("cc_last_participant_code") : null;
      const { session } = await api<{ session: Session }>("session/start", {
        consented: consent,
        eligible,
        priorExposure: prior,
        practice,
        token,
        clientLastCode: lastCode,
      });

      if (practice) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cc-practice-exposure", "yes");
        }
        state.setSession(session);
        await state.reload();
        router.push("/play");
      } else {
        if (typeof window !== "undefined" && session.code) {
          localStorage.setItem("cc_last_participant_code", session.code);
        }
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

  const studyTitle =
    config?.title ||
    "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka";

  return (
    <ResearchJourneyFrame
      currentStep="consent"
      progressPercent={0}
      missionKicker="STEP 01 OF 07"
      title="Research Consent"
      subtitle="A little context. Your choice to take part in academic research."
      noticePill="Voluntary Academic Research · University Students in Sri Lanka (18+)"
      backHref="/"
      backLabel="Home"
      onContinue={() => handleStart(false)}
      continueLabel="Continue to Step 02: About You"
      continueDisabled={!consent || !eligible}
      continueLoading={busy}
    >
      <div className="spot-join-container">
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
              aria-disabled={!consent || !eligible || busy}
              aria-busy={busy}
              aria-label="I Agree & Continue to Step 02: About You"
              title="Agree and continue to student profile"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Starting Session…</span>
                </>
              ) : (
                <>
                  <span>I Agree &amp; Continue to Step 02</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>

            <button
              type="button"
              className="spot-join-btn-disagree"
              onClick={() => router.push("/")}
              disabled={busy}
              aria-disabled={busy}
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
              aria-disabled={busy}
              aria-label="Explore practice challenges only"
            >
              Explore practice challenges only →
            </button>
          </div>

          {/* Expandable Ethics & Governance Details */}
          <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] py-2"
              onClick={() => setExpandedDetails(!expandedDetails)}
              aria-expanded={expandedDetails}
              aria-controls="ethics-governance-details"
            >
              <span>Research Ethics, Data Privacy &amp; Participant Rights</span>
              {expandedDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedDetails && (
              <div
                id="ethics-governance-details"
                className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/80 border border-transparent dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-2"
              >
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
