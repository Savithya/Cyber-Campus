"use client";

import React, { useState, useEffect, useRef } from "react";
import { api, useSession } from "@/lib/client";
import { missions } from "@/content/missions";
import type { Scenario, Attempt } from "@/lib/types";
import {
  CyberMissionHeader,
  ScenarioIntroduction,
  UniversityEmailSimulator,
  ActionSelectionGroup,
  NextChallengeButton,
  getScenarioEmailData,
} from "./cyber-mission-challenge";

export interface InteractiveChallengeRunnerProps {
  scenario: Scenario;
  missionId: string;
  scenarioIndex: number; // 0..4
  totalInMission: number; // 5
  overallCompleted?: number; // 0..20
  totalOverall?: number; // 20
  overallXp?: number; // 0..200
  onCompleteScenario: (attempt: Attempt) => void;
  onPreviousScenario?: () => void;
  onNextScenario?: () => void;
  onSelectScenarioIndex?: (index: number) => void;
  onSelectMission?: (missionId: string, scenarioIndex?: number) => void;
  onReturnToHub: () => void;
  previousAttempt?: Attempt;
  educationalMode?: boolean;
}

export function InteractiveChallengeRunner({
  scenario,
  missionId,
  scenarioIndex,
  totalInMission,
  overallCompleted = 0,
  totalOverall = 20,
  overallXp = 0,
  onCompleteScenario,
  onPreviousScenario,
  onNextScenario,
  onSelectScenarioIndex,
  onSelectMission,
  onReturnToHub,
  previousAttempt,
  educationalMode = false,
}: InteractiveChallengeRunnerProps) {
  const state = useSession();
  const startTimeRef = useRef<number>(Date.now());

  // Active answer selection state (initialized to previous answer if already answered)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    previousAttempt?.selectedAction ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recordedAttempt, setRecordedAttempt] = useState<Attempt | null>(
    previousAttempt ?? null,
  );
  const [error, setError] = useState<string>("");

  // When scenario changes, re-initialize state
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedChoiceId(previousAttempt?.selectedAction ?? null);
    setRecordedAttempt(previousAttempt ?? null);
    setError("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scenario.id, previousAttempt]);

  const currentMission = missions.find((m) => m.id === missionId) ?? missions[0];
  const emailData = getScenarioEmailData(scenario);
  const isLastChallenge = scenarioIndex >= totalInMission - 1;

  // List of completed scenario IDs for jump pills
  const completedScenarioIds = (state.session?.attempts ?? [])
    .filter((a) => a.attemptNumber === 1 && a.selectedAction !== null)
    .map((a) => a.scenarioId);

  // Choice Selection: updates highlighted choice immediately and enables Next Challenge button
  const handleSelectChoice = (choiceId: string) => {
    if (isSubmitting) return;
    setSelectedChoiceId(choiceId);
    setError("");
  };

  // Primary Action: Next Challenge (or Complete Mission)
  // Saves the final response to research backend API and advances
  const handleAdvance = async () => {
    if (!selectedChoiceId || isSubmitting) return;

    // If this scenario was already recorded with the same selection, advance directly
    if (recordedAttempt && recordedAttempt.selectedAction === selectedChoiceId) {
      onNextScenario?.();
      return;
    }

    setIsSubmitting(true);
    setError("");

    const elapsedMs = Math.min(
      86400000,
      Math.max(1000, Date.now() - (startTimeRef.current || Date.now())),
    );

    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await api<{
        session: typeof state.session;
        attempt: Attempt;
      }>("game/attempt", {
        scenarioId: scenario.id,
        action: selectedChoiceId,
        elapsedMs,
        idempotencyKey,
      });

      setRecordedAttempt(res.attempt);
      if (res.session) {
        state.setSession(res.session);
      }
      onCompleteScenario(res.attempt);
      onNextScenario?.();
    } catch (e) {
      setError(
        (e as Error).message ||
          "Failed to save response to research session. Please retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="interactive-challenge-runner"
      role="region"
      aria-label={`Cyber Investigation Challenge ${scenario.id}`}
    >
      {/* =====================================================================
          SECTION A — MISSION HEADER
          ===================================================================== */}
      <CyberMissionHeader
        missionName={currentMission.name}
        ivCode={currentMission.iv}
        challengeIndex={scenarioIndex}
        totalInMission={totalInMission}
        overallCompleted={overallCompleted}
        totalOverall={totalOverall}
        challengeTitle={scenario.title}
        onReturnToHub={onReturnToHub}
        onSelectIndex={onSelectScenarioIndex}
        completedIds={completedScenarioIds}
        missionIds={currentMission.ids}
      />

      {/* 2-Column Responsive Investigation Workstation Layout */}
      <div className="challenge-workstation-grid workstation-2col">
        {/* PRIMARY STAGE: Scenario Briefing & University Evidence Simulator (Questions & Evidence) */}
        <main className="challenge-investigation-stage" aria-label="Scenario Evidence Stage">
          {/* SECTION B — SHORT SCENARIO INTRODUCTION */}
          <ScenarioIntroduction introText={emailData.scenarioIntro} />

          {/* SECTION C — REALISTIC UNIVERSITY EVIDENCE SIMULATOR */}
          <UniversityEmailSimulator emailData={emailData} />
        </main>

        {/* RIGHT SIDE PANEL: Decision Console */}
        <aside
          className="challenge-decision-corner"
          aria-label="Decision Console"
        >
          <div className="decision-corner-sticky-wrapper">
            {/* DECISION POINT: What would you do next? + NEXT CHALLENGE CONTROLS */}
            <div className="decision-action-console-card">
              <ActionSelectionGroup
                choices={scenario.choices}
                selectedChoiceId={selectedChoiceId}
                onSelectChoice={handleSelectChoice}
                disabled={isSubmitting}
              />

              <NextChallengeButton
                isLastChallenge={isLastChallenge}
                hasSelectedAnswer={Boolean(selectedChoiceId)}
                isSubmitting={isSubmitting}
                error={error}
                onAdvance={handleAdvance}
                onPrevious={onPreviousScenario}
                canGoPrevious={scenarioIndex > 0 && Boolean(onPreviousScenario)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
