"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Home,
  RotateCcw,
  Sparkles,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  ChevronsUpDown,
} from "lucide-react";
import { api, useSession, clearDraft } from "@/lib/client";
import { missions, getActiveMissions } from "@/content/missions";
import type { Scenario, Attempt, AnswerKey, Session } from "@/lib/types";
import { ResearchProgressStepper } from "./research-progress-stepper";
import { Loading, ErrorBox } from "./ui";

const missionIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};

export function ResearchCompletion() {
  const state = useSession();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [debriefKeys, setDebriefKeys] = useState<Record<string, AnswerKey>>({});
  const [loadingContent, setLoadingContent] = useState<boolean>(true);

  // Accordion state for the 4 mission sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    phishing: true,
    pretexting: true,
    impersonation: true,
    links: true,
  });

  // Clear unneeded draft tokens
  useEffect(() => {
    if (state.session && state.session.status !== "draft") {
      clearDraft();
    }
  }, [state.session]);

  // Load scenarios and debrief answer keys
  useEffect(() => {
    if (!state.session) return;
    Promise.all([
      api<{ scenarios: Scenario[] }>("scenarios").catch(() => ({ scenarios: [] })),
      api<{ debrief: Record<string, AnswerKey> }>("debrief").catch(() => ({ debrief: {} })),
    ])
      .then(([scRes, dbRes]) => {
        setScenarios(scRes.scenarios || []);
        setDebriefKeys(dbRes.debrief || {});
      })
      .finally(() => {
        setLoadingContent(false);
      });
  }, [state.session]);

  const activeModules = useMemo(() => getActiveMissions(false), []);

  if (state.loading || loadingContent) return <Loading />;
  if (state.error) {
    return (
      <div className="container page-space narrow">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  }

  const s = state.session;
  if (!s || s.status === "draft") {
    return (
      <div className="container page-space narrow text-center">
        <h2>Research Session Incomplete</h2>
        <p className="mt-2 text-muted">You have not started or submitted your research session yet.</p>
        <Link href="/consent" className="button primary large mt-6">
          <span>Go to Research Consent</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const attempts = s.attempts ?? [];
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);
  const completedCount = firstAttempts.length;
  const totalScenariosCount = 20;
  const completionPercentage = Math.min(100, Math.round((completedCount / totalScenariosCount) * 100));

  // Count correct decisions across all 20 challenges
  const correctCount = firstAttempts.filter((a) => a.correct === true).length;

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    activeModules.forEach((m) => {
      allOpen[m.id] = true;
    });
    setOpenSections(allOpen);
  };

  const handleCollapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    activeModules.forEach((m) => {
      allClosed[m.id] = false;
    });
    setOpenSections(allClosed);
  };

  const allAreOpen = activeModules.every((m) => !!openSections[m.id]);

  return (
    <div className="completion-redesign-container container page-space" role="region" aria-label="Research Participation Complete">
      {/* 4-Stage Progress Stepper */}
      <ResearchProgressStepper currentStep={4} />

      {/* Main Completion Confirmation Header */}
      <header className="completion-minimal-header text-center my-8">
        <div className="success-icon-animation-wrapper" aria-hidden="true">
          <div className="success-pulse-ring" />
          <div className="success-icon-circle">
            <ShieldCheck size={52} className="success-shield-icon" />
          </div>
        </div>

        <div className="eyebrow mt-4">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>STEP 04 OF 04 · COMPLETED &amp; RECORDED</span>
        </div>

        <h1 className="completion-redesign-title mt-2">
          Research Participation Completed
        </h1>

        <p className="completion-redesign-subtitle mt-3 max-w-2xl mx-auto">
          You have successfully completed the Cyber Campus research missions. Review your answers
          and discover the safest responses to each cybersecurity scenario.
        </p>

        {/* Minimal Metrics Bar */}
        <div className="completion-kpi-bar mt-8" role="region" aria-label="Participation Summary Metrics">
          <div className="kpi-metric-block">
            <span className="kpi-metric-label">Research Missions</span>
            <strong className="kpi-metric-value text-primary">
              {completedCount} / {totalScenariosCount}
            </strong>
            <span className="kpi-metric-subtext">Challenges Evaluated</span>
          </div>

          <div className="kpi-divider" aria-hidden="true" />

          <div className="kpi-metric-block">
            <span className="kpi-metric-label">Mission Completion</span>
            <strong className="kpi-metric-value text-emerald">
              {completionPercentage}%
            </strong>
            <span className="kpi-metric-subtext">Complete</span>
          </div>

          <div className="kpi-divider" aria-hidden="true" />

          <div className="kpi-metric-block">
            <span className="kpi-metric-label">Safest Decisions</span>
            <strong className="kpi-metric-value text-cyan">
              {correctCount} / {completedCount || 20}
            </strong>
            <span className="kpi-metric-subtext">Optimal Defenses</span>
          </div>

          <div className="kpi-divider" aria-hidden="true" />

          <div className="kpi-metric-block">
            <span className="kpi-metric-label">Research Status</span>
            <strong className="kpi-metric-value text-purple font-mono">
              {s.mode === "practice" ? "Practice Sandbox" : "Recorded"}
            </strong>
            <span className="kpi-metric-subtext">Session Verified</span>
          </div>
        </div>

        {/* Simple encouraging message */}
        <div className="completion-encouraging-message mt-6 p-4 rounded-xl max-w-2xl mx-auto">
          <p className="text-sm leading-relaxed text-muted">
            Thank you for your valuable contribution to academic cybersecurity research. Your responses
            help identify which social engineering tactics pose the greatest risks to user privacy
            among university students in Sri Lanka.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="completion-header-actions mt-6 flex items-center justify-center gap-3">
          <Link href="/" className="button primary">
            <Home size={17} aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
          <Link href="/play" className="button secondary">
            <RotateCcw size={17} aria-hidden="true" />
            <span>Practice Missions</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          SECTION B: REVIEW MY ANSWERS
          ========================================================================= */}
      <section className="review-my-answers-section mt-12" aria-labelledby="review-answers-heading">
        <div className="review-section-header flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div>
            <h2 id="review-answers-heading" className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={22} className="text-cyan" aria-hidden="true" />
              <span>Review My Answers</span>
            </h2>
            <p className="text-muted text-sm mt-1">
              Examine your recorded choices alongside the validated safe responses and key warning signs.
            </p>
          </div>

          {/* Expand All / Collapse All Controls */}
          <div className="review-controls">
            <button
              type="button"
              className="button ghost small text-cyan flex items-center gap-1.5"
              onClick={allAreOpen ? handleCollapseAll : handleExpandAll}
              aria-label={allAreOpen ? "Collapse All Mission Sections" : "Expand All Mission Sections"}
            >
              <ChevronsUpDown size={15} aria-hidden="true" />
              <span>{allAreOpen ? "Collapse All Sections" : "Expand All Sections"}</span>
            </button>
          </div>
        </div>

        {/* Four Expandable Review Sections */}
        <div className="review-mission-accordions mt-6 space-y-6">
          {activeModules.map((module, moduleIdx) => {
            const isOpen = !!openSections[module.id];
            const Icon = missionIcons[module.icon] || Mail;

            // Get scenarios for this module in deterministic order
            const moduleScenarios = module.ids
              .map((id) => scenarios.find((s) => s.id === id))
              .filter((s): s is Scenario => Boolean(s));

            // Module completion stats
            const moduleAttempts = module.ids
              .map((id) => firstAttempts.find((a) => a.scenarioId === id))
              .filter(Boolean);
            const moduleCorrect = moduleAttempts.filter((a) => a?.correct === true).length;

            return (
              <div
                key={module.id}
                className={`review-accordion-card card ${isOpen ? "is-expanded" : "is-collapsed"}`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  className="review-accordion-header w-full text-left"
                  onClick={() => toggleSection(module.id)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${module.id}`}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`mission-icon-box ${module.color}`}>
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="module-badge-tag">{module.iv}</span>
                          <span className="module-number-label">Mission 0{moduleIdx + 1}</span>
                        </div>
                        <h3 className="module-review-title text-lg font-bold mt-0.5">
                          {module.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="module-summary-pill text-xs">
                        <span className="text-muted">Safest Actions: </span>
                        <strong className="text-primary font-semibold">{moduleCorrect} / {module.ids.length}</strong>
                      </div>
                      <div className="accordion-chevron-icon" aria-hidden="true">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div
                    id={`panel-${module.id}`}
                    className="review-accordion-panel pt-4 pb-2"
                    role="region"
                    aria-label={`${module.name} Answers`}
                  >
                    <div className="challenges-review-list space-y-6">
                      {moduleScenarios.map((sc, qIndex) => {
                        const attempt = firstAttempts.find((a) => a.scenarioId === sc.id);
                        const debrief = debriefKeys[sc.id];

                        // Determine selected choice and correct choice
                        const selectedChoice = sc.choices.find((c) => c.id === attempt?.selectedAction);
                        const correctActionId = debrief?.action ?? sc.choices.find((c) => !c.unsafe && c.privacyRiskScore === 0)?.id;
                        const correctChoice = sc.choices.find((c) => c.id === correctActionId);

                        const isAnswered = Boolean(attempt && attempt.selectedAction !== null);
                        const isCorrect = attempt?.correct === true || (isAnswered && attempt?.selectedAction === correctActionId);

                        // Warning signs list
                        const warningSigns = sc.mediaDetails?.warningIndicators && sc.mediaDetails.warningIndicators.length > 0
                          ? sc.mediaDetails.warningIndicators
                          : sc.evidence.map((e) => e.label);

                        return (
                          <article
                            key={sc.id}
                            className={`review-question-card ${
                              !isAnswered ? "status-skipped" : isCorrect ? "status-correct" : "status-incorrect"
                            }`}
                            aria-labelledby={`q-title-${sc.id}`}
                          >
                            {/* Question Header */}
                            <div className="review-q-header flex items-center justify-between flex-wrap gap-2 pb-3 border-b">
                              <div className="flex items-center gap-2">
                                <span className="q-number-pill">Question 0{qIndex + 1} of 05</span>
                                <span className="q-id-code font-mono text-xs text-muted">[{sc.id}]</span>
                              </div>

                              {/* Correct / Incorrect Status Badge */}
                              <div className="q-status-badge-wrap">
                                {!isAnswered ? (
                                  <span className="q-status-badge skipped">
                                    <HelpCircle size={15} aria-hidden="true" />
                                    <span>Skipped / Unanswered</span>
                                  </span>
                                ) : isCorrect ? (
                                  <span className="q-status-badge correct">
                                    <CheckCircle2 size={15} aria-hidden="true" />
                                    <span>Correct · Safest Action</span>
                                  </span>
                                ) : (
                                  <span className="q-status-badge incorrect">
                                    <XCircle size={15} aria-hidden="true" />
                                    <span>Unsafe Action Selected</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Mission Title & Scenario */}
                            <div className="review-q-body mt-3 space-y-3">
                              <div>
                                <h4 id={`q-title-${sc.id}`} className="text-base font-semibold">
                                  {sc.title}
                                </h4>
                                <p className="review-scenario-text mt-1 text-sm leading-relaxed text-muted">
                                  &ldquo;{sc.situation}&rdquo;
                                </p>
                              </div>

                              {/* Answer Comparison Grid */}
                              <div className="review-answers-grid grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                {/* Participant Selected Answer */}
                                <div className={`answer-card participant-answer ${isCorrect ? "was-safe" : "was-unsafe"}`}>
                                  <span className="answer-card-label">Your Answer:</span>
                                  <p className="answer-card-content mt-1 text-sm font-medium">
                                    {selectedChoice ? selectedChoice.label : "No answer recorded"}
                                  </p>
                                </div>

                                {/* Correct / Safest Action */}
                                <div className="answer-card correct-answer">
                                  <span className="answer-card-label text-emerald">Correct Answer / Safest Action:</span>
                                  <p className="answer-card-content mt-1 text-sm font-medium">
                                    {correctChoice ? correctChoice.label : "Verify via official independent channels"}
                                  </p>
                                </div>
                              </div>

                              {/* Explanation Box */}
                              <div className="review-explanation-box mt-3 p-3 rounded-lg">
                                <span className="explanation-title text-xs font-semibold uppercase tracking-wider block">
                                  Why This Action is Safest:
                                </span>
                                <p className="explanation-body mt-1 text-xs leading-relaxed">
                                  {debrief?.explanation ||
                                    "Verifying directly through official institutional channels prevents credential theft and personal data exposure."}
                                </p>
                              </div>

                              {/* Threat Identified & Warning Signs Footer */}
                              <div className="review-q-footer flex items-center justify-between flex-wrap gap-3 pt-2 text-xs text-muted">
                                <div className="threat-tag-wrap flex items-center gap-1.5">
                                  <span className="font-semibold text-muted">Threat Identified:</span>
                                  <span className="text-primary font-medium">{module.topic} ({module.iv})</span>
                                </div>

                                {warningSigns && warningSigns.length > 0 && (
                                  <div className="warning-signs-wrap flex items-center gap-1.5 flex-wrap">
                                    <AlertTriangle size={13} className="text-amber" aria-hidden="true" />
                                    <span className="font-semibold">Warning Signs:</span>
                                    <span className="text-muted">{warningSigns.slice(0, 3).join(" · ")}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
