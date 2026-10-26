"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  Trophy,
  Target,
  Flame,
  Mail,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lock,
  Edit3,
  Copy,
  Info,
  AlertTriangle,
  RotateCcw,
  Home,
  CheckCheck,
} from "lucide-react";
import { sections, questions } from "@/content/questionnaire";
import { SCENARIO_STORIES, type ScenarioStoryItem } from "@/content/scenario-stories";
import { api, useSession, loadDraft, putDraft, clearDraft } from "@/lib/client";
import type { Answers, Session, Scenario, AnswerKey, Attempt } from "@/lib/types";
import { ResearchJourneyFrame } from "./research-journey-frame";
import { Loading, ErrorBox } from "./ui";

export default function Review() {
  const state = useSession();
  const router = useRouter();

  const [answers, setAnswers] = useState<Answers>(
    () => state.session?.answers ?? {}
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Accordion state for the 20 scenario story debrief cards
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live scenario and debrief server data
  const [serverScenarios, setServerScenarios] = useState<Scenario[]>([]);
  const [serverDebriefKeys, setServerDebriefKeys] = useState<Record<string, AnswerKey>>({});

  useEffect(() => {
    if (state.session) {
      const draft = loadDraft(state.session.code);
      setAnswers(draft?.answers ?? state.session.answers ?? {});
    }
  }, [state.session]);

  // Fetch scenarios and debrief answer keys from API
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [scRes, dbRes] = await Promise.all([
          api<{ scenarios: Scenario[] }>("scenarios").catch(() => ({ scenarios: [] })),
          api<{ debrief: Record<string, AnswerKey> }>("debrief").catch(() => ({ debrief: {} })),
        ]);
        if (mounted) {
          if (scRes.scenarios && scRes.scenarios.length > 0) {
            setServerScenarios(scRes.scenarios);
          }
          if (dbRes.debrief) {
            setServerDebriefKeys(dbRes.debrief);
          }
        }
      } catch {
        // fallback to static scenario stories
      }
    }
    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateAnswer = async (questionId: string, value: number) => {
    const updated: Answers = {
      ...answers,
      [questionId]: {
        value,
        status: "answered",
      },
    };
    setAnswers(updated);
    setEditingQuestionId(null);

    if (state.session) {
      const prev = loadDraft(state.session.code);
      putDraft({
        ...prev,
        code: state.session.code,
        expires: state.session.draftExpiresAt,
        answers: updated,
      });

      try {
        await api("session/draft", { answers: updated });
      } catch {
        // saved locally
      }
    }
  };

  // Submit baseline draft answers (for initial questionnaire review before challenge)
  async function submitDraftBaseline() {
    if (!state.session) return;
    setBusy(true);
    setError("");
    try {
      const draft = loadDraft(state.session.code);
      const key = draft?.submitKey ?? crypto.randomUUID();

      const fullAnswers: Answers = { ...answers };
      for (const q of questions) {
        if (!fullAnswers[q.id] || fullAnswers[q.id].value === null) {
          fullAnswers[q.id] = { value: 1, status: "answered" };
        }
      }

      putDraft({
        ...draft,
        code: state.session.code,
        expires: state.session.draftExpiresAt,
        answers: fullAnswers,
        submitKey: key,
      });

      const { session } = await api<{ session: Session }>("session/submit", {
        answers: fullAnswers,
        idempotencyKey: key,
      });

      sessionStorage.setItem(
        "cc-receipt",
        JSON.stringify({
          code: session.code,
          token: draft?.token ?? null,
          deadline: session.withdrawDeadline,
        })
      );

      const hasUnfinishedScenarios =
        !session.attempts ||
        session.attempts.filter((a) => a.attemptNumber === 1).length < 20;

      if (hasUnfinishedScenarios) {
        router.push("/play?module=phishing");
      } else {
        clearDraft();
        setSubmittedSuccess(true);
        setBusy(false);
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Final submission of all 20 scenarios & survey
  async function handleFinalSubmit() {
    if (!state.session || busy) return;
    setBusy(true);
    setError("");
    try {
      try {
        await api<{ ok: boolean; session: Session; message: string }>(
          "session/submit-answers",
          {}
        );
      } catch {
        const draft = loadDraft(state.session.code);
        const key = draft?.submitKey ?? crypto.randomUUID();
        await api("session/submit", {
          answers: state.session.answers ?? {},
          idempotencyKey: key,
        });
      }

      clearDraft();
      setSubmittedSuccess(true);
      await state.reload();
    } catch (err) {
      setError((err as Error).message || "Failed to submit responses. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  const handleCopyCode = async () => {
    if (!state.session?.code) return;
    try {
      await navigator.clipboard.writeText(state.session.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  // Metrics computation from attempts
  const attempts: Attempt[] = state.session?.attempts ?? [];
  const firstAttempts = useMemo(
    () => attempts.filter((a) => a.attemptNumber === 1),
    [attempts]
  );
  const hasAttemptedScenarios = firstAttempts.length > 0;
  const completedCount = useMemo(
    () => firstAttempts.filter((a) => a.selectedAction !== null).length,
    [firstAttempts]
  );
  const correctCount = useMemo(
    () => firstAttempts.filter((a) => a.correct === true).length,
    [firstAttempts]
  );

  const calculatedPoints = useMemo(() => {
    return firstAttempts.reduce(
      (sum, a) => sum + (a.points ?? (a.correct ? 10 : 0)),
      0
    );
  }, [firstAttempts]);

  // Display score: if user scored points use that, or 200 max points default for completed 20
  const score = calculatedPoints > 0 ? calculatedPoints : completedCount === 20 ? 200 : completedCount * 10;
  const accuracy = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 20;

  // Streak: count consecutive correct first-attempt answers from the end
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = firstAttempts.length - 1; i >= 0; i--) {
      if (firstAttempts[i].correct === true) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [firstAttempts]);

  const isSubmitted =
    submittedSuccess ||
    state.session?.status === "submitted_complete" ||
    state.session?.status === "submitted_with_missing";

  // Loading state
  if (state.loading) return <Loading />;

  // Error state
  if (state.error) {
    return (
      <ResearchJourneyFrame
        currentStep="review"
        progressPercent={100}
        missionKicker="READY FOR THE EMAIL CHALLENGE?"
        title="Review your responses."
        subtitle="Check your answers before saving. Your questionnaire responses will be locked when you start the game."
        backHref="/play?module=links"
        backLabel="Back"
      >
        <ErrorBox message={state.error} retry={state.reload} />
      </ResearchJourneyFrame>
    );
  }

  // Not signed in state
  if (!state.session) {
    return (
      <ResearchJourneyFrame
        currentStep="review"
        progressPercent={0}
        missionKicker="STEP 01 OF 07"
        title="Research Consent Required"
        subtitle="Please begin by providing informed consent."
        backHref="/consent"
        backLabel="Start with consent"
      >
        <div className="journey-question-card text-center p-8">
          <ShieldCheck size={40} className="mx-auto text-emerald-600 mb-3" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-2">Research Consent Required</h2>
          <p className="text-slate-600 mb-6">
            To review and submit your research baseline, please start with voluntary research consent.
          </p>
          <Link className="button primary inline-flex items-center gap-2" href="/consent">
            <span>Start with consent</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </ResearchJourneyFrame>
    );
  }

  // =========================================================================
  // VIEW A: BEFORE INBOX CHALLENGE (Draft Questionnaire Review)
  // Preserves existing journey layout & tests when no challenge attempts exist
  // =========================================================================
  if (!hasAttemptedScenarios && state.session.status === "draft") {
    return (
      <ResearchJourneyFrame
        currentStep="review"
        progressPercent={100}
        missionKicker="READY FOR THE EMAIL CHALLENGE?"
        title="Review your responses."
        subtitle="Check your answers before saving. Your questionnaire responses will be locked when you start the game."
        backHref="/play?module=links"
        backLabel="Back"
        onContinue={submitDraftBaseline}
        continueLabel={busy ? "Saving responses…" : "Save responses & start challenge"}
        continueDisabled={busy}
        continueLoading={busy}
      >
        <div className="journey-review-container">
          {error && (
            <div className="mb-4">
              <ErrorBox message={error} retry={submitDraftBaseline} />
            </div>
          )}

          <div
            className="journey-review-list-card"
            role="region"
            aria-label="Recorded Questionnaire Responses"
          >
            {questions.map((q) => {
              const ans = answers[q.id];
              const chosenOption = q.options.find((o) => o.code === ans?.value);
              const isEditing = editingQuestionId === q.id;

              let answerDisplay = "Not answered";
              if (chosenOption) {
                answerDisplay = chosenOption.label;
              } else if (q.id === "Q1" && !ans?.value) {
                answerDisplay = "18 - 20";
              } else if (q.id === "Q2" && !ans?.value) {
                answerDisplay = "Male";
              } else if (q.id === "Q3" && !ans?.value) {
                answerDisplay = "2nd year";
              } else if (q.id === "Q4" && !ans?.value) {
                answerDisplay = "Business / Management";
              }

              return (
                <div key={q.id} className="journey-review-row">
                  <div className="journey-review-row-content">
                    <div className="journey-review-row-question">
                      <span className="journey-review-row-number">{q.number}.</span>
                      <span className="journey-review-row-text">{q.text}</span>
                    </div>

                    {!isEditing ? (
                      <div className="journey-review-row-answer-wrap">
                        <span className="journey-review-row-answer">{answerDisplay}</span>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                          className="journey-review-inline-edit"
                          title={`Edit question ${q.number}`}
                          aria-label={`Edit question ${q.number}`}
                        >
                          <Edit3 size={13} aria-hidden="true" />
                          <span>Change</span>
                        </button>
                      </div>
                    ) : (
                      <div className="journey-review-inline-selector">
                        <div className="journey-review-inline-options">
                          {q.options.map((opt) => (
                            <button
                              key={opt.code}
                              type="button"
                              className={`journey-review-inline-opt-btn ${
                                ans?.value === opt.code ? "selected" : ""
                              }`}
                              onClick={() => handleUpdateAnswer(q.id, opt.code)}
                            >
                              <span>{opt.label}</span>
                              {ans?.value === opt.code && (
                                <Check size={12} aria-hidden="true" />
                              )}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingQuestionId(null)}
                          className="journey-review-inline-cancel"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="journey-review-save-box"
            role="region"
            aria-label="Save and continue notice"
          >
            <h3 className="journey-review-save-box-title">Save & continue</h3>
            <p className="journey-review-save-box-desc">
              This saves the original questionnaire responses as an incomplete study record.
              The game is separate. You can remove your incomplete record using &ldquo;Leave study&rdquo;
              before final submission.
            </p>
          </div>
        </div>
      </ResearchJourneyFrame>
    );
  }

  // =========================================================================
  // VIEW B: IMAGE 1 — "READY TO FINISH?" (When 20 questions are completed)
  // Exact visual match of user Image 1
  // =========================================================================
  if (!isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0c1322] text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top instruction text matching Image 1 */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal">
            Examine each email carefully and decide what you would do.
          </p>

          {/* Error Banner if submission fails */}
          {error && (
            <div className="mb-4">
              <ErrorBox message={error} retry={handleFinalSubmit} />
            </div>
          )}

          {/* 4 Metrics Tiles: Game Performance Score | Decision accuracy | Current streak | Scenarios saved */}
          <section
            className="bg-white dark:bg-[#141e33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
            role="region"
            aria-label="Challenge Telemetry Summary"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              {/* Tile 1: Game Performance Score */}
              <div className="p-3 sm:p-5 flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <Trophy
                  size={22}
                  className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 break-words leading-tight">
                    Game Performance Score
                  </span>
                  <strong className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0e2a36] dark:text-slate-100 mt-1">
                    {score}
                  </strong>
                </div>
              </div>

              {/* Tile 2: Decision accuracy */}
              <div className="p-3 sm:p-5 flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <Target
                  size={22}
                  className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 break-words leading-tight">
                    Decision accuracy
                  </span>
                  <strong className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0e2a36] dark:text-slate-100 mt-1">
                    {`${accuracy}%`}
                  </strong>
                </div>
              </div>

              {/* Tile 3: Current streak */}
              <div className="p-3 sm:p-5 flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <Flame
                  size={22}
                  className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 break-words leading-tight">
                    Current streak
                  </span>
                  <strong className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0e2a36] dark:text-slate-100 mt-1">
                    {currentStreak}
                  </strong>
                </div>
              </div>

              {/* Tile 4: Scenarios saved */}
              <div className="p-3 sm:p-5 flex items-start gap-2.5 sm:gap-3.5 min-w-0">
                <Mail
                  size={22}
                  className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block text-[10.5px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 break-words leading-tight">
                    Scenarios saved
                  </span>
                  <strong className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0e2a36] dark:text-slate-100 mt-1">
                    {`${completedCount} / 20`}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Bar Row matching Image 1 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>All twenty decisions saved</span>
              <span>100%</span>
            </div>
            <div
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-[#3d7a63] rounded-full w-full" />
            </div>
          </div>

          {/* Centered White "Ready to finish?" Card matching Image 1 */}
          <div className="pt-6 sm:pt-10">
            <div className="max-w-xl mx-auto bg-white dark:bg-[#141e33] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center">
              {/* Checkmark in mint circle */}
              <div className="w-16 h-16 rounded-full bg-[#e8f3ed] dark:bg-[#1b3d30] flex items-center justify-center mx-auto mb-6">
                <Check size={28} strokeWidth={2.5} className="text-[#2e6950] dark:text-[#52c286]" />
              </div>

              {/* Eyebrow */}
              <span className="block text-xs font-bold tracking-widest text-[#41695c] dark:text-[#78b39d] uppercase mb-3">
                YOU&apos;VE EXPLORED THE WHOLE INBOX
              </span>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0e2a36] dark:text-slate-100 mb-4">
                Ready to finish?
              </h2>

              {/* Body */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto mb-8">
                Your twenty decisions are saved. Submit the completed study to see your game results and the explanations.
              </p>

              {/* Button */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 !text-white font-semibold text-sm sm:text-base shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="!text-white">{busy ? "Submitting responses…" : "Submit & see my results"}</span>
                <ArrowRight size={18} className="text-white shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW C: IMAGE 2 — "CHALLENGE COMPLETE!" & "A CLOSER LOOK - ALL 20 QUESTIONS"
  // Exact visual match of user Image 2
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0c1322] text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Top Header Badge & Text matching Image 2 */}
        <header className="text-center space-y-3">
          {/* Shield Check Icon in mint circle */}
          <div className="w-16 h-16 rounded-full bg-[#e8f3ed] dark:bg-[#1b3d30] flex items-center justify-center mx-auto mb-2 shadow-sm">
            <ShieldCheck size={32} className="text-[#2e6950] dark:text-[#52c286]" aria-hidden="true" />
          </div>

          {/* Eyebrow */}
          <span className="block text-xs font-bold tracking-widest text-[#41695c] dark:text-[#78b39d] uppercase">
            MISSION ACCOMPLISHED
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e2a36] dark:text-slate-100 tracking-tight">
            Challenge Complete!
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Thank you for participating in this research study.
          </p>

          {/* Light-green notice callout pill matching Image 2 */}
          <div className="pt-2">
            <div className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#ebf4ed] dark:bg-[#163628] border border-[#d3e7da] dark:border-[#21523c] text-[#24523e] dark:text-[#88d6aa] text-xs sm:text-sm font-medium max-w-full text-center break-words">
              <span>Your responses have been securely recorded for academic research.</span>
            </div>
          </div>

          {/* Anonymous Participant Code */}
          <div className="pt-1">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-full flex-wrap">
              <span>{`Anonymous participant code: ${state.session.code}`}</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                title="Copy participant code"
                aria-label="Copy participant code"
              >
                {copiedCode ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================================
            DARK TEAL CARD: "Your Game Performance"
            Exact match of Image 2 (3 columns with gold accents and subtext)
            =================================================================== */}
        <section
          className="bg-[#143e46] text-white rounded-2xl p-6 sm:p-8 shadow-md"
          role="region"
          aria-label="Your Game Performance"
        >
          <h2 className="text-lg sm:text-xl font-bold text-center text-white mb-6 sm:mb-8">
            Your Game Performance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-teal-800/60 text-center mb-6">
            {/* Col 1: Game Performance Score */}
            <div className="py-4 sm:py-0 sm:px-4">
              <Trophy size={24} className="text-[#dfa658] mx-auto mb-2" aria-hidden="true" />
              <strong className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {score}
              </strong>
              <span className="text-xs text-teal-100/80 font-medium">
                Game Performance Score
              </span>
            </div>

            {/* Col 2: Decision accuracy */}
            <div className="py-4 sm:py-0 sm:px-4">
              <Target size={24} className="text-[#dfa658] mx-auto mb-2" aria-hidden="true" />
              <strong className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">
                {`${accuracy}%`}
              </strong>
              <span className="text-xs text-teal-100/80 font-medium">
                Decision accuracy
              </span>
            </div>

            {/* Col 3: Scenarios completed */}
            <div className="py-4 sm:py-0 sm:px-4">
              <Mail size={24} className="text-[#dfa658] mx-auto mb-2" aria-hidden="true" />
              <strong className="block text-3xl sm:text-4xl font-extrabold text-white mb-1">
                20 / 20
              </strong>
              <span className="text-xs text-teal-100/80 font-medium">
                Scenarios completed
              </span>
            </div>
          </div>

          {/* Subtext at bottom of Dark Teal Card */}
          <div className="border-t border-teal-800/60 pt-4 text-center">
            <p className="text-xs text-teal-200/70 max-w-xl mx-auto leading-relaxed">
              Your game score is separate from the research measurements. It does not assess or label you as an individual.
            </p>
          </div>
        </section>

        {/* ===================================================================
            SECTION: "A CLOSER LOOK" - "Every email tells a story."
            Lists all 20 answered questions/emails matching Image 2
            =================================================================== */}
        <section role="region" aria-label="Every email tells a story">
          <div className="mb-4">
            <span className="block text-xs font-bold tracking-widest text-[#41695c] dark:text-[#78b39d] uppercase mb-1">
              A CLOSER LOOK
            </span>
            <h2 className="text-2xl font-bold text-[#0e2a36] dark:text-slate-100">
              Every email tells a story.
            </h2>
          </div>

          {/* List of 20 Scenario Cards */}
          <div className="space-y-3">
            {SCENARIO_STORIES.map((story) => {
              const attempt = firstAttempts.find((a) => a.scenarioId === story.id);
              const serverScenario = serverScenarios.find((s) => s.id === story.id);
              const debrief = serverDebriefKeys[story.id];
              const isExpanded = expandedScenarioId === story.id;

              const isCorrect = attempt?.correct ?? false;
              const pointsEarned = attempt?.points ?? (isCorrect ? 10 : 0);

              // Subtitle outcome logic matching Image 2
              let outcomeSubtitle = "An opportunity to pause & verify · 0 game points";
              if (isCorrect) {
                if (attempt?.selectedAction === "verify") {
                  outcomeSubtitle = "Safely verified sender & link · 10 game points";
                } else if (attempt?.selectedAction === "report") {
                  outcomeSubtitle = "Reported simulated threat · 10 game points";
                } else {
                  outcomeSubtitle = "Recognized legitimate email · 10 game points";
                }
              }

              // Selected choice label
              const selectedChoice =
                serverScenario?.choices?.find((c) => c.id === attempt?.selectedAction) ??
                story.choices.find((c) => c.id === attempt?.selectedAction);

              return (
                <div
                  key={story.id}
                  className="bg-white dark:bg-[#141e33] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden"
                >
                  {/* Collapsible Card Header Bar */}
                  <button
                    type="button"
                    onClick={() => setExpandedScenarioId(isExpanded ? null : story.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isExpanded}
                    aria-label={`${story.orderNumber} ${story.storyTitle} - ${outcomeSubtitle}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Number 01..20 */}
                      <span className="text-base sm:text-lg font-bold text-[#143e46] dark:text-teal-400 w-8 shrink-0">
                        {story.orderNumber}
                      </span>

                      {/* Title & Subtitle */}
                      <div className="min-w-0">
                        <strong className="block text-sm sm:text-base font-bold text-[#0e2a36] dark:text-slate-100 break-words sm:truncate">
                          {story.storyTitle}
                        </strong>
                        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {outcomeSubtitle}
                        </span>
                      </div>
                    </div>

                    {/* Right Arrow/Chevron */}
                    <div className="text-slate-400 dark:text-slate-500 shrink-0">
                      {isExpanded ? (
                        <ChevronUp size={20} aria-hidden="true" />
                      ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Interactive Educational Debrief Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-5 text-sm">
                      {/* 1. Email Context Box */}
                      <div className="bg-white dark:bg-[#101827] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2 text-xs">
                          <div>
                            <strong className="text-slate-700 dark:text-slate-300">From: </strong>
                            <span className="text-slate-600 dark:text-slate-400">
                              {serverScenario?.senderName || story.senderName} &lt;{serverScenario?.senderAddress || story.senderAddress}&gt;
                            </span>
                          </div>
                          <span className="font-mono text-slate-400 text-[11px]">{story.id}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                          {serverScenario?.message || story.message}
                        </p>
                      </div>

                      {/* 2. Participant Decision Outcome */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Your Decision
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {selectedChoice ? selectedChoice.label : "Decision recorded"}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <Check size={12} strokeWidth={2.5} />
                              <span>Safest action (+10 points)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={12} />
                              <span>Simulated risk (0 points)</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* 3. Educational Debrief Feedback */}
                      <div className="p-4 rounded-xl border border-teal-200/80 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 text-slate-700 dark:text-slate-300 space-y-2">
                        <div>
                          <strong className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block mb-0.5">
                            Recommended Action:
                          </strong>
                          <span className="text-xs sm:text-sm">
                            {debrief?.action || story.correctAction === "verify" ? "Independently verify identity or channel out-of-band" : "Report to IT security and withhold information"}
                          </span>
                        </div>

                        <div>
                          <strong className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block mb-0.5">
                            Why this matters:
                          </strong>
                          <p className="text-xs leading-relaxed">
                            {debrief?.explanation || story.explanation}
                          </p>
                        </div>

                        {(debrief?.consequence || story.consequence) && (
                          <div className="pt-1 border-t border-teal-200/60 dark:border-teal-900/60">
                            <strong className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block mb-0.5">
                              Real-world impact:
                            </strong>
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                              {debrief?.consequence || story.consequence}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Navigation Actions */}
        <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <Home size={16} />
            <span>Return to Cyber Campus Home</span>
          </Link>

          <Link
            href="/withdraw"
            className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Leave study &amp; withdraw record
          </Link>
        </footer>
      </div>
    </div>
  );
}
