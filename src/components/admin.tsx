"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  Users,
  Gamepad2,
  Download,
  Search,
  SlidersHorizontal,
  LogOut,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Sigma,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { questions, sections } from "@/content/questionnaire";
import { missions } from "@/content/missions";
import {
  aggregateQuestion,
  filterSessions,
  describeFilters,
  colomboTime,
} from "@/lib/analytics";
import { downloadChart } from "@/lib/chart-download";
import { exportKinds, toCsv } from "@/lib/csv";
import { scoreSummary, computeThreatMetrics } from "@/lib/scoring";
import { api } from "@/lib/client";
import type { Session, Filters, Question } from "@/lib/types";
import { PageHeading, ErrorBox } from "./ui";
import StatisticalAnalysis from "./statistical-analysis";
const navs = [
  ["", "Overview", LayoutDashboard],
  ["threats", "Threat Impact Comparison", ShieldAlert],
  ["iv-analysis", "Threat Variables (IV1–IV4)", Layers],
  ["privacy-dv", "User Privacy (DV)", ShieldCheck],
  ["statistics", "Statistical Analysis", Sigma],
  ["questions", "Question explorer", ChartNoAxesCombined],
  ["responses", "Submission history", Users],
  ["game-analytics", "Challenge Analytics", Gamepad2],
  ["exports", "Export centre", Download],
] as const;
export default function Admin({
  sessions,
  demo,
  path,
}: {
  sessions: Session[];
  demo: boolean;
  path: string[];
}) {
  const router = useRouter();
  const base = demo ? "/demo" : "/admin",
    params = useSearchParams();
  const [filters, setFilters] = useState<Filters>(
      Object.fromEntries(params.entries()),
    ),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [error, setError] = useState("");
  const filtered = filterSessions(sessions, filters),
    all = filterSessions(sessions, filters, false),
    active = path[0] ?? "",
    selected = questions.find((q) => q.id === path[1]),
    filterText = describeFilters(filters);
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  ).toString();
  const href = (p: string) =>
    base + (p ? "/" + p : "") + (query ? "?" + query : "");
  const submitted = all.filter(
    (s) =>
      s.status === "submitted_complete" || s.status === "submitted_with_missing",
  );
  const totalSubmissions = submitted.length;
  const uniqueParticipants = new Set(
    submitted.map((s) => s.participantId || s.code),
  ).size;

  const counts = {
    totalSubmissions,
    uniqueParticipants,
    complete: all.filter((s) => s.status === "submitted_complete").length,
    missing: all.filter((s) => s.status === "submitted_with_missing").length,
    drafts: all.filter((s) => s.status === "draft").length,
    games: filtered.filter((s) => s.attempts.length).length,
  };
  function change(key: string, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setPage(0);
    const q = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v) as [string, string][],
    );
    history.replaceState(
      null,
      "",
      location.pathname + (q.size ? "?" + q.toString() : ""),
    );
  }
  const shown = questions.filter((q) =>
    (q.id + " " + q.text + " " + q.dimension)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const allAttempts = filtered.flatMap((s) => s.attempts),
    first = allAttempts.filter((a) => a.attemptNumber === 1),
    scores = filtered
      .filter((s) => s.attempts.length)
      .map((s) => scoreSummary(s.attempts).points);
  const [selectedIvId, setSelectedIvId] = useState<string>("IV1");
  const threatSummary = computeThreatMetrics(allAttempts);
  const highestThreat = threatSummary.highestThreat;
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="research-label">
          <ShieldCheck size={20} />
          <span>RESEARCH WORKSPACE</span>
        </div>
        <nav aria-label="Researcher navigation">
          {navs.map(([p, label, Icon]) => (
            <Link
              key={p}
              href={href(p)}
              className={active === p ? "selected" : ""}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span className="tag">
            {demo ? "SYNTHETIC PREVIEW" : "RESEARCH MODE"}
          </span>
          <p>
            {demo
              ? "48 authored fixture sessions. Your local trial responses are not included."
              : "Private access · assigned researcher role"}
          </p>
          {!demo && (
            <button
              className="button secondary"
              onClick={async () => {
                await api("auth/logout", {});
                router.replace("/admin/login");
                router.refresh();
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          )}
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <span>
            Cyber Campus /{" "}
            <strong>
              {navs.find((n) => n[0] === active)?.[1] ?? "Report"}
            </strong>
          </span>
          <span>Asia/Colombo (UTC+05:30)</span>
        </div>
        <PageHeading
          label="STUDENT PRIVACY RESEARCH"
          title={
            selected
              ? selected.id + " · Response distribution"
              : active === "statistics"
                ? "Advanced Statistical Analysis"
                : active === "questions"
                  ? "Every question. Its own perspective."
                  : active === "responses"
                    ? "Participant responses"
                    : active === "game-analytics"
                      ? "Learning activity insights"
                      : active === "exports"
                        ? "Ready for your next analysis"
                        : active === "report"
                          ? "All-question research report"
                          : "A clearer view of your study."
          }
        >
          {demo
            ? "Synthetic demonstration data · no actual participant findings."
            : active === "statistics"
              ? "Comprehensive statistical inference, hypothesis testing, and regression analysis."
              : "Descriptive, item-level findings from submitted research responses."}
        </PageHeading>
        {demo && (
          <div className="notice demo-notice">
            <strong>DEMO DATA</strong>
            <span>
              All counts, charts, and exports in this preview are synthetic and
              excluded from research totals. Real research totals: not
              connected.
            </span>
          </div>
        )}
        <details className="filter-panel" open>
          <summary>
            <SlidersHorizontal size={17} /> Filter this view
            <span>{filtered.length} submitted responses</span>
          </summary>
          <div className="filter-grid">
            <label>
              Submitted from (Colombo)
              <input
                type="date"
                value={filters.from ?? ""}
                onChange={(e) => change("from", e.target.value)}
              />
            </label>
            <label>
              Submitted through (Colombo)
              <input
                type="date"
                value={filters.to ?? ""}
                onChange={(e) => change("to", e.target.value)}
              />
            </label>
            <label>
              Participant code or Submission ID
              <input
                placeholder="Search participant code or submission ID"
                value={filters.code ?? ""}
                onChange={(e) => change("code", e.target.value)}
              />
            </label>
            {questions.slice(0, 5).map((q) => (
              <label key={q.id}>
                {q.variable}
                <select
                  value={filters[q.id as keyof Filters] ?? ""}
                  onChange={(e) => change(q.id, e.target.value)}
                >
                  <option value="">All categories</option>
                  {q.options.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label>
              Known prior practice
              <select
                value={filters.exposure ?? ""}
                onChange={(e) => change("exposure", e.target.value)}
              >
                <option value="">All exposure statuses</option>
                <option value="true">Known prior exposure</option>
                <option value="false">No known prior exposure</option>
              </select>
            </label>
            <label>
              Questionnaire status
              <select
                value={filters.status ?? ""}
                onChange={(e) => change("status", e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="submitted_complete">Submitted complete</option>
                <option value="submitted_with_missing">
                  Submitted with missing
                </option>
                <option value="draft">Drafts</option>
              </select>
            </label>
          </div>
          <button
            className="button ghost"
            onClick={() => {
              setFilters({});
              history.replaceState(null, "", location.pathname);
              setPage(0);
            }}
          >
            Clear filters
          </button>
          <p className="small-copy">
            Active filters: {filterText}. Date filters apply to submission
            dates; for drafts they use consent dates.
          </p>
        </details>
        {active === "" && (
          <>
            <div className="stats-grid four">
              <Stat
                label="Total Submissions"
                value={counts.totalSubmissions}
                detail="All completed research responses"
              />
              <Stat
                label="Unique Participants"
                value={counts.uniqueParticipants}
                detail="Reliably measurable unique individuals"
              />
              <Stat
                label="Submitted complete"
                value={counts.complete}
                detail="All 25 items answered"
              />
              <Stat
                label="Submitted with missing"
                value={counts.missing}
                detail="At least one skipped or unanswered"
              />
            </div>
            <div className="dashboard-grid">
              <section className="card">
                <div className="card-top">
                  <h2>Questionnaire at a glance</h2>
                  <Link className="text-link" href={href("questions")}>
                    Explore 25 items
                  </Link>
                </div>
                <p>
                  Six original sections. Four independent variables and one
                  dependent variable. Demographics describe the sample.
                </p>
                {sections.map((s) => (
                  <Link
                    href={href("questions/" + s.questions[0])}
                    key={s.id}
                    className="section-summary"
                  >
                    <span className="section-letter">{s.id}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <small>
                        {s.questions[0]}–{s.questions.at(-1)} ·{" "}
                        {s.questions.length} items
                      </small>
                    </div>
                    <span className="tag">{s.role}</span>
                  </Link>
                ))}
              </section>
              <div>
                <section className="card">
                  <h2>Participation summary</h2>
                  <div className="mini-stat">
                    <span>Total research submissions</span>
                    <strong>{counts.totalSubmissions}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Unique participants (measurable)</span>
                    <strong>{counts.uniqueParticipants}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Active saved drafts</span>
                    <strong>{counts.drafts}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Started optional games</span>
                    <strong>{counts.games}</strong>
                  </div>
                  <div className="mini-stat">
                    <span>Reviewed all 12 scenarios</span>
                    <strong>
                      {
                        filtered.filter(
                          (s) => scoreSummary(s.attempts).completed === 12,
                        ).length
                      }
                    </strong>
                  </div>
                  <p className="small-copy">
                    Game participation is separate from questionnaire
                    completion. Students can leave after submitting.
                  </p>
                </section>
                <section className="card tinted-card">
                  <h3>Keep the dimensions visible.</h3>
                  <p>
                    Awareness, exposure, concerns, and protective behaviours are
                    different measures. This dashboard does not invent a
                    combined “privacy score”.
                  </p>
                  <Link href={href("exports")} className="text-link">
                    View the full codebook
                  </Link>
                </section>
              </div>
            </div>
          </>
        )}
        {active === "threats" && (
          <div className="space-y-6">
            {/* Highest-Scoring Threat Indicator Banner */}
            <div className="card border-cyan/40 bg-surface p-5">
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <div className="icon-tile cyan shrink-0">
                  <ShieldAlert size={28} className="text-cyan" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="eyebrow flex items-center gap-1.5 text-xs text-cyan font-bold tracking-wider">
                    <span className="live-pulse-dot" aria-hidden="true" />
                    <span>PRIMARY THREAT DRIVER IDENTIFIED</span>
                  </div>
                  <h2 className="text-xl font-bold mt-1">
                    Highest Simulated Privacy Risk: {highestThreat ? `${highestThreat.primaryIV} — ${highestThreat.threatName}` : "IV1 — Phishing Investigation"}
                  </h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    University students in this study sample exhibited the highest observed simulated privacy disclosure in this category.
                    Evaluated on a 0–100% standardized privacy-risk scale based on first-decision responses across realistic campus scenarios.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="p-2.5 rounded bg-surface border">
                      <span className="text-[11px] text-muted block">PRIVACY RISK SCORE</span>
                      <strong className="text-lg font-bold font-mono text-cyan">
                        {highestThreat?.privacyRiskScore ?? 0}%
                      </strong>
                    </div>
                    <div className="p-2.5 rounded bg-surface border">
                      <span className="text-[11px] text-muted block">UNSAFE DECISION RATE</span>
                      <strong className="text-lg font-bold font-mono text-red">
                        {highestThreat?.unsafeRate ?? 0}%
                      </strong>
                    </div>
                    <div className="p-2.5 rounded bg-surface border">
                      <span className="text-[11px] text-muted block">MEAN RISK (0–4)</span>
                      <strong className="text-lg font-bold font-mono text-foreground">
                        {highestThreat?.meanPrivacyRisk ?? 0} <span className="text-xs font-normal text-muted">(±{highestThreat?.stdDevPrivacyRisk ?? 0})</span>
                      </strong>
                    </div>
                    <div className="p-2.5 rounded bg-surface border">
                      <span className="text-[11px] text-muted block">95% CONFIDENCE INTERVAL</span>
                      <strong className="text-sm font-bold font-mono text-foreground">
                        [{highestThreat?.ciLow ?? 0}, {highestThreat?.ciHigh ?? 0}]
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Bar Chart Comparing All 5 Threats */}
            <div className="card">
              <div className="card-top">
                <div>
                  <h2>Threat Impact Comparison: Simulated Privacy Risk &amp; Unsafe Rate</h2>
                  <p className="small-copy">
                    Horizontal comparative analysis of the four active threat modules (IV1 to IV4) across filtered participant sessions.
                  </p>
                </div>
              </div>
              <div style={{ height: 320, width: "100%", marginTop: "1rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={threatSummary.metrics.map((m) => ({
                      name: m.threatName,
                      code: m.primaryIV,
                      riskScore: m.privacyRiskScore,
                      unsafeRate: m.unsafeRate,
                      meanRisk: m.meanPrivacyRisk,
                      ciLow: m.ciLow,
                      ciHigh: m.ciHigh,
                      completed: m.completedAttempts,
                    }))}
                    margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={130}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="chart-tooltip p-3 rounded shadow-lg border bg-surface text-xs space-y-1">
                            <strong className="block font-semibold text-sm">{d.code}: {d.name}</strong>
                            <div>Simulated Privacy Risk Score: <strong className="text-cyan">{d.riskScore}%</strong></div>
                            <div>Unsafe Decision Rate: <strong className="text-red">{d.unsafeRate}%</strong></div>
                            <div>Mean Risk (0–4 scale): <strong>{d.meanRisk}</strong> (95% CI: [{d.ciLow}, {d.ciHigh}])</div>
                            <div className="text-muted">Completed Evaluations: {d.completed}</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="riskScore" name="Simulated Privacy Risk Score (%)" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="unsafeRate" name="Unsafe Decision Rate (%)" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-muted mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-cyan inline-block" />
                  <span>Simulated Privacy Risk Score (0–100%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red inline-block" />
                  <span>Unsafe Decision Rate (%)</span>
                </span>
              </div>
            </div>

            {/* Comprehensive Threat Comparison Table */}
            <div className="card">
              <div className="card-top">
                <h2>Threat Module Metrics &amp; Disclosure Severity Table</h2>
                <span className="tag">First Responses Only</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Threat Category</th>
                      <th>IV Code</th>
                      <th>Evaluations</th>
                      <th>Unsafe Decisions</th>
                      <th>Unsafe Rate</th>
                      <th>Privacy Risk Score</th>
                      <th>Mean Risk (0–4)</th>
                      <th>95% CI</th>
                      <th>Primary Data At Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threatSummary.metrics.map((m) => {
                      const dataAtRisk =
                        m.primaryIV === "IV1"
                          ? "SSO Passwords, LMS Portals"
                          : m.primaryIV === "IV2"
                            ? "Reset Codes, Internal Pretexts"
                            : m.primaryIV === "IV3"
                              ? "Classmate Accounts, Faculty Trust"
                              : m.primaryIV === "IV4"
                                ? "Deposit Slips, E-Commerce Cards"
                                : "Voice / Video Biometrics, Auth Approval";
                      const isHighest = highestThreat?.primaryIV === m.primaryIV;
                      return (
                        <tr key={m.threatKey} className={isHighest ? "bg-cyan/5 font-medium" : ""}>
                          <th>
                            <div className="flex items-center gap-1.5">
                              <span>{m.threatName}</span>
                              {isHighest && (
                                <span className="badge-status-tag unlocked text-[10px] py-0 px-1">
                                  Highest
                                </span>
                              )}
                            </div>
                          </th>
                          <td><code>{m.primaryIV}</code></td>
                          <td>{m.completedAttempts}</td>
                          <td>{m.unsafeCount}</td>
                          <td>
                            <span className={m.unsafeRate > 50 ? "text-red font-semibold" : ""}>
                              {m.unsafeRate}%
                            </span>
                          </td>
                          <td>
                            <strong className="text-cyan font-mono">{m.privacyRiskScore}%</strong>
                          </td>
                          <td className="font-mono">{m.meanPrivacyRisk}</td>
                          <td className="font-mono text-xs">[{m.ciLow}, {m.ciHigh}]</td>
                          <td className="text-xs text-muted">{dataAtRisk}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {active === "iv-analysis" && (
          <div className="space-y-6">
            {/* IV Sub-Selector Tabs */}
            <div className="threat-filter-row" role="tablist" aria-label="Select Threat Module">
              {missions.map((m) => (
                <button
                  key={m.iv}
                  type="button"
                  className={`threat-pill ${selectedIvId === m.iv ? "active" : ""}`}
                  onClick={() => setSelectedIvId(m.iv)}
                >
                  {m.iv}: {m.name}
                </button>
              ))}
            </div>

            {/* Selected Threat Module Analysis Card */}
            {(() => {
              const currentMission = missions.find((m) => m.iv === selectedIvId) ?? missions[0];
              const missionAttempts = first.filter((a) => a.primaryIV === selectedIvId);
              const attemptedOnly = missionAttempts.filter((a) => a.selectedAction !== null);
              const unsafeCount = attemptedOnly.filter((a) => a.unsafe === true).length;
              const unsafeRate = attemptedOnly.length ? Math.round((unsafeCount / attemptedOnly.length) * 100) : 0;
              const totalRisk = attemptedOnly.reduce((sum, a) => sum + (a.privacyRiskScore ?? 0), 0);
              const meanRisk = attemptedOnly.length ? Number((totalRisk / attemptedOnly.length).toFixed(2)) : 0;

              // Action counts
              const actionCounts: Record<string, number> = { report: 0, verify: 0, ignore: 0, proceed: 0 };
              attemptedOnly.forEach((a) => {
                if (a.selectedAction && actionCounts[a.selectedAction] !== undefined) {
                  actionCounts[a.selectedAction]++;
                }
              });

              // Disclosed info category counts
              const infoCounts: Record<string, number> = {};
              attemptedOnly.forEach((a) => {
                const cat = a.disclosedInfoCategory || (a.unsafe ? "Simulated Disclosure" : "None");
                infoCounts[cat] = (infoCounts[cat] || 0) + 1;
              });

              return (
                <div className="space-y-6">
                  <div className="card">
                    <div className="card-top">
                      <div>
                        <span className="eyebrow text-cyan font-bold">{currentMission.iv} · THREAT ANALYSIS</span>
                        <h2 className="text-xl font-bold mt-1">{currentMission.name}</h2>
                        <p className="text-xs text-muted mt-1">{currentMission.description}</p>
                      </div>
                      <span className="tag">{currentMission.code}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="card p-3 text-center">
                        <span className="text-xs text-muted block">EVALUATIONS</span>
                        <strong className="text-xl font-bold font-mono text-foreground">
                          {attemptedOnly.length}
                        </strong>
                        <span className="text-[11px] text-muted block mt-0.5">Scenarios Reviewed</span>
                      </div>
                      <div className="card p-3 text-center">
                        <span className="text-xs text-muted block">UNSAFE DECISION RATE</span>
                        <strong className="text-xl font-bold font-mono text-red">
                          {unsafeRate}%
                        </strong>
                        <span className="text-[11px] text-muted block mt-0.5">{unsafeCount} Unsafe Actions</span>
                      </div>
                      <div className="card p-3 text-center">
                        <span className="text-xs text-muted block">MEAN PRIVACY RISK</span>
                        <strong className="text-xl font-bold font-mono text-cyan">
                          {meanRisk} <small className="text-xs text-muted">/ 4</small>
                        </strong>
                        <span className="text-[11px] text-muted block mt-0.5">Disclosure Severity</span>
                      </div>
                      <div className="card p-3 text-center">
                        <span className="text-xs text-muted block">PROTECTIVE RATE</span>
                        <strong className="text-xl font-bold font-mono text-emerald">
                          {100 - unsafeRate}%
                        </strong>
                        <span className="text-[11px] text-muted block mt-0.5">Data Withheld / Reported</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Action & Disclosed Info Distributions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card">
                      <h3 className="text-sm font-semibold mb-3">Action Distribution (Report / Verify / Ignore / Proceed)</h3>
                      <div style={{ height: 220, width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { action: "Report to IT", count: actionCounts.report, fill: "#10b981" },
                              { action: "Verify Out-of-Band", count: actionCounts.verify, fill: "#06b6d4" },
                              { action: "Ignore / Delete", count: actionCounts.ignore, fill: "#f59e0b" },
                              { action: "Proceed (Unsafe)", count: actionCounts.proceed, fill: "#f43f5e" },
                            ]}
                            margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                            <XAxis dataKey="action" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="count" name="Decisions" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-sm font-semibold mb-3">Disclosed Information Categories Breakdown</h3>
                      <div className="space-y-2 mt-2">
                        {Object.entries(infoCounts).map(([cat, count]) => {
                          const pct = attemptedOnly.length ? Math.round((count / attemptedOnly.length) * 100) : 0;
                          const isSafe = cat === "None";
                          return (
                            <div key={cat} className="p-2.5 rounded bg-surface border flex items-center justify-between text-xs">
                              <div>
                                <span className={`font-semibold ${isSafe ? "text-emerald" : "text-red"}`}>
                                  {cat}
                                </span>
                                <span className="text-muted block text-[11px]">
                                  {isSafe ? "Protected: No data disclosed" : "Simulated exposure / disclosure"}
                                </span>
                              </div>
                              <div className="text-right">
                                <strong className="font-mono text-sm">{count}</strong>
                                <span className="text-muted block text-[11px]">{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Scenarios Breakdown Table for Selected IV */}
                  <div className="card">
                    <h3 className="text-sm font-semibold mb-2">Scenario Performance Breakdown ({currentMission.name})</h3>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Scenario ID</th>
                            <th>Evaluated</th>
                            <th>Unsafe Count</th>
                            <th>Unsafe Rate</th>
                            <th>Mean Risk</th>
                            <th>Median Response Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMission.ids.map((id) => {
                            const scAttempts = first.filter((a) => a.scenarioId === id && a.selectedAction !== null);
                            const unsafe = scAttempts.filter((a) => a.unsafe === true).length;
                            const rate = scAttempts.length ? Math.round((unsafe / scAttempts.length) * 100) : 0;
                            const risk = scAttempts.length
                              ? Number((scAttempts.reduce((s, a) => s + (a.privacyRiskScore ?? 0), 0) / scAttempts.length).toFixed(2))
                              : 0;
                            const times = scAttempts.map((a) => a.elapsedMs / 1000).sort((a, b) => a - b);
                            const med = times.length ? times[Math.floor(times.length / 2)].toFixed(1) + "s" : "—";
                            return (
                              <tr key={id}>
                                <th><code>{id}</code></th>
                                <td>{scAttempts.length}</td>
                                <td>{unsafe}</td>
                                <td>
                                  <span className={rate > 50 ? "text-red font-semibold" : ""}>{rate}%</span>
                                </td>
                                <td className="font-mono">{risk}</td>
                                <td>{med}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {active === "privacy-dv" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <span className="eyebrow text-cyan font-bold">DEPENDENT VARIABLE ANALYSIS</span>
                  <h2 className="text-xl font-bold mt-1">User Privacy (DV) Operationalization &amp; Severity Distribution</h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    User Privacy is operationalized through simulated privacy-risk decisions and potential disclosure severity (0–4 scale).
                    This separates empirical behavior under controlled simulated scenarios from subjective self-reported perceptions.
                  </p>
                </div>
              </div>

              {/* Severity Scale Definitions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mt-4 text-xs">
                <div className="p-3 rounded border bg-emerald/5 border-emerald/20">
                  <span className="font-bold text-emerald block">Score 0: Protective</span>
                  <p className="text-muted text-[11px] mt-1">Withheld credentials, reported to IT, or verified out-of-band.</p>
                </div>
                <div className="p-3 rounded border bg-surface">
                  <span className="font-bold text-foreground block">Score 1: Minor Risk</span>
                  <p className="text-muted text-[11px] mt-1">Passive hesitation or non-sensitive preliminary inquiry.</p>
                </div>
                <div className="p-3 rounded border bg-surface">
                  <span className="font-bold text-amber block">Score 2: Moderate Risk</span>
                  <p className="text-muted text-[11px] mt-1">Engaged unverified sender; non-critical data exposed.</p>
                </div>
                <div className="p-3 rounded border bg-surface">
                  <span className="font-bold text-red block">Score 3: High Risk</span>
                  <p className="text-muted text-[11px] mt-1">Shared personal identifiers (NIC), student index, academic records.</p>
                </div>
                <div className="p-3 rounded border bg-red/5 border-red/20">
                  <span className="font-bold text-red block">Score 4: Critical Risk</span>
                  <p className="text-muted text-[11px] mt-1">Disclosed SSO login passwords, financial OTPs, or payment credentials.</p>
                </div>
              </div>
            </div>

            {/* Severity Level Distribution */}
            {(() => {
              const attemptedFirst = first.filter((a) => a.selectedAction !== null);
              const severityCounts = [0, 1, 2, 3, 4].map((score) => {
                const count = attemptedFirst.filter((a) => (a.privacyRiskScore ?? (a.correct ? 0 : 3)) === score).length;
                const pct = attemptedFirst.length ? Math.round((count / attemptedFirst.length) * 100) : 0;
                return { score, count, pct };
              });

              return (
                <div className="card">
                  <h3 className="text-sm font-semibold mb-2">Simulated Privacy Risk Severity Distribution (0–4 Scale)</h3>
                  <div style={{ height: 260, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { label: "0 (Protective)", count: severityCounts[0].count, fill: "#10b981" },
                          { label: "1 (Minor Risk)", count: severityCounts[1].count, fill: "#3b82f6" },
                          { label: "2 (Moderate Risk)", count: severityCounts[2].count, fill: "#f59e0b" },
                          { label: "3 (High Risk)", count: severityCounts[3].count, fill: "#f97316" },
                          { label: "4 (Critical Disclosure)", count: severityCounts[4].count, fill: "#ef4444" },
                        ]}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Evaluations" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}

            {/* Self-Reported Concern vs Simulated Risk Discussion */}
            <div className="card p-4 bg-surface-subtle border">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-cyan mb-1.5">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>Methodological Insight: Subjective Concern vs Simulated Disclosure</span>
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                In higher education cyber research, students often express high subjective concern about personal privacy
                in Likert questionnaires (Section F, Q19–Q25) while simultaneously demonstrating elevated simulated disclosure rates
                when encountering urgency-based pretexting or high-fidelity lookalike portals. This empirical simulation platform
                enables direct quantitative comparison between perceived privacy concern and actual decision-making vulnerability.
              </p>
            </div>
          </div>
        )}
        {active === "statistics" && (
          <StatisticalAnalysis
            sessions={filtered}
            allSessions={all}
            demo={demo}
            filters={filters}
            filterText={filterText}
          />
        )}
        {(active === "questions" || active === "report") && (
          <>
            <div className="question-toolbar">
              <label className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  placeholder="Search question ID, wording, or dimension"
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search questions"
                />
              </label>
              <Link className="button secondary" href={href("report")}>
                <Printer size={16} /> All-question report
              </Link>
              {active === "report" && (
                <button
                  className="button primary"
                  onClick={() => window.print()}
                >
                  Print report
                </button>
              )}
            </div>
            {selected ? (
              <>
                <Link className="text-link" href={href("questions")}>
                  View all questions
                </Link>
                <QuestionChart
                  q={selected}
                  sessions={filtered}
                  filters={demo ? "Synthetic demo · " + filterText : filterText}
                  onError={setError}
                />
              </>
            ) : (
              sections.map((section) => (
                <section key={section.id} className="question-group">
                  <h2>
                    {section.id}. {section.title}{" "}
                    <span className="tag">{section.role}</span>
                  </h2>
                  {shown
                    .filter((q) => q.section === section.id)
                    .map((q) =>
                      active === "report" ? (
                        <QuestionChart
                          key={q.id}
                          q={q}
                          sessions={filtered}
                          filters={
                            demo ? "Synthetic demo · " + filterText : filterText
                          }
                          onError={setError}
                        />
                      ) : (
                        <Link
                          className="question-row"
                          href={href("questions/" + q.id)}
                          key={q.id}
                        >
                          <span className="question-number">{q.id}</span>
                          <div>
                            <strong>{q.text}</strong>
                            <small>{q.dimension ?? q.variable}</small>
                          </div>
                          <span className="tag">
                            n = {aggregateQuestion(q, filtered).validN}
                          </span>
                        </Link>
                      ),
                    )}
                </section>
              ))
            )}
            {!shown.length && (
              <div className="state-box">
                <h2>No matching questions</h2>
                <p>Try another ID or part of the question text.</p>
              </div>
            )}
          </>
        )}
        {active === "responses" && (
          <>
            <div className="card">
              <div className="card-top">
                <div>
                  <h2>Submission History</h2>
                  <p className="text-sm opacity-80 mt-1">
                    {all.length} matching records · {counts.totalSubmissions} total submissions from {counts.uniqueParticipants} unique participants
                  </p>
                </div>
                <span className="tag">Times in Asia/Colombo</span>
              </div>
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Submission history table"
              >
                <table>
                  <thead>
                    <tr>
                      <th>Submission ID</th>
                      <th>Participant code</th>
                      <th>Status</th>
                      <th>Answered / 25</th>
                      <th>Submission Date & Time</th>
                      <th>Game reviewed</th>
                      <th>Known exposure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {all.slice(page * 10, page * 10 + 10).map((s) => (
                      <tr key={s.submissionId ?? s.id}>
                        <td>
                          <code className="text-xs font-mono">{s.submissionId ?? s.id}</code>
                        </td>
                        <td>
                          <code>{s.code}</code>
                        </td>
                        <td>
                          <span className="tag">
                            {s.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td>
                          {
                            Object.values(s.answers).filter(
                              (a) => a.status === "answered",
                            ).length
                          }
                        </td>
                        <td>{colomboTime(s.submittedAt) || colomboTime(s.createdAt)}</td>
                        <td>{scoreSummary(s.attempts).completed} / 12</td>
                        <td>{s.priorExposure ? "Yes" : "No known exposure"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!all.length && (
                <p className="empty-copy">No sessions match these filters.</p>
              )}
              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page + 1} of {Math.max(1, Math.ceil(all.length / 10))}
                </span>
                <button
                  className="button secondary"
                  disabled={(page + 1) * 10 >= all.length}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
            <p className="small-copy">
              Drafts are visible to authorised researchers for operational
              counts, but excluded from baseline exports and questionnaire
              charts.
            </p>
          </>
        )}
        {active === "game-analytics" && (
          <>
            <div className="notice">
              Supplementary educational performance only. Game metrics are
              separate from User Privacy (the survey DV). First-attempt accuracy
              excludes skips; timing is descriptive and carries no points.
            </div>
            <div className="stats-grid">
              <Stat
                label="Game participants"
                value={counts.games}
                detail="At least one recorded first decision or skip"
              />
              <Stat
                label="Attempted decisions"
                value={first.filter((a) => a.selectedAction !== null).length}
                detail="First attempts; excludes skips"
              />
              <Stat
                label="Skipped scenarios"
                value={first.filter((a) => a.selectedAction === null).length}
                detail="Recorded separately"
              />
            </div>
            <div className="card">
              <h2>First attempts by scenario</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Reviewed</th>
                      <th>Attempted</th>
                      <th>Skipped</th>
                      <th>Correct</th>
                      <th>Accuracy</th>
                      <th>Median time</th>
                      <th>Time range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions
                      .flatMap((m) => m.ids)
                      .map((id) => {
                        const a = first.filter((a) => a.scenarioId === id),
                          attempted = a.filter(
                            (a) => a.selectedAction !== null,
                          ),
                          right = attempted.filter((a) => a.correct).length,
                          times = attempted
                            .map((a) => a.elapsedMs / 1000)
                            .sort((a, b) => a - b),
                          median = times.length
                            ? (times[Math.floor((times.length - 1) / 2)] +
                                times[Math.floor(times.length / 2)]) /
                              2
                            : null;
                        return (
                          <tr key={id}>
                            <th>{id}</th>
                            <td>{a.length}</td>
                            <td>{attempted.length}</td>
                            <td>{a.length - attempted.length}</td>
                            <td>{right}</td>
                            <td>
                              {attempted.length
                                ? ((right / attempted.length) * 100).toFixed(
                                    1,
                                  ) + "%"
                                : "—"}
                            </td>
                            <td>
                              {median === null ? "—" : median.toFixed(1) + "s"}
                            </td>
                            <td>
                              {times.length
                                ? times[0].toFixed(1) +
                                  "–" +
                                  times.at(-1)!.toFixed(1) +
                                  "s"
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="dashboard-grid">
              <div className="card">
                <h2>First-attempt points by mission</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Mission</th>
                      <th>Total points</th>
                      <th>Participants</th>
                      <th>Possible per participant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m) => {
                      const a = first.filter((a) => a.primaryIV === m.iv);
                      return (
                        <tr key={m.id}>
                          <th>{m.name}</th>
                          <td>{a.reduce((s, x) => s + x.points, 0)}</td>
                          <td>
                            {
                              filtered.filter((s) =>
                                s.attempts.some((a) => a.primaryIV === m.iv),
                              ).length
                            }
                          </td>
                          <td>{m.ids.length * 10}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="card">
                <h2>Overall score distribution</h2>
                <p className="small-copy">
                  Among game participants; incomplete missions remain included.
                  Maximum 120.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>First-attempt points</th>
                      <th>Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 17 }, (_, i) => i * 10).map(
                      (score) => (
                        <tr key={score}>
                          <th>{score}</th>
                          <td>{scores.filter((s) => s === score).length}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {active === "exports" && (
          <>
            <div className="export-grid">
              {exportKinds.map((kind, i) => (
                <div className="card" key={kind}>
                  <span className="icon-tile lavender">
                    <Download size={23} />
                  </span>
                  <h2>{kind}.csv</h2>
                  <p>
                    {
                      [
                        "One submitted participant per row. Raw codes, exact labels, missing statuses, versions, and UTC timestamps.",
                        "One row per participant and question. Section, role, dimension, value, label, and missing status.",
                        "Learning attempts and replays, kept separate from baseline responses. Includes versions, elapsed time, and first-attempt points.",
                        "Option counts, valid-response percentages, valid n, missing n, and active filters for all 25 questions.",
                        "The complete instrument, option order and codes, measurement levels, and missing-value rules.",
                      ][i]
                    }
                  </p>
                  <a
                    className="button secondary"
                    href={
                      "/api/" +
                      (demo ? "demo" : "admin") +
                      "/export?kind=" +
                      kind +
                      (query ? "&" + query : "")
                    }
                  >
                    Download CSV
                  </a>
                </div>
              ))}
            </div>
            <div className="card prose">
              <h2>Built for a transparent analysis</h2>
              <p>
                Exports use UTF-8 with a BOM for Excel, quoted text, numeric
                code columns, and formula-injection protection for text. Active
                filters and inclusion rules are in each data export. Withdrawn
                records, unsubmitted drafts, and practice-only sessions are
                excluded. Demo files are explicitly labelled synthetic.
              </p>
              <p>
                No internal auth IDs, session tokens, or withdrawal secrets are
                exported. Baseline and game data remain separate; join by
                participant_code only when your analysis plan calls for it. The
                codebook describes coding, not a validated composite score. No
                automatic reverse-coding, invented p-values, or causal claims.
              </p>
              <p>
                Keep exports private. Apply the retention and withdrawal policy
                to every downloaded copy. Before publishing results, review
                small demographic cells for re-identification risk.
              </p>
            </div>
          </>
        )}
        {error && <ErrorBox message={error} />}
      </div>
    </div>
  );
}
function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
function QuestionChart({
  q,
  sessions,
  filters,
  onError,
}: {
  q: Question;
  sessions: Session[];
  filters: string;
  onError: (e: string) => void;
}) {
  const a = aggregateQuestion(q, sessions);
  function summary() {
    const content = toCsv([
      [
        "question_id",
        "question_text",
        "dimension",
        "code",
        "label",
        "count",
        "percentage",
        "valid_n",
        "missing_n",
        "filters",
      ],
      ...a.rows.map((r) => [
        q.id,
        q.text,
        q.dimension ?? q.variable,
        r.code,
        r.label,
        r.count,
        r.percentage,
        a.validN,
        a.missingN,
        filters,
      ]),
    ]);
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const el = document.createElement("a");
    el.href = url;
    el.download = q.id + "-summary.csv";
    el.click();
    URL.revokeObjectURL(url);
  }
  return (
    <article className="card chart-card">
      <div className="chart-meta">
        <span className="question-number">{q.id}</span>
        <span className="tag">
          SECTION {q.section} · {q.role}
        </span>
      </div>
      <h2>{q.text}</h2>
      <p>{q.dimension ?? q.variable}</p>
      <div className="chart-denominators">
        <span>
          <strong>{a.validN}</strong> valid responses
        </span>
        <span>
          <strong>{a.missingN}</strong> missing
        </span>
        <span>Percentages use valid n = {a.validN}</span>
      </div>
      <p className="small-copy">Filters: {filters}</p>
      {a.validN === 0 ? (
        <div className="state-box">
          <h3>No valid responses yet</h3>
          <p>
            All original categories remain available below, including zero
            counts.
          </p>
        </div>
      ) : (
        <div
          className="chart-visual"
          role="img"
          aria-label={
            q.id + " response distribution; full values in the following table."
          }
        >
          <ResponsiveContainer
            width="100%"
            height={Math.max(260, a.rows.length * 56)}
            minWidth={0}
          >
            <BarChart
              data={a.rows}
              layout="vertical"
              margin={{ top: 8, right: 30, left: 0, bottom: 15 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e8f0"
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(n) => n + "%"}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={190}
                tick={{ fontSize: 12, fill: "#34415b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [
                  Number(value).toFixed(1) + "%",
                  "Valid responses",
                ]}
              />
              <Bar
                dataKey="percentage"
                fill="#786bd1"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            {q.id} accessible response distribution; percentages exclude missing
            answers.
          </caption>
          <thead>
            <tr>
              <th>Response category</th>
              <th>Count</th>
              <th>% of valid n = {a.validN}</th>
            </tr>
          </thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.code}>
                <th>
                  {q.type === "scale" ? r.code + " · " : ""}
                  {r.label}
                </th>
                <td>{r.count}</td>
                <td>{r.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Valid responses</th>
              <td>{a.validN}</td>
              <td>{a.validN ? "100.0%" : "—"}</td>
            </tr>
            <tr>
              <th>Missing (skipped / not answered)</th>
              <td>{a.missingN}</td>
              <td>Excluded</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="chart-actions">
        <button
          className="button secondary"
          onClick={() =>
            downloadChart(q, a, filters, "svg").catch(() =>
              onError("Unable to download chart. Please retry."),
            )
          }
        >
          SVG
        </button>
        <button
          className="button secondary"
          onClick={() =>
            downloadChart(q, a, filters, "png").catch(() =>
              onError("Unable to download chart. Please retry."),
            )
          }
        >
          PNG
        </button>
        <button className="button secondary" onClick={summary}>
          Summary CSV
        </button>
      </div>
    </article>
  );
}
