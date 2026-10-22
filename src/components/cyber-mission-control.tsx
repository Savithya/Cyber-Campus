"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Gamepad2,
  ChevronRight,
  Layers,
  Check,
  RotateCcw,
  AlertCircle,
  Play,
  FileCheck2,
  Inbox,
  UserCheck,
  Globe,
  Trophy,
  Award,
} from "lucide-react";
import { api, useSession, randomToken } from "@/lib/client";
import { missions, getActiveMissions } from "@/content/missions";
import { getOperativeRank } from "@/lib/scoring";
import type { Scenario, Session, Attempt } from "@/lib/types";
import { InteractiveChallengeRunner } from "./interactive-challenge-runner";
import { ResearchProgressStepper } from "./research-progress-stepper";
import { GlobalResearchProgressTracker } from "./global-research-progress-tracker";
import { Loading, ErrorBox } from "./ui";

const missionIcons: Record<string, typeof Mail> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};

interface CyberMissionControlProps {
  initialMissionId?: string;
}

let cachedScenarios: Scenario[] | null = null;

export function CyberMissionControl({ initialMissionId }: CyberMissionControlProps = {}) {
  const router = useRouter();
  const state = useSession();

  const [scenarios, setScenarios] = useState<Scenario[]>(() => cachedScenarios ?? []);
  const [loadingScenarios, setLoadingScenarios] = useState<boolean>(() => !cachedScenarios);
  const [error, setError] = useState<string>("");
  const [startingPractice, setStartingPractice] = useState<boolean>(false);

  // Active Challenge Runner State
  const [activeMissionId, setActiveMissionId] = useState<string | null>(initialMissionId ?? null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);

  const session = state.session;
  const isAuthorized = !!session && (session.status !== "draft" || session.mode === "practice");

  // Scroll to top on challenge change or view switch
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeMissionId, activeScenarioIndex]);

  const fetchScenarios = useCallback(async () => {
    if (cachedScenarios && cachedScenarios.length > 0) {
      setScenarios(cachedScenarios);
      setLoadingScenarios(false);
      return;
    }
    setLoadingScenarios(true);
    setError("");
    try {
      const data = await api<{ scenarios: Scenario[] }>("scenarios");
      cachedScenarios = data.scenarios || [];
      setScenarios(cachedScenarios);
    } catch (err) {
      setError((err as Error).message || "Failed to load cyber missions.");
    } finally {
      setLoadingScenarios(false);
    }
  }, []);

  useEffect(() => {
    if (state.loading) return;
    if (isAuthorized) {
      void fetchScenarios();
    } else {
      setLoadingScenarios(false);
    }
  }, [state.loading, isAuthorized, fetchScenarios]);

  useEffect(() => {
    if (initialMissionId && scenarios.length > 0 && activeMissionId === initialMissionId && session) {
      const currentMission = missions.find((m) => m.id === initialMissionId);
      if (currentMission) {
        const mScenarios = scenarios.filter((s) => currentMission.ids.includes(s.id));
        const firstUncompleted = mScenarios.findIndex(
          (sc) => !session.attempts.some((a) => a.scenarioId === sc.id && a.attemptNumber === 1),
        );
        if (firstUncompleted > 0) {
          setActiveScenarioIndex(firstUncompleted);
        }
      }
    }
  }, [initialMissionId, scenarios, activeMissionId, session]);

  const handleLaunchPractice = async () => {
    setStartingPractice(true);
    setError("");
    try {
      const token = randomToken();
      const res = await api<{ session: Session }>("session/start", {
        consented: false,
        eligible: false,
        priorExposure: false,
        practice: true,
        token,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("cc-practice-exposure", "yes");
      }
      state.setSession(res.session);
      setLoadingScenarios(true);
      const scRes = await api<{ scenarios: Scenario[] }>("scenarios");
      cachedScenarios = scRes.scenarios || [];
      setScenarios(cachedScenarios);
    } catch (e) {
      setError((e as Error).message || "Failed to launch practice mode.");
    } finally {
      setStartingPractice(false);
      setLoadingScenarios(false);
    }
  };

  if (state.loading || (isAuthorized && loadingScenarios)) {
    return <Loading />;
  }

  // Case 1: Participant without consent
  if (!session) {
    return (
      <div className="cyber-access-page container page-space">
        <ResearchProgressStepper currentStep={1} />

        <div className="cyber-access-card" role="region" aria-label="Access Prerequisite">
          <div className="eyebrow">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>RESEARCH PREREQUISITE REQUIRED · SRI LANKA</span>
          </div>

          <div className="cyber-access-icon-wrap cyan">
            <ShieldAlert size={32} aria-hidden="true" />
          </div>

          <h2>Research Consent Required</h2>
          <p className="cyber-access-desc">
            Participation in the Cyber Campus research study requires informed consent and an
            anonymous participant token. Please review the study details and confirm your voluntary
            consent to begin, or explore the cybersecurity challenges immediately in practice mode.
          </p>

          <div className="cyber-access-actions">
            <Link href="/consent" prefetch={true} className="button primary large">
              <span>Begin Research Consent</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="button secondary large"
              onClick={handleLaunchPractice}
              disabled={startingPractice}
            >
              <Gamepad2 size={18} aria-hidden="true" />
              <span>{startingPractice ? "Launching Practice…" : "Explore Practice Challenges"}</span>
            </button>

            <Link href="/" prefetch={true} className="button ghost">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Consented, but Demographic Profile is in draft (unsubmitted)
  if (session.mode !== "practice" && session.status === "draft") {
    return (
      <div className="cyber-access-page container page-space">
        <ResearchProgressStepper currentStep={2} />

        <div className="cyber-access-card" role="region" aria-label="Demographic Profile Incomplete">
          <div className="eyebrow">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>STEP 02 OF 04 REQUIRED · SRI LANKA</span>
          </div>

          <div className="cyber-access-icon-wrap purple">
            <UserRoundSearch size={32} aria-hidden="true" />
          </div>

          <h2>Complete Your Student Profile</h2>
          <p className="cyber-access-desc">
            Your demographic profile has not been submitted yet. Please complete the 5 required
            profile questions before starting the research scenarios, or switch to educational practice mode.
          </p>

          <div className="cyber-access-actions">
            <Link href="/demographics" prefetch={true} className="button primary large">
              <span>Continue Student Profile</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="button secondary large"
              onClick={handleLaunchPractice}
              disabled={startingPractice}
            >
              <Gamepad2 size={18} aria-hidden="true" />
              <span>{startingPractice ? "Launching Practice…" : "Explore Practice Challenges"}</span>
            </button>

            <Link href="/" prefetch={true} className="button ghost">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Error during scenarios load
  if (state.error || error) {
    return (
      <div className="container page-space">
        <ErrorBox
          message={state.error || error}
          retry={() => {
            setError("");
            void state.reload();
            void fetchScenarios();
          }}
        />
      </div>
    );
  }

  const attempts = session.attempts ?? [];
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);
  const completedCount = firstAttempts.length;
  const totalScenariosCount = scenarios.length || 20;
  const completionXP = completedCount * 10;
  const rank = getOperativeRank(completionXP);

  // Active missions list with counterbalanced order if assigned
  const activeMissions = getActiveMissions(false);
  const orderedMissions = session.assignedModuleOrder
    ? [...activeMissions].sort((a, b) => {
        const order = session.assignedModuleOrder!;
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
    : activeMissions;

  // Active scenario runner view
  if (activeMissionId) {
    const currentMission = missions.find((m) => m.id === activeMissionId) ?? missions[0];
    const missionScenarios = scenarios.filter((s) => currentMission.ids.includes(s.id));
    const activeScenario = missionScenarios[activeScenarioIndex] ?? missionScenarios[0];

    const currentAttempt = attempts.find(
      (a) => a.scenarioId === activeScenario?.id && a.attemptNumber === 1,
    );

    return (
      <div className="container page-space">
        <InteractiveChallengeRunner
          scenario={activeScenario}
          missionId={activeMissionId}
          scenarioIndex={activeScenarioIndex}
          totalInMission={missionScenarios.length}
          overallCompleted={completedCount}
          totalOverall={totalScenariosCount}
          overallXp={completedCount * 10}
          previousAttempt={currentAttempt}
          educationalMode={session.mode === "practice"}
          onCompleteScenario={(newAttempt) => {
            void state.reload();
          }}
          onPreviousScenario={() => {
            void state.reload();
            if (activeScenarioIndex > 0) {
              setActiveScenarioIndex((prev) => prev - 1);
            }
          }}
          onNextScenario={() => {
            void state.reload();
            if (activeScenarioIndex < missionScenarios.length - 1) {
              setActiveScenarioIndex((prev) => prev + 1);
            } else {
              // Current module complete! Find the next module in orderedMissions with uncompleted scenarios
              const currentMissionIdx = orderedMissions.findIndex((m) => m.id === activeMissionId);
              let nextMissionToLoad: { missionId: string; index: number } | null = null;
              for (let i = 1; i <= orderedMissions.length; i++) {
                const candidate = orderedMissions[(currentMissionIdx + i) % orderedMissions.length];
                const candScenarios = scenarios.filter((s) => candidate.ids.includes(s.id));
                const candUncompleted = candScenarios.findIndex(
                  (sc) => !firstAttempts.some((a) => a.scenarioId === sc.id) && sc.id !== activeScenario?.id,
                );
                if (candUncompleted !== -1) {
                  nextMissionToLoad = { missionId: candidate.id, index: candUncompleted };
                  break;
                }
              }

              if (nextMissionToLoad) {
                setActiveMissionId(nextMissionToLoad.missionId);
                setActiveScenarioIndex(nextMissionToLoad.index);
              } else {
                // All 20 scenarios complete across all modules!
                router.push("/results");
              }
            }
          }}
          onSelectScenarioIndex={(idx) => {
            void state.reload();
            setActiveScenarioIndex(idx);
          }}
          onReturnToHub={() => {
            void state.reload();
            setActiveMissionId(null);
            setActiveScenarioIndex(0);
          }}
        />
      </div>
    );
  }

  // Cyber Mission Control Main Hub View
  return (
    <div className="mission-control-page container page-space">
      {session.mode === "practice" && (
        <div className="practice-mode-indicator-banner" role="status">
          <div className="practice-banner-content">
            <div className="practice-banner-header">
              <Gamepad2 size={20} className="text-cyan" aria-hidden="true" />
              <strong>Educational Practice Sandbox Active</strong>
            </div>
            <p>
              You are exploring the cybersecurity missions in practice mode. Responses are stored in your
              local browser sandbox and will not be recorded in the academic research dataset.
            </p>
          </div>
          <Link href="/consent" className="button primary small">
            <span>Join Research Study</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* 1. Four-Step Progress Tracker */}
      <nav className="research-journey-tracker" aria-label="Research Participation Progress">
        <div className="tracker-step completed">
          <div className="tracker-dot">
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 01</span>
            <span className="tracker-step-name">Research Consent</span>
          </div>
        </div>

        <div className="tracker-connector completed" />

        <div className="tracker-step completed">
          <div className="tracker-dot">
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 02</span>
            <span className="tracker-step-name">Student Profile</span>
          </div>
        </div>

        <div className={`tracker-connector ${completedCount >= totalScenariosCount ? "completed" : "active"}`} />

        <div
          className={`tracker-step ${completedCount >= totalScenariosCount ? "completed" : "active"}`}
          aria-current={completedCount < totalScenariosCount ? "step" : undefined}
        >
          <div className="tracker-dot">
            {completedCount >= totalScenariosCount ? (
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              "03"
            )}
          </div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 03</span>
            <span className="tracker-step-name">Cyber Missions ({completedCount}/{totalScenariosCount})</span>
          </div>
        </div>

        <div className={`tracker-connector ${completedCount >= totalScenariosCount ? "active" : ""}`} />

        <div
          className={`tracker-step ${completedCount >= totalScenariosCount ? "active" : ""}`}
          aria-current={completedCount >= totalScenariosCount ? "step" : undefined}
        >
          <div className="tracker-dot">04</div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 04</span>
            <span className="tracker-step-name">Completion</span>
          </div>
        </div>
      </nav>

      {/* 2. Redesigned Page Header (Centered) */}
      <header className="cmc-header-centered">
        <div className="eyebrow">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>CYBER SIMULATION LABORATORY · SRI LANKA</span>
        </div>
        <h1 className="cmc-main-heading">Cyber Mission Control</h1>
        <p className="cmc-description">
          Investigate four social engineering threat categories through realistic interactive cybersecurity scenarios. Examine evidence, identify suspicious behaviour, and make decisions that contribute to privacy research.
        </p>
      </header>

      {/* 3. Redesigned Research Session Information Bar */}
      <div className="cmc-session-bar" role="region" aria-label="Research Session Telemetry">
        <div className="cmc-session-pill">
          <span className="cmc-pill-icon cyan-glow">
            <Lock size={14} aria-hidden="true" />
          </span>
          <div className="cmc-pill-content">
            <span className="cmc-pill-label">ANONYMOUS RESEARCH ID</span>
            <strong className="cmc-pill-value font-mono">{session.code}</strong>
          </div>
        </div>

        <div className="cmc-session-divider" aria-hidden="true" />

        <div className="cmc-session-pill">
          <span className="cmc-pill-icon emerald-glow">
            <span className="live-pulse-dot" aria-hidden="true" />
          </span>
          <div className="cmc-pill-content">
            <span className="cmc-pill-label">SESSION STATUS</span>
            <strong className="cmc-pill-value">
              {session.mode === "practice" ? "Practice Sandbox" : "Active Research Study"}
            </strong>
          </div>
        </div>

        <div className="cmc-session-divider" aria-hidden="true" />

        <div className="cmc-session-pill">
          <span className="cmc-pill-icon purple-glow">
            <Layers size={14} aria-hidden="true" />
          </span>
          <div className="cmc-pill-content">
            <span className="cmc-pill-label">CURRENT RESEARCH STEP</span>
            <strong className="cmc-pill-value">
              {completedCount >= totalScenariosCount ? "Step 03 Complete · Ready for Step 04" : "Step 03 of 04 · Threat Missions"}
            </strong>
          </div>
        </div>

        <div className="cmc-session-divider" aria-hidden="true" />

        <div className="cmc-session-pill">
          <span className="cmc-pill-icon amber-glow">
            <ShieldCheck size={14} aria-hidden="true" />
          </span>
          <div className="cmc-pill-content">
            <span className="cmc-pill-label">SECURITY &amp; PRIVACY</span>
            <strong className="cmc-pill-value">Isolated · No Credentials Collected</strong>
          </div>
        </div>
      </div>

      {/* 4. Redesigned Research Statistics Panel (4-column layout) */}
      <section className="cmc-stats-panel" aria-label="Research Statistics Panel">
        <div className="cmc-stat-card">
          <div className="cmc-stat-header">
            <span className="cmc-stat-label">INVESTIGATOR RANK</span>
            <Award size={18} className="cmc-stat-icon text-cyan" aria-hidden="true" />
          </div>
          <div className="cmc-stat-body">
            <div className="cmc-rank-badge-wrap">
              <span className="cmc-rank-level-badge">LVL {rank.level}</span>
              <strong className="cmc-rank-title">{rank.title}</strong>
            </div>
            <span className="cmc-stat-sub">Badge: {rank.badge}</span>
          </div>
        </div>

        <div className="cmc-stat-card">
          <div className="cmc-stat-header">
            <span className="cmc-stat-label">RESEARCH XP EARNED</span>
            <Trophy size={18} className="cmc-stat-icon text-amber" aria-hidden="true" />
          </div>
          <div className="cmc-stat-body">
            <div className="cmc-xp-value-wrap">
              <strong className="cmc-xp-current">{completionXP}</strong>
              <span className="cmc-xp-max">{" "}/ 200 XP</span>
            </div>
            <span className="cmc-stat-sub">10 XP per completed challenge</span>
          </div>
        </div>

        <div className="cmc-stat-card">
          <div className="cmc-stat-header">
            <span className="cmc-stat-label">CHALLENGES EVALUATED</span>
            <CheckCircle2 size={18} className="cmc-stat-icon text-emerald" aria-hidden="true" />
          </div>
          <div className="cmc-stat-body">
            <div className="cmc-challenges-value-wrap">
              <strong className="cmc-challenges-current">{completedCount}</strong>
              <span className="cmc-challenges-max">{" "}/ {totalScenariosCount}</span>
            </div>
            <div className="cmc-mini-progress-track">
              <div
                className="cmc-mini-progress-fill"
                style={{ width: `${(completedCount / totalScenariosCount) * 100}%` }}
              />
            </div>
            <span className="cmc-stat-sub">
              {totalScenariosCount - completedCount === 0
                ? "All scenarios evaluated"
                : `${totalScenariosCount - completedCount} challenges remaining`}
            </span>
          </div>
        </div>

        <div className="cmc-stat-card">
          <div className="cmc-stat-header">
            <span className="cmc-stat-label">OVERALL RESEARCH STATUS</span>
            <Play size={18} className="cmc-stat-icon text-purple" aria-hidden="true" />
          </div>
          <div className="cmc-stat-body">
            <div className="cmc-status-badge-wrap">
              {completedCount >= totalScenariosCount ? (
                <span className="cmc-status-badge complete">
                  <CheckCircle2 size={14} aria-hidden="true" /> All Missions Complete
                </span>
              ) : (
                <span className="cmc-status-badge active">
                  <Play size={12} aria-hidden="true" /> Investigation Active
                </span>
              )}
            </div>
            <span className="cmc-stat-sub">
              {completedCount >= totalScenariosCount
                ? "Step 04 unlocked — certificate ready"
                : `${completedCount} of ${totalScenariosCount} completed`}
            </span>
          </div>
        </div>
      </section>

      {/* Completion Banner if all 20 challenges finished */}
      {completedCount >= totalScenariosCount && (
        <div className="mission-complete-banner" role="status">
          <div className="banner-content">
            <div className="banner-icon-box">
              <Trophy size={36} className="text-amber" aria-hidden="true" />
            </div>
            <div>
              <h3>All 20 Cyber Research Challenges Complete!</h3>
              <p>
                You have evaluated all four social engineering threat categories. Review your answers and discover the safest responses to each cybersecurity scenario.
              </p>
            </div>
          </div>
          <Link href="/results" prefetch={true} className="button primary large banner-cta-btn">
            <span>Complete &amp; Review My Answers</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Global Research Progress Tracker */}
      <GlobalResearchProgressTracker
        attempts={session.attempts ?? []}
        onSelectMission={(id) => {
          setActiveMissionId(id);
          setActiveScenarioIndex(0);
        }}
      />

      {/* 4. Four Large Professional Mission Cards */}
      <section className="threat-modules-grid" aria-label="Four Social Engineering Threat Modules">
        {orderedMissions.map((mission) => {
          const Icon = missionIcons[mission.icon] ?? Mail;
          const missionScenarios = scenarios.filter((s) => mission.ids.includes(s.id));
          const completedInMission = missionScenarios.filter((sc) =>
            firstAttempts.some((a) => a.scenarioId === sc.id),
          ).length;
          const isMissionComplete = completedInMission === missionScenarios.length && missionScenarios.length > 0;
          const progressPct = missionScenarios.length > 0 ? (completedInMission / missionScenarios.length) * 100 : 0;

          // Find first uncompleted scenario index
          const nextIndex = missionScenarios.findIndex(
            (sc) => !firstAttempts.some((a) => a.scenarioId === sc.id),
          );
          const targetIndex = nextIndex === -1 ? 0 : nextIndex;

          const statusText =
            isMissionComplete
              ? "Completed"
              : completedInMission > 0
              ? "In Progress"
              : "Not Started";

          return (
            <article
              key={mission.id}
              className={`module-card ${isMissionComplete ? "completed" : ""} ${
                completedInMission > 0 && !isMissionComplete ? "in-progress" : ""
              }`}
            >
              <div className="module-card-top">
                <div className="module-header-row">
                  <div className={`module-icon-tile ${mission.color}`}>
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div className="module-meta-badges">
                    <span className="module-code">{mission.code} · {mission.iv}</span>
                    <span className={`module-status-chip ${statusText.toLowerCase().replace(/\s+/g, "-")}`}>
                      {isMissionComplete && <Check size={12} strokeWidth={2.5} aria-hidden="true" />}
                      <span>{statusText}</span>
                    </span>
                  </div>
                </div>

                <h2 className="module-title">{mission.name}</h2>
                <p className="module-desc">{mission.description}</p>
              </div>

              {/* Five Separate Challenge Indicator Chips */}
              <div className="module-challenges-list">
                <span className="challenges-label">5 Interactive Scenarios:</span>
                <div className="challenge-pills-row" role="list" aria-label={`Scenarios for ${mission.name}`}>
                  {mission.ids.map((id, sIdx) => {
                    const isDone = firstAttempts.some((a) => a.scenarioId === id);
                    return (
                      <span
                        key={id}
                        role="listitem"
                        className={`challenge-indicator-pill ${isDone ? "done" : "pending"}`}
                        title={`${id}: ${isDone ? "Completed" : "Pending"}`}
                      >
                        {isDone ? <Check size={11} strokeWidth={3} aria-hidden="true" /> : null}
                        <span>{id}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar & Footer */}
              <div className="module-card-footer">
                <div className="module-progress-bar-row">
                  <span className="module-completion-text">
                    {completedInMission} of {mission.ids.length} Scenarios Completed
                  </span>
                  <strong className="module-progress-pct">{Math.round(progressPct)}%</strong>
                </div>
                <div
                  className="module-progress-track"
                  role="progressbar"
                  aria-valuenow={Math.round(progressPct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${mission.name} progress`}
                >
                  <div className="module-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>

                <div className="module-action-row">
                  <span className="module-time-est">
                    <Clock size={13} aria-hidden="true" /> ~3–4 Min
                  </span>

                  <button
                    type="button"
                    className={`button ${isMissionComplete ? "secondary" : "primary"} small module-launch-btn`}
                    onClick={() => {
                      setActiveMissionId(mission.id);
                      setActiveScenarioIndex(targetIndex);
                    }}
                    aria-label={`${isMissionComplete ? "Review" : completedInMission > 0 ? "Continue" : "Start"} ${mission.name}`}
                  >
                    <span>
                      {isMissionComplete
                        ? "Review Mission"
                        : completedInMission > 0
                        ? "Continue Mission"
                        : "Start Mission"}
                    </span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Bottom Hub Navigation Footer */}
      <footer className="hub-footer-navigation">
        <div className="footer-stats-note">
          <ShieldCheck size={16} className="text-emerald" aria-hidden="true" />
          <span>
            Responses are recorded neutrally for academic analysis without collecting real passwords or personal identifiers.
          </span>
        </div>

        {completedCount > 0 && (
          <Link href="/results" prefetch={true} className="button secondary">
            <span>View Completion &amp; Debrief ({completedCount}/{totalScenariosCount})</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </footer>
    </div>
  );
}
