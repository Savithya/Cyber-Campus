"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Radio,
  BookOpen,
  ShieldCheck,
  Link2,
  Check,
  Lock,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

export type JourneyStepKey =
  | "consent"
  | "profile"
  | "phishing"
  | "pretexting"
  | "impersonation"
  | "links"
  | "review"
  // Legacy & convenience aliases
  | "step1"
  | "step2"
  | "step3"
  | "step4"
  | "step5"
  | "step6"
  | "step7"
  | "knowledge"
  | "risk"
  | "trust"
  | "missions";

export interface JourneyStepItem {
  key: JourneyStepKey;
  stepNumber: string;
  kicker: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

export const ALL_JOURNEY_STEPS: JourneyStepItem[] = [
  {
    key: "consent",
    stepNumber: "01",
    kicker: "STEP 01",
    title: "Research Consent",
    icon: FileText,
    href: "/consent",
  },
  {
    key: "profile",
    stepNumber: "02",
    kicker: "STEP 02",
    title: "About You",
    icon: User,
    href: "/demographics",
  },
  {
    key: "phishing",
    stepNumber: "03",
    kicker: "STEP 03",
    title: "Phishing Investigation",
    icon: Radio,
    href: "/play?module=phishing",
  },
  {
    key: "pretexting",
    stepNumber: "04",
    kicker: "STEP 04",
    title: "Pretexting Detection",
    icon: BookOpen,
    href: "/play?module=pretexting",
  },
  {
    key: "impersonation",
    stepNumber: "05",
    kicker: "STEP 05",
    title: "Impersonation Investigation",
    icon: ShieldCheck,
    href: "/play?module=impersonation",
  },
  {
    key: "links",
    stepNumber: "06",
    kicker: "STEP 06",
    title: "Scam & Malicious Link Investigation",
    icon: Link2,
    href: "/play?module=links",
  },
  {
    key: "review",
    stepNumber: "07",
    kicker: "STEP 07",
    title: "Review & Save",
    icon: Check,
    href: "/survey/review",
  },
];

interface ResearchJourneyFrameProps {
  currentStep: JourneyStepKey;
  progressPercent: number;
  missionKicker: string;
  title: string;
  subtitle: string;
  noticePill?: string;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  hideProgressHeader?: boolean;
  hideActionBar?: boolean;
  children: React.ReactNode;
}

export function ResearchJourneyFrame({
  currentStep,
  progressPercent,
  missionKicker,
  title,
  subtitle,
  noticePill,
  onBack,
  backHref,
  backLabel = "Back",
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  continueLoading = false,
  hideProgressHeader = false,
  hideActionBar = false,
  children,
}: ResearchJourneyFrameProps) {
  // Normalize alias keys to canonical 7 steps so only ONE card is active
  const normalizedKey =
    currentStep === "step1"
      ? "consent"
      : currentStep === "step2"
      ? "profile"
      : currentStep === "step3"
      ? "phishing"
      : currentStep === "step4" || currentStep === "knowledge"
      ? "pretexting"
      : currentStep === "step5" || currentStep === "risk"
      ? "impersonation"
      : currentStep === "step6" || currentStep === "trust"
      ? "links"
      : currentStep === "step7"
      ? "review"
      : currentStep === "missions"
      ? "phishing"
      : currentStep;

  const activeStepIndex = Math.max(
    0,
    ALL_JOURNEY_STEPS.findIndex((s) => s.key === normalizedKey)
  );

  return (
    <div className="journey-layout-container">
      <div className="journey-layout-grid">
        {/* ===================================================================
            LEFT SIDEBAR: YOUR RESEARCH JOURNEY (7 Clear Steps)
            =================================================================== */}
        <aside className="journey-sidebar" aria-label="Research Journey Navigation">
          <div className="journey-sidebar-sticky">
            {/* Header */}
            <div className="journey-sidebar-header">
              <span className="journey-sidebar-kicker">YOUR RESEARCH JOURNEY</span>
              <h2 className="journey-sidebar-title">
                One mission at a time.
              </h2>
            </div>

            {/* Stepper Navigation List: 7 Clean Step Cards */}
            <nav className="journey-stepper-list" aria-label="7 Research Steps">
              {ALL_JOURNEY_STEPS.map((step, idx) => {
                const isActive = normalizedKey === step.key;
                const isCompleted = idx < activeStepIndex || normalizedKey === "review" || idx <= activeStepIndex;

                return (
                  <Link
                    key={step.key}
                    href={step.href}
                    prefetch={true}
                    className={`journey-step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                    title={`${step.kicker}: ${step.title}`}
                  >
                    <div className="journey-step-checkbox">
                      {isCompleted ? (
                        <Check size={13} strokeWidth={2.5} className="journey-step-check" aria-hidden="true" />
                      ) : (
                        <span className="journey-step-blank" />
                      )}
                    </div>
                    <div className="journey-step-text">
                      <span className="journey-step-kicker">{step.kicker}</span>
                      <strong className="journey-step-title">{step.title}</strong>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Encouragement Note */}
            <div className="journey-sidebar-footer">
              <Lock size={15} className="journey-lock-icon" aria-hidden="true" />
              <p className="journey-sidebar-reassurance">
                Your perspective counts. Honest answers are more valuable than a
                high score.
              </p>
            </div>
          </div>
        </aside>

        {/* ===================================================================
            RIGHT MAIN COLUMN: QUESTIONNAIRE & CARDS
            =================================================================== */}
        <main className="journey-main-content">
          {/* Progress Header */}
          {!hideProgressHeader && (
            <div className="journey-progress-header">
              <div className="journey-progress-labels">
                <span className="journey-progress-title">Questionnaire progress</span>
                <span className="journey-progress-percent">{progressPercent}%</span>
              </div>
              <div className="journey-progress-bar-track">
                <div
                  className="journey-progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>
          )}

          {/* Mission Stage Header */}
          <div className="journey-stage-header">
            <span className="journey-stage-kicker">{missionKicker}</span>
            <h1 className="journey-stage-title">{title}</h1>
            <p className="journey-stage-subtitle">{subtitle}</p>
          </div>

          {/* Optional Notice Banner */}
          {noticePill && (
            <div className="journey-notice-pill">
              <span>{noticePill}</span>
            </div>
          )}

          {/* The Question Cards / Form Body */}
          <div className="journey-body-cards">{children}</div>

          {/* Action Buttons Row */}
          {!hideActionBar && (
            <div className="journey-action-bar">
              {backHref ? (
                <Link href={backHref} prefetch={true} className="journey-back-btn">
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>{backLabel}</span>
                </Link>
              ) : onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="journey-back-btn"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>{backLabel}</span>
                </button>
              ) : (
                <div />
              )}

              {onContinue && (
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={continueDisabled || continueLoading}
                  className={`journey-continue-btn ${
                    continueDisabled ? "disabled" : ""
                  }`}
                >
                  {continueLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      <span>Processing…</span>
                    </>
                  ) : (
                    <>
                      <span>{continueLabel}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Bottom "Leave study" link */}
          <div className="journey-leave-wrapper">
            <Link href="/withdraw" prefetch={true} className="journey-leave-link">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Leave study</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
