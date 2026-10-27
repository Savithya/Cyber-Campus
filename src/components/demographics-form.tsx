"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, RotateCcw, Lock } from "lucide-react";
import {
  api,
  useSession,
  loadDraft,
  putDraft,
  randomToken,
  clearParticipationStorage,
} from "@/lib/client";
import { questions } from "@/content/questionnaire";
import type { Answers, Session } from "@/lib/types";
import { ResearchJourneyFrame } from "./research-journey-frame";
import { Loading } from "./ui";

export function DemographicsForm() {
  const router = useRouter();
  const state = useSession();

  const [answers, setAnswers] = useState<Record<string, number | null>>({
    Q1: null,
    Q2: null,
    Q3: null,
    Q4: null,
  });
  const [saving, setSaving] = useState(false);
  const [, setSaveStatus] = useState<string>("Draft stored in session");
  const [error, setError] = useState<string>("" );
  const [validationError, setValidationError] = useState<string>("");
  const [missingQuestionIds, setMissingQuestionIds] = useState<string[]>([]);
  const [resettingParticipant, setResettingParticipant] = useState(false);

  const handleStartNewParticipant = async () => {
    setResettingParticipant(true);
    setError("");
    setValidationError("");
    try {
      const currentCode = state.session?.code;
      const storedLastCode = typeof window !== "undefined" ? localStorage.getItem("cc_last_participant_code") : null;
      const clientLastCode = currentCode || storedLastCode;
      clearParticipationStorage();
      const res = await api<{ session: Session }>("session/new-participant", { clientLastCode });
      if (res.session) {
        if (typeof window !== "undefined" && res.session.code) {
          localStorage.setItem("cc_last_participant_code", res.session.code);
        }
        state.setSession(res.session);
        putDraft({
          code: res.session.code,
          expires: res.session.draftExpiresAt,
          answers: res.session.answers,
          token: randomToken(),
          submitKey: crypto.randomUUID(),
        });
        setAnswers({
          Q1: null,
          Q2: null,
          Q3: null,
          Q4: null,
        });
        setSaveStatus("New anonymous participant ready");
      }
      await state.reload();
    } catch (e) {
      setError((e as Error).message || "Failed to assign new Anonymous ID. Please retry.");
    } finally {
      setResettingParticipant(false);
    }
  };

  const handleResetToStart = async () => {
    setResettingParticipant(true);
    setError("");
    setValidationError("");
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cc_last_participant_code");
      }
      clearParticipationStorage();
      const res = await api<{ session: Session }>("session/new-participant", { resetToStart: true });
      if (res.session) {
        if (typeof window !== "undefined" && res.session.code) {
          localStorage.setItem("cc_last_participant_code", res.session.code);
        }
        state.setSession(res.session);
        putDraft({
          code: res.session.code,
          expires: res.session.draftExpiresAt,
          answers: res.session.answers,
          token: randomToken(),
          submitKey: crypto.randomUUID(),
        });
        setAnswers({
          Q1: null,
          Q2: null,
          Q3: null,
          Q4: null,
        });
        setSaveStatus("Anonymous participant sequence reset to ID 01");
      }
      await state.reload();
    } catch (e) {
      setError((e as Error).message || "Failed to reset Anonymous ID. Please retry.");
    } finally {
      setResettingParticipant(false);
    }
  };

  const q1 = questions.find((q) => q.id === "Q1")!;
  const q2 = questions.find((q) => q.id === "Q2")!;
  const q3 = questions.find((q) => q.id === "Q3")!;
  const q4 = questions.find((q) => q.id === "Q4")!;

  useEffect(() => {
    router.prefetch("/play");
    router.prefetch("/consent");
  }, [router]);

  useEffect(() => {
    if (!state.loading && !state.session) {
      router.replace("/consent");
      return;
    }
    if (state.session) {
      const local = loadDraft(state.session.code);
      const sessionAnswers = local?.answers ?? state.session.answers;
      setAnswers({
        Q1: sessionAnswers.Q1?.value ?? null,
        Q2: sessionAnswers.Q2?.value ?? null,
        Q3: sessionAnswers.Q3?.value ?? null,
        Q4: sessionAnswers.Q4?.value ?? null,
      });
      if (state.session.status !== "draft") {
        setSaveStatus("Profile validated and submitted");
      }
    }
  }, [state.loading, state.session, router]);

  const handleSelect = async (questionId: string, code: number | null) => {
    const updated = { ...answers, [questionId]: code };
    setAnswers(updated);
    setError("");
    setValidationError("");
    setMissingQuestionIds((prev) => prev.filter((id) => id !== questionId));

    if (!state.session) return;

    // Convert to Answers format
    const draftAnswers: Answers = { ...state.session.answers };
    for (const [k, v] of Object.entries(updated)) {
      draftAnswers[k] = {
        value: v,
        status: v !== null ? "answered" : "not_answered",
      };
    }

    // Save locally
    const prev = loadDraft(state.session.code);
    putDraft({
      ...prev,
      code: state.session.code,
      expires: state.session.draftExpiresAt,
      answers: draftAnswers,
    });

    // If session is still draft, persist draft to server
    if (state.session.status === "draft") {
      setSaving(true);
      setSaveStatus("Saving to secure session…");
      try {
        await api("session/draft", { answers: draftAnswers });
        setSaveStatus("Saved securely to anonymous session");
      } catch {
        setSaveStatus("Saved on this browser");
      } finally {
        setSaving(false);
      }
    }
  };

  const isComplete =
    answers.Q1 !== null &&
    answers.Q2 !== null &&
    answers.Q3 !== null &&
    answers.Q4 !== null;

  const handleProceed = async () => {
    if (!isComplete) {
      const missing = ["Q1", "Q2", "Q3", "Q4"].filter(
        (id) => answers[id] === null
      );
      setMissingQuestionIds(missing);
      setValidationError(
        `Please answer all 4 demographic questions to continue (${missing.length} remaining).`
      );
      const firstMissing = document.getElementById(`${missing[0]?.toLowerCase()}-card`);
      firstMissing?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!state.session) {
      router.push("/consent");
      return;
    }

    // If already validated and submitted, navigate directly
    if (state.session.status !== "draft") {
      router.push("/play?module=phishing");
      return;
    }

    setSaving(true);
    setValidationError("");
    try {
      const fullAnswers: Answers = { ...state.session.answers };
      for (const [k, v] of Object.entries(answers)) {
        fullAnswers[k] = {
          value: v,
          status: v !== null ? "answered" : "not_answered",
        };
      }
      for (const q of questions) {
        if (!fullAnswers[q.id]) {
          fullAnswers[q.id] = { value: null, status: "not_answered" };
        }
      }

      const local = loadDraft(state.session.code);
      const submitKey = local?.submitKey ?? crypto.randomUUID();

      const res = await api<{ session: Session }>("session/submit", {
        answers: fullAnswers,
        idempotencyKey: submitKey,
      });

      if (res.session) {
        state.setSession(res.session);
        putDraft({
          code: res.session.code,
          expires: res.session.draftExpiresAt,
          answers: fullAnswers,
          token: local?.token,
          submitKey,
        });
      }

      setSaveStatus("Profile validated and submitted securely");
      router.push("/play?module=phishing");
    } catch (e) {
      setError((e as Error).message || "Failed to submit profile. Please retry.");
      setSaving(false);
    }
  };

  if (state.loading) {
    return <Loading />;
  }

  const rawCode = state.session?.code;
  const participantCode = rawCode
    ? /^\d+$/.test(rawCode.trim())
      ? String(parseInt(rawCode.trim(), 10)).padStart(2, "0")
      : rawCode
    : "01";

  return (
    <ResearchJourneyFrame
      currentStep="profile"
      progressPercent={answers.Q1 ? 25 : 15}
      missionKicker="STEP 02 OF 07"
      title="About You"
      subtitle="These questions help us understand the background of participants. There are no right or wrong answers."
      noticePill={`Anonymous ID: ${participantCode} · Step 02 of 07`}
      backHref="/consent"
      backLabel="Back to Step 01: Research Consent"
      onContinue={handleProceed}
      continueLabel="Continue to Step 03: Phishing Investigation"
      continueLoading={saving}
      continueDisabled={!isComplete}
    >
      {/* Prominent Anonymous ID Identification Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-3.5 sm:p-5 mb-6 shadow-sm dark:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors w-full max-w-full min-w-0 overflow-hidden box-border">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Lock size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-mono text-emerald-700 dark:text-emerald-400 font-bold">Active Research Participant</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-500/30">Anonymous Session</span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Anonymous ID:</span>
              <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/40 font-bold">{participantCode}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">Assigned automatically for non-identifiable research data collection under academic ethics protocol.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
          <button
            type="button"
            onClick={handleStartNewParticipant}
            disabled={resettingParticipant}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg shadow-2xs transition-colors min-h-[44px] w-full sm:w-auto text-center"
          >
            <RotateCcw size={14} className={resettingParticipant ? "animate-spin" : ""} aria-hidden="true" />
            <span>{resettingParticipant ? "Assigning Next ID..." : "Start as Next Participant"}</span>
          </button>
          <button
            type="button"
            onClick={handleResetToStart}
            disabled={resettingParticipant}
            title="Reset participant ID sequence back to 01"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-500/40 rounded-lg shadow-2xs transition-colors min-h-[44px] w-full sm:w-auto text-center"
          >
            <span>Reset to 01</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner mb-4" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {validationError && (
        <div className="error-banner mb-4" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Previously Completed Profile Banner */}
      {state.session?.status !== "draft" && (
        <div className="completed-participant-banner mb-6" role="region" aria-label="Previously Completed Profile">
          <div className="banner-content">
            <CheckCircle2 size={18} className="text-emerald shrink-0" aria-hidden="true" />
            <div className="banner-text">
              <strong>Previously Completed Profile (Anonymous ID: {participantCode})</strong>
              <p>This profile was previously recorded. Click below if you want to start as a new participant with a fresh Anonymous ID.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartNewParticipant}
            disabled={resettingParticipant}
            className="button secondary small mt-2"
          >
            {resettingParticipant ? (
              <span>Assigning New ID...</span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw size={12} aria-hidden="true" />
                <span>Start as New Participant</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Four Clean Demographic Question Cards matching Reference Design */}
      {/* Question 01: Age Group */}
      <div
        id="q1-card"
        className={`journey-question-card ${
          missingQuestionIds.includes("Q1") ? "validation-error" : ""
        }`}
      >
        <div className="journey-card-top">
          <span className="journey-card-count">Question 1 of 24</span>
          <span className="journey-card-required">Required</span>
        </div>
        <h2 id="q1-title" className="journey-question-text">
          {q1.text}
        </h2>
        <div
          className="journey-options-grid"
          role="radiogroup"
          aria-labelledby="q1-title"
          aria-required="true"
        >
          {q1.options.map((opt) => {
            const isSelected = answers.Q1 === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : answers.Q1 === null ? 0 : -1}
                className={`journey-option-pill ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect("Q1", opt.code)}
              >
                <span className="journey-radio-circle" aria-hidden="true">
                  {isSelected && <span className="journey-radio-dot" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 02: Gender */}
      <div
        id="q2-card"
        className={`journey-question-card ${
          missingQuestionIds.includes("Q2") ? "validation-error" : ""
        }`}
      >
        <div className="journey-card-top">
          <span className="journey-card-count">Question 2 of 24</span>
          <span className="journey-card-required">Required</span>
        </div>
        <h2 id="q2-title" className="journey-question-text">
          {q2.text}
        </h2>
        <div
          className="journey-options-grid"
          role="radiogroup"
          aria-labelledby="q2-title"
          aria-required="true"
        >
          {q2.options.map((opt) => {
            const isSelected = answers.Q2 === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : answers.Q2 === null ? 0 : -1}
                className={`journey-option-pill ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect("Q2", opt.code)}
              >
                <span className="journey-radio-circle" aria-hidden="true">
                  {isSelected && <span className="journey-radio-dot" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 03: Current Year of Study */}
      <div
        id="q3-card"
        className={`journey-question-card ${
          missingQuestionIds.includes("Q3") ? "validation-error" : ""
        }`}
      >
        <div className="journey-card-top">
          <span className="journey-card-count">Question 3 of 24</span>
          <span className="journey-card-required">Required</span>
        </div>
        <h2 id="q3-title" className="journey-question-text">
          {q3.text}
        </h2>
        <div
          className="journey-options-grid"
          role="radiogroup"
          aria-labelledby="q3-title"
          aria-required="true"
        >
          {q3.options.map((opt) => {
            const isSelected = answers.Q3 === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : answers.Q3 === null ? 0 : -1}
                className={`journey-option-pill ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect("Q3", opt.code)}
              >
                <span className="journey-radio-circle" aria-hidden="true">
                  {isSelected && <span className="journey-radio-dot" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 04: Main Field of Study */}
      <div
        id="q4-card"
        className={`journey-question-card ${
          missingQuestionIds.includes("Q4") ? "validation-error" : ""
        }`}
      >
        <div className="journey-card-top">
          <span className="journey-card-count">Question 4 of 24</span>
          <span className="journey-card-required">Required</span>
        </div>
        <h2 id="q4-title" className="journey-question-text">
          {q4.text}
        </h2>
        <div
          className="journey-options-grid"
          role="radiogroup"
          aria-labelledby="q4-title"
          aria-required="true"
        >
          {q4.options.map((opt) => {
            const isSelected = answers.Q4 === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : answers.Q4 === null ? 0 : -1}
                className={`journey-option-pill ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect("Q4", opt.code)}
              >
                <span className="journey-radio-circle" aria-hidden="true">
                  {isSelected && <span className="journey-radio-dot" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ResearchJourneyFrame>
  );
}
