"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Target,
  Flame,
  Mail,
  Star,
  MoreHorizontal,
  Search,
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Phone,
  PhoneIncoming,
  MessagesSquare,
  Paperclip,
  Shield,
  Info,
} from "lucide-react";
import { api, useSession } from "@/lib/client";
import { missions } from "@/content/missions";
import type { Scenario, Attempt } from "@/lib/types";
import {
  getScenarioEmailData,
  type EmailMetadata,
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
  onReturnToHub?: () => void;
  previousAttempt?: Attempt;
  educationalMode?: boolean;
}

export function InteractiveChallengeRunner({
  scenario,
  missionId,
  scenarioIndex,
  totalInMission,
  onCompleteScenario,
  onNextScenario,
  previousAttempt,
}: InteractiveChallengeRunnerProps) {
  const state = useSession();
  const startTimeRef = useRef<number>(0);

  // Active answer selection state
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    previousAttempt?.selectedAction ?? null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recordedAttempt, setRecordedAttempt] = useState<Attempt | null>(
    previousAttempt ?? null,
  );
  const [error, setError] = useState<string>("");

  // UI Interactive States
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [showOptionsDropdown, setShowOptionsDropdown] =
    useState<boolean>(false);
  const [showRFCHeaders, setShowRFCHeaders] = useState<boolean>(false);
  const [showLinkSimModal, setShowLinkSimModal] = useState<boolean>(false);
  const [showRedFlags, setShowRedFlags] = useState<boolean>(false);
  const [checkedRedFlags, setCheckedRedFlags] = useState<
    Record<string, boolean>
  >({});

  // Reset or initialize state when scenario changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedChoiceId(previousAttempt?.selectedAction ?? null);
    setRecordedAttempt(previousAttempt ?? null);
    setError("");
    setShowRFCHeaders(false);
    setShowLinkSimModal(false);
    setShowOptionsDropdown(false);
    setCheckedRedFlags({});
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scenario.id, previousAttempt]);

  const currentMission =
    missions.find((m) => m.id === missionId) ?? missions[0];
  const emailData: EmailMetadata = getScenarioEmailData(scenario);

  // Session Attempts & Performance Calculations
  const allAttempts = state.session?.attempts ?? [];
  const firstAttempts = allAttempts.filter(
    (a) => a.attemptNumber === 1 && a.selectedAction !== null,
  );

  // 1. Game Performance Score
  const performanceScore =
    firstAttempts.filter((a) => a.correct === true || a.unsafe === false)
      .length * 10;

  // 2. Decision accuracy
  const correctCount = firstAttempts.filter((a) => a.correct === true).length;
  const decisionAccuracy =
    firstAttempts.length > 0
      ? `${Math.round((correctCount / firstAttempts.length) * 100)}%`
      : "—";

  // 3. Current streak
  let currentStreak = 0;
  for (let i = firstAttempts.length - 1; i >= 0; i--) {
    if (
      firstAttempts[i].correct === true ||
      firstAttempts[i].unsafe === false
    ) {
      currentStreak++;
    } else {
      break;
    }
  }

  // 4. Scenarios saved in this mission
  const savedInMissionCount = currentMission.ids.filter((id) =>
    firstAttempts.some((a) => a.scenarioId === id),
  ).length;

  // Choice Selection
  const handleSelectChoice = (choiceId: string) => {
    if (isSubmitting) return;
    setSelectedChoiceId(choiceId);
    setError("");
  };

  // Lock decision & continue
  const handleAdvance = async () => {
    if (!selectedChoiceId || isSubmitting) return;

    if (
      recordedAttempt &&
      recordedAttempt.selectedAction === selectedChoiceId
    ) {
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
          "Failed to record response in study session. Please retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine Red Flag indicators
  const redFlagList =
    scenario.mediaDetails?.warningIndicators &&
    scenario.mediaDetails.warningIndicators.length > 0
      ? scenario.mediaDetails.warningIndicators
      : scenario.evidence && scenario.evidence.length > 0
        ? scenario.evidence.map((ev) => ev.label)
        : [
            "Domain address verification mismatch",
            "Artificial deadline & psychological pressure",
            "Unverified external link destination",
          ];

  // Helper for toggleable red flag checklist
  const toggleRedFlag = (flag: string) => {
    setCheckedRedFlags((prev) => ({
      ...prev,
      [flag]: !prev[flag],
    }));
  };

  const progressPercent = Math.round((scenarioIndex / totalInMission) * 100);

  // Dynamic header icon based on communicationType
  const getHeaderIcon = () => {
    if (emailData.communicationType === "call") {
      return (
        <Phone
          size={18}
          className="text-slate-600 dark:text-slate-300"
          aria-hidden="true"
        />
      );
    }
    if (emailData.communicationType === "message") {
      return (
        <MessagesSquare
          size={18}
          className="text-slate-600 dark:text-slate-300"
          aria-hidden="true"
        />
      );
    }
    return (
      <Mail
        size={18}
        className="text-slate-600 dark:text-slate-300"
        aria-hidden="true"
      />
    );
  };

  const getHeaderTitle = () => {
    if (emailData.communicationType === "call")
      return "Challenge incoming call";
    if (emailData.communicationType === "message") return "Challenge message";
    return "Challenge inbox";
  };

  return (
    <div className="cyber-step-investigation-layout w-full max-w-6xl mx-auto space-y-6">
      {/* =====================================================================
          1. 4-METRIC TOP STATS BANNER
          ===================================================================== */}
      <section
        className="cyber-metrics-banner bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
        role="region"
        aria-label="Simulation Performance Telemetry"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
          {/* Metric 1: Game Performance Score */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Trophy
                size={16}
                className="text-amber-500 shrink-0"
                aria-hidden="true"
              />
              <span>Game Performance Score</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {performanceScore}
            </div>
          </div>

          {/* Metric 2: Decision Accuracy */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Target
                size={16}
                className="text-teal-600 dark:text-teal-400 shrink-0"
                aria-hidden="true"
              />
              <span>Decision accuracy</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {decisionAccuracy}
            </div>
          </div>

          {/* Metric 3: Current Streak */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Flame
                size={16}
                className="text-orange-500 shrink-0"
                aria-hidden="true"
              />
              <span>Current streak</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {currentStreak}
            </div>
          </div>

          {/* Metric 4: Scenarios Saved */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Mail
                size={16}
                className="text-sky-600 dark:text-sky-400 shrink-0"
                aria-hidden="true"
              />
              <span>Scenarios saved</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {savedInMissionCount} / {totalInMission}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SCENARIO PROGRESS BAR ROW
          ===================================================================== */}
      <section
        className="scenario-progress-bar-row space-y-1.5"
        aria-label="Scenario progress"
      >
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 px-0.5">
          <span>
            Scenario {scenarioIndex + 1} of {totalInMission}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div
          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={scenarioIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalInMission}
        >
          <div
            className="h-full bg-slate-500 dark:bg-teal-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* =====================================================================
          3. TWO-COLUMN INVESTIGATION WORKSTATION
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start workstation-2col">
        {/* ===================================================================
            LEFT COLUMN: THE SIMULATED CHALLENGE INBOX / EVIDENCE ARTIFACT
            =================================================================== */}
        <div className="lg:col-span-7 challenge-investigation-stage bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30">
            <div className="flex items-center gap-2.5">
              {getHeaderIcon()}
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 font-bold">
                  SCENARIO BRIEFING ·
                </span>
                {getHeaderTitle()}
              </span>
              <span className="sr-only">
                Inspect the communication below before deciding
              </span>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className="p-1 text-slate-400 hover:text-amber-500 transition-colors rounded focus:outline-none"
                aria-label={isStarred ? "Unstar scenario" : "Star scenario"}
                title="Star scenario"
              >
                <Star
                  size={18}
                  className={isStarred ? "fill-amber-400 text-amber-500" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded focus:outline-none"
                aria-label="Simulation options"
                title="More options"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Quick Actions Dropdown */}
              {showOptionsDropdown && (
                <div className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRFCHeaders(!showRFCHeaders);
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Info size={14} className="text-teal-600" />
                    <span>
                      {showRFCHeaders
                        ? "Hide Security Headers"
                        : "Inspect Security Headers"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedFlags(true);
                      setShowOptionsDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Search size={14} className="text-amber-500" />
                    <span>Open Red Flag Hunt</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email / Evidence Content Body */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Kicker */}
            <div className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase font-mono">
              SIMULATED{" "}
              {emailData.communicationType === "call"
                ? "CALL"
                : emailData.communicationType === "message"
                  ? "SMS"
                  : "EMAIL"}{" "}
              · {scenarioIndex + 1} / {totalInMission}
            </div>

            {/* Subject / Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {emailData.subject}
            </h2>

            {/* Sender Metadata Block */}
            <div className="flex items-start gap-3.5 pt-1">
              <div
                className="w-10 h-10 rounded-full bg-[#dbeee2] dark:bg-[#1c382b] text-[#1c6439] dark:text-[#52c286] font-bold text-base flex items-center justify-center shrink-0 select-none"
                aria-hidden="true"
              >
                {emailData.senderInitials || "S"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {emailData.senderName}
                  </strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                    {emailData.senderEmail}
                    <button
                      type="button"
                      onClick={() => setShowRFCHeaders(!showRFCHeaders)}
                      className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Inspect envelope domain and security headers"
                      aria-label="Inspect envelope domain and security headers"
                    >
                      <Search size={13} />
                    </button>
                  </span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  To: you, the participant · {emailData.timestamp}
                </div>
              </div>
            </div>

            {/* Technical Header Inspector Drawer */}
            {showRFCHeaders && (
              <div
                className="mt-3 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1.5"
                role="region"
                aria-label="RFC Security Header Telemetry"
              >
                <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 font-semibold text-[11px] uppercase tracking-wider pb-1 border-b border-teal-200/60 dark:border-teal-900/60">
                  <span className="flex items-center gap-1.5">
                    <Shield size={13} /> Envelope Authentication Results
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRFCHeaders(false)}
                    className="text-slate-400 hover:text-slate-700 text-[10px]"
                  >
                    Hide
                  </button>
                </div>
                <div className="pt-1 space-y-1 text-[11px] leading-relaxed">
                  <div>
                    <strong className="text-slate-500">Return-Path:</strong>{" "}
                    {emailData.rfcHeaders?.returnPath ||
                      `<bounce@${scenario.senderAddress}>`}
                  </div>
                  <div>
                    <strong className="text-slate-500">Authentication:</strong>{" "}
                    {emailData.rfcHeaders?.spfResult ||
                      "spf=softfail (mismatch)"}
                  </div>
                  <div>
                    <strong className="text-slate-500">DKIM-Domain:</strong>{" "}
                    {emailData.rfcHeaders?.dkimDomain ||
                      "unverified-relay.test"}
                  </div>
                  <div>
                    <strong className="text-slate-500">Originating-IP:</strong>{" "}
                    {emailData.rfcHeaders?.originatingIp || "198.51.100.42"}
                  </div>
                </div>
              </div>
            )}

            {/* Divider Line */}
            <hr className="border-t border-slate-100 dark:border-slate-800 my-3" />

            {/* Message Body Content */}
            <div className="space-y-3.5 text-sm md:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              {emailData.bodyParagraphs &&
              emailData.bodyParagraphs.length > 0 ? (
                emailData.bodyParagraphs.map((paragraph, pIdx) => (
                  <p key={pIdx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>{scenario.message}</p>
              )}

              {/* Call Transcript Audio Display if Call Scenario */}
              {emailData.communicationType === "call" &&
                emailData.callAudioTranscript && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <PhoneIncoming size={14} className="text-teal-600" />
                      <span>Call Audio Transcript</span>
                    </div>
                    {emailData.callAudioTranscript.map((line, lIdx) => (
                      <p
                        key={lIdx}
                        className="text-xs italic text-slate-600 dark:text-slate-300"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}

              {/* Attachment preview if applicable */}
              {emailData.attachment && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 mt-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Paperclip size={18} className="text-amber-500 shrink-0" />
                    <div className="text-xs min-w-0">
                      <strong className="block font-medium text-slate-800 dark:text-slate-200 truncate">
                        {emailData.attachment.name}
                      </strong>
                      <span className="text-slate-400">
                        {emailData.attachment.size} · Simulated inactive payload
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/40 px-2 py-0.5 rounded shrink-0">
                    Inactive
                  </span>
                </div>
              )}

              {/* Simulated Interactive CTA Button */}
              {emailData.linkCta && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLinkSimModal(!showLinkSimModal)}
                    aria-expanded={showLinkSimModal}
                    aria-label={`Simulated link: ${emailData.linkCta.buttonText}. Click to safely inspect destination.`}
                    className="simulated-safe-link-btn group inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold !text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[44px] w-full sm:w-auto text-center break-words focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <span className="break-words !text-white">
                      {emailData.linkCta.buttonText}
                    </span>
                    <ArrowRight
                      size={15}
                      className="shrink-0 transition-transform group-hover:translate-x-0.5 text-white"
                      aria-hidden="true"
                    />
                  </button>

                  {/* Simulated Link Safety Notice Popup */}
                  {showLinkSimModal && (
                    <div className="mt-2.5 p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-1 break-words">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Lock size={13} className="shrink-0" /> Simulated
                        Inactive Link
                      </div>
                      <p className="text-[11px] break-all">
                        Destination:{" "}
                        <code className="font-mono break-all">
                          {emailData.linkCta.destinationUrl}
                        </code>
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                        This simulated link is disabled for participant safety.
                        In real cyber attacks, clicking this leads to credential
                        harvesting.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Notice */}
          <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
            <Lock
              size={13}
              className="text-slate-400 shrink-0"
              aria-hidden="true"
            />
            <span>All links and attachments are fictional and inactive.</span>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN: "YOUR CALL" DECISION CONSOLE
            =================================================================== */}
        <div className="lg:col-span-5 challenge-decision-corner bg-white dark:bg-[#141e33] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm sticky top-6 space-y-4 sm:space-y-5">
          {/* Eyebrow & Title */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              DECISION POINT · YOUR CALL
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              What would you do?
            </h3>
            <span className="sr-only">What would you do next?</span>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Choose the action closest to what you would actually do.
            </p>
          </div>

          {/* 4 Decision Choice Cards (A, B, C, D) */}
          <div
            className="space-y-2.5 pt-1"
            role="radiogroup"
            aria-label="Action choices"
          >
            {scenario.choices.map((choice, cIndex) => {
              const letter = String.fromCharCode(65 + cIndex); // A, B, C, D
              const isSelected = selectedChoiceId === choice.id;

              return (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSubmitting}
                  onClick={() => handleSelectChoice(choice.id)}
                  className={`interactive-action-card w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center gap-2.5 sm:gap-3.5 cursor-pointer min-h-[48px] ${
                    isSelected
                      ? "selected border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/20 dark:ring-blue-400/25 bg-blue-50/70 dark:bg-blue-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141e33] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Badge [ A ], [ B ], [ C ], [ D ] */}
                  <div
                    className={`action-letter-badge w-7 h-7 rounded-md border font-semibold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 !text-white dark:bg-blue-500 dark:!text-white border-blue-600 dark:border-blue-500 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    {letter}
                  </div>

                  {/* Option Label */}
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug flex-1 break-words min-w-0">
                    {choice.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Red Flag Hunt (Optional bonus feature) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowRedFlags(!showRedFlags)}
              className="w-full flex items-center justify-between text-xs py-2 px-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Search size={14} className="text-slate-500" />
                <span>Red Flag Hunt</span>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Optional bonus
              </span>
            </button>

            {/* Expandable Red Flag Hunt Checklist */}
            {showRedFlags && (
              <div className="mt-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2 text-xs">
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  Can you spot the suspicious indicators in this scenario?
                </p>
                <div className="space-y-1.5 pt-1">
                  {redFlagList.map((flag, fIdx) => {
                    const isFound = Boolean(checkedRedFlags[flag]);
                    return (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => toggleRedFlag(flag)}
                        className={`w-full text-left p-2 rounded-lg border flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isFound
                            ? "border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100/60"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isFound
                              ? "bg-teal-600 border-teal-600 text-white"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                          }`}
                        >
                          {isFound && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="text-xs leading-tight flex-1">
                          {flag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Error Alert with Retry */}
          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={handleAdvance}
                disabled={isSubmitting}
                className="p-1 text-red-600 hover:underline shrink-0 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* Primary Action Button: Lock decision & continue */}
          <div className="pt-1">
            <button
              type="button"
              disabled={!selectedChoiceId || isSubmitting}
              onClick={handleAdvance}
              aria-label="Lock decision and continue"
              className={`primary-next-btn group w-full min-h-[48px] py-3.5 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                !selectedChoiceId || isSubmitting
                  ? "bg-slate-100 hover:bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:hover:bg-slate-800/80 dark:text-slate-500 border border-slate-200 dark:border-slate-700/70 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 !text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:!text-white shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.99] cursor-pointer border border-transparent"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin shrink-0 text-white"
                    aria-hidden="true"
                  />
                  <span className="!text-white">Locking decision...</span>
                </>
              ) : (
                <>
                  <span className="!text-white">Lock decision &amp; continue</span>
                  <span className="sr-only">Next Challenge</span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-transform text-white ${
                      selectedChoiceId
                        ? "group-hover:translate-x-0.5"
                        : "opacity-60"
                    }`}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            {/* Microcopy disclaimer */}
            <p className="text-[10px] sm:text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2.5 leading-normal">
              Your actual choice is recorded. Explanations appear after final
              submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
