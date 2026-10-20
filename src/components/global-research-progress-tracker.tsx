"use client";

import React from "react";
import {
  ShieldCheck,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { missions, getActiveMissions } from "@/content/missions";
import type { Attempt, Session } from "@/lib/types";

interface GlobalResearchProgressTrackerProps {
  attempts: Attempt[];
  activeMissionId?: string | null;
  onSelectMission?: (missionId: string) => void;
  compact?: boolean;
}

const missionIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};

export function GlobalResearchProgressTracker({
  attempts,
  activeMissionId,
  onSelectMission,
  compact = false,
}: GlobalResearchProgressTrackerProps) {
  const activeModules = getActiveMissions(false);
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);

  // Set of scenario IDs completed (counted once per scenario)
  const completedScenarioIds = new Set(
    firstAttempts
      .filter((a) => a.selectedAction !== null)
      .map((a) => a.scenarioId),
  );

  const totalCompleted = completedScenarioIds.size;
  const totalRequired = 20;
  const overallPercentage = Math.min(100, Math.round((totalCompleted / totalRequired) * 100));

  // Compute status for each of the 4 active research missions
  const moduleProgress = activeModules.map((m) => {
    const completedInModule = m.ids.filter((id) => completedScenarioIds.has(id)).length;
    const isCompleted = completedInModule === m.ids.length;
    const isStarted = completedInModule > 0;
    const status = isCompleted ? "Completed" : isStarted ? "In Progress" : "Not Started";
    const percentage = Math.round((completedInModule / m.ids.length) * 100);
    const Icon = missionIcons[m.icon] || Mail;

    return {
      ...m,
      completedInModule,
      totalInModule: m.ids.length,
      percentage,
      status,
      Icon,
      isActive: activeMissionId === m.id,
    };
  });

  if (compact) {
    return (
      <div className="global-progress-tracker compact-mode" role="region" aria-label="Research Progress Tracker">
        <div className="overall-progress-header flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-cyan">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Overall Research Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <strong className="text-primary font-mono">{totalCompleted} / {totalRequired} Challenges</strong>
            <span className="text-muted">({overallPercentage}%)</span>
          </div>
        </div>

        {/* Smooth horizontal progress bar */}
        <div className="progress-bar-track mt-1.5" role="progressbar" aria-valuenow={overallPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-bar-fill animated"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>

        {/* 4 Mini indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {moduleProgress.map((mod) => (
            <div
              key={mod.id}
              className={`mini-mod-chip ${mod.status.toLowerCase().replace(" ", "-")} ${mod.isActive ? "active-chip" : ""}`}
            >
              <mod.Icon size={13} className="mod-chip-icon" aria-hidden="true" />
              <span className="mod-chip-label truncate">{mod.name.split(" ")[0]}</span>
              <span className="mod-chip-count font-mono">{mod.completedInModule}/{mod.totalInModule}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="global-progress-tracker full-mode card p-5 mb-6" role="region" aria-label="Global Research Progress Tracker">
      {/* Header with Title and Global Metrics */}
      <div className="tracker-top flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan" aria-hidden="true" />
            <h3 className="tracker-title text-base font-bold">Overall Research Progress</h3>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Complete all 20 interactive challenges across the four independent variables (IV1–IV4).
          </p>
        </div>

        <div className="tracker-metrics-badge flex items-center gap-3 bg-card-alt px-3 py-1.5 rounded-lg border">
          <div className="text-right">
            <span className="text-xs text-muted block">Challenges Completed</span>
            <strong className="text-sm font-mono font-bold text-primary">
              {totalCompleted} / {totalRequired}
            </strong>
          </div>
          <div className="percentage-circle font-mono font-bold text-base text-emerald px-2 py-0.5 rounded bg-emerald/10">
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="overall-bar-container mt-4">
        <div
          className="progress-bar-track large"
          role="progressbar"
          aria-valuenow={overallPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall Research Progress: ${overallPercentage}%`}
        >
          <div
            className="progress-bar-fill animated gradient-fill"
            style={{ width: `${Math.max(2, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Four Individual Mission Progress Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {moduleProgress.map((mod) => {
          const isSelected = activeMissionId === mod.id;
          return (
            <div
              key={mod.id}
              className={`module-progress-item p-3 rounded-lg border transition-all ${
                isSelected ? "border-cyan bg-cyan/5 shadow-sm" : "border-border/60 bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${mod.color} bg-card`}>
                    <mod.Icon size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block leading-tight">{mod.name}</span>
                    <span className="text-[10px] text-muted">{mod.iv}</span>
                  </div>
                </div>

                <span
                  className={`status-pill text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    mod.status === "Completed"
                      ? "bg-emerald/15 text-emerald border border-emerald/30"
                      : mod.status === "In Progress"
                        ? "bg-cyan/15 text-cyan border border-cyan/30"
                        : "bg-muted/20 text-muted"
                  }`}
                >
                  {mod.status}
                </span>
              </div>

              {/* Progress Bar within Mission */}
              <div className="flex items-center justify-between text-xs mt-1 text-muted">
                <span className="text-[11px] font-mono">{mod.completedInModule} of {mod.totalInModule} Completed</span>
                <span className="text-[11px] font-mono font-semibold">{mod.percentage}%</span>
              </div>

              <div className="progress-bar-track small mt-1">
                <div
                  className={`progress-bar-fill ${mod.status === "Completed" ? "bg-emerald" : "bg-cyan"}`}
                  style={{ width: `${mod.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
