"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sections, questions } from "@/content/questionnaire";
import { api, useSession, loadDraft, putDraft, clearDraft } from "@/lib/client";
import type { Answers, Session } from "@/lib/types";
import { PageHeading, Loading, ErrorBox } from "./ui";
export default function Review() {
  const state = useSession(),
    router = useRouter();
  const [answers, setAnswers] = useState<Answers>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (state.session) {
      if (state.session.status !== "draft") {
        router.replace("/survey/complete");
        return;
      }
      setAnswers(
        loadDraft(state.session.code)?.answers ?? state.session.answers,
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
        }),
      );
      clearDraft();
      router.push("/survey/complete");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
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
        <Link className="button primary" href="/consent">
          Start with consent
        </Link>
      </div>
    );
  const count = Object.values(answers).filter(
    (a) => a.status === "answered",
  ).length;
  return (
    <div className="narrow page-space">
      <PageHeading
        label="REVIEW & SUBMIT"
        title="Does this reflect your experience?"
      >
        You answered {count} of 25 questions.{" "}
        {25 - count > 0
          ? "Unanswered and skipped questions are welcome. You can submit without disclosing more."
          : "You can edit any answer before submitting."}
      </PageHeading>
      <div className="notice">
        <strong>Your questionnaire has no score.</strong> After submission, the
        baseline is locked. Optional game decisions never change it.
      </div>
      {sections.map((s, i) => (
        <section className="card review-section" key={s.id}>
          <div className="review-heading">
            <h2>
              {s.id}. {s.title}
            </h2>
            <Link className="text-link" href={"/survey?section=" + i}>
              Edit section {s.id}
            </Link>
          </div>
          {questions
            .filter((q) => q.section === s.id)
            .map((q) => (
              <div className="review-answer" key={q.id}>
                <strong>
                  {q.id}. {q.text}
                </strong>
                <p>
                  {q.options.find((o) => o.code === answers[q.id]?.value)
                    ?.label ??
                    (answers[q.id]?.status === "skipped"
                      ? "Skipped"
                      : "Not answered")}
                </p>
              </div>
            ))}
        </section>
      ))}
      {error && <ErrorBox message={error} retry={submit} />}
      <div className="survey-bottom">
        <Link className="button secondary" href="/survey?section=5">
          Back to questionnaire
        </Link>
        <button
          disabled={busy || !Object.keys(answers).length}
          className="button primary"
          onClick={submit}
        >
          {busy ? "Submitting…" : "Submit questionnaire"}
        </button>
      </div>
      <p className="small-copy">
        A connection error keeps your local draft. Retrying the same submission
        will not create another response.
      </p>
    </div>
  );
}
