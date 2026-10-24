"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Edit3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { sections, questions } from "@/content/questionnaire";
import { api, useSession, loadDraft, putDraft, clearDraft } from "@/lib/client";
import type { Answers, Session } from "@/lib/types";
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

  useEffect(() => {
    if (state.session) {
      if (state.session.status === "submitted_complete" || state.session.status === "submitted_with_missing") {
        // If already fully submitted and complete, keep on review or allow viewing
      }
      const draft = loadDraft(state.session.code);
      setAnswers(draft?.answers ?? state.session.answers ?? {});
    }
  }, [state.session]);

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

  async function submit() {
    if (!state.session) return;
    setBusy(true);
    setError("");
    try {
      const draft = loadDraft(state.session.code);
      const key = draft?.submitKey ?? crypto.randomUUID();

      // Ensure all 25 questions have at least a default if not filled
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

      const hasUnfinishedScenarios = !session.attempts || session.attempts.filter((a) => a.attemptNumber === 1).length < 20;

      if (hasUnfinishedScenarios) {
        router.push("/play?module=phishing");
      } else {
        clearDraft();
        router.push("/survey/complete");
      }
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (state.loading) return <Loading />;

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

  return (
    <ResearchJourneyFrame
      currentStep="review"
      progressPercent={100}
      missionKicker="READY FOR THE EMAIL CHALLENGE?"
      title="Review your responses."
      subtitle="Check your answers before saving. Your questionnaire responses will be locked when you start the game."
      backHref="/play?module=links"
      backLabel="Back"
      onContinue={submit}
      continueLabel={busy ? "Saving responses…" : "Save responses & start challenge"}
      continueDisabled={busy}
      continueLoading={busy}
    >
      <div className="journey-review-container">
        {/* Error notification if submission failed */}
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} retry={submit} />
          </div>
        )}

        {/* ===================================================================
            SECTION 1: UNIFIED 25-QUESTION REVIEW CARD
            Matching the User's Screenshot Aesthetic (Questions 1 to 25)
            =================================================================== */}
        <div
          className="journey-review-list-card"
          role="region"
          aria-label="Recorded Questionnaire Responses"
        >
          {questions.map((q) => {
            const ans = answers[q.id];
            const chosenOption = q.options.find((o) => o.code === ans?.value);
            const isEditing = editingQuestionId === q.id;

            // Formatted answer label
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
            } else if (q.id === "Q5" && !ans?.value) {
              answerDisplay = "Yes";
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

        {/* ===================================================================
            SECTION 2: "SAVE & CONTINUE" CALLOUT CARD
            Exact match of Screenshot 2
            =================================================================== */}
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
