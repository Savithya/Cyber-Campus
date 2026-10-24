"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ResearchJourneyFrame, type JourneyStepKey } from "./research-journey-frame";
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
  initialScenarios?: Scenario[];
}

let cachedScenarios: Scenario[] | null = null;

export function CyberMissionControl({
  initialMissionId,
  initialScenarios,
}: CyberMissionControlProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleQuery = searchParams?.get("module");

  const state = useSession();

  const [scenarios, setScenarios] = useState<Scenario[]>(
    () => initialScenarios ?? cachedScenarios ?? []
  );
  const [loadingScenarios, setLoadingScenarios] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [startingPractice, setStartingPractice] = useState<boolean>(false);

  // Active Challenge Runner State
  const [activeMissionId, setActiveMissionId] = useState<string | null>(
    initialMissionId ?? moduleQuery ?? null
  );
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);

  const session = state.session;
  const isAuthorized = !!session && (session.status !== "draft" || session.mode === "practice");

  // Sync module query parameter with active mission
  useEffect(() => {
    if (moduleQuery && ["phishing", "pretexting", "impersonation", "links"].includes(moduleQuery)) {
      setActiveMissionId(moduleQuery);
      setActiveScenarioIndex(0);
    }
  }, [moduleQuery]);

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
        const mScenarios = currentMission.ids
          .map((id) => scenarios.find((s) => s.id === id))
          .filter((s): s is Scenario => Boolean(s));
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
      <ResearchJourneyFrame
        currentStep="consent"
        progressPercent={0}
        missionKicker="STEP 1 OF 6"
        title="Research Consent Required"
        subtitle="Participation in the Cyber Campus research study requires informed consent and an anonymous participant token."
        noticePill="Research Prerequisite Required · Sri Lanka"
        backHref="/"
        backLabel="Home"
        onContinue={() => router.push("/consent")}
        continueLabel="Begin Research Consent"
      >
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
      </ResearchJourneyFrame>
    );
  }

  // Case 2: Consented, but Demographic Profile is in draft (unsubmitted)
  if (session.mode !== "practice" && session.status === "draft") {
    return (
      <ResearchJourneyFrame
        currentStep="profile"
        progressPercent={4}
        missionKicker="MISSION 1 OF 6"
        title="Complete Your Student Profile"
        subtitle="Your demographic profile has not been submitted yet. Please complete the 4 required profile questions before starting the cyber missions."
        noticePill="Step 02 of 04 Required · Sri Lanka"
        backHref="/consent"
        backLabel="Research Consent"
        onContinue={() => router.push("/demographics")}
        continueLabel="Continue Student Profile"
      >
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
            Your demographic profile has not been submitted yet. Please complete the 4 required
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
      </ResearchJourneyFrame>
    );
  }

  // Case 3: Error during scenarios load
  if (state.error || error) {
    return (
      <ResearchJourneyFrame
        currentStep="missions"
        progressPercent={50}
        missionKicker="MISSION 6 - PART A"
        title="Cyber Missions"
        subtitle="An error occurred while loading cybersecurity scenarios."
        noticePill="Network Telemetry Error"
        backHref="/demographics"
        backLabel="Student Profile"
      >
        <ErrorBox
          message={state.error || error}
          retry={() => {
            setError("");
            void state.reload();
            void fetchScenarios();
          }}
        />
      </ResearchJourneyFrame>
    );
  }

  const attempts = session.attempts ?? [];
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);
  const completedCount = firstAttempts.length;
  const totalScenariosCount = scenarios.length || 20;
  const completionXP = completedCount * 10;
  const rank = getOperativeRank(completionXP);

  // Canonical order: IV1 — Phishing, IV2 — Pretexting, IV3 — Impersonation, IV4 — Online Scams & Malicious Links
  const CANONICAL_MISSION_ORDER = ["phishing", "pretexting", "impersonation", "links"] as const;
  const activeMissions = getActiveMissions(false);
  const orderedMissions = [...activeMissions].sort((a, b) => {
    const indexA = CANONICAL_MISSION_ORDER.indexOf(a.id as typeof CANONICAL_MISSION_ORDER[number]);
    const indexB = CANONICAL_MISSION_ORDER.indexOf(b.id as typeof CANONICAL_MISSION_ORDER[number]);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  // Active scenario runner view
  if (activeMissionId) {
    const currentMission = missions.find((m) => m.id === activeMissionId) ?? missions[0];
    const missionScenarios = currentMission.ids
      .map((id) => scenarios.find((s) => s.id === id))
      .filter((s): s is Scenario => Boolean(s));
    const activeScenario = missionScenarios[activeScenarioIndex] ?? missionScenarios[0];

    if (!activeScenario || loadingScenarios) {
      return <Loading />;
    }

    const currentAttempt = attempts.find(
      (a) => a.scenarioId === activeScenario?.id && a.attemptNumber === 1,
    );

    const stepConfigMap: Record<
      string,
      {
        stepKey: JourneyStepKey;
        stepKicker: string;
        title: string;
        subtitle: string;
        progress: number;
        backLabel: string;
        onBack: () => void;
        continueLabel: string;
        onContinue: () => void;
      }
    > = {
      phishing: {
        stepKey: "phishing",
        stepKicker: "STEP 03 OF 07 · IV1",
        title: "Phishing Investigation",
        subtitle: "Examine each email carefully and decide what you would do.",
        progress: 30,
        backLabel: "Back to Step 02: About You",
        onBack: () => router.push("/demographics"),
        continueLabel: "Continue to Step 04: Pretexting Detection",
        onContinue: () => {
          setActiveMissionId("pretexting");
          setActiveScenarioIndex(0);
          router.push("/play?module=pretexting");
        },
      },
      pretexting: {
        stepKey: "pretexting",
        stepKicker: "STEP 04 OF 07 · IV2",
        title: "Pretexting Detection",
        subtitle: "Examine each communication carefully and decide what you would do.",
        progress: 45,
        backLabel: "Back to Step 03: Phishing Investigation",
        onBack: () => {
          setActiveMissionId("phishing");
          setActiveScenarioIndex(0);
          router.push("/play?module=phishing");
        },
        continueLabel: "Continue to Step 05: Impersonation Investigation",
        onContinue: () => {
          setActiveMissionId("impersonation");
          setActiveScenarioIndex(0);
          router.push("/play?module=impersonation");
        },
      },
      impersonation: {
        stepKey: "impersonation",
        stepKicker: "STEP 05 OF 07 · IV3",
        title: "Impersonation Investigation",
        subtitle: "Examine each identity and message carefully and decide what you would do.",
        progress: 60,
        backLabel: "Back to Step 04: Pretexting Detection",
        onBack: () => {
          setActiveMissionId("pretexting");
          setActiveScenarioIndex(0);
          router.push("/play?module=pretexting");
        },
        continueLabel: "Continue to Step 06: Scam & Malicious Link Investigation",
        onContinue: () => {
          setActiveMissionId("links");
          setActiveScenarioIndex(0);
          router.push("/play?module=links");
        },
      },
      links: {
        stepKey: "links",
        stepKicker: "STEP 06 OF 07 · IV4",
        title: "Scam & Malicious Link Investigation",
        subtitle: "Examine each offer and link carefully and decide what you would do.",
        progress: 75,
        backLabel: "Back to Step 05: Impersonation Investigation",
        onBack: () => {
          setActiveMissionId("impersonation");
          setActiveScenarioIndex(0);
          router.push("/play?module=impersonation");
        },
        continueLabel: "Continue to Step 07: Review & Save",
        onContinue: () => router.push("/survey/review"),
      },
    };

    const currentConfig = stepConfigMap[activeMissionId] ?? stepConfigMap.phishing;

    return (
      <ResearchJourneyFrame
        currentStep={currentConfig.stepKey}
        progressPercent={currentConfig.progress}
        missionKicker={currentConfig.stepKicker}
        title={currentConfig.title}
        subtitle={currentConfig.subtitle}
        hideProgressHeader={true}
        hideActionBar={true}
        onBack={currentConfig.onBack}
        backLabel={currentConfig.backLabel}
        onContinue={currentConfig.onContinue}
        continueLabel={currentConfig.continueLabel}
      >
        <div className="challenge-runner-wrapper">
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
                // Advance sequentially through the 7 steps:
                if (activeMissionId === "phishing") {
                  setActiveMissionId("pretexting");
                  setActiveScenarioIndex(0);
                  router.push("/play?module=pretexting");
                } else if (activeMissionId === "pretexting") {
                  setActiveMissionId("impersonation");
                  setActiveScenarioIndex(0);
                  router.push("/play?module=impersonation");
                } else if (activeMissionId === "impersonation") {
                  setActiveMissionId("links");
                  setActiveScenarioIndex(0);
                  router.push("/play?module=links");
                } else {
                  // Step 06 complete! Proceed to Step 07: Review & Save
                  router.push("/survey/review");
                }
              }
            }}
            onSelectScenarioIndex={(idx) => {
              void state.reload();
              setActiveScenarioIndex(idx);
            }}
            onSelectMission={(mid, sIdx = 0) => {
              void state.reload();
              setActiveMissionId(mid);
              setActiveScenarioIndex(sIdx);
              router.push(`/play?module=${mid}`);
            }}
            onReturnToHub={() => {
              void state.reload();
              setActiveMissionId(null);
              setActiveScenarioIndex(0);
              router.push("/play");
            }}
          />
        </div>
      </ResearchJourneyFrame>
    );
  }

  // Cyber Mission Control Main Hub View
  return (
    <ResearchJourneyFrame
      currentStep="phishing"
      progressPercent={
        totalScenariosCount > 0
          ? Math.round((completedCount / totalScenariosCount) * 100)
          : 30
      }
      missionKicker="CYBER SIMULATION LABORATORY · STEPS 03–06"
      title="Social Engineering Threat Investigations"
      subtitle="Investigate four social engineering threat categories through realistic interactive cybersecurity scenarios. Examine evidence, identify suspicious behaviour, and make decisions that contribute to privacy research."
      noticePill="20 Interactive Scenarios · 4 Threat Variables (IV1–IV4) · Academic Privacy Simulation"
      backHref="/demographics"
      backLabel="Back to Step 02: About You"
      onContinue={() => router.push("/survey/review")}
      continueLabel="Continue to Step 07: Review & Save"
    >
      <div className="mission-control-content">
        {session.mode === "practice" && (
          <div className="practice-mode-indicator-banner mb-6" role="status">
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

        {/* Redesigned Research Session Information Bar */}
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

        {/* Research Statistics Panel */}
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
                  ? "Ready for BEFORE THE INBOX"
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
                  You have evaluated all four social engineering threat categories. Continue to BEFORE THE INBOX to review your responses and save your research baseline.
                </p>
              </div>
            </div>
            <Link href="/survey/review" prefetch={true} className="button primary large banner-cta-btn">
              <span>Continue to BEFORE THE INBOX: Review &amp; Save</span>
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

        {/* Four Large Professional Mission Cards */}
        <section className="threat-modules-grid" aria-label="Four Social Engineering Threat Modules">
          {orderedMissions.map((mission) => {
            const Icon = missionIcons[mission.icon] ?? Mail;
            const missionScenarios = mission.ids
              .map((id) => scenarios.find((s) => s.id === id))
              .filter((s): s is Scenario => Boolean(s));
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

            const stepNum =
              mission.id === "phishing"
                ? "STEP 03"
                : mission.id === "pretexting"
                ? "STEP 04"
                : mission.id === "impersonation"
                ? "STEP 05"
                : mission.id === "links"
                ? "STEP 06"
                : mission.code;

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
                      <span className="module-code">{stepNum} · {mission.iv}</span>
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
                    {mission.ids.map((id) => {
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
                        router.push(`/play?module=${mission.id}`);
                      }}
                      aria-label={`${isMissionComplete ? "Review" : completedInMission > 0 ? "Continue" : "Start"} ${stepNum}: ${mission.name}`}
                    >
                      <span>
                        {isMissionComplete
                          ? `Review ${stepNum}`
                          : completedInMission > 0
                          ? `Continue ${stepNum}`
                          : `Start ${stepNum}`}
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

          <Link href="/survey/review" prefetch={true} className="button primary">
            <span>Continue to Step 07: Review &amp; Save</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </ResearchJourneyFrame>
  );
}
