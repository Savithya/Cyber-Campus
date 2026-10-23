"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Check,
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
  Award,
  Target,
  Database,
  Download,
  Copy,
  FileCheck2,
  BookOpen,
  Search,
  Filter,
  AlertOctagon,
  Lightbulb,
  FileText,
  ArrowLeft,
  ListChecks,
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
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Accordion state for the 4 mission sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    phishing: true,
    pretexting: true,
    impersonation: true,
    links: true,
  });

  // Active mission tab for simplified browsing: 'phishing' | 'pretexting' | 'impersonation' | 'links' | 'all'
  const [activeMissionTab, setActiveMissionTab] = useState<string>("phishing");

  // Filter state for reviewing answers
  const [activeFilter, setActiveFilter] = useState<"all" | "unsafe" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const s = state.session;
  const attempts = useMemo(() => s?.attempts ?? [], [s?.attempts]);
  const firstAttempts = useMemo(() => attempts.filter((a) => a.attemptNumber === 1), [attempts]);

  // Pre-calculate review statistics for filter chips (MUST be declared before early returns)
  const reviewStats = useMemo(() => {
    let safe = 0;
    let unsafe = 0;
    let skipped = 0;

    activeModules.forEach((m) => {
      m.ids.forEach((id) => {
        const sc = scenarios.find((s) => s.id === id);
        if (!sc) return;
        const attempt = firstAttempts.find((a) => a.scenarioId === sc.id);
        const debrief = debriefKeys[sc.id];
        const correctActionId = debrief?.action ?? sc.choices.find((c) => !c.unsafe && c.privacyRiskScore === 0)?.id;
        const isAnswered = Boolean(attempt && attempt.selectedAction !== null);
        const isCorrect = attempt?.correct === true || (isAnswered && attempt?.selectedAction === correctActionId);

        if (!isAnswered) skipped++;
        else if (isCorrect) safe++;
        else unsafe++;
      });
    });

    const total = safe + unsafe + skipped || 20;
    return { safe, unsafe, skipped, needsReview: unsafe + skipped, total };
  }, [activeModules, scenarios, firstAttempts, debriefKeys]);

  // Per-module statistics for mission tab cards
  const moduleStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number; unsafe: number }> = {};
    activeModules.forEach((m) => {
      const mAttempts = m.ids.map((id) => firstAttempts.find((a) => a.scenarioId === id)).filter(Boolean);
      const mCorrect = mAttempts.filter((a) => a?.correct === true).length;
      stats[m.id] = {
        correct: mCorrect,
        total: m.ids.length,
        unsafe: m.ids.length - mCorrect,
      };
    });
    return stats;
  }, [activeModules, firstAttempts]);

  if (state.loading || loadingContent) return <Loading />;
  if (state.error) {
    return (
      <div className="container page-space narrow">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  }

  if (!s || s.status === "draft") {
    return (
      <div className="container page-space narrow text-center">
        <h2>Research Session Incomplete</h2>
        <p className="mt-2 text-muted">You have not started or submitted your research session yet.</p>
        <Link href="/consent" prefetch={true} className="button primary large mt-6">
          <span>Go to Research Consent</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

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

  // Smooth scroll to a specific scenario card and briefly pulse-highlight it
  const scrollToScenario = (moduleId: string, scenarioId: string) => {
    if (activeMissionTab !== "all" && activeMissionTab !== moduleId) {
      setActiveMissionTab(moduleId);
    }
    setOpenSections((prev) => ({ ...prev, [moduleId]: true }));
    setTimeout(() => {
      const el = document.getElementById(`scenario-card-${scenarioId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("review-card-highlight");
        setTimeout(() => el.classList.remove("review-card-highlight"), 2100);
      }
    }, 150);
  };

  const handleCopyCode = () => {
    if (s?.code) {
      navigator.clipboard.writeText(s.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadReceipt = () => {
    if (!s) return;
    const accuracyPct = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;
    const text =
      `========================================================================\n` +
      `       CYBER CAMPUS RESEARCH STUDY — PARTICIPATION RECEIPT\n` +
      `========================================================================\n\n` +
      `Participant Research Code: ${s.code}\n` +
      `Submission ID:             ${s.submissionId ?? s.id}\n` +
      `Study Mode:                ${s.mode === "practice" ? "Practice Sandbox" : "Academic Research Protocol"}\n` +
      `Status:                    Session Verified & Recorded\n` +
      `Missions Evaluated:        ${completedCount} / ${totalScenariosCount}\n` +
      `Completion Rate:           ${completionPercentage}%\n` +
      `Safest Decisions:          ${correctCount} / ${completedCount || 20} (${accuracyPct}% Optimal Defenses)\n` +
      `Submission Timestamp:      ${s.submittedAt ? new Date(s.submittedAt).toISOString() : new Date().toISOString()}\n` +
      `Withdrawal Deadline:       ${s.withdrawDeadline ?? "Not applicable"}\n\n` +
      `This receipt serves as personal confirmation of your participation in the\n` +
      `academic cybersecurity research study on social engineering vulnerability\n` +
      `and privacy preservation among university students in Sri Lanka.\n\n` +
      `Thank you for contributing to academic cyber research!\n` +
      `========================================================================\n`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyber-campus-receipt-${s.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="completion-redesign-container container page-space" role="region" aria-label="Research Participation Complete">
      {/* 4-Stage Progress Stepper */}
      <ResearchProgressStepper currentStep={4} completedSteps={[1, 2, 3, 4]} />

      {/* Main Completion Confirmation Header */}
      <header className="completion-minimal-header text-center my-8">
        <div className="success-icon-animation-wrapper" aria-hidden="true">
          <div className="success-pulse-ring" />
          <div className="success-icon-circle">
            <ShieldCheck size={48} className="success-shield-icon" />
          </div>
        </div>

        <div className="completion-eyebrow-pill mt-4">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>STEP 04 OF 04 · COMPLETED &amp; RECORDED</span>
        </div>

        <h1 className="completion-redesign-title mt-3">
          Research Participation Complete
        </h1>

        <p className="completion-redesign-subtitle mt-3 max-w-2xl mx-auto">
          You have successfully completed the Cyber Campus research missions. Review your answers
          and discover the safest responses to each cybersecurity scenario below.
        </p>

        {/* Professional 4-Metric Grid */}
        <div className="completion-stats-grid mt-8" role="region" aria-label="Participation Summary Metrics">
          {/* Tile 1: Research Missions */}
          <div className="completion-stat-card card-missions">
            <div className="completion-stat-top">
              <span className="completion-stat-label">Research Missions</span>
              <div className="completion-stat-icon-wrap icon-missions">
                <Target size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="completion-stat-main">
              <div className="completion-stat-metric">
                <span className="stat-number">{completedCount}</span>
                <span className="stat-denom">/ {totalScenariosCount}</span>
              </div>
              <div className="completion-stat-progress-track">
                <div
                  className="completion-stat-progress-fill fill-missions"
                  style={{ width: `${(completedCount / totalScenariosCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="completion-stat-footer">
              <span className="completion-stat-subtext">Challenges Evaluated</span>
              <span className="stat-badge badge-blue">Complete</span>
            </div>
          </div>

          {/* Tile 2: Mission Completion */}
          <div className="completion-stat-card card-progress">
            <div className="completion-stat-top">
              <span className="completion-stat-label">Mission Completion</span>
              <div className="completion-stat-icon-wrap icon-progress">
                <Award size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="completion-stat-main">
              <div className="completion-stat-metric text-emerald">
                <span className="stat-number">{completionPercentage}%</span>
              </div>
              <div className="completion-stat-progress-track">
                <div
                  className="completion-stat-progress-fill fill-emerald"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div className="completion-stat-footer">
              <span className="completion-stat-subtext">Protocol Finished</span>
              <span className="stat-badge badge-emerald">100% Complete</span>
            </div>
          </div>

          {/* Tile 3: Safest Decisions */}
          <div className="completion-stat-card card-safest">
            <div className="completion-stat-top">
              <span className="completion-stat-label">Safest Decisions</span>
              <div className="completion-stat-icon-wrap icon-safest">
                <ShieldCheck size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="completion-stat-main">
              <div className="completion-stat-metric text-cyan">
                <span className="stat-number">{correctCount}</span>
                <span className="stat-denom">/ {completedCount || 20}</span>
              </div>
              <div className="completion-stat-progress-track">
                <div
                  className="completion-stat-progress-fill fill-cyan"
                  style={{ width: `${Math.round((correctCount / (completedCount || 20)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="completion-stat-footer">
              <span className="completion-stat-subtext">Optimal Defenses</span>
              <span className="stat-badge badge-cyan">{Math.round((correctCount / (completedCount || 20)) * 100)}% Optimal</span>
            </div>
          </div>

          {/* Tile 4: Research Status */}
          <div className="completion-stat-card card-status">
            <div className="completion-stat-top">
              <span className="completion-stat-label">Research Status</span>
              <div className="completion-stat-icon-wrap icon-status">
                <Database size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="completion-stat-main">
              <div className="completion-stat-metric text-purple">
                <span className="stat-status-text font-mono">
                  {s.mode === "practice" ? "Practice Sandbox" : "Recorded"}
                </span>
              </div>
              <div className="completion-stat-status-badge">
                <span className="live-pulse-dot" aria-hidden="true" />
                <span>Session Verified</span>
              </div>
            </div>
            <div className="completion-stat-footer">
              <span className="completion-stat-subtext font-mono">Code: {s.code}</span>
              <span className="stat-badge badge-purple">Logged</span>
            </div>
          </div>
        </div>

        {/* Academic Session Verification Banner */}
        <div className="completion-verification-banner mt-6" role="region" aria-label="Session Verification Details">
          <div className="verification-banner-inner">
            <div className="verification-code-group">
              <div className="verification-icon-box">
                <FileCheck2 size={22} className="text-primary" />
              </div>
              <div className="verification-details">
                <span className="verification-label">Participant Research Code</span>
                <div className="verification-code-display">
                  <code className="verification-code">{s.code}</code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="verification-copy-btn"
                    title="Copy Participant Code"
                    aria-label="Copy Participant Code"
                  >
                    {copiedCode ? (
                      <span className="copied-text"><Check size={13} /> Copied</span>
                    ) : (
                      <span className="copy-action"><Copy size={13} /> Copy</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="verification-meta-group">
              <div className="meta-item">
                <span className="meta-label">Submission ID</span>
                <span className="meta-value font-mono">
                  {s.submissionId ? `${s.submissionId.slice(0, 14)}...` : `${s.id.slice(0, 14)}...`}
                </span>
              </div>
              <div className="meta-divider" aria-hidden="true" />
              <div className="meta-item">
                <span className="meta-label">Session Status</span>
                <span className="meta-value text-emerald flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={13} /> Verified &amp; Recorded
                </span>
              </div>
            </div>

            <div className="verification-receipt-action">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="button secondary small"
              >
                <Download size={14} />
                <span>Save Receipt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Research Contribution Callout */}
        <div className="completion-academic-callout mt-6">
          <div className="callout-icon-wrapper">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div className="callout-content">
            <h3 className="callout-heading">Academic Cybersecurity Research Contribution</h3>
            <p className="callout-text">
              Thank you for your valuable contribution to academic cybersecurity research. Your responses help
              identify which social engineering tactics pose the greatest risks to user privacy among university
              students in Sri Lanka. All research responses are securely stored and analyzed in accordance with
              strict research ethics protocols.
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="completion-header-actions mt-8">
          <Link href="/" prefetch={true} className="button primary large flex items-center gap-2">
            <Home size={18} aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
          <Link href="/play" prefetch={true} className="button ghost large flex items-center gap-2">
            <RotateCcw size={18} aria-hidden="true" />
            <span>Practice Missions</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          SECTION B: REVIEW MY ANSWERS & DEFENSE DEBRIEF (HIGHLIGHTED)
          ========================================================================= */}
      <section className="review-my-answers-section mt-12" aria-labelledby="review-answers-heading">
        <div className="review-section-header-highlight">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="review-header-eyebrow">
                <span className="live-pulse-dot" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Educational Debrief &amp; Defense Analysis
                </span>
              </div>
              <h2 id="review-answers-heading" className="review-highlight-title text-2xl md:text-3xl font-extrabold">
                Review My Answers
              </h2>
              <p className="review-highlight-subtitle text-sm md:text-base mt-1.5 max-w-2xl">
                Examine your recorded choices alongside validated defense protocols and key warning signs.
              </p>
            </div>

            <div className="review-header-stats-pill hidden sm:flex items-center gap-4">
              <div className="text-left">
                <span className="text-xs text-muted block font-medium">Evaluated</span>
                <strong className="text-ink text-sm font-bold">{reviewStats.total} Scenarios</strong>
              </div>
              <div className="h-7 w-px bg-border" aria-hidden="true" />
              <div className="text-left">
                <span className="text-xs text-muted block font-medium">Optimal Defenses</span>
                <strong className="text-emerald text-sm font-bold">{reviewStats.safe} / {reviewStats.total}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Filter & Search Toolbar */}
        <div className="review-toolbar-card mt-6 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="review-filter-pills" role="tablist" aria-label="Filter Scenarios by Performance">
            <button
              type="button"
              className={`filter-pill-btn ${activeFilter === "all" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("all")}
              aria-selected={activeFilter === "all"}
            >
              <span>All Scenarios</span>
              <span className="filter-count-badge">{reviewStats.total}</span>
            </button>
            <button
              type="button"
              className={`filter-pill-btn filter-unsafe ${activeFilter === "unsafe" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("unsafe")}
              aria-selected={activeFilter === "unsafe"}
            >
              <span>Needs Review</span>
              <span className="filter-count-badge">{reviewStats.needsReview}</span>
            </button>
            <button
              type="button"
              className={`filter-pill-btn filter-safe ${activeFilter === "safe" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("safe")}
              aria-selected={activeFilter === "safe"}
            >
              <span>Safest Decisions</span>
              <span className="filter-count-badge">{reviewStats.safe}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="review-search-wrap relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search scenarios or threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="review-search-input w-full bg-surface"
                aria-label="Filter scenarios by text"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="search-clear-btn absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-label="Clear search query"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Easy Mission Navigation Selector Cards */}
        <div className="review-mission-selector-section mt-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Select a Mission to Review:
            </span>
            <button
              type="button"
              onClick={() => setActiveMissionTab("all")}
              className={`filter-pill-btn ${activeMissionTab === "all" ? "is-active" : ""}`}
            >
              <ListChecks size={14} aria-hidden="true" />
              <span>View All 4 Missions (20)</span>
            </button>
          </div>

          <div className="review-mission-nav-bar" role="tablist" aria-label="Select Mission to Inspect">
            {activeModules.map((m, idx) => {
              const Icon = missionIcons[m.icon] || Mail;
              const stats = moduleStats[m.id] || { correct: 0, total: 5, unsafe: 5 };
              const isActive = activeMissionTab === m.id;
              const isPerfect = stats.correct === stats.total;

              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveMissionTab(m.id);
                    setOpenSections((prev) => ({ ...prev, [m.id]: true }));
                  }}
                  className={`mission-tab-card ${isActive ? "is-active" : ""}`}
                >
                  <div className="mission-tab-card-top">
                    <div className={`mission-tab-icon-wrap ${m.color}`}>
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <span className="mission-tab-badge">Mission 0{idx + 1}</span>
                  </div>

                  <div>
                    <h3 className="mission-tab-title">{m.name}</h3>
                    <span className="text-xs text-muted block mt-0.5">{m.topic}</span>
                  </div>

                  <div className="mission-tab-footer">
                    <span className="text-xs text-muted">Safest Actions:</span>
                    <span className={`mission-tab-score-pill ${
                      isPerfect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                      stats.correct > 0 ? "bg-cyan/10 text-cyan font-bold" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}>
                      {stats.correct} / {stats.total} Safe
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Displayed Missions & Question Cards */}
        <div className="review-missions-content mt-8 space-y-8">
          {(activeMissionTab === "all" ? activeModules : activeModules.filter((m) => m.id === activeMissionTab)).map((module) => {
            const moduleIdx = activeModules.findIndex((m) => m.id === module.id);
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
            const stats = moduleStats[module.id] || { correct: moduleCorrect, total: module.ids.length, unsafe: module.ids.length - moduleCorrect };

            // Apply active filters & search to module scenarios
            const filteredModuleScenarios = moduleScenarios.filter((sc) => {
              const attempt = firstAttempts.find((a) => a.scenarioId === sc.id);
              const debrief = debriefKeys[sc.id];
              const correctActionId = debrief?.action ?? sc.choices.find((c) => !c.unsafe && c.privacyRiskScore === 0)?.id;
              const isAnswered = Boolean(attempt && attempt.selectedAction !== null);
              const isCorrect = attempt?.correct === true || (isAnswered && attempt?.selectedAction === correctActionId);

              // Filter by decision status
              if (activeFilter === "unsafe" && isCorrect) return false;
              if (activeFilter === "safe" && !isCorrect) return false;

              // Filter by search query
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = sc.title.toLowerCase().includes(q);
                const situationMatch = sc.situation.toLowerCase().includes(q);
                const idMatch = sc.id.toLowerCase().includes(q);
                const topicMatch = module.topic.toLowerCase().includes(q);
                const selectedChoice = sc.choices.find((c) => c.id === attempt?.selectedAction);
                const correctChoice = sc.choices.find((c) => c.id === correctActionId);
                const selectedMatch = selectedChoice?.label.toLowerCase().includes(q);
                const correctMatch = correctChoice?.label.toLowerCase().includes(q);
                return titleMatch || situationMatch || idMatch || topicMatch || Boolean(selectedMatch) || Boolean(correctMatch);
              }

              return true;
            });

            // Navigation indexes
            const prevModule = moduleIdx > 0 ? activeModules[moduleIdx - 1] : null;
            const nextModule = moduleIdx < activeModules.length - 1 ? activeModules[moduleIdx + 1] : null;

            return (
              <div key={module.id} className="active-mission-view">
                {/* Active Mission Header Banner (Clean & Easy to scan) */}
                <div className="active-mission-banner p-5 rounded-2xl border mb-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div className={`mission-tab-icon-wrap ${module.color}`}>
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="module-badge-tag">Mission 0{moduleIdx + 1}</span>
                          <span className="text-xs text-muted font-bold uppercase">{module.topic}</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-ink mt-0.5">{module.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Jump-to-question pills */}
                      <div className="flex items-center gap-1.5 flex-wrap" aria-label="Jump to Question">
                        <span className="text-xs text-muted font-semibold mr-1 hidden sm:inline">Jump to:</span>
                        {module.ids.map((id, qIdx) => {
                          const sc = scenarios.find((s) => s.id === id);
                          const attempt = firstAttempts.find((a) => a.scenarioId === id);
                          const debrief = debriefKeys[id];
                          const correctActionId = debrief?.action ?? sc?.choices.find((c) => !c.unsafe && c.privacyRiskScore === 0)?.id;
                          const isAnswered = Boolean(attempt && attempt.selectedAction !== null);
                          const isCorrect = attempt?.correct === true || (isAnswered && attempt?.selectedAction === correctActionId);

                          const statusClass = !isAnswered ? "chip-skipped" : isCorrect ? "chip-safe" : "chip-unsafe";
                          const statusLabel = !isAnswered ? "Skipped" : isCorrect ? "Safest Action" : "Unsafe Action";

                          return (
                            <button
                              key={id}
                              type="button"
                              className={`q-nav-chip ${statusClass}`}
                              title={`Question 0${qIdx + 1}: ${statusLabel}`}
                              onClick={() => scrollToScenario(module.id, id)}
                            >
                              <span>Q{qIdx + 1}</span>
                              {isCorrect ? (
                                <Check size={11} className="shrink-0" aria-hidden="true" />
                              ) : !isAnswered ? (
                                <HelpCircle size={11} className="shrink-0" aria-hidden="true" />
                              ) : (
                                <XCircle size={11} className="shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="module-summary-pill text-xs">
                        <span className="text-muted">Safest Actions: </span>
                        <strong className="text-primary font-semibold">{stats.correct} / {stats.total}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenarios List for this Mission */}
                {filteredModuleScenarios.length === 0 ? (
                  <div className="review-all-safe-empty-state text-center py-10 px-4 rounded-2xl border border-dashed my-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                      <CheckCircle2 size={26} aria-hidden="true" />
                    </div>
                    <h4 className="font-bold text-ink text-lg">
                      {activeFilter === "unsafe" ? `Flawless Defense in ${module.name}!` : "No Scenarios Match Filter"}
                    </h4>
                    <p className="text-sm text-muted mt-1 max-w-md mx-auto">
                      {activeFilter === "unsafe"
                        ? "All 5 scenarios in this mission were resolved with the safest defensive action. No unsafe choices to review!"
                        : searchQuery
                        ? `No scenarios in this mission match "${searchQuery}".`
                        : "No scenarios match the selected filter."}
                    </p>
                  </div>
                ) : (
                  <div className="challenges-review-list space-y-6">
                    {filteredModuleScenarios.map((sc) => {
                      const attempt = firstAttempts.find((a) => a.scenarioId === sc.id);
                      const debrief = debriefKeys[sc.id];

                      // Determine selected choice and correct choice
                      const selectedChoice = sc.choices.find((c) => c.id === attempt?.selectedAction);
                      const correctActionId = debrief?.action ?? sc.choices.find((c) => !c.unsafe && c.privacyRiskScore === 0)?.id;
                      const correctChoice = sc.choices.find((c) => c.id === correctActionId);

                      const isAnswered = Boolean(attempt && attempt.selectedAction !== null);
                      const isCorrect = attempt?.correct === true || (isAnswered && attempt?.selectedAction === correctActionId);

                      // Original question index within this mission (1 to 5)
                      const originalIndex = module.ids.indexOf(sc.id) + 1;

                      // Warning signs list
                      const warningSigns = sc.mediaDetails?.warningIndicators && sc.mediaDetails.warningIndicators.length > 0
                        ? sc.mediaDetails.warningIndicators
                        : sc.evidence.map((e) => e.label);

                      return (
                        <article
                          key={sc.id}
                          id={`scenario-card-${sc.id}`}
                          className={`review-question-card ${
                            !isAnswered ? "status-skipped" : isCorrect ? "status-correct" : "status-incorrect"
                          }`}
                          aria-labelledby={`q-title-${sc.id}`}
                        >
                          {/* Question Header */}
                          <div className="review-q-header flex items-center justify-between flex-wrap gap-2 pb-3 border-b">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="q-number-pill">Challenge 0{originalIndex} of 05</span>
                              <span className="q-id-code font-mono text-xs">#{sc.id}</span>
                              <span className="text-xs text-muted font-medium">· {module.name}</span>
                            </div>

                            {/* Status Badge */}
                            <div className="q-status-badge-wrap">
                              {!isAnswered ? (
                                <span className="q-status-badge skipped">
                                  <HelpCircle size={14} aria-hidden="true" />
                                  <span>Skipped / Unanswered</span>
                                </span>
                              ) : isCorrect ? (
                                <span className="q-status-badge safe">
                                  <CheckCircle2 size={14} aria-hidden="true" />
                                  <span>Correct · Safest Action</span>
                                </span>
                              ) : (
                                <span className="q-status-badge unsafe">
                                  <AlertOctagon size={14} aria-hidden="true" />
                                  <span>Unsafe Action Selected</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Scenario Title & Scenario Briefing */}
                          <div className="scenario-briefing-wrapper mt-3">
                            <h4 id={`q-title-${sc.id}`} className="scenario-title text-base font-bold">
                              {sc.title}
                            </h4>
                            <div className="scenario-situation-box mt-2">
                              <div className="scenario-situation-label flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1">
                                <FileText size={13} className="text-muted" aria-hidden="true" />
                                <span>Scenario Briefing</span>
                              </div>
                              <p className="scenario-situation-text text-sm leading-relaxed">
                                {sc.situation}
                              </p>
                            </div>
                          </div>

                          {/* Answer Resolution — Single Card for Safe, Comparative Grid for Unsafe */}
                          {isCorrect ? (
                            /* Single Unified Verified Safe Banner (NO DUPLICATE BOX!) */
                            <div className="review-answer-unified-safe">
                              <div className="safe-card-badge-row">
                                <div className="safe-card-badge">
                                  <CheckCircle2 size={16} className="text-emerald shrink-0" aria-hidden="true" />
                                  <span>Your Choice · Safest Defense Selected</span>
                                </div>
                                <span className="safe-card-points">+10 XP · Protected</span>
                              </div>
                              <p className="safe-card-choice-text">
                                {selectedChoice ? selectedChoice.label : "Safest defense chosen"}
                              </p>
                              <div className="safe-card-note">
                                <ShieldCheck size={14} className="text-emerald shrink-0" aria-hidden="true" />
                                <span>Optimal cybersecurity protocol followed — zero sensitive data or credentials compromised.</span>
                              </div>
                            </div>
                          ) : (
                            /* Side-by-side Comparative View for Unsafe or Skipped decisions */
                            <div className="review-answers-grid">
                              {/* Participant Selected Answer */}
                              <div className={`answer-card participant-answer ${!isAnswered ? "was-skipped" : "was-unsafe"}`}>
                                <div>
                                  <div className="answer-card-header mb-1.5">
                                    {!isAnswered ? (
                                      <>
                                        <HelpCircle size={15} className="text-muted shrink-0" aria-hidden="true" />
                                        <span className="answer-card-label text-muted">Your Action: Skipped</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle size={15} className="text-red shrink-0" aria-hidden="true" />
                                        <span className="answer-card-label text-red">Your Action: Unsafe Decision</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="answer-card-content mt-1">
                                    {selectedChoice ? selectedChoice.label : "No action was recorded for this scenario"}
                                  </p>
                                </div>
                                {attempt?.disclosedInfoCategory && attempt.disclosedInfoCategory !== "None" && (
                                  <div className="risk-exposure-tag mt-2.5">
                                    <span>⚠️ Sensitive Data Exposed: <strong>{attempt.disclosedInfoCategory}</strong></span>
                                  </div>
                                )}
                              </div>

                              {/* Correct / Safest Action */}
                              <div className="answer-card correct-answer">
                                <div>
                                  <div className="answer-card-header mb-1.5">
                                    <ShieldCheck size={15} className="text-emerald shrink-0" aria-hidden="true" />
                                    <span className="answer-card-label text-emerald">Recommended Safest Action</span>
                                  </div>
                                  <p className="answer-card-content mt-1">
                                    {correctChoice ? correctChoice.label : "Verify via official independent channels"}
                                  </p>
                                </div>
                                <div className="safe-defense-tag mt-2.5">
                                  <span>✓ Validated Institutional Defense Protocol</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Security Analysis & Defense Protocol Box */}
                          <div className="review-security-insight-box mt-3.5">
                            <div className="insight-header">
                              <div className="insight-icon-pill">
                                <Lightbulb size={15} className="text-primary shrink-0" aria-hidden="true" />
                              </div>
                              <span className="insight-title">Security Analysis &amp; Defense Protocol</span>
                            </div>
                            <p className="insight-explanation mt-2">
                              {debrief?.explanation ||
                                "Verifying directly through official institutional channels prevents credential theft and personal data exposure."}
                            </p>
                            {debrief?.consequence && (
                              <div className="insight-consequence mt-2.5">
                                <AlertTriangle size={14} className="text-amber shrink-0" aria-hidden="true" />
                                <div>
                                  <strong className="text-amber">Potential Real-World Hazard: </strong>
                                  <span>{debrief.consequence}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Threat Identified & Warning Signs Footer */}
                          <div className="review-q-footer flex items-center justify-between flex-wrap gap-3 pt-3 mt-3.5 border-t text-xs text-muted">
                            <div className="threat-tag-wrap flex items-center gap-1.5">
                              <span className="threat-category-badge">
                                <Target size={12} className="text-primary shrink-0" aria-hidden="true" />
                                <span className="text-muted font-medium">Threat Category:</span>
                                <strong className="text-ink">{module.topic}</strong>
                              </span>
                            </div>

                            {warningSigns && warningSigns.length > 0 && (
                              <div className="warning-signs-wrap flex items-center gap-1.5 flex-wrap">
                                <span className="warning-signs-heading flex items-center gap-1 font-semibold text-amber">
                                  <AlertTriangle size={13} aria-hidden="true" />
                                  <span>Warning Signs:</span>
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {warningSigns.slice(0, 4).map((sign, sIdx) => (
                                    <span key={sIdx} className="warning-chip">
                                      {sign}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Step-by-step Previous & Next Mission Buttons (when in single mission view) */}
                {activeMissionTab !== "all" && (
                  <div className="mission-review-navigation-footer flex items-center justify-between flex-wrap gap-4">
                    {prevModule ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMissionTab(prevModule.id);
                          const el = document.getElementById("review-answers-heading");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="button secondary flex items-center gap-2"
                      >
                        <ArrowLeft size={16} aria-hidden="true" />
                        <span>Previous: Mission 0{moduleIdx} ({prevModule.name})</span>
                      </button>
                    ) : <div />}

                    {nextModule ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMissionTab(nextModule.id);
                          const el = document.getElementById("review-answers-heading");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="button primary flex items-center gap-2"
                      >
                        <span>Next: Mission 0{moduleIdx + 2} ({nextModule.name})</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById("review-answers-heading");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="button primary flex items-center gap-2"
                      >
                        <span>Back to Top of Review</span>
                        <ChevronUp size={16} aria-hidden="true" />
                      </button>
                    )}
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
