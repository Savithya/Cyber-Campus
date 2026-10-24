"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  User,
  Radio,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  Mail,
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
  | "knowledge"
  | "risk"
  | "trust"
  | "missions"
  | "review";

export interface JourneyStepItem {
  key: JourneyStepKey;
  kicker: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

const ALL_JOURNEY_STEPS: JourneyStepItem[] = [
  {
    key: "consent",
    kicker: "STEP 1",
    title: "Research Consent",
    icon: FileText,
    href: "/consent",
  },
  {
    key: "profile",
    kicker: "MISSION 1",
    title: "About You",
    icon: User,
    href: "/demographics",
  },
  {
    key: "phishing",
    kicker: "MISSION 2",
    title: "Phishing Radar",
    icon: Radio,
    href: "/play?module=phishing",
  },
  {
    key: "knowledge",
    kicker: "MISSION 3",
    title: "Cyber Knowledge",
    icon: BookOpen,
    href: "/play?module=pretexting",
  },
  {
    key: "risk",
    kicker: "MISSION 4",
    title: "Risk Radar",
    icon: ShieldCheck,
    href: "/play?module=impersonation",
  },
  {
    key: "trust",
    kicker: "MISSION 5",
    title: "Trust Check",
    icon: Mail,
    href: "/play?module=links",
  },
  {
    key: "missions",
    kicker: "MISSION 6 - PART A",
    title: "Your Email Decisions",
    icon: ShieldAlert,
    href: "/play",
  },
  {
    key: "review",
    kicker: "BEFORE THE INBOX",
    title: "Review & save",
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
  children,
}: ResearchJourneyFrameProps) {
  return (
    <div className="journey-layout-container">
      <div className="journey-layout-grid">
        {/* ===================================================================
            LEFT SIDEBAR: YOUR RESEARCH JOURNEY (One mission at a time)
            =================================================================== */}
        <aside className="journey-sidebar" aria-label="Research Journey Navigation">
          <div className="journey-sidebar-sticky">
            {/* Header */}
            <div className="journey-sidebar-header">
              <span className="journey-sidebar-kicker">YOUR RESEARCH JOURNEY</span>
              <h2 className="journey-sidebar-title">
                One mission
                <br />
                at a time.
              </h2>
            </div>

            {/* Stepper Navigation List matching Reference Image */}
            <nav className="journey-stepper-list" aria-label="Stages">
              {ALL_JOURNEY_STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.key;

                return (
                  <Link
                    key={step.key}
                    href={step.href}
                    prefetch={true}
                    className={`journey-step-item ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="journey-step-icon-box">
                      <Icon size={16} aria-hidden="true" />
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

          {/* Mission Stage Header */}
          <div className="journey-stage-header">
            <span className="journey-stage-kicker">{missionKicker}</span>
            <h1 className="journey-stage-title">{title}</h1>
            <p className="journey-stage-subtitle">{subtitle}</p>
          </div>

          {/* Optional Notice Banner (e.g. Age Group / Token) */}
          {noticePill && (
            <div className="journey-notice-pill">
              <span>{noticePill}</span>
            </div>
          )}

          {/* The Question Cards / Form Body */}
          <div className="journey-body-cards">{children}</div>

          {/* Action Buttons Row */}
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
