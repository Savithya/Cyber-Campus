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
} from "lucide-react";
import { api, useSession, randomToken } from "@/lib/client";
import { missions, getActiveMissions } from "@/content/missions";
import type { Scenario, Session, Attempt } from "@/lib/types";
import { InteractiveChallengeRunner } from "./interactive-challenge-runner";
import { ResearchProgressStepper } from "./research-progress-stepper";
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
  const [startingPractice, setStartingPractice] = useState<boolean>(false);

  // Active Challenge Runner State
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);

  const session = state.session;
  const isAuthorized = !!session && (session.status !== "draft" || session.mode === "practice");

  const fetchScenarios = useCallback(async () => {
    setLoadingScenarios(true);
    setError("");
    try {
      const data = await api<{ scenarios: Scenario[] }>("scenarios");
      setScenarios(data.scenarios || []);
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
      setScenarios(scRes.scenarios || []);
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
            <Link href="/consent" className="button primary large">
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

            <Link href="/" className="button ghost">
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
            <Link href="/demographics" className="button primary large">
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

            <Link href="/" className="button ghost">
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
          previousAttempt={currentAttempt}
          educationalMode={session.mode === "practice"}
          onCompleteScenario={(newAttempt) => {
            void state.reload();
          }}
          onNextScenario={() => {
            void state.reload();
            if (activeScenarioIndex < missionScenarios.length - 1) {
              setActiveScenarioIndex((prev) => prev + 1);
            } else {
              setActiveMissionId(null);
              setActiveScenarioIndex(0);
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

      {/* 1. Four-Stage Reusable Progress Stepper */}
      <ResearchProgressStepper
        currentStep={3}
        stepDetail={`${completedCount}/${totalScenariosCount} completed`}
      />

      {/* 2. Page Header */}
      <header className="cmc-header-centered">
        <div className="eyebrow">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>CYBER MISSION HUB · INTERACTIVE INVESTIGATION EXPERIENCE</span>
        </div>
        <h1 className="cmc-main-heading">Your Cyber Investigation Begins Here</h1>
        <p className="cmc-description">
          Explore realistic situations, identify suspicious activity and choose how you would respond.
          Your decisions provide empirical evidence on social engineering threats and student privacy.
        </p>
      </header>

      {/* 3. Overall Research Progress Component */}
      <div className="cmc-overall-progress-panel" role="region" aria-label="Investigation Progress">
        <div className="progress-panel-top">
          <div className="progress-headline-wrap">
            <span className="progress-eyebrow">OVERALL RESEARCH PROGRESS</span>
            <h2 className="progress-title">
              {completedCount} of {totalScenariosCount} Scenarios Completed
            </h2>
          </div>

          <div className="progress-status-badge">
            <span className="status-dot green" aria-hidden="true" />
            <span>
              {completedCount >= totalScenariosCount
                ? "All 20 Completed · Ready for Step 04"
                : `${totalScenariosCount - completedCount} Scenarios Remaining`}
            </span>
          </div>
        </div>

        {/* Clean Animated Progress Bar */}
        <div
          className="cmc-master-progress-track"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalScenariosCount}
          aria-label="Overall research scenario completion"
        >
          <div
            className="cmc-master-progress-fill"
            style={{ width: `${(completedCount / totalScenariosCount) * 100}%` }}
          />
        </div>

        {/* Telemetry info chips */}
        <div className="cmc-telemetry-chips-row">
          <div className="telemetry-chip">
            <Lock size={13} className="text-muted" aria-hidden="true" />
            <span className="chip-label">ANONYMOUS ID:</span>
            <strong className="chip-val font-mono">{session.code}</strong>
          </div>
          <div className="telemetry-chip">
            <ShieldCheck size={13} className="text-emerald" aria-hidden="true" />
            <span className="chip-label">DATA RECORDING:</span>
            <strong className="chip-val">
              {session.mode === "practice" ? "Practice Sandbox" : "Standardized Empirical Capture"}
            </strong>
          </div>
          <div className="telemetry-chip">
            <FileCheck2 size={13} className="text-cyan" aria-hidden="true" />
            <span className="chip-label">CREDENTIAL SECURITY:</span>
            <strong className="chip-val">Simulated Safe Environment</strong>
          </div>
        </div>
      </div>

      {/* Completion Banner if all 20 challenges finished */}
      {completedCount >= totalScenariosCount && (
        <div className="mission-complete-banner" role="status">
          <div className="banner-content">
            <div className="banner-icon-box">
              <CheckCircle2 size={36} className="text-emerald" aria-hidden="true" />
            </div>
            <div>
              <h3>All 20 Cyber Investigation Scenarios Complete!</h3>
              <p>
                You have evaluated all four social engineering threat categories. Proceed to Step 04 to view your participation summary, completion certificate, and empirical debrief.
              </p>
            </div>
          </div>
          <Link href="/results" className="button primary large banner-cta-btn">
            <span>Proceed to Step 04 — Completion</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}

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
                        ? "Review Scenarios"
                        : completedInMission > 0
                        ? "Continue Investigation"
                        : "Start Investigation"}
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
          <Link href="/results" className="button secondary">
            <span>View Completion &amp; Debrief ({completedCount}/{totalScenariosCount})</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        )}
      </footer>
    </div>
  );
}
