"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Award,
  ChevronRight,
  Layers,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Play,
  Trophy,
} from "lucide-react";
import { api, useSession } from "@/lib/client";
import { missions, getActiveMissions } from "@/content/missions";
import { scoreSummary, getOperativeRank } from "@/lib/scoring";
import type { Scenario, Session, Attempt } from "@/lib/types";
import { InteractiveChallengeRunner } from "./interactive-challenge-runner";
import { Loading, ErrorBox } from "./ui";

const missionIcons: Record<string, typeof Mail> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};

export function CyberMissionControl() {
  const router = useRouter();
  const state = useSession();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Active Challenge Runner State
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);

  // Fetch scenarios from server
  useEffect(() => {
    api<{ scenarios: Scenario[] }>("scenarios")
      .then((data) => {
        setScenarios(data.scenarios);
      })
      .catch((err) => {
        setError(err.message || "Failed to load cyber missions.");
      })
      .finally(() => {
        setLoadingScenarios(false);
      });
  }, []);

  if (state.loading || loadingScenarios) return <Loading />;
  if (state.error || error) {
    return (
      <div className="container page-space">
        <ErrorBox message={state.error || error} retry={state.reload} />
      </div>
    );
  }

  const session = state.session;
  if (!session) {
    return (
      <div className="container page-space narrow text-center">
        <h2>Research Session Required</h2>
        <p>Please review research consent and set up your anonymous profile before entering Cyber Mission Control.</p>
        <Link href="/consent" className="button primary large mt-4">
          <span>Go to Research Consent</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const attempts = session.attempts ?? [];
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);
  const completedCount = firstAttempts.length;
  const totalScenariosCount = scenarios.length || 25;

  // XP & Rank calculations
  const totalScore = scoreSummary(attempts);
  // Award 10 XP per completed challenge + correct bonus, separating educational XP from risk score
  const completionXP = completedCount * 10;
  const rank = getOperativeRank(completionXP);

  // Active missions list with counterbalanced order if assigned
  const activeMissions = getActiveMissions(true);
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
          previousAttempt={currentAttempt}
          onCompleteScenario={(newAttempt) => {
            // Reload session in background to sync attempts
            void state.reload();
            // Automatically advance to next scenario in mission if available
            if (activeScenarioIndex < missionScenarios.length - 1) {
              setActiveScenarioIndex(activeScenarioIndex + 1);
            }
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
      {/* Four-Step Progress Tracker */}
      <div className="research-journey-tracker" role="navigation" aria-label="Research Journey Progress">
        <div className="tracker-step completed">
          <div className="tracker-dot">
            <Check size={14} aria-hidden="true" />
          </div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 01</span>
            <span className="tracker-step-name">Consent</span>
          </div>
        </div>

        <div className="tracker-connector completed" />

        <div className="tracker-step completed">
          <div className="tracker-dot">
            <Check size={14} aria-hidden="true" />
          </div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 02</span>
            <span className="tracker-step-name">Profile</span>
          </div>
        </div>

        <div className="tracker-connector active" />

        <div className="tracker-step active" aria-current="step">
          <div className="tracker-dot">03</div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 03</span>
            <span className="tracker-step-name">Cyber Missions ({completedCount}/{totalScenariosCount})</span>
          </div>
        </div>

        <div className="tracker-connector" />

        <div className="tracker-step">
          <div className="tracker-dot">04</div>
          <div className="tracker-info">
            <span className="tracker-step-num">STEP 04</span>
            <span className="tracker-step-name">Completion</span>
          </div>
        </div>
      </div>

      {/* Cyber Mission Control Header & Operative HUD */}
      <div className="hub-header-row">
        <div className="hub-title-block">
          <div className="eyebrow">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>CYBER SIMULATION LABORATORY · SRI LANKA</span>
          </div>
          <h1 className="hub-main-heading">Cyber Mission Control</h1>
          <p className="hub-description">
            Investigate real cyber manipulation vectors across five threat categories.
            Inspect evidence, analyze indicators, and make your decisions. Your initial decisions
            are recorded to evaluate simulated privacy protection among university students.
          </p>
        </div>

        {/* Anonymous Session Token Badge */}
        <div className="hub-session-card">
          <div className="session-card-header">
            <Lock size={15} aria-hidden="true" />
            <span>RESEARCH SESSION</span>
          </div>
          <div className="session-code-display">{session.code}</div>
          <small className="session-status-text">
            {session.mode === "practice" ? "Practice Mode · Isolated" : "Anonymous Research Participant"}
          </small>
        </div>
      </div>

      {/* Futuristic Telemetry HUD */}
      <div className="gaming-telemetry-hud" role="region" aria-label="Operative Telemetry and XP">
        <div className="hud-metric-row">
          <div className="hud-metric-tile">
            <span className="hud-metric-label">INVESTIGATOR RANK</span>
            <div className="hud-rank-box">
              <span className="hud-rank-badge">LVL {rank.level}</span>
              <strong className="hud-rank-title">{rank.title}</strong>
            </div>
          </div>

          <div className="hud-metric-tile">
            <span className="hud-metric-label">RESEARCH XP EARNED</span>
            <div className="hud-xp-box">
              <strong className="hud-xp-value">{completionXP} <small className="hud-xp-max">/ 250 XP</small></strong>
              <span className="hud-xp-tag">10 XP / completed mission</span>
            </div>
          </div>

          <div className="hud-metric-tile">
            <span className="hud-metric-label">CHALLENGES EVALUATED</span>
            <div className="hud-scenarios-box">
              <strong className="hud-scenarios-value">{completedCount} <small className="hud-scenarios-max">/ {totalScenariosCount}</small></strong>
              <div className="hud-mini-progress">
                <div
                  className="hud-mini-fill"
                  style={{ width: `${(completedCount / totalScenariosCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="hud-metric-tile">
            <span className="hud-metric-label">OVERALL STATUS</span>
            <div className="hud-status-badge-box">
              {completedCount === totalScenariosCount ? (
                <span className="status-pill complete">
                  <CheckCircle2 size={15} aria-hidden="true" /> All Missions Complete
                </span>
              ) : (
                <span className="status-pill active">
                  <Play size={13} aria-hidden="true" /> Investigation Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Banner if all challenges finished */}
      {completedCount >= totalScenariosCount && (
        <div className="mission-complete-banner" role="status">
          <div className="banner-content">
            <Trophy size={32} className="text-amber" aria-hidden="true" />
            <div>
              <h3>All 25 Cyber Research Challenges Complete!</h3>
              <p>You have evaluated all five social engineering threat categories. View your research completion certificate and debrief.</p>
            </div>
          </div>
          <Link href="/results" className="button primary large">
            <span>View Research Certificate</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Five Threat Module Cards Grid */}
      <section className="threat-modules-grid" aria-label="Five Cybersecurity Threat Modules">
        {orderedMissions.map((mission, idx) => {
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

          return (
            <article
              key={mission.id}
              className={`module-card ${isMissionComplete ? "completed" : ""} ${mission.proposed ? "proposed-module" : ""}`}
            >
              <div className="module-card-top">
                <div className="module-header-row">
                  <span className={`module-icon-tile ${mission.color}`}>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div className="module-meta-badges">
                    <span className="module-code">{mission.code} · {mission.iv}</span>
                    {mission.proposed && (
                      <span className="proposed-badge" title="Proposed variable module for research approval">
                        PROPOSED IV5
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="module-title">{mission.name}</h2>
                <p className="module-desc">{mission.description}</p>
              </div>

              {/* Challenge dots indicators */}
              <div className="module-challenges-list">
                <span className="challenges-label">Challenges in Module:</span>
                <div className="challenge-pills-row">
                  {mission.ids.map((id, cIdx) => {
                    const isDone = firstAttempts.some((a) => a.scenarioId === id);
                    return (
                      <span
                        key={id}
                        className={`challenge-indicator-pill ${isDone ? "done" : ""}`}
                        title={`${id}: ${isDone ? "Evaluated" : "Pending"}`}
                      >
                        {isDone ? <Check size={11} strokeWidth={3} /> : id}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar & Footer */}
              <div className="module-card-footer">
                <div className="module-progress-bar-row">
                  <span>{completedInMission} of {mission.ids.length} Challenges</span>
                  <strong>{Math.round(progressPct)}%</strong>
                </div>
                <div className="module-progress-track">
                  <div className="module-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>

                <div className="module-action-row">
                  <span className="module-time-est">
                    <Clock size={13} aria-hidden="true" /> ~3–4 min
                  </span>

                  <button
                    type="button"
                    className={`button ${isMissionComplete ? "secondary" : "primary"} small`}
                    onClick={() => {
                      setActiveMissionId(mission.id);
                      setActiveScenarioIndex(targetIndex);
                    }}
                    aria-label={`${isMissionComplete ? "Review" : "Start"} ${mission.name}`}
                  >
                    <span>{isMissionComplete ? "Review Mission" : completedInMission > 0 ? "Continue" : "Start Mission"}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Completion Shortcut Footer */}
      <div className="hub-footer-navigation">
        <div className="footer-stats-note">
          <ShieldCheck size={16} className="text-emerald" aria-hidden="true" />
          <span>
            First responses are recorded automatically and analyzed without collecting personal credentials.
          </span>
        </div>

        {completedCount > 0 && (
          <Link href="/results" className="button secondary">
            <span>View Completion &amp; Debrief ({completedCount}/{totalScenariosCount})</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
