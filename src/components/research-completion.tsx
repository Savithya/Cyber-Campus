"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  Lock,
  Download,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  Play,
  FileText,
  Printer,
  Sparkles,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  GraduationCap,
  Building,
  KeyRound,
  Check,
  Home,
  Gamepad2,
  Info,
} from "lucide-react";
import { api, useSession, loadDraft, clearDraft } from "@/lib/client";
import { missions, getActiveMissions } from "@/content/missions";
import { scoreSummary, getOperativeRank } from "@/lib/scoring";
import type { Scenario, Attempt, AnswerKey, Session } from "@/lib/types";
import { InteractiveChallengeRunner } from "./interactive-challenge-runner";
import { ResearchProgressStepper } from "./research-progress-stepper";
import { Loading, ErrorBox, PageHeading, Reveal } from "./ui";

const missionIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  mail: Mail,
  chat: MessagesSquare,
  profile: UserRoundSearch,
  link: Link2,
  sparkles: Sparkles,
};

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function ResearchCompletion() {
  const router = useRouter();
  const state = useSession();

  const [token, setToken] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [debriefKeys, setDebriefKeys] = useState<Record<string, AnswerKey>>({});
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [selectedThreatFilter, setSelectedThreatFilter] = useState<string>("all");
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({});

  // Practice Sandbox Replay Modal
  const [sandboxScenario, setSandboxScenario] = useState<Scenario | null>(null);

  // Load private receipt token
  useEffect(() => {
    if (state.session && state.session.status !== "draft") {
      const d = loadDraft(state.session.code);
      const r = JSON.parse(sessionStorage.getItem("cc-receipt") ?? "null");
      const t = d?.token ?? (r?.code === state.session.code ? r.token : null);
      setToken(t);
      if (t) {
        sessionStorage.setItem(
          "cc-receipt",
          JSON.stringify({
            code: state.session.code,
            token: t,
            deadline: state.session.withdrawDeadline,
          }),
        );
      }
      clearDraft();
    }
  }, [state.session]);

  // Load scenarios and debrief answer keys
  useEffect(() => {
    if (!state.session) return;
    Promise.all([
      api<{ scenarios: Scenario[] }>("scenarios").catch(() => ({ scenarios: [] })),
      api<{ debrief: Record<string, AnswerKey> }>("debrief").catch(() => ({ debrief: {} })),
    ])
      .then(([scRes, dbRes]) => {
        setScenarios(scRes.scenarios || []);
        setDebriefKeys(dbRes.debrief || {});
      })
      .finally(() => {
        setLoadingContent(false);
      });
  }, [state.session]);

  if (state.loading || loadingContent) return <Loading />;
  if (state.error) {
    return (
      <div className="container page-space narrow">
        <ErrorBox message={state.error} retry={state.reload} />
      </div>
    );
  }

  const s = state.session;
  if (!s || s.status === "draft") {
    return (
      <div className="container page-space narrow text-center">
        <h2>Research Session Incomplete</h2>
        <p>You have not started or submitted your research session yet.</p>
        <Link href="/consent" className="button primary large mt-4">
          <span>Go to Research Consent</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const attempts = s.attempts ?? [];
  const firstAttempts = attempts.filter((a) => a.attemptNumber === 1);
  const completedCount = firstAttempts.length;
  const totalScenariosCount = scenarios.length || 20;
  const scoreStats = scoreSummary(attempts);
  const operativeXP = completedCount * 10;
  const rank = getOperativeRank(operativeXP);

  // Calculate Badges
  const badges: Badge[] = [
    {
      id: "b_phishing",
      title: "Phishing Investigator",
      description: "Evaluated all 5 email, SMS, QR, and attachment phishing challenges (IV1).",
      icon: "mail",
      unlocked: missions[0].ids.every((id) => firstAttempts.some((a) => a.scenarioId === id)),
    },
    {
      id: "b_pretexting",
      title: "Pretexting Sleuth",
      description: "Detected false authority and high-urgency psychological manipulation (IV2).",
      icon: "chat",
      unlocked: missions[1].ids.every((id) => firstAttempts.some((a) => a.scenarioId === id)),
    },
    {
      id: "b_impersonation",
      title: "Identity Verifier",
      description: "Corroborated faculty, classmate, and tech support accounts via official directories (IV3).",
      icon: "profile",
      unlocked: missions[2].ids.every((id) => firstAttempts.some((a) => a.scenarioId === id)),
    },
    {
      id: "b_scams",
      title: "Scam Hunter",
      description: "Exposed counterfeit e-commerce discounts, accommodation scams, and bad links (IV4).",
      icon: "link",
      unlocked: missions[3].ids.every((id) => firstAttempts.some((a) => a.scenarioId === id)),
    },
    {
      id: "b_sentinel",
      title: "Campus Cyber Sentinel",
      description: "Completed all 20 interactive simulation scenarios across all four research threat categories.",
      icon: "award",
      unlocked: completedCount >= 20,
    },
  ];

  function toggleScenario(id: string) {
    setExpandedScenarios((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function downloadReceipt() {
    if (!s) return;
    const text = [
      "============================================================",
      "   CYBER CAMPUS RESEARCH PLATFORM — PARTICIPATION RECEIPT   ",
      "============================================================",
      `Study: Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka`,
      `Participant Anonymous Code: ${s.code}`,
      `Submission ID: ${s.submissionId ?? s.id}`,
      `Submitted at (UTC): ${s.submittedAt ?? s.createdAt}`,
      `Submitted at (Asia/Colombo): ${s.submittedAt ? new Date(s.submittedAt).toLocaleString("en-GB", { timeZone: "Asia/Colombo" }) : "N/A"}`,
      `Total Challenges Completed: ${completedCount} / ${totalScenariosCount}`,
      `Operative Rank: ${rank.title} (Level ${rank.level})`,
      `Total Operative XP: ${operativeXP} XP`,
      `Private Withdrawal Token: ${token ?? "Not available on this device"}`,
      `Withdrawal Deadline: ${s.withdrawDeadline ? new Date(s.withdrawDeadline).toLocaleString("en-GB", { timeZone: "Asia/Colombo" }) : "N/A"} (Asia/Colombo)`,
      "",
      "IMPORTANT PRIVACY NOTICE:",
      "Keep this receipt and private token safe if you wish to withdraw your responses",
      "prior to the withdrawal deadline. Research administrators cannot recover lost tokens.",
      "============================================================",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyber-campus-receipt-${s.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredScenarios =
    selectedThreatFilter === "all"
      ? scenarios
      : scenarios.filter((sc) => {
          const m = missions.find((x) => x.ids.includes(sc.id));
          return m?.id === selectedThreatFilter;
        });

  return (
    <div className="completion-page-container container page-space">
      {/* 4-Stage Reusable Progress Stepper */}
      <ResearchProgressStepper currentStep={4} />

      {/* Completion Header */}
      <header className="completion-main-header">
        <div className="eyebrow">
          <ShieldCheck size={16} className="text-emerald" aria-hidden="true" />
          <span>STEP 04 OF 04 · RESEARCH PARTICIPATION COMPLETE</span>
        </div>
        <h1 className="completion-title">
          Thank You for Participating!
        </h1>
        <p className="completion-subtitle">
          Your participation contributes to academic research on social engineering threats and user privacy among university students in Sri Lanka.
        </p>

        {s.mode === "demo" && (
          <div className="demo-mode-compact-banner mt-4" role="status">
            <Info size={16} className="text-cyan" aria-hidden="true" />
            <span>Demonstration Mode — This was an interactive preview; responses were not submitted to the live research dataset.</span>
          </div>
        )}

        {/* 4-Item Simple Completion Summary Card */}
        <div className="completion-summary-card" role="region" aria-label="Participation Summary">
          <div className="summary-item">
            <span className="summary-label">Scenarios Completed</span>
            <strong className="summary-value text-primary">{completedCount} of {totalScenariosCount} Scenarios</strong>
          </div>
          <div className="summary-divider" aria-hidden="true" />
          <div className="summary-item">
            <span className="summary-label">Research Status</span>
            <strong className="summary-value text-emerald">
              {s.mode === "demo" ? "Demo Session Saved" : "Confirmed & Recorded"}
            </strong>
          </div>
          <div className="summary-divider" aria-hidden="true" />
          <div className="summary-item">
            <span className="summary-label">Anonymous Reference</span>
            <strong className="summary-value font-mono text-cyan">{s.code}</strong>
          </div>
          <div className="summary-divider" aria-hidden="true" />
          <div className="summary-item">
            <span className="summary-label">Threat Categories</span>
            <strong className="summary-value">4 / 4 Threat Vectors</strong>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="completion-nav-actions">
          <Link href="/" className="button primary large">
            <Home size={18} aria-hidden="true" />
            <span>Return Home</span>
          </Link>
          <a href="/#challenges" className="button secondary large">
            <Gamepad2 size={18} aria-hidden="true" />
            <span>Explore Cyber Challenges</span>
          </a>
          <button type="button" className="button ghost large" onClick={downloadReceipt}>
            <Download size={18} aria-hidden="true" />
            <span>Download Participation Receipt</span>
          </button>
        </div>
      </header>

      {/* Official Research Completion Certificate Card */}
      <div className="card research-certificate-card my-6">
        <div className="certificate-inner-border">
          <div className="certificate-header">
            <div className="cert-seal">
              <GraduationCap size={36} className="text-cyan" aria-hidden="true" />
            </div>
            <div className="cert-headings">
              <span className="cert-institute">UNIVERSITY CYBERSECURITY RESEARCH INITIATIVE</span>
              <h2 className="cert-title">Certificate of Research Participation</h2>
              <p className="cert-subtitle">
                &ldquo;Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka&rdquo;
              </p>
            </div>
          </div>

          <div className="certificate-body-grid">
            <div className="cert-field">
              <span className="cert-field-label">ANONYMOUS PARTICIPANT CODE</span>
              <strong className="cert-field-val text-cyan font-mono text-lg">{s.code}</strong>
            </div>

            <div className="cert-field">
              <span className="cert-field-label">SUBMISSION IDENTIFIER</span>
              <strong className="cert-field-val font-mono text-xs">{s.submissionId ?? s.id}</strong>
            </div>

            <div className="cert-field">
              <span className="cert-field-label">RECORDED TIMESTAMP</span>
              <strong className="cert-field-val text-sm">
                {s.submittedAt
                  ? new Date(s.submittedAt).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })
                  : new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" })}{" "}
                (Asia/Colombo)
              </strong>
            </div>

            <div className="cert-field">
              <span className="cert-field-label">CHALLENGES EVALUATED</span>
              <strong className="cert-field-val text-emerald font-semibold">
                {completedCount} of {totalScenariosCount} Scenarios
              </strong>
            </div>

            <div className="cert-field">
              <span className="cert-field-label">OPERATIVE XP &amp; RANK</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge-level">LVL {rank.level}</span>
                <strong className="cert-field-val text-base">{rank.title}</strong>
                <span className="text-muted text-xs">({operativeXP} XP)</span>
              </div>
            </div>

            <div className="cert-field">
              <span className="cert-field-label">RESEARCH INTEGRITY STATUS</span>
              <div className="flex items-center gap-1.5 text-emerald text-sm font-medium mt-1">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>Primary Research Response Locked</span>
              </div>
            </div>
          </div>

          <div className="certificate-footer">
            <p className="cert-disclaimer">
              This certificate verifies voluntary participation in an empirical cybersecurity research study.
              Responses are anonymized and stored strictly in aggregated form in accordance with ethical standards.
            </p>
            <div className="cert-actions">
              <button
                type="button"
                className="button secondary small"
                onClick={() => window.print()}
              >
                <Printer size={15} aria-hidden="true" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                className="button secondary small"
                onClick={downloadReceipt}
              >
                <Download size={15} aria-hidden="true" />
                <span>Save Private Receipt (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Research Achievement Badges */}
      <section className="mb-8" aria-label="Research Achievement Badges">
        <div className="section-title mb-4">
          <Award size={20} className="text-amber" aria-hidden="true" />
          <h2 className="text-xl font-bold">Research Investigation Badges</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((b) => {
            const IconComponent =
              b.icon === "mail"
                ? Mail
                : b.icon === "chat"
                  ? MessagesSquare
                  : b.icon === "profile"
                    ? UserRoundSearch
                    : b.icon === "link"
                      ? Link2
                      : b.icon === "sparkles"
                        ? Sparkles
                        : Award;
            return (
              <div
                key={b.id}
                className={`card badge-card ${b.unlocked ? "unlocked" : "locked"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`badge-icon-tile ${b.unlocked ? "active" : "inactive"}`}>
                    <IconComponent size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{b.title}</h3>
                      {b.unlocked ? (
                        <span className="badge-status-tag unlocked">
                          <Check size={11} strokeWidth={3} aria-hidden="true" /> Unlocked
                        </span>
                      ) : (
                        <span className="badge-status-tag locked">In Progress</span>
                      )}
                    </div>
                    <p className="text-muted text-xs mt-1 leading-relaxed">{b.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Private Receipt & Withdrawal Management */}
      <div className="card receipt mb-8">
        <div className="section-title">
          <KeyRound size={20} className="text-cyan" aria-hidden="true" />
          <h2 className="text-xl font-bold">Confidentiality &amp; Withdrawal Protocol</h2>
        </div>
        <p className="text-sm text-muted">
          Your participation is completely voluntary. As described in the research consent agreement,
          you may withdraw your response at any time before the withdrawal deadline using your private deletion token.
        </p>

        <div className="receipt-meta-box mt-4">
          <div>
            <span className="text-xs text-muted block">ANONYMOUS CODE</span>
            <strong className="font-mono text-cyan">{s.code}</strong>
          </div>
          <div>
            <span className="text-xs text-muted block">WITHDRAWAL DEADLINE</span>
            <strong className="text-sm">
              {s.withdrawDeadline
                ? new Date(s.withdrawDeadline).toLocaleString("en-GB", { timeZone: "Asia/Colombo" })
                : "Not applicable"}{" "}
              (Asia/Colombo)
            </strong>
          </div>
        </div>

        {token ? (
          <div className="receipt-token-section mt-4">
            <details className="token-details">
              <summary className="cursor-pointer text-sm font-semibold text-cyan flex items-center gap-1.5">
                <span>Show Private Cryptographic Token</span>
                <ChevronDown size={14} aria-hidden="true" />
              </summary>
              <div className="token-display-box mt-2">
                <code className="token text-xs font-mono select-all">{token}</code>
              </div>
            </details>
            <div className="mt-3">
              <button
                type="button"
                className="button secondary small"
                onClick={downloadReceipt}
              >
                <Download size={15} aria-hidden="true" />
                <span>Save Private Receipt to Device</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="notice mt-4 text-xs">
            This browser does not retain your private token. Please refer to the receipt downloaded at the start of your session.
          </p>
        )}
      </div>

      {/* Educational Debrief & Threat Forensic Breakdown */}
      <section className="card educational-debrief-hub mb-8" aria-label="Educational Debrief">
        <div className="debrief-header">
          <div className="section-title">
            <ShieldAlert size={22} className="text-cyan" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold">Educational Debrief &amp; Threat Forensics</h2>
              <p className="text-muted text-sm mt-0.5">
                Review attacker tactics, forensic indicators, and privacy implications for all 20 research scenarios.
                Test alternative decisions in the interactive sandbox without affecting your recorded research data.
              </p>
            </div>
          </div>

          {/* Threat Filter Tabs */}
          <div className="threat-filter-row mt-4" role="tablist" aria-label="Filter Scenarios by Threat Module">
            <button
              type="button"
              className={`threat-pill ${selectedThreatFilter === "all" ? "active" : ""}`}
              onClick={() => setSelectedThreatFilter("all")}
            >
              All Scenarios ({scenarios.length})
            </button>
            {getActiveMissions(false).map((m) => (
              <button
                key={m.id}
                type="button"
                className={`threat-pill ${selectedThreatFilter === m.id ? "active" : ""}`}
                onClick={() => setSelectedThreatFilter(m.id)}
              >
                {m.code}: {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios List */}
        <div className="scenarios-debrief-list mt-6 space-y-4">
          {filteredScenarios.map((sc) => {
            const m = missions.find((x) => x.ids.includes(sc.id));
            const attempt = firstAttempts.find((a) => a.scenarioId === sc.id);
            const answerKey = debriefKeys[sc.id];
            const isExpanded = !!expandedScenarios[sc.id];

            const chosenChoice = sc.choices.find((c) => c.id === attempt?.selectedAction);
            const isUnsafe = attempt?.unsafe === true;
            const isProtective = attempt && !isUnsafe && attempt.selectedAction !== null;
            const isSkipped = attempt?.selectedAction === null;

            return (
              <article key={sc.id} className="debrief-scenario-card border rounded-lg p-4 bg-surface">
                <div className="debrief-card-summary flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="badge-scenario-id font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-raised border">
                        {sc.id}
                      </span>
                      <span className="text-xs text-muted uppercase font-medium tracking-wide">
                        {m?.name ?? "Cyber Threat"}
                      </span>
                      {attempt ? (
                        isProtective ? (
                          <span className="badge-decision protective flex items-center gap-1 text-xs text-emerald font-medium">
                            <ShieldCheck size={13} aria-hidden="true" /> Protective Action Chosen
                          </span>
                        ) : isUnsafe ? (
                          <span className="badge-decision unsafe flex items-center gap-1 text-xs text-red font-medium">
                            <AlertTriangle size={13} aria-hidden="true" /> Unsafe Decision Recorded
                          </span>
                        ) : (
                          <span className="badge-decision skipped flex items-center gap-1 text-xs text-muted font-medium">
                            <Clock size={13} aria-hidden="true" /> Skipped
                          </span>
                        )
                      ) : (
                        <span className="badge-decision unreviewed text-xs text-muted">Not Yet Evaluated</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mt-1">{sc.title}</h3>
                    <p className="text-muted text-sm line-clamp-2 mt-0.5">{sc.situation}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="button secondary small"
                      onClick={() => setSandboxScenario(sc)}
                    >
                      <Play size={13} aria-hidden="true" />
                      <span>Practice Sandbox</span>
                    </button>
                    <button
                      type="button"
                      className="button ghost small"
                      onClick={() => toggleScenario(sc.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} debrief for ${sc.id}`}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Forensic Breakdown */}
                {isExpanded && (
                  <div className="debrief-details-panel mt-4 pt-4 border-t space-y-4">
                    {/* Decision Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded border bg-surface-subtle">
                        <span className="text-xs font-semibold text-muted block mb-1">
                          YOUR RECORDED FIRST RESPONSE
                        </span>
                        {attempt ? (
                          chosenChoice ? (
                            <div>
                              <strong className="text-sm font-medium">{chosenChoice.label}</strong>
                              <div className="text-xs text-muted mt-1">
                                Privacy Risk Score: <strong>{attempt.privacyRiskScore} / 4</strong>
                                {attempt.disclosedInfoCategory && attempt.disclosedInfoCategory !== "None" && (
                                  <span className="block text-red mt-0.5">
                                    Disclosed Data: {attempt.disclosedInfoCategory}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted">Scenario Skipped (No Data Disclosed)</span>
                          )
                        ) : (
                          <span className="text-sm text-muted">Scenario was not attempted during your study session.</span>
                        )}
                      </div>

                      <div className="p-3 rounded border bg-surface-subtle">
                        <span className="text-xs font-semibold text-muted block mb-1">
                          RECOMMENDED DEFENSIVE ACTION
                        </span>
                        {answerKey ? (
                          <div>
                            <strong className="text-sm font-medium text-emerald">
                              {sc.choices.find((c) => c.id === answerKey.action)?.label ?? answerKey.action}
                            </strong>
                            <p className="text-xs text-muted mt-1 leading-relaxed">
                              {answerKey.explanation}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted">Verifying sender independently and withholding credentials.</span>
                        )}
                      </div>
                    </div>

                    {/* Threat Analysis & Consequence on User Privacy */}
                    <div className="p-3 rounded border bg-surface-subtle">
                      <h4 className="text-sm font-semibold flex items-center gap-1.5 text-cyan">
                        <AlertTriangle size={15} aria-hidden="true" />
                        <span>Privacy Risk &amp; Threat Consequence</span>
                      </h4>
                      <p className="text-sm text-muted mt-1 leading-relaxed">
                        {answerKey?.consequence ??
                          "Unsafe disclosure in this scenario exposes user credentials, authentication tokens, or personal identifiers to unauthorized third parties."}
                      </p>
                      {answerKey?.sensitiveDataAtStake && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-foreground">Sensitive Data at Stake: </span>
                          <span className="text-amber">{answerKey.sensitiveDataAtStake}</span>
                        </div>
                      )}
                    </div>

                    {/* Forensic Clues & Red Flags */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                        Forensic Clues Present in Scenario
                      </h4>
                      <div className="space-y-2">
                        {sc.evidence.map((ev, i) => (
                          <div key={i} className="text-xs p-2.5 rounded bg-surface-raised border">
                            <strong className="text-foreground block mb-0.5">{ev.label}</strong>
                            <p className="text-muted leading-relaxed">{ev.detail}</p>
                            {ev.url && (
                              <div className="mt-1 font-mono text-[11px] text-cyan break-all">
                                Destination: {ev.url}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-World Advice for Sri Lankan University Students */}
                    <div className="p-3 rounded border border-cyan/20 bg-cyan/5">
                      <h4 className="text-sm font-semibold text-cyan flex items-center gap-1.5">
                        <ShieldCheck size={16} aria-hidden="true" />
                        <span>Real-World Protection Guidance for Sri Lankan Students</span>
                      </h4>
                      <ul className="text-xs text-muted mt-2 space-y-1.5 list-disc pl-4 leading-relaxed">
                        <li>
                          Always verify Sri Lankan university portal domains ending in <code>.ac.lk</code> rather than lookalike <code>.com</code> or <code>.org</code> domains.
                        </li>
                        <li>
                          University IT and administrative departments will never demand immediate password sharing, OTPs, or credential re-verification under short deadlines.
                        </li>
                        <li>
                          For suspicious incidents, report to your campus IT center or contact Sri Lanka CERT|CC on hotline <strong>1901</strong> or via email at <strong>report@cert.gov.lk</strong>.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Action Row */}
      <div className="survey-bottom flex items-center justify-between flex-wrap gap-4 mt-8 pt-6 border-t">
        <div className="flex items-center gap-3">
          <Link href="/play" className="button secondary">
            <RotateCcw size={16} aria-hidden="true" />
            <span>Return to Cyber Mission Control</span>
          </Link>
          <Link href="/" className="button ghost">
            <span>Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/consent" className="button primary">
            <span>Submit Another Anonymous Response</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Practice Sandbox Replay Modal */}
      {sandboxScenario && (
        <div className="modal-backdrop" onClick={() => setSandboxScenario(null)}>
          <div
            className="modal-dialog max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <span className="modal-title flex items-center gap-2">
                <Play size={18} className="text-cyan" aria-hidden="true" />
                <span>Interactive Practice Sandbox · {sandboxScenario.id}</span>
              </span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSandboxScenario(null)}
                aria-label="Close Practice Sandbox"
              >
                ✕
              </button>
            </div>
            <div className="modal-body p-4">
              <div className="notice mb-4">
                <ShieldCheck size={16} className="text-cyan shrink-0" aria-hidden="true" />
                <span className="text-xs">
                  <strong>Sandbox Practice Mode:</strong> Decisions made here are for interactive learning only.
                  They do not modify your recorded primary research response.
                </span>
              </div>

              <InteractiveChallengeRunner
                scenario={sandboxScenario}
                missionId={sandboxScenario.mission}
                scenarioIndex={0}
                totalInMission={1}
                educationalMode={true}
                onCompleteScenario={() => {
                  // Educational replay only; do nothing to primary session
                }}
                onReturnToHub={() => {
                  setSandboxScenario(null);
                }}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button secondary small"
                onClick={() => setSandboxScenario(null)}
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
