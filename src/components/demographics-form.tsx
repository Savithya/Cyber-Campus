"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  AlertCircle,
  Lock,
  Layers,
  Loader2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { api, useSession, loadDraft, putDraft, randomToken, clearParticipationStorage } from "@/lib/client";
import { questions } from "@/content/questionnaire";
import type { Answers, Session } from "@/lib/types";
import { ResearchProgressStepper } from "./research-progress-stepper";
import { Loading } from "./ui";

export function DemographicsForm() {
  const router = useRouter();
  const state = useSession();

  const [answers, setAnswers] = useState<Record<string, number | null>>({
    Q1: null,
    Q2: null,
    Q3: null,
    Q4: null,
    Q5: null,
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("Draft stored in session");
  const [error, setError] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [missingQuestionIds, setMissingQuestionIds] = useState<string[]>([]);
  const [resettingParticipant, setResettingParticipant] = useState(false);

  const handleStartNewParticipant = async () => {
    setResettingParticipant(true);
    setError("");
    setValidationError("");
    try {
      clearParticipationStorage();
      const res = await api<{ session: Session }>("session/new-participant", {});
      if (res.session) {
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
          Q5: null,
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

  const q1 = questions.find((q) => q.id === "Q1")!;
  const q2 = questions.find((q) => q.id === "Q2")!;
  const q3 = questions.find((q) => q.id === "Q3")!;
  const q4 = questions.find((q) => q.id === "Q4")!;
  const q5 = questions.find((q) => q.id === "Q5")!;

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
        Q5: sessionAnswers.Q5?.value ?? null,
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
    answers.Q4 !== null &&
    answers.Q5 !== null;

  const handleProceed = async () => {
    if (!isComplete) {
      const missing = ["Q1", "Q2", "Q3", "Q4", "Q5"].filter(
        (id) => answers[id] === null
      );
      setMissingQuestionIds(missing);
      setValidationError(
        `Please answer all 5 demographic questions to continue (${missing.length} remaining).`
      );
      // Smooth scroll to first missing question
      const firstMissing = document.getElementById(`${missing[0]?.toLowerCase()}-title`);
      firstMissing?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!state.session) {
      router.push("/consent");
      return;
    }

    // If already validated and submitted, navigate directly
    if (state.session.status !== "draft") {
      router.push("/play");
      return;
    }

    setSaving(true);
    setValidationError("");
    try {
      // Assemble full answers structure with Q1..Q5 as answered, Q6..Q25 as not_answered
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

      // Authoritative idempotency key
      const local = loadDraft(state.session.code);
      const submitKey = local?.submitKey ?? crypto.randomUUID();

      // Submit demographic profile to backend authoritative repository
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
      router.push("/play");
    } catch (e) {
      setError((e as Error).message || "Failed to submit profile. Please retry.");
      setSaving(false);
    }
  };

  if (state.loading) {
    return <Loading />;
  }

  const participantCode = state.session?.code ?? "ANON";

  return (
    <div className="demographics-page-wrapper">
      {/* 1. Four-Step Progress Stepper */}
      <nav
        className="research-progress-stepper"
        aria-label="Research Participation Progress"
      >
        <div className="stepper-step completed">
          <div className="stepper-dot">
            <Check size={16} aria-hidden="true" />
          </div>
          <div className="stepper-info">
            <span className="stepper-step-num">STEP 01</span>
            <span className="stepper-step-name">Research Consent</span>
          </div>
        </div>

        <div className="stepper-connector completed" />

        <div className="stepper-step active" aria-current="step">
          <div className="stepper-dot">02</div>
          <div className="stepper-info">
            <span className="stepper-step-num">STEP 02</span>
            <span className="stepper-step-name">Student Profile</span>
          </div>
        </div>

        <div className="stepper-connector" />

        <div className="stepper-step">
          <div className="stepper-dot">03</div>
          <div className="stepper-info">
            <span className="stepper-step-num">STEP 03</span>
            <span className="stepper-step-name">Cyber Missions</span>
          </div>
        </div>

        <div className="stepper-connector" />

        <div className="stepper-step">
          <div className="stepper-dot">04</div>
          <div className="stepper-info">
            <span className="stepper-step-num">STEP 04</span>
            <span className="stepper-step-name">Completion</span>
          </div>
        </div>
      </nav>

      {/* 2. Main Header & Participation Information Bar */}
      <header className="demographics-header">
        <div className="eyebrow">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span>STEP 02 OF 04 · PARTICIPANT PROFILE</span>
        </div>
        <h1 className="demographics-title">
          Participant Profile
        </h1>
        <p className="demographics-subtitle">
          Provide basic academic background information to support research analysis.
        </p>

        <div className="demographics-info-bar" role="status" aria-label="Participation Information">
          <div className="info-bar-pill">
            <Lock size={13} className="text-muted" aria-hidden="true" />
            <span className="info-pill-label">Anonymous ID:</span>
            <strong className="info-pill-value font-mono">{participantCode}</strong>
          </div>
          <div className="info-bar-divider" aria-hidden="true" />
          <div className="info-bar-pill">
            <ShieldCheck size={14} className="text-emerald" aria-hidden="true" />
            <span className="info-pill-label">Draft Status:</span>
            <strong className="info-pill-value">{saveStatus}</strong>
          </div>
          <div className="info-bar-divider" aria-hidden="true" />
          <div className="info-bar-pill">
            <Layers size={14} className="text-primary" aria-hidden="true" />
            <span className="info-pill-label">Research Stage:</span>
            <strong className="info-pill-value">Stage 02 of 04</strong>
          </div>
          <div className="info-bar-divider" aria-hidden="true" />
          <button
            type="button"
            className="btn-new-participant-pill"
            onClick={handleStartNewParticipant}
            disabled={resettingParticipant}
            title="Generate a new dynamic Anonymous ID and join as a new research participant"
            aria-label="Generate new dynamic Anonymous ID"
          >
            {resettingParticipant ? (
              <>
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                <span>Assigning ID...</span>
              </>
            ) : (
              <>
                <RotateCcw size={13} aria-hidden="true" />
                <span>New Anonymous ID</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Previously Completed Profile Banner */}
      {state.session?.status !== "draft" && (
        <div className="completed-participant-banner mb-6" role="region" aria-label="Previously Completed Profile">
          <div className="banner-content">
            <CheckCircle2 size={18} className="text-emerald shrink-0" aria-hidden="true" />
            <div className="banner-text">
              <strong>Previously Completed Profile (Anonymous ID: {participantCode})</strong>
              <p>This profile was previously validated and recorded into the Research Workspace. Click below to start as a new participant with a fresh Anonymous ID.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartNewParticipant}
            disabled={resettingParticipant}
            className="button secondary small"
          >
            {resettingParticipant ? "Assigning New ID..." : "Join as New Participant (Next ID)"}
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert" style={{ marginBottom: 24 }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Five Demographic Question Cards */}
      <main className="demographics-cards-grid" aria-label="Demographic Questions">
        {/* Question 01: Age Group */}
        <section
          className={`demo-card ${missingQuestionIds.includes("Q1") ? "validation-error" : ""}`}
          aria-labelledby="q1-title"
        >
          <div className="demo-card-header">
            <span className="demo-icon-box lavender">
              <Calendar size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="demo-question-tag">QUESTION 01 — AGE GROUP</span>
              <h2 id="q1-title" className="demo-question-heading">{q1.text}</h2>
            </div>
          </div>
          <div className="demo-options-container grid-2" role="radiogroup" aria-labelledby="q1-title">
            {q1.options.map((opt) => {
              const isSelected = answers.Q1 === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`demo-option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect("Q1", opt.code)}
                >
                  <span className="demo-radio-circle" aria-hidden="true">
                    {isSelected ? (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="demo-radio-dot" />
                    )}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Question 02: Gender */}
        <section
          className={`demo-card ${missingQuestionIds.includes("Q2") ? "validation-error" : ""}`}
          aria-labelledby="q2-title"
        >
          <div className="demo-card-header">
            <span className="demo-icon-box teal">
              <User size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="demo-question-tag">QUESTION 02 — GENDER</span>
              <h2 id="q2-title" className="demo-question-heading">{q2.text}</h2>
            </div>
          </div>
          <div className="demo-options-container grid-2" role="radiogroup" aria-labelledby="q2-title">
            {q2.options.map((opt) => {
              const isSelected = answers.Q2 === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`demo-option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect("Q2", opt.code)}
                >
                  <span className="demo-radio-circle" aria-hidden="true">
                    {isSelected ? (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="demo-radio-dot" />
                    )}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Question 03: Current Year of Study */}
        <section
          className={`demo-card ${missingQuestionIds.includes("Q3") ? "validation-error" : ""}`}
          aria-labelledby="q3-title"
        >
          <div className="demo-card-header">
            <span className="demo-icon-box amber">
              <GraduationCap size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="demo-question-tag">QUESTION 03 — YEAR OF STUDY</span>
              <h2 id="q3-title" className="demo-question-heading">{q3.text}</h2>
            </div>
          </div>
          <div className="demo-options-container grid-2" role="radiogroup" aria-labelledby="q3-title">
            {q3.options.map((opt) => {
              const isSelected = answers.Q3 === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`demo-option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect("Q3", opt.code)}
                >
                  <span className="demo-radio-circle" aria-hidden="true">
                    {isSelected ? (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="demo-radio-dot" />
                    )}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Question 04: Main Field of Study */}
        <section
          className={`demo-card ${missingQuestionIds.includes("Q4") ? "validation-error" : ""}`}
          aria-labelledby="q4-title"
        >
          <div className="demo-card-header">
            <span className="demo-icon-box cyan">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="demo-question-tag">QUESTION 04 — MAIN FIELD OF STUDY</span>
              <h2 id="q4-title" className="demo-question-heading">{q4.text}</h2>
            </div>
          </div>
          <div className="demo-options-container grid-2" role="radiogroup" aria-labelledby="q4-title">
            {q4.options.map((opt) => {
              const isSelected = answers.Q4 === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`demo-option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect("Q4", opt.code)}
                >
                  <span className="demo-radio-circle" aria-hidden="true">
                    {isSelected ? (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="demo-radio-dot" />
                    )}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Question 05: University Type */}
        <section
          className={`demo-card full-width ${missingQuestionIds.includes("Q5") ? "validation-error" : ""}`}
          aria-labelledby="q5-title"
        >
          <div className="demo-card-header">
            <span className="demo-icon-box peach">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <div>
              <span className="demo-question-tag">QUESTION 05 — UNIVERSITY TYPE</span>
              <h2 id="q5-title" className="demo-question-heading">{q5.text}</h2>
            </div>
          </div>
          <div className="demo-options-container grid-2" role="radiogroup" aria-labelledby="q5-title">
            {q5.options.map((opt) => {
              const isSelected = answers.Q5 === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`demo-option-button ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect("Q5", opt.code)}
                >
                  <span className="demo-radio-circle" aria-hidden="true">
                    {isSelected ? (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="demo-radio-dot" />
                    )}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* 4. Bottom Navigation & Action Bar */}
      <footer className="demographics-actions-bar">
        <Link
          href="/consent"
          prefetch={true}
          className="button secondary large demo-back-btn"
          aria-label="Back to Research Consent"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Research Consent</span>
        </Link>

        <div className="demo-actions-right">
          {validationError && (
            <div className="demo-validation-message" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          <button
            type="button"
            className={`button primary large demo-continue-btn ${!isComplete ? "disabled-btn" : ""}`}
            onClick={handleProceed}
            disabled={saving}
            aria-busy={saving}
            aria-label="Save Profile & Enter Cyber Missions"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spin" aria-hidden="true" />
                <span>Saving Profile…</span>
              </>
            ) : (
              <>
                <span>Save Profile &amp; Enter Cyber Missions</span>
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
