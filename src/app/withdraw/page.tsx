"use client";
import { useState } from "react";
import Link from "next/link";
import { api, clearParticipationStorage } from "@/lib/client";
import { PageHeading, ErrorBox } from "@/components/ui";
export default function Page() {
  const [code, setCode] = useState(""),
    [token, setToken] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("withdraw", {
        code: code.trim().toUpperCase(),
        token: token.trim(),
      });
      clearParticipationStorage();
      setToken("");
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow page-space">
      <PageHeading
        label="YOUR PARTICIPATION"
        title={
          done
            ? "Your active response has been deleted."
            : "Withdraw your response"
        }
      >
        Use the participant code and private deletion token in your saved
        receipt before the deadline. Lost tokens cannot be recovered.
      </PageHeading>
      {done ? (
        <div className="card">
          <p>
            The active study records and local draft have been removed. Copies
            in provider backups expire under the configured retention policy.
            Researchers must also apply the withdrawal to retained exports.
          </p>
          <Link className="button secondary" href="/">
            Return home
          </Link>
        </div>
      ) : (
        <form className="card form-stack" onSubmit={submit}>
          <label>
            Participant code
            <input
              required
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. 01"
              maxLength={15}
              className="w-full"
            />
          </label>
          <label>
            Private deletion token
            <input
              type="password"
              autoComplete="off"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              minLength={64}
              maxLength={64}
              className="w-full font-mono text-xs sm:text-sm"
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I want to permanently delete my active study response and game
              records.
            </span>
          </label>
          {error && <ErrorBox message={error} />}
          <button disabled={!confirmed || busy} className="button danger w-full sm:w-auto min-h-[46px] justify-center">
            {busy ? "Deleting…" : "Delete my response"}
          </button>
          <p className="small-copy">
            Local demo deletion requires the original browser. Research deletion
            works with your code and token on another device.
          </p>
        </form>
      )}
    </div>
  );
}
