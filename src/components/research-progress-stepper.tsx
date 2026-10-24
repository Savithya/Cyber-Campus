"use client";

import React from "react";
import { Check } from "lucide-react";

export type ResearchStep = 1 | 2 | 3 | 4;

interface StepDefinition {
  number: ResearchStep;
  numStr: string;
  name: string;
  shortName: string;
}

const STEPS: readonly StepDefinition[] = [
  { number: 1, numStr: "STEP 01", name: "Research Consent", shortName: "Consent" },
  { number: 2, numStr: "STEP 02", name: "Student Profile", shortName: "Profile" },
  { number: 3, numStr: "STEP 03", name: "Cyber Missions", shortName: "Missions" },
  { number: 4, numStr: "STEP 04", name: "Completion", shortName: "Completion" },
] as const;

interface ResearchProgressStepperProps {
  currentStep: ResearchStep;
  completedSteps?: readonly ResearchStep[];
  stepDetail?: string; // Optional subtitle or detail (e.g. "12/20 completed")
  className?: string;
}

export function ResearchProgressStepper({
  currentStep,
  completedSteps,
  stepDetail,
  className = "",
}: ResearchProgressStepperProps) {
  // If completedSteps isn't explicitly provided, default to all steps strictly prior to currentStep
  const isCompleted = (stepNum: ResearchStep): boolean => {
    if (completedSteps) {
      return completedSteps.includes(stepNum);
    }
    return stepNum < currentStep;
  };

  const currentStepObj = STEPS.find((s) => s.number === currentStep) ?? STEPS[0];

  return (
    <div
      className={`research-progress-stepper-container research-progress-stepper ${className}`}
      role="region"
      aria-label="Research Participation Stages"
    >
      {/* Mobile Compact Progress Bar */}
      <div className="stepper-mobile-bar" aria-hidden="true">
        <div className="stepper-mobile-top">
          <span className="stepper-mobile-stage">
            {currentStepObj.numStr} — {currentStepObj.name}
          </span>
          <span className="stepper-mobile-count">
            Stage {currentStep} of 4{stepDetail ? ` · ${stepDetail}` : ""}
          </span>
        </div>
        <div className="stepper-mobile-track">
          <div
            className="stepper-mobile-fill"
            style={{ width: `${((currentStep - 1 + (currentStep === 4 ? 1 : 0.5)) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet Full Horizontal Stepper */}
      <nav
        className="research-stepper-desktop"
        aria-label="Research Study Progress"
      >
        <ol className="stepper-track-list">
          {STEPS.map((step, idx) => {
            const completed = isCompleted(step.number);
            const active = step.number === currentStep;
            const stateClass = completed
              ? active
                ? "completed active"
                : "completed"
              : active
              ? "active"
              : "upcoming";

            return (
              <React.Fragment key={step.number}>
                <li
                  className={`stepper-item ${stateClass}`}
                  aria-current={active ? "step" : undefined}
                >
                  <div className="stepper-node">
                    <span className="stepper-circle">
                      {completed ? (
                        <Check size={16} strokeWidth={2.8} aria-hidden="true" />
                      ) : (
                        <span className="stepper-number">0{step.number}</span>
                      )}
                    </span>
                    <div className="stepper-meta">
                      <span className="stepper-meta-step">{step.numStr}</span>
                      <strong className="stepper-meta-label">
                        {step.name}
                        {active && stepDetail ? (
                          <span className="stepper-meta-detail"> ({stepDetail})</span>
                        ) : null}
                      </strong>
                    </div>
                  </div>
                </li>

                {idx < STEPS.length - 1 && (
                  <li
                    className={`stepper-divider ${
                      completed || (active && isCompleted((step.number + 1) as ResearchStep))
                        ? "completed"
                        : active
                        ? "active-tail"
                        : "upcoming"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
