"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, Gamepad2, LockKeyhole, CheckCircle2 } from "lucide-react";
import { useSession, clearDraft, loadDraft } from "@/lib/client";
import { Loading, ErrorBox, PageHeading, Reveal } from "./ui";
export default function Completion() {
  const state = useSession();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (state.session && state.session.status !== "draft") {
      const d = loadDraft(state.session.code);
      const r = JSON.parse(sessionStorage.getItem("cc-receipt") ?? "null");
      const t = d?.token ?? (r?.code === state.session.code ? r.token : null);
      setToken(t);
      if (t)
        sessionStorage.setItem(
          "cc-receipt",
          JSON.stringify({
            code: state.session.code,
            token: t,
            deadline: state.session.withdrawDeadline,
          }),
        );
      clearDraft();
    }
  }, [state.session]);
  if (state.loading) return <Loading />;
  if (state.error)
    return (
      <div className="narrow page-space">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  if (!state.session || state.session.status === "draft")
    return (
      <div className="narrow page-space">
        <h1>Your questionnaire is not submitted yet</h1>
        <Link href="/survey" className="button primary">
          Continue questionnaire
        </Link>
      </div>
    );
  const s = state.session;
  function download() {
    const text =
      "Cyber Campus private withdrawal receipt\nParticipant code: " +
      s!.code +
      "\nSubmission ID: " +
      (s!.submissionId ?? s!.id) +
      "\nSubmitted at (UTC): " +
      (s!.submittedAt ?? s!.createdAt) +
      "\nPrivate token: " +
      token +
      "\nDeadline (UTC): " +
      s!.withdrawDeadline +
      "\nKeep this private. Without the token we cannot recover or delete a response on your behalf.\nMode: " +
      s!.mode;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = "cyber-campus-private-receipt.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <Reveal className="narrow page-space">
      <div className="completion-icon">
        <Check size={34} />
      </div>
      <PageHeading
        label={
          s.mode === "demo"
            ? "DEMO QUESTIONNAIRE COMPLETE"
            : "QUESTIONNAIRE COMPLETE"
        }
        title="Thank you for sharing your perspective."
      >
        Your questionnaire response has been safely recorded.
      </PageHeading>

      <div className="notice mb-4">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 size={18} className="text-teal shrink-0 mt-0.5" />
          <div>
            <strong>Multiple Submissions Policy:</strong> Participants may submit multiple responses without any restrictions on the number of submissions. Each submission will be recorded separately for research purposes.
          </div>
        </div>
      </div>

      <div className="card receipt">
        <div className="section-title">
          <LockKeyhole />
          <h2>Keep your private receipt</h2>
        </div>
        <p>
          Participant code <strong>{s.code}</strong>
        </p>
        <p>
          Submission ID <strong className="font-mono text-xs">{s.submissionId ?? s.id}</strong>
        </p>
        {s.submittedAt && (
          <p>
            Submission time:{" "}
            {new Date(s.submittedAt).toLocaleString("en-GB", {
              timeZone: "Asia/Colombo",
            })}{" "}
            (Asia/Colombo).
          </p>
        )}
        <p>
          Withdrawal deadline:{" "}
          {s.withdrawDeadline
            ? new Date(s.withdrawDeadline).toLocaleString("en-GB", {
                timeZone: "Asia/Colombo",
              })
            : "Not applicable"}{" "}
          (Asia/Colombo).
        </p>
        {token ? (
          <>
            <details>
              <summary>Show private deletion token</summary>
              <code className="token">{token}</code>
            </details>
            <button className="button secondary" onClick={download}>
              <Download size={17} /> Save private receipt
            </button>
          </>
        ) : (
          <p className="notice">
            This browser no longer has your private token. Use the receipt you
            saved earlier. The researcher cannot recover a lost token.
          </p>
        )}
        <p className="small-copy">
          The token is required for deletion before the deadline. Keep it
          private; it is never included in researcher exports.
        </p>
      </div>

      <div className="card">
        <div className="section-title">
          <CheckCircle2 size={20} className="text-teal" />
          <h2>Submit Another Response</h2>
        </div>
        <p>
          Would you like to complete another survey submission? Participants are welcome to submit multiple responses, each recorded separately with its own submission ID for research purposes.
        </p>
        <Link className="button primary" href="/consent">
          Submit Another Response
        </Link>
      </div>

      <div className="card optional-card">
        <span className="tag">COMPLETELY OPTIONAL</span>
        <h2>A new part of campus awaits.</h2>
        <p>
          Explore four fictional campus missions about online privacy. Your game
          choices stay separate from your questionnaire.
        </p>
        <Link className="button primary" href="/play">
          <Gamepad2 size={19} /> Explore the campus missions
        </Link>
      </div>
      <Link className="text-link" href="/">
        Finish here & return home
      </Link>
    </Reveal>
  );
}
