"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, CloudCheck, LockKeyhole, Trash2 } from "lucide-react";
import { sections, questions } from "@/content/questionnaire";
import {
  api,
  useSession,
  loadDraft,
  putDraft,
  clearParticipationStorage,
} from "@/lib/client";
import type { Answers } from "@/lib/types";
import { Loading, ErrorBox, Reveal } from "./ui";
export default function Survey() {
  const state = useSession(),
    router = useRouter(),
    params = useSearchParams();
  const [index, setIndex] = useState(
    Math.min(sections.length - 1, Math.max(0, Number(params.get("section")) || 0)),
  );
  const [answers, setAnswers] = useState<Answers>({}),
    [saving, setSaving] = useState("Loading draft…"),
    [error, setError] = useState(""),
    [discard, setDiscard] = useState(false);
  const queue = useRef(Promise.resolve()),
    revision = useRef(0),
    latest = useRef<Answers>({});
  useEffect(() => {
    if (state.session) {
      if (state.session.status !== "draft") {
        router.replace("/survey/complete");
        return;
      }
      const local = loadDraft(state.session.code);
      const a = local?.answers ?? state.session.answers;
      setAnswers(a);
      latest.current = a;
      setSaving(local ? "Draft restored from this browser" : "Saved");
    }
  }, [state.session, router]);
  useEffect(() => {
    const offline = () => setSaving("Offline · saved on this device");
    const online = () => {
      if (Object.keys(latest.current).length) void save(latest.current);
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  });
  async function save(a: Answers) {
    const rev = ++revision.current;
    setSaving("Saving…");
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        try {
          await api("session/draft", { answers: a });
          if (rev === revision.current) {
            setSaving("Saved securely");
            setError("");
          }
        } catch (e) {
          if (rev === revision.current) {
            setSaving("Saved on this device · retry needed");
            setError((e as Error).message);
          }
        }
      });
    await queue.current;
  }
  function answer(id: string, value: number | null, skip = false) {
    if (!state.session) return;
    const next = {
      ...answers,
      [id]: {
        value,
        status: (value !== null
          ? "answered"
          : skip
            ? "skipped"
            : "not_answered") as "answered" | "skipped" | "not_answered",
      },
    };
    latest.current = next;
    setAnswers(next);
    const prev = loadDraft(state.session.code);
    try {
      putDraft({
        ...prev,
        code: state.session.code,
        expires: state.session.draftExpiresAt,
        answers: next,
      });
    } catch {
      setError(
        "Browser draft storage is unavailable. Keep this tab open and wait for the saved status.",
      );
    }
    void save(next);
  }
  async function discardNow() {
    try {
      await api("session/discard", {});
      clearParticipationStorage();
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (state.loading) return <Loading />;
  if (state.error)
    return (
      <div className="narrow page-space">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  if (!state.session)
    return (
      <div className="narrow page-space">
        <h1>Begin with your informed choice</h1>
        <p>Read the study information before starting the questionnaire.</p>
        <Link className="button primary" href="/consent">
          Read information & consent
        </Link>
      </div>
    );
  const s = sections[index],
    answered = Object.values(answers).filter(
      (a) => a.status === "answered",
    ).length,
    reviewed = Object.values(answers).filter(
      (a) => a.status !== "not_answered",
    ).length;
  return (
    <div className="survey-layout container page-space">
      <aside className="survey-sidebar">
        <span className="eyebrow">YOUR QUESTIONNAIRE</span>
        <h2>
          A little about
          <br />
          your experience.
        </h2>
        <p>There are no right or wrong answers. Share only what you choose.</p>
        <nav aria-label="Questionnaire sections">
          {sections.map((sec, i) => (
            <button
              key={sec.id}
              className={"section-nav " + (index === i ? "selected" : "")}
              aria-current={index === i ? "step" : undefined}
              onClick={() => {
                setIndex(i);
                window.scrollTo({ top: 0 });
              }}
            >
              <span>{sec.id}</span>
              <div>
                {sec.title}
                <small>
                  {
                    sec.questions.filter(
                      (q) => answers[q]?.status !== "not_answered",
                    ).length
                  }{" "}
                  / {sec.questions.length} reviewed
                </small>
              </div>
              {sec.questions.every(
                (q) => answers[q]?.status !== "not_answered",
              ) && <Check size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <LockKeyhole size={18} />
          <span>
            Participant <strong>{state.session.code}</strong>
          </span>
        </div>
        <button
          className="text-link discard-link"
          onClick={() => setDiscard(!discard)}
        >
          <Trash2 size={14} /> Discard this draft
        </button>
        {discard && (
          <div className="notice">
            <p>Delete this draft from the browser and study storage?</p>
            <button className="button danger" onClick={discardNow}>
              Delete draft
            </button>
            <button className="button ghost" onClick={() => setDiscard(false)}>
              Keep it
            </button>
          </div>
        )}
      </aside>
      <div className="survey-main">
        <div className="survey-topline">
          <span>SECTION {s.id} OF {sections[sections.length - 1]?.id ?? "E"}</span>
          <span>
            {reviewed} of 25 reviewed · {answered} answered
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Questions reviewed"
          aria-valuenow={reviewed}
          aria-valuemin={0}
          aria-valuemax={25}
        >
          <div style={{ width: (reviewed / 25) * 100 + "%" }} />
        </div>
        <div className="survey-title">
          <h1>{s.title}</h1>
          <p>{s.introduction}</p>
        </div>
        <div className="save-status" role="status" aria-live="polite">
          <CloudCheck size={16} />
          {saving}
        </div>
        {error && <ErrorBox message={error} retry={() => void save(answers)} />}
        <Reveal key={s.id}>
          <div className="question-list">
            {questions
              .filter((q) => q.section === s.id)
              .map((q) => (
                <fieldset key={q.id} className="question-card">
                  <legend>
                    <span className="question-number">{q.id}</span>
                    <span>{q.text}</span>
                  </legend>
                  {q.type === "dropdown" ? (
                    <select
                      aria-label={q.text}
                      value={answers[q.id]?.value ?? ""}
                      onChange={(e) =>
                        answer(
                          q.id,
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Select an option</option>
                      {q.options.map((o) => (
                        <option value={o.code} key={o.code}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className={
                        "answer-options " +
                        (q.type === "scale" ? "scale-options" : "")
                      }
                    >
                      {q.options.map((o) => (
                        <label
                          key={o.code}
                          className={
                            "answer-option " +
                            (answers[q.id]?.value === o.code ? "chosen" : "")
                          }
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={o.code}
                            checked={answers[q.id]?.value === o.code}
                            onChange={() => answer(q.id, o.code)}
                          />
                          {q.type === "scale" && <strong>{o.code}</strong>}
                          <span>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <button
                    className="skip-question"
                    onClick={() => answer(q.id, null, true)}
                  >
                    {answers[q.id]?.status === "skipped"
                      ? "Skipped · you can still choose an answer"
                      : "Skip this question"}
                  </button>
                </fieldset>
              ))}
          </div>
        </Reveal>
        <div className="survey-bottom">
          <button
            className="button secondary"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1);
              window.scrollTo({ top: 0 });
            }}
          >
            Back
          </button>
          <span>
            {index < sections.length - 1
              ? "You can review everything before submitting."
              : "Your answers are ready for review."}
          </span>
          <button
            className="button primary"
            onClick={() => {
              if (index < sections.length - 1) {
                setIndex(index + 1);
                window.scrollTo({ top: 0 });
              } else router.push("/survey/review");
            }}
          >
            {index < sections.length - 1 ? "Next section" : "Review answers"}
          </button>
        </div>
      </div>
    </div>
  );
}
