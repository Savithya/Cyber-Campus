"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Question, Session } from "@/lib/types";
import { aggregateQuestion } from "@/lib/analytics";

interface UserPrivacyDVSectionProps {
  questions: Question[];
  sessions: Session[];
}

export default function UserPrivacyDVSection({
  questions,
  sessions,
}: UserPrivacyDVSectionProps) {
  // Ensure we sort and handle Q19-Q25
  const dvQuestions = useMemo(() => {
    return questions.filter((q) =>
      ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"].includes(q.id),
    );
  }, [questions]);

  const [selectedId, setSelectedId] = useState<string>(
    dvQuestions[0]?.id || "Q19",
  );
  const [viewMode, setViewMode] = useState<"focus" | "all">("focus");
  const [showMethodologyDetails, setShowMethodologyDetails] = useState<boolean>(false);

  // Compute aggregate stats across all 7 DV construct items
  const summaryData = useMemo(() => {
    return dvQuestions.map((q) => {
      const agg = aggregateQuestion(q, sessions);
      // Option 1 is the accurate identification of the threat across Q19-Q25
      const opt1 = agg.rows.find((r) => r.code === 1) || agg.rows[0];
      const safestRate = opt1?.percentage ?? 0;
      const safestCount = opt1?.count ?? 0;

      return {
        question: q,
        agg,
        safestRate,
        safestCount,
        validN: agg.validN,
        missingN: agg.missingN,
      };
    });
  }, [dvQuestions, sessions]);

  // Overall construct threat recognition average
  const overallRecognitionRate = useMemo(() => {
    if (!summaryData.length) return 0;
    const totalSafest = summaryData.reduce((acc, curr) => acc + curr.safestRate, 0);
    return Math.round(totalSafest / summaryData.length);
  }, [summaryData]);

  const selectedIndex = dvQuestions.findIndex((q) => q.id === selectedId);
  const activeQuestion = dvQuestions[selectedIndex >= 0 ? selectedIndex : 0];
  const activeSummary = summaryData[selectedIndex >= 0 ? selectedIndex : 0];

  function handlePrev() {
    if (selectedIndex > 0) {
      setSelectedId(dvQuestions[selectedIndex - 1].id);
    } else {
      setSelectedId(dvQuestions[dvQuestions.length - 1].id);
    }
  }

  function handleNext() {
    if (selectedIndex < dvQuestions.length - 1) {
      setSelectedId(dvQuestions[selectedIndex + 1].id);
    } else {
      setSelectedId(dvQuestions[0].id);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="card empty-state-box text-center p-8 border-dashed">
        <ShieldCheck size={48} className="mx-auto text-cyan mb-4" />
        <h2 className="text-lg font-bold">No research responses available yet</h2>
        <p className="text-xs text-muted max-w-lg mx-auto mt-2">
          Standardized psychometric measurement of the research Dependent Variable (Section F, Q19–Q25)
          requires participant submissions. Once survey responses are recorded, threat recognition and disclosure vulnerability statistics will be computed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. HEADER & METHODOLOGICAL PRINCIPLE (COMPACT & CLEAN)
          ========================================================================= */}
      <div className="card">
        <div className="card-top">
          <div>
            <span className="eyebrow text-cyan font-bold flex items-center gap-1.5">
              <ShieldCheck size={14} /> DEPENDENT VARIABLE ANALYSIS
            </span>
            <h2 className="text-xl font-bold mt-1">
              User Privacy (DV) Operationalization &amp; Psychometric Items
            </h2>
            <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
              Standardized psychometric measurement of the research Dependent Variable (Section F, Q19–Q25)
              evaluating student threat recognition and simulated disclosure vulnerability.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="tag cyan font-semibold">Section F · 7 Items</span>
            <span className="tag">
              Mean Recognition: <strong className="text-cyan ml-1">{overallRecognitionRate}%</strong>
            </span>
          </div>
        </div>

        {/* Methodological separation banner - sleek & collapsible */}
        <div className="p-3 rounded-lg bg-cyan/5 border border-cyan/20 mt-4 text-xs leading-relaxed">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-cyan font-semibold">
              <ShieldCheck size={16} className="text-cyan flex-shrink-0" />
              <span>Core Methodological Principle: User Privacy is the primary research Dependent Variable</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMethodologyDetails((prev) => !prev)}
              className="text-[11px] font-medium text-cyan hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              {showMethodologyDetails ? "Hide Rationale" : "Methodological Rationale"}
              {showMethodologyDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {showMethodologyDetails && (
            <p className="text-muted mt-2 pt-2 border-t border-cyan/15 text-[11px] leading-relaxed">
              The primary research Dependent Variable (DV) is <strong>User Privacy</strong>. Gameplay challenge points
              represent supplementary educational gamification and <strong>must not be conflated with the psychometric
              User Privacy construct</strong>. Self-reported identification accuracy in Section F provides the standardized
              baseline against which simulated disclosure scores are validated.
            </p>
          )}
        </div>

        {/* Streamlined Severity Scale Continuum Strip (Saves vertical space) */}
        <div className="mt-4 pt-3 border-t">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Simulated Privacy Risk Severity Scale (0–4 Scale):</span>
            <span className="text-[10px] text-muted-light normal-case font-normal">
              Validated behavioral scoring continuum
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border bg-emerald/5 border-emerald/20 transition-all hover:border-emerald/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald text-[11px]">Score 0: Protective</span>
                <span className="text-[10px] px-1 rounded bg-emerald/15 text-emerald font-mono">0 pts</span>
              </div>
              <p className="text-muted text-[10.5px] mt-1 leading-snug">
                Withheld credentials, reported to IT, or verified out-of-band.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border bg-surface transition-all hover:border-border-strong">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-[11px]">Score 1: Minor Risk</span>
                <span className="text-[10px] px-1 rounded bg-surface-2 text-muted font-mono">1 pt</span>
              </div>
              <p className="text-muted text-[10.5px] mt-1 leading-snug">
                Passive hesitation or non-sensitive preliminary inquiry.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border bg-amber/5 border-amber/20 transition-all hover:border-amber/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber text-[11px]">Score 2: Moderate Risk</span>
                <span className="text-[10px] px-1 rounded bg-amber/15 text-amber font-mono">2 pts</span>
              </div>
              <p className="text-muted text-[10.5px] mt-1 leading-snug">
                Engaged unverified sender; non-critical data exposed.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border bg-orange-500/5 border-orange-500/20 transition-all hover:border-orange-500/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400 text-[11px]">Score 3: High Risk</span>
                <span className="text-[10px] px-1 rounded bg-orange-500/15 text-orange-400 font-mono">3 pts</span>
              </div>
              <p className="text-muted text-[10.5px] mt-1 leading-snug">
                Shared personal identifiers (NIC), student index, or records.
              </p>
            </div>

            <div className="p-2.5 rounded-lg border bg-red/5 border-red/20 transition-all hover:border-red/40">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red text-[11px]">Score 4: Critical Risk</span>
                <span className="text-[10px] px-1 rounded bg-red/15 text-red font-mono">4 pts</span>
              </div>
              <p className="text-muted text-[10.5px] mt-1 leading-snug">
                Disclosed SSO login passwords, financial OTPs, or cards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CONSOLIDATED PSYCHOMETRIC ITEMS MATRIX (GIVES A SHORT, CLEAR OVERVIEW)
          ========================================================================= */}
      <div className="card">
        <div className="card-top">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Layers size={16} className="text-cyan" />
              Psychometric Construct Matrix (Q19–Q25 At-a-Glance)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              All 7 Dependent Variable items in one compact view. Select any row to inspect response details.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Total Evaluated Items:</span>
            <span className="font-bold font-mono text-foreground bg-surface-2 px-2 py-0.5 rounded border">
              {dvQuestions.length}
            </span>
          </div>
        </div>

        {/* Responsive Compact Summary Table without overflow scrolling bugs */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-surface-2/60 text-muted font-semibold">
                <th className="py-2.5 px-3">Item ID</th>
                <th className="py-2.5 px-3">Threat Dimension</th>
                <th className="py-2.5 px-3">Scenario Briefing</th>
                <th className="py-2.5 px-3 text-center">Threat Recognition Rate</th>
                <th className="py-2.5 px-3 text-center">Valid (n)</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaryData.map(({ question: q, safestRate, safestCount, validN }) => {
                const isSelected = selectedId === q.id && viewMode === "focus";
                return (
                  <tr
                    key={q.id}
                    onClick={() => {
                      setSelectedId(q.id);
                      setViewMode("focus");
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-cyan/10 font-medium"
                        : "hover:bg-surface-2/60"
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-cyan text-white shadow-sm"
                            : "bg-surface-2 border text-foreground"
                        }`}
                      >
                        {q.id}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-foreground">
                        {q.dimension ?? q.variable}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs sm:max-w-md truncate text-muted text-[11px]" title={q.text}>
                      {q.text}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-surface-2 overflow-hidden border">
                          <div
                            className="h-full bg-cyan rounded-full transition-all"
                            style={{ width: `${Math.min(100, safestRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-foreground">
                          {safestRate.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted font-mono">
                          ({safestCount}/{validN})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-xs text-muted whitespace-nowrap">
                      {validN}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(q.id);
                          setViewMode("focus");
                        }}
                        className={`text-xs px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-cyan text-white font-semibold"
                            : "bg-surface-2 text-muted hover:text-foreground hover:bg-surface-hover border"
                        }`}
                      >
                        {isSelected ? "Active" : "Inspect"}
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          3. INTERACTIVE ITEM INSPECTOR (TABS + CLEAN COMPACT VIEW)
          ========================================================================= */}
      <div className="space-y-4">
        {/* Navigation Bar: Question Tabs & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface rounded-xl border">
          {/* Quick Select Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-muted uppercase tracking-wider mr-1 hidden lg:inline">
              Select Item:
            </span>
            <button
              type="button"
              onClick={handlePrev}
              title="Previous item"
              className="p-1.5 rounded-lg border bg-surface hover:bg-surface-2 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {dvQuestions.map((q) => {
              const isActive = selectedId === q.id && viewMode === "focus";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(q.id);
                    setViewMode("focus");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan text-white shadow-sm ring-2 ring-cyan/30"
                      : "bg-surface-2 hover:bg-surface-hover text-muted hover:text-foreground border"
                  }`}
                >
                  {q.id}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleNext}
              title="Next item"
              className="p-1.5 rounded-lg border bg-surface hover:bg-surface-2 text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View Mode Toggle: Focus (Shorter page) vs Show All 7 */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                viewMode === "focus"
                  ? "bg-cyan/15 text-cyan border border-cyan/40 font-bold"
                  : "bg-surface text-muted hover:text-foreground border"
              }`}
            >
              <LayoutGrid size={14} />
              Focus View (Compact)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                viewMode === "all"
                  ? "bg-cyan/15 text-cyan border border-cyan/40 font-bold"
                  : "bg-surface text-muted hover:text-foreground border"
              }`}
            >
              <Layers size={14} />
              Expand All 7
            </button>
          </div>
        </div>

        {/* Display Item(s) */}
        {viewMode === "focus" && activeQuestion && activeSummary ? (
          <QuestionDetailCard
            question={activeQuestion}
            agg={activeSummary.agg}
            safestRate={activeSummary.safestRate}
            safestCount={activeSummary.safestCount}
            isFocusView={true}
            onNext={handleNext}
            onPrev={handlePrev}
            currentIndex={selectedIndex}
            totalItems={dvQuestions.length}
          />
        ) : (
          <div className="space-y-6">
            {summaryData.map(({ question: q, agg, safestRate, safestCount }, idx) => (
              <QuestionDetailCard
                key={q.id}
                question={q}
                agg={agg}
                safestRate={safestRate}
                safestCount={safestCount}
                isFocusView={false}
                currentIndex={idx}
                totalItems={dvQuestions.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENT: FIXED, CLEAN QUESTION CARD (NO OVERLAPPING TEXT, NO HORIZONTAL SCROLLBAR)
// =========================================================================
interface QuestionDetailCardProps {
  question: Question;
  agg: ReturnType<typeof aggregateQuestion>;
  safestRate: number;
  safestCount: number;
  isFocusView: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex: number;
  totalItems: number;
}

function QuestionDetailCard({
  question: q,
  agg,
  safestRate,
  safestCount,
  isFocusView,
  onNext,
  onPrev,
  currentIndex,
  totalItems,
}: QuestionDetailCardProps) {
  // Format rows with clean short labels so Recharts NEVER overlaps SVG text!
  const chartData = useMemo(() => {
    return agg.rows.map((r) => ({
      ...r,
      shortLabel: `Option ${r.code}`,
      isSafest: r.code === 1,
    }));
  }, [agg.rows]);

  return (
    <div className="card transition-all">
      {/* Card Header */}
      <div className="card-top border-b pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="question-number">{q.id}</span>
            <span className="tag cyan font-bold">SECTION F · DEPENDENT VARIABLE</span>
            <span className="tag font-semibold text-foreground">
              {q.dimension ?? q.variable}
            </span>
            {isFocusView && (
              <span className="text-[11px] text-muted font-mono ml-1">
                Item {currentIndex + 1} of {totalItems}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold mt-2 text-foreground">
            {q.variable || q.dimension}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <div className="text-muted">
              Valid (n): <strong className="text-foreground">{agg.validN}</strong>
            </div>
            <div className="text-muted">
              Missing: <strong className="text-foreground">{agg.missingN}</strong>
            </div>
          </div>
          {isFocusView && (
            <div className="flex items-center gap-1 border-l pl-3">
              <button
                type="button"
                onClick={onPrev}
                title="Previous item"
                className="p-1 rounded border bg-surface hover:bg-surface-2 text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={onNext}
                title="Next item"
                className="p-1 rounded border bg-surface hover:bg-surface-2 text-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scenario Prompt Box */}
      <div className="mt-3.5 p-3 rounded-lg bg-surface border border-border leading-relaxed text-xs">
        <span className="font-bold uppercase tracking-wider text-[10px] text-muted block mb-1">
          Simulated Cyber Threat Scenario:
        </span>
        <p className="text-sm font-medium text-foreground italic">
          &ldquo;{q.text}&rdquo;
        </p>
      </div>

      {/* Two-Column Layout: Left = Non-overlapping BarChart, Right = Clean Responsive Option Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 items-start">
        {/* Left Column: Fixed BarChart */}
        <div className="p-3.5 rounded-xl bg-surface border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Response Distribution (%)
            </span>
            <span className="text-[11px] text-muted flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan inline-block" /> Threat Identified (Option 1)
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60 inline-block ml-1" /> Distractors
            </span>
          </div>

          <div style={{ height: 180, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11 }}
                />
                {/* Clean shortLabel (e.g., 'Option 1') completely fixes the overlapping text bug! */}
                <YAxis
                  type="category"
                  dataKey="shortLabel"
                  tick={{ fontSize: 11 }}
                  width={68}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 text-xs max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold text-cyan-400">Option {d.code}</span>
                          {d.code === 1 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-semibold">
                              Safest / Threat Recognized
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                          {d.label}
                        </p>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 font-mono text-[11px]">
                          <span className="text-slate-400">Count: {d.count} of {agg.validN}</span>
                          <span className="font-bold text-cyan-300">{d.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.code}`}
                      fill={entry.code === 1 ? "#06b6d4" : "#6366f1"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted text-center mt-1">
            Percentage calculated from valid responses (n = {agg.validN})
          </p>
        </div>

        {/* Right Column: Clean Responsive Option Breakdown (Zero horizontal scrolling!) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider mb-1 px-1">
            <span>Response Options &amp; Breakdown</span>
            <span>Count · %</span>
          </div>

          <div className="space-y-2">
            {agg.rows.map((r) => {
              const isSafest = r.code === 1;
              return (
                <div
                  key={r.code}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isSafest
                      ? "bg-cyan/5 border-cyan/30"
                      : "bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-surface-2 border text-foreground">
                        Option {r.code}
                      </span>
                      {isSafest && (
                        <span className="tag green text-[10px] py-0.5 px-1.5 flex items-center gap-1 font-semibold">
                          <CheckCircle2 size={11} /> Safest / Accurate Identification
                        </span>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap font-mono text-xs">
                      <span className="font-bold text-foreground">
                        {r.percentage.toFixed(1)}%
                      </span>
                      <span className="text-muted text-[11px] ml-1">
                        ({r.count})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground mt-1.5 leading-snug">
                    {r.label}
                  </p>

                  {/* Clean Visual Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden mt-2 border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSafest ? "bg-cyan" : "bg-indigo-500/70"
                      }`}
                      style={{ width: `${Math.min(100, r.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
