"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  User,
  Radio,
  BookOpen,
  Link2,
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

  useEffect(() => {
    if (state.session) {
      if (state.session.status !== "draft") {
        router.replace("/survey/complete");
        return;
      }
      setAnswers(
        loadDraft(state.session.code)?.answers ?? state.session.answers
      );
    }
  }, [state.session, router]);

  async function submit() {
    if (!state.session) return;
    setBusy(true);
    setError("");
    try {
      const draft = loadDraft(state.session.code);
      const key = draft?.submitKey ?? crypto.randomUUID();
      putDraft({
        ...draft,
        code: state.session.code,
        expires: state.session.draftExpiresAt,
        answers,
        submitKey: key,
      });
      const { session } = await api<{ session: Session }>("session/submit", {
        answers,
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
      clearDraft();
      router.push("/survey/complete");
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
        progressPercent={95}
        missionKicker="STEP 07 OF 07"
        title="Review & Save"
        subtitle="Review your responses and decisions before saving."
        noticePill="Your perspective counts · Honest answers are more valuable than a high score"
        backHref="/play?module=links"
        backLabel="Back to Step 06: Scam & Malicious Link Investigation"
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
        missionKicker="STEP 07 OF 07"
        title="Review & Save"
        subtitle="Please begin by providing informed consent."
        noticePill="Research Session Required"
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

  const answeredCount = Object.values(answers).filter(
    (a) => a.status === "answered"
  ).length;

  const totalQuestions = questions.length || 25;
  const attempts = state.session.attempts ?? [];
  const completedScenariosCount = attempts.filter((a) => a.attemptNumber === 1).length;

  return (
    <ResearchJourneyFrame
      currentStep="review"
      progressPercent={95}
      missionKicker="STEP 07 OF 07"
      title="Review & Save"
      subtitle="Review your responses and simulation decisions across all previous steps before saving. After this step, your research baseline is locked."
      noticePill="Your perspective counts · Honest answers are more valuable than a high score"
      backHref="/play?module=links"
      backLabel="Back to Step 06: Scam & Malicious Link Investigation"
      onContinue={submit}
      continueLabel={busy ? "Submitting Baseline…" : "Submit Questionnaire & Complete"}
      continueDisabled={busy || !Object.keys(answers).length}
      continueLoading={busy}
    >
      <div className="journey-review-container">
        {/* Lock Baseline Notice matching Reference Aesthetic */}
        <div className="journey-review-lock-banner" role="status">
          <div className="journey-review-banner-icon">
            <Lock size={18} aria-hidden="true" />
          </div>
          <div className="journey-review-banner-text">
            <strong>Your questionnaire has no score.</strong> After submission, the baseline is locked. Optional game decisions never change it.
          </div>
        </div>

        {/* Overview Telemetry Card */}
        <div className="journey-question-card journey-review-summary-card">
          <div className="journey-question-header">
            <span className="journey-question-kicker">PARTICIPANT TELEMETRY</span>
            <span className="journey-question-badge">{`ANONYMOUS ID: ${state.session.code}`}</span>
          </div>

          <h2 className="journey-review-card-heading">
            Does this reflect your experience?
          </h2>

          <p className="journey-review-card-lead">
            You answered <strong>{answeredCount} of {totalQuestions} questions</strong>.{" "}
            {totalQuestions - answeredCount > 0
              ? "Unanswered and skipped questions are welcome. You can submit without disclosing more."
              : "You can edit any answer before submitting."}
          </p>

          <div className="journey-review-meta-pills">
            <span className="journey-review-meta-pill">
              <User size={13} aria-hidden="true" />
              <span>Student Profile: 5 / 5 recorded</span>
            </span>
            <span className="journey-review-meta-pill">
              <Gamepad2 size={13} aria-hidden="true" />
              <span>Cyber Missions: {completedScenariosCount} of 20 evaluated</span>
            </span>
            <span className="journey-review-meta-pill safe">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>No Credentials Stored</span>
            </span>
          </div>
        </div>

        {/* Error notification if submission failed */}
        {error && (
          <div className="mb-4">
            <ErrorBox message={error} retry={submit} />
          </div>
        )}

        {/* Section Cards */}
        <div className="journey-review-sections-list">
          {sections.map((s, i) => {
            const sectionQuestions = questions.filter((q) => q.section === s.id);
            const sectionAnswered = sectionQuestions.filter(
              (q) => answers[q.id]?.status === "answered"
            ).length;

            const editLink = s.id === "A" ? "/demographics" : `/survey?section=${i}`;

            return (
              <section key={s.id} className="journey-question-card journey-review-section-card">
                <div className="journey-review-section-header">
                  <div>
                    <span className="journey-question-kicker">
                      SECTION {s.id} · {s.role ?? "RESEARCH VARIABLE"}
                    </span>
                    <h3 className="journey-review-section-title">
                      {s.id}. {s.title}
                    </h3>
                  </div>

                  <Link
                    href={editLink}
                    prefetch={true}
                    className="journey-review-edit-link"
                    aria-label={`Edit section ${s.id}`}
                  >
                    <Edit3 size={13} aria-hidden="true" />
                    <span>Edit section {s.id}</span>
                  </Link>
                </div>

                <p className="journey-review-section-intro">{s.introduction}</p>

                <div className="journey-review-questions-list">
                  {sectionQuestions.map((q) => {
                    const ans = answers[q.id];
                    const chosenOption = q.options.find((o) => o.code === ans?.value);
                    const isAnswered = ans?.status === "answered" && chosenOption;
                    const isSkipped = ans?.status === "skipped";

                    return (
                      <div key={q.id} className="journey-review-question-row">
                        <div className="journey-review-q-prompt">
                          <span className="journey-review-q-id">{q.id}</span>
                          <span className="journey-review-q-text">{q.text}</span>
                        </div>

                        <div className="journey-review-q-answer">
                          {isAnswered ? (
                            <span className="journey-review-answer-pill answered">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              <span>{chosenOption.label}</span>
                            </span>
                          ) : isSkipped ? (
                            <span className="journey-review-answer-pill skipped">
                              <HelpCircle size={13} aria-hidden="true" />
                              <span>Skipped</span>
                            </span>
                          ) : (
                            <span className="journey-review-answer-pill missing">
                              <AlertCircle size={13} aria-hidden="true" />
                              <span>Not answered</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Subtext Reassurance */}
        <p className="journey-review-bottom-note">
          A connection error keeps your local draft. Retrying the same submission will not create another response.
        </p>
      </div>
    </ResearchJourneyFrame>
  );
}
