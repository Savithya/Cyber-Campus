"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Check,
  LockKeyhole,
  Map,
  BookOpen,
  RotateCcw,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
import { api, useSession } from "@/lib/client";
import { missions } from "@/content/missions";
import { scoreSummary } from "@/lib/scoring";
import type { Scenario, Session, Attempt, AnswerKey } from "@/lib/types";
import { Loading, ErrorBox, PageHeading, Reveal } from "./ui";
const icons: Record<string, typeof Mail> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};
export function CampusMap() {
  const router = useRouter();
  const state = useSession();
  const [error, setError] = useState("");
  if (state.loading) return <Loading />;
  if (state.error)
    return (
      <div className="narrow page-space">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  if (!state.session || state.session.status === "draft") return <Locked />;
  const s = state.session,
    total = scoreSummary(s.attempts);

  // Compute Rank dynamically from 120 max XP
  const getRank = (xp: number) => {
    if (xp >= 100) return { title: "Master Privacy Architect", level: 4 };
    if (xp >= 70) return { title: "Cyber Defense Specialist", level: 3 };
    if (xp >= 30) return { title: "Threat Investigator", level: 2 };
    return { title: "Cyber Recruit", level: 1 };
  };
  const rank = getRank(total.points);

  return (
    <div className="container page-space">
      <div className="game-heading">
        <PageHeading
          label={
            s.mode === "practice"
              ? "PRACTICE ONLY · OUTSIDE THE STUDY"
              : "THE OPTIONAL CAMPUS ACTIVITY"
          }
          title="Welcome to your cyber campus."
        >
          Four missions. Everyday campus situations. Take your time, inspect the
          details, and choose your next step.
        </PageHeading>
        <div className="score-card">
          <span>FIRST-ATTEMPT POINTS</span>
          <strong>
            {total.points}
            <small> / 120</small>
          </strong>
          <p>
            {total.attempted} attempted · {total.skipped} skipped
          </p>
        </div>
      </div>

      {/* Cyber Challenge Zone Gaming HUD */}
      <div className="gaming-telemetry-hud" style={{ marginBottom: "24px" }}>
        <div className="hud-metric-row">
          <div className="hud-metric-tile">
            <span className="hud-metric-label">OPERATIVE STATUS</span>
            <div className="hud-rank-box">
              <span className="hud-rank-badge">LVL {rank.level}</span>
              <strong className="hud-rank-title">{rank.title}</strong>
            </div>
          </div>
          <div className="hud-metric-tile">
            <span className="hud-metric-label">FIRST-ATTEMPT XP</span>
            <div className="hud-xp-box">
              <strong className="hud-xp-value">{total.points}<small className="hud-xp-max"> / 120 XP</small></strong>
              <span className="hud-xp-tag">10 XP / correct choice</span>
            </div>
          </div>
          <div className="hud-metric-tile">
            <span className="hud-metric-label">SCENARIOS EVALUATED</span>
            <div className="hud-scenarios-box">
              <strong className="hud-scenarios-value">{total.completed}<small className="hud-scenarios-max"> / 12</small></strong>
              <span className="hud-scenarios-tag">{total.skipped} skipped</span>
            </div>
          </div>
          <div className="hud-action-tile">
            <Link className="button primary hud-launch-btn" href="/results" prefetch={true}>
              <span>View Badges & Debrief</span>
            </Link>
          </div>
        </div>
        <div className="hud-progress-wrapper">
          <div className="hud-progress-labels">
            <span>Overall Mission Completion</span>
            <strong>{Math.round((total.completed / 12) * 100)}% Evaluated</strong>
          </div>
          <div className="hud-progress-track">
            <div
              className="hud-progress-fill"
              style={{ width: `${Math.max(4, (total.completed / 12) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="notice">
        <LockKeyhole size={18} />
        <span>
          {s.mode === "practice"
            ? "Practice is kept only in this browser session and is excluded from research."
            : "Your questionnaire is complete and locked. Games are optional and never change your answers."}{" "}
          Each first correct decision earns 10 points; replays are practice. No
          speed bonus.
        </span>
      </div>
      <section className="campus-map" aria-label="Four campus missions">
        {missions.map((m, i) => {
          const Icon = icons[m.icon],
            stats = scoreSummary(
              s.attempts.filter((a) =>
                (m.ids as readonly string[]).includes(a.scenarioId),
              ),
            );
          const maxPts = m.ids.length * 10;
          return (
            <Reveal key={m.id} className={"mission-card " + m.color}>
              <div className="mission-top">
                <span className={"icon-tile " + m.color}>
                  <Icon size={28} />
                </span>
                <span className="mini-label">{m.code ?? `MISSION 0${i + 1}`}</span>
                {stats.completed === m.ids.length && (
                  <span className="completion-badge">
                    <Check size={14} /> Completed
                  </span>
                )}
              </div>
              <span className="mission-topic">{m.topic}</span>
              <h2>{m.name}</h2>
              <p>{m.description}</p>
              <div className="mission-progress">
                <span>{stats.completed} / {m.ids.length} scenarios reviewed</span>
                <strong>{stats.points} / {maxPts} pts</strong>
              </div>
              <div className="progress-track">
                <div style={{ width: Math.round((stats.completed / m.ids.length) * 100) + "%" }} />
              </div>
              <Link className="button secondary" href={"/play/" + m.id}>
                {stats.completed === m.ids.length
                  ? "Replay for practice"
                  : stats.completed
                    ? "Continue mission"
                    : "Enter mission"}
              </Link>
            </Reveal>
          );
        })}
      </section>
      <div className="card game-rules">
        <BookOpen size={25} />
        <div>
          <h3>A safe place to explore</h3>
          <p>
            Every person, message, account, and link is fictional. Links are
            inert and never open a destination. Use the evidence supplied; a
            simulation cannot establish certainty about a real message. No
            credentials, documents, or actual OTPs are needed.
          </p>
        </div>
      </div>
      <div className="survey-bottom">
        <Link
          href={s.mode === "practice" ? "/" : "/survey/complete"}
          prefetch={true}
          className="button secondary"
        >
          Finish for now
        </Link>
        <Link className="button primary" href="/results" prefetch={true}>
          View my progress & debrief
        </Link>
      </div>
      {s.mode === "practice" && (
        <>
          <button
            className="text-link"
            onClick={async () => {
              try {
                await api("session/discard", {});
                router.push("/consent");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            End practice & return to consent
          </button>
          {error && <ErrorBox message={error} />}
        </>
      )}
    </div>
  );
}
function Locked() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startInstantPractice() {
    setBusy(true);
    setError("");
    try {
      const { randomToken } = await import("@/lib/client");
      const token = randomToken();
      await api("session/start", {
        consented: false,
        eligible: false,
        priorExposure: false,
        practice: true,
        token,
      });
      localStorage.setItem("cc-practice-exposure", "yes");
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="narrow page-space">
      <span className="icon-tile lavender">
        <LockKeyhole />
      </span>
      <PageHeading
        label="YOUR EXPERIENCE COMES FIRST"
        title="Start with the participation information."
      >
        Research participants complete their baseline questionnaire before
        seeing educational content. You can also decline research and choose
        practice-only play.
      </PageHeading>
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "18px" }}>
        <Link className="button primary" href="/consent">
          Read information & choose
        </Link>
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={startInstantPractice}
        >
          {busy ? "Starting Practice…" : "Practice Challenges Only"}
        </button>
      </div>
      {error && <ErrorBox message={error} />}
    </div>
  );
}
const nextMissionMap: Record<string, { id: string; name: string; code: string } | null> = {
  phishing: { id: "pretexting", name: "Story or Scam?", code: "M02" },
  pretexting: { id: "impersonation", name: "Who Is Behind the Account?", code: "M03" },
  impersonation: { id: "links", name: "Link Lab", code: "M04" },
  links: null,
};

const missionDebrief: Record<string, string> = {
  phishing:
    "Email spoofing, urgent artificial deadlines, and lookalike domain names are the primary vectors attackers use to harvest credentials. Always inspect raw sender addresses and verify independently out-of-band.",
  pretexting:
    "Pretexters exploit empathy, fabricated authority, and emergency pretexts to manipulate victims into revealing private information. Slow down, recognize high-pressure psychological tactics, and refuse data disclosure without independent confirmation.",
  impersonation:
    "Deceptive actors impersonate student council members, university administrators, or tech support using spoofed social accounts and cloned profiles. Never trust unverified messaging channels for sensitive data sharing or identity verification.",
  links:
    "Too-good-to-be-true offers, deceptive short links, and advance-fee release schemes prey on financial stress and curiosity. Inspect full DNS hostnames, verify offers through official campus channels, and never upload documents or credentials to unverified links.",
};

export function Mission({ missionId }: { missionId: string }) {
  const state = useSession(),
    m = missions.find((x) => x.id === missionId),
    [scenarios, setScenarios] = useState<Scenario[]>([]),
    [index, setIndex] = useState(0),
    [showSummary, setShowSummary] = useState(false),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [feedback, setFeedback] = useState<{
      attempt: Attempt;
      feedback: AnswerKey;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [sorted, setSorted] = useState<Record<number, string>>({});
  const started = useRef(0);
  const sessionId = state.session?.id;
  const canPlay = !!state.session && state.session.status !== "draft";
  useEffect(() => {
    if (!sessionId || !canPlay) return;
    let cancelled = false;
    Promise.all([
      api<{ scenarios: Scenario[] }>("scenarios"),
      api<{ session: Session }>("session"),
    ])
      .then(([content, saved]) => {
        if (cancelled) return;
        const list = content.scenarios.filter((s) => s.mission === missionId);
        setScenarios(list);
        const next = list.findIndex(
          (sc) => !saved.session.attempts.some((a) => a.scenarioId === sc.id),
        );
        setIndex(next < 0 ? 0 : next);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, canPlay, missionId]);
  useEffect(() => {
    started.current = Date.now();
    setSelected(null);
    setFeedback(null);
    setSorted({});
    setError("");
  }, [index]);
  async function decide(skip = false) {
    const sc = scenarios[index];
    if (!sc || busy) return;
    setBusy(true);
    setError("");
    try {
      const storageKey = "cc-pending-" + state.session!.code + "-" + sc.id;
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      const payload = saved ?? {
        scenarioId: sc.id,
        action: skip ? null : selected,
        elapsedMs: Math.min(
          86400000,
          Math.max(0, Date.now() - started.current),
        ),
        idempotencyKey: crypto.randomUUID(),
      };
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
      setSelected(payload.action);
      const result = await api<{
        session: Session;
        attempt: Attempt;
        feedback: AnswerKey;
      }>("game/attempt", payload);
      state.setSession(result.session);
      setFeedback(result);
      sessionStorage.removeItem(storageKey);
    } catch (e) {
      setError((e as Error).message);
    } finally {
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
  if (!state.session || state.session.status === "draft") return <Locked />;
  if (!m)
    return (
      <div className="narrow page-space">
        <h1>Mission not found</h1>
        <Link href="/play">Return to map</Link>
      </div>
    );
  const sc = scenarios[index];
  if (!sc)
    return (
      <div className="narrow page-space">
        {error ? (
          <ErrorBox message={error} retry={() => window.location.reload()} />
        ) : (
          <Loading />
        )}
      </div>
    );
  const first = state.session.attempts.find(
      (a) => a.scenarioId === sc.id && a.attemptNumber === 1,
    ),
    Icon = icons[m.icon],
    stats = scoreSummary(
      state.session.attempts.filter((a) =>
        (m.ids as readonly string[]).includes(a.scenarioId),
      ),
    );
  const maxPts = m.ids.length * 10;
  const nextMission = nextMissionMap[m.id];

  return (
    <div className="container page-space">
      <div className="mission-breadcrumb">
        <Link className="text-link" href="/play">
          <Map size={16} /> Campus map
        </Link>
        <span className="mission-breadcrumb-tag">{m.code ?? "MISSION"} · {m.topic.toUpperCase()}</span>
        <span>
          {sc.id} · Scenario {index + 1} of {scenarios.length}
        </span>
        <span>{stats.points} / {maxPts} first-attempt points</span>
      </div>
      <div className="game-heading">
        <PageHeading label={`${m.code ?? "MISSION"} · ${m.topic.toUpperCase()}`} title={m.name}>
          {m.description} Inspect the fictional evidence, then choose the safest cybersecurity action.
        </PageHeading>
        <span className={"icon-tile " + m.color}>
          <Icon size={30} />
        </span>
      </div>

      {/* Mission Progress Indicator */}
      <div className="mission-progress-indicator">
        <div className="progress-indicator-labels">
          <span>Scenario {index + 1} of {scenarios.length} · {stats.completed} of {scenarios.length} Resolved ({Math.round((stats.completed / Math.max(1, scenarios.length)) * 100)}%)</span>
          <strong>{stats.points} / {maxPts} XP Earned</strong>
        </div>
        <div className="progress-indicator-track">
          <div
            className="progress-indicator-fill"
            style={{ width: `${Math.max(4, (stats.completed / Math.max(1, scenarios.length)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Scenario Navigation Tabs */}
      <div className="scenario-tabs" aria-label="Scenarios">
        {scenarios.map((s, i) => {
          const attempt = state.session!.attempts.find(
            (a) => a.scenarioId === s.id && a.attemptNumber === 1,
          );
          const isResolved = !!attempt;
          const isSkipped = attempt?.selectedAction === null;
          const isCorrect = attempt?.correct === true;

          return (
            <button
              key={s.id}
              disabled={busy}
              className={`scenario-nav-btn ${index === i && !showSummary ? "selected" : ""}`}
              onClick={() => {
                setIndex(i);
                setShowSummary(false);
              }}
              aria-current={index === i && !showSummary ? "step" : undefined}
            >
              <span>{s.id}</span>
              {isResolved && (
                isSkipped ? (
                  <span className="scenario-nav-badge skipped" title="Skipped">
                    <RotateCcw size={11} />
                  </span>
                ) : isCorrect ? (
                  <span className="scenario-nav-badge correct" title="Correct (+10 XP)">
                    <Check size={12} />
                  </span>
                ) : (
                  <span className="scenario-nav-badge incorrect" title="Completed">
                    <Check size={12} />
                  </span>
                )
              )}
            </button>
          );
        })}
        {stats.completed === scenarios.length && (
          <button
            type="button"
            className={`scenario-nav-summary-btn ${showSummary ? "selected" : ""}`}
            onClick={() => setShowSummary(true)}
          >
            <Award size={14} />
            <span>Mission Summary</span>
          </button>
        )}
      </div>

      {showSummary ? (
        <div className="mission-completion-card card">
          <div className="completion-card-header">
            <span className="tag">MISSION COMPLETE</span>
            <h2>{m.code ?? "MISSION"} · {m.name} Summary</h2>
            <p className="mission-topic-sub">{m.topic}</p>
          </div>

          <div className="completion-stats-grid">
            <div className="completion-stat-tile">
              <span className="stat-label">SCENARIOS</span>
              <strong>{stats.completed} <small>/ {scenarios.length}</small></strong>
              <span>All {scenarios.length} Resolved</span>
            </div>
            <div className="completion-stat-tile">
              <span className="stat-label">XP EARNED</span>
              <strong>{stats.points} <small>/ {maxPts} XP</small></strong>
              <span>{Math.round((stats.points / Math.max(1, maxPts)) * 100)}% Max XP</span>
            </div>
            <div className="completion-stat-tile">
              <span className="stat-label">ACCURACY</span>
              <strong>{stats.accuracy === null ? "—" : `${Math.round(stats.accuracy)}%`}</strong>
              <span>{stats.correct} correct · {stats.attempted - stats.correct} incorrect</span>
            </div>
            <div className="completion-stat-tile">
              <span className="stat-label">SKIPPED</span>
              <strong>{stats.skipped}</strong>
              <span>Zero-penalty learning</span>
            </div>
          </div>

          <div className="completion-debrief-box">
            <h3><ShieldCheck size={18} className="text-cyan" /> Key Cybersecurity Takeaway</h3>
            <p>{missionDebrief[m.id] ?? "Review the investigative clues and verify sender identities out-of-band."}</p>
          </div>

          <div className="completion-actions-bar">
            {nextMission ? (
              <Link className="button primary large" href={`/play/${nextMission.id}`} prefetch={true}>
                <span>Continue to {nextMission.code}: {nextMission.name}</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link className="button primary large" href="/results" prefetch={true}>
                <span>View Platform Results & Debrief</span>
                <ArrowRight size={16} />
              </Link>
            )}
            <button
              type="button"
              className="button secondary"
              onClick={() => setShowSummary(false)}
            >
              <RotateCcw size={15} />
              <span>Review Scenarios</span>
            </button>
            <Link className="button ghost" href="/play" prefetch={true}>
              Return to Campus Map
            </Link>
          </div>
        </div>
      ) : (
        <div className="scenario-layout">
          <section className="scenario-evidence">
            <div className="scenario-context">
              <span className="tag">FICTIONAL CAMPUS SIMULATION</span>
              <h2>{sc.title}</h2>
              <p>{sc.situation}</p>
            </div>
            <div className={"message-window " + sc.interaction}>
              <div className="message-window-bar">
                <span />
                <span />
                <span />
                <strong>
                  {sc.interaction === "email"
                    ? "Campus inbox"
                    : sc.interaction === "chat"
                      ? "Simulated conversation"
                      : sc.interaction === "profile"
                        ? "Account inspection"
                        : "Link inspection"}
                </strong>
                <LockKeyhole size={14} />
              </div>
              <div className="message-content">
                <div className="sender-avatar">
                  <Icon size={24} />
                </div>
                <strong>{sc.senderName}</strong>
                <details className="sender-details">
                  <summary>
                    Inspect actual sender <ChevronDown size={13} />
                  </summary>
                  <code>{sc.senderAddress}</code>
                  <p>The displayed name and actual address are separate clues.</p>
                </details>
                <div className="message-body">{sc.message}</div>
                {sc.interaction === "chat" && selected && (
                  <div className="chat-reply">
                    <small>Your proposed reply · not sent</small>
                    <p>{sc.choices.find((c) => c.id === selected)?.reply}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="clue-list">
              <h3>Take a closer look</h3>
              {sc.evidence.map((e, i) => (
                <details key={sc.id + i} className="clue">
                  <summary>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {e.label}
                    <ChevronDown size={16} />
                  </summary>
                  <p>{e.detail}</p>
                  {e.url && (
                    <div className="url-preview">
                      <span>VISIBLE TEXT</span>
                      <code>{e.displayText}</code>
                      <span>ACTUAL HOSTNAME</span>
                      <code>{new URL(e.url).hostname}</code>
                      <span>PATH</span>
                      <code>{new URL(e.url).pathname}</code>
                      <small>
                        Safe preview · authored evidence · never opens a
                        destination
                      </small>
                    </div>
                  )}
                  {sc.interaction === "url" && (
                    <div className="evidence-sort">
                      <p>Organise this clue for your own review (unscored):</p>
                      <button
                        className={
                          "button secondary " +
                          (sorted[i] === "check" ? "selected" : "")
                        }
                        onClick={() => setSorted({ ...sorted, [i]: "check" })}
                      >
                        Needs checking
                      </button>
                      <button
                        className={
                          "button secondary " +
                          (sorted[i] === "context" ? "selected" : "")
                        }
                        onClick={() => setSorted({ ...sorted, [i]: "context" })}
                      >
                        Established context
                      </button>
                    </div>
                  )}
                </details>
              ))}
            </div>
            {sc.interaction === "chat" && (
              <div className="card">
                <h3>What stays private?</h3>
                <p className="small-copy">
                  An unscored note to yourself. All details are fictional and
                  prefilled.
                </p>
                {[
                  "Authentication code: [CODE WITHHELD]",
                  "Account password: [NOT SHARED]",
                  "Identity document: [NO UPLOAD]",
                ].map((t) => (
                  <label className="checkbox-row" key={t}>
                    <input type="checkbox" />
                    <span>Withhold {t}</span>
                  </label>
                ))}
              </div>
            )}
            {sc.interaction === "profile" && (
              <details className="clue">
                <summary>
                  Compare call-back routes
                  <ChevronDown size={16} />
                </summary>
                <p>
                  A number or address supplied by an unverified account leads back
                  to the same unverified source. An existing handbook, saved bank
                  app, or established campus directory offers an independent
                  route. No calls are placed.
                </p>
              </details>
            )}
          </section>
          <aside className="decision-panel">
            <div className="card">
              <span className="mini-label">YOUR NEXT STEP</span>
              <h2>What would you do?</h2>
              <p className="small-copy">
                Choose the best decision using all the stated context.
              </p>
              {first && !feedback && (
                <div className="notice">
                  Practice replay. Your first score of {first.points} / 10 is
                  locked.
                </div>
              )}
              <fieldset
                className="decision-options"
                disabled={busy || !!feedback}
              >
                <legend className="sr-only">Choose your action</legend>
                {sc.choices.map((c) => (
                  <label
                    className={
                      "answer-option " + (selected === c.id ? "chosen" : "")
                    }
                    key={c.id}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={selected === c.id}
                      onChange={() => setSelected(c.id)}
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </fieldset>
              {!feedback && (
                <>
                  <button
                    className="button primary full"
                    disabled={!selected || busy}
                    onClick={() => decide()}
                  >
                    {busy ? "Saving decision…" : "Confirm decision"}
                  </button>
                  <button
                    className="skip-question"
                    disabled={busy}
                    onClick={() => decide(true)}
                  >
                    Skip this scenario
                  </button>
                </>
              )}
              {error && <ErrorBox message={error} retry={() => decide()} />}
              {feedback && (
                <Reveal className="feedback">
                  <span className="feedback-label">
                    {feedback.attempt.selectedAction === null
                      ? "Skipped — ready to learn"
                      : feedback.attempt.correct
                        ? "Good call."
                        : "A useful clue for next time."}
                  </span>
                  <h3>
                    {feedback.attempt.attemptNumber === 1
                      ? feedback.attempt.points + " / 10 first-attempt points"
                      : "Practice replay · first score unchanged"}
                  </h3>
                  <p>{feedback.feedback.explanation}</p>
                  <h4>Why privacy is involved</h4>
                  <p>{feedback.feedback.consequence}</p>
                  {index < scenarios.length - 1 ? (
                    <button
                      className="button primary full"
                      onClick={() => setIndex(index + 1)}
                    >
                      Next scenario
                    </button>
                  ) : (
                    <>
                      <button
                        className="button primary full"
                        onClick={() => setShowSummary(true)}
                      >
                        View mission summary
                      </button>
                      <Link className="button secondary full" href="/play">
                        Return to campus map
                      </Link>
                    </>
                  )}
                  <button
                    className="button ghost"
                    onClick={() => {
                      setFeedback(null);
                      setSelected(null);
                      started.current = Date.now();
                    }}
                  >
                    <RotateCcw size={15} /> Try again for practice
                  </button>
                </Reveal>
              )}
            </div>
            <p className="small-copy">
              Only your first decision can earn points. Skips count as reviewed,
              not attempted, in accuracy statistics. Looking at clues has no
              score.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
export function Results() {
  const state = useSession();
  if (state.loading) return <Loading />;
  if (state.error)
    return (
      <div className="narrow page-space">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  if (!state.session || state.session.status === "draft") return <Locked />;
  const s = state.session,
    stats = scoreSummary(s.attempts);
  return (
    <div className="narrow page-space">
      <PageHeading
        label="YOUR ACTIVITY & DEBRIEF"
        title="A little more context for campus life."
      >
        These results describe performance during an educational game. They do
        not measure your real-world risk or score your questionnaire.
      </PageHeading>
      <div className="stats-grid">
        <div className="stat-card">
          <span>First-attempt points</span>
          <strong>
            {stats.points}
            <small> / 120</small>
          </strong>
        </div>
        <div className="stat-card">
          <span>First-attempt accuracy</span>
          <strong>
            {stats.accuracy === null ? "—" : Math.round(stats.accuracy) + "%"}
          </strong>
          <p>
            {stats.correct} correct / {stats.attempted} attempted
          </p>
        </div>
        <div className="stat-card">
          <span>Scenarios reviewed</span>
          <strong>
            {stats.completed}
            <small> / 12</small>
          </strong>
          <p>{stats.skipped} skipped</p>
        </div>
      </div>
      <div className="card">
        <h2>Your mission badges</h2>
        {missions.map((m) => {
          const sum = scoreSummary(
            s.attempts.filter((a) =>
              (m.ids as readonly string[]).includes(a.scenarioId),
            ),
          );
          const maxPts = m.ids.length * 10;
          return (
            <div className="review-answer" key={m.id}>
              <strong>{m.name}</strong>
              <p>
                {sum.completed === m.ids.length
                  ? "✓ Mission complete"
                  : "In progress · " + sum.completed + " / " + m.ids.length + " reviewed"}{" "}
                · {sum.points} / {maxPts} points · {sum.attempted} attempted
              </p>
            </div>
          );
        })}
        <p className="small-copy">
          Badges recognise completion, not privacy protection or low real-world
          risk. Replays do not replace first decisions.
        </p>
      </div>
      <div className="card prose">
        <h2>Connecting the missions to privacy</h2>
        <p>
          Phishing messages, invented stories, impersonating accounts, and
          deceptive offers or links can expose information, allow unauthorised
          account access, or lead to misuse. These threats can overlap in real
          situations.
        </p>
        <p>
          Independent verification, using an established contact route, and
          sharing only information needed for a confirmed purpose can help
          protect information. HTTPS, a polished profile, or good grammar alone
          does not prove legitimacy. Not every unexpected message is malicious;
          context and verification matter.
        </p>
        <p>
          People can experience concern, use protective behaviours, and still
          encounter threats. Your answers about privacy in Q19–Q25 are personal
          experiences and perceptions, with no correct or incorrect response.
        </p>
        <p>
          Feedback in earlier scenarios may influence later decisions. These
          game metrics are supplementary learning observations, separate from
          the study’s baseline and dependent variable.
        </p>
      </div>
      <div className="survey-bottom">
        <Link className="button secondary" href="/">
          Finish for now
        </Link>
        <Link className="button primary" href="/play">
          Return to missions
        </Link>
      </div>
    </div>
  );
}
