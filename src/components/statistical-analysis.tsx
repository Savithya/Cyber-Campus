"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  Table,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Download,
  Layers,
  Filter,
  Printer,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import { questions } from "@/content/questionnaire";
import type { Session, Filters } from "@/lib/types";
import {
  STANDARD_VARIABLES,
  extractVariableValues,
  calculateDescriptiveStats,
  calculatePearson,
  calculateSpearman,
  calculateCorrelationMatrix,
  calculateLinearRegression,
  calculateReliability,
  runAssumptionDiagnostics,
  runHypothesisTest,
  calculateFriedmanTest,
  type FriedmanResult,
  type WilcoxonComparison,
  CorrelationResult,
  RegressionResult,
} from "@/lib/statistics";
import {
  exportDescriptiveStatsCsv,
  exportCorrelationMatrixCsv,
  exportHypothesisSummaryCsv,
  exportRegressionResultsCsv,
  exportReliabilityCsv,
  exportExcelXmlWorkbook,
} from "@/lib/statistics-export";

type TabId =
  | "descriptives"
  | "correlations"
  | "hypotheses"
  | "friedman"
  | "regression"
  | "reliability"
  | "diagnostics"
  | "reports";

interface StatisticalAnalysisProps {
  sessions: Session[];
  allSessions: Session[];
  demo: boolean;
  filters: Filters;
  filterText: string;
}

const TABS: { id: TabId; label: string; icon: typeof Calculator }[] = [
  { id: "descriptives", label: "Descriptive Statistics", icon: Table },
  { id: "correlations", label: "Correlation Analysis", icon: Activity },
  { id: "hypotheses", label: "Hypothesis Testing", icon: CheckCircle2 },
  { id: "friedman", label: "Repeated Measures (Friedman/Wilcoxon)", icon: Calculator },
  { id: "regression", label: "Regression Analysis", icon: TrendingUp },
  { id: "reliability", label: "Reliability Analysis", icon: Layers },
  { id: "diagnostics", label: "Assumption Diagnostics", icon: AlertTriangle },
  { id: "reports", label: "Statistical Reports", icon: FileSpreadsheet },
];

const CHART_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
];

export default function StatisticalAnalysis({
  sessions,
  allSessions,
  demo,
  filters,
  filterText,
}: StatisticalAnalysisProps) {
  const [activeTab, setActiveTab] = useState<TabId>("descriptives");
  const [copiedText, setCopiedText] = useState(false);

  // Download helper for in-browser client side downloads
  function triggerDownload(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const validSampleCount = sessions.length;
  const totalSubmissionsCount = allSessions.filter(
    (s) =>
      s.status === "submitted_complete" || s.status === "submitted_with_missing",
  ).length;

  // Empty state handling
  if (validSampleCount === 0) {
    return (
      <div className="card empty-state-box text-center p-8">
        <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">No research responses available yet</h2>
        <p className="text-sm text-muted mt-2">
          Statistical computations and hypothesis testing require authentic submitted survey responses.
        </p>
        <p className="small-copy mt-2">
          Clear your search filters or wait for research participants to submit
          the survey instrument. In academic research, no fabricated observations
          are generated.
        </p>
      </div>
    );
  }

  return (
    <div className="stats-dashboard">
      {/* Top Academic Context Header */}
      <section className="stats-header-card card">
        <div className="stats-header-main">
          <div>
            <div className="stats-badge-row">
              <span className="tag primary-tag">FEATURE 14 · ADVANCED STATISTICAL SUITE</span>
              <span className="tag">ACTUAL RESEARCH DATASET</span>
              <span className="tag">Asia/Colombo</span>
            </div>
            <h1 className="stats-page-title">Advanced Statistical Analysis</h1>
            <p className="stats-page-subtitle">
              Empirical examination of the relationship between social engineering
              threat dimensions (Phishing, Pretexting, Impersonation, Online Scams)
              and User Privacy among university students in Sri Lanka.
            </p>
          </div>
          <div className="stats-header-actions">
            <button
              className="button secondary"
              onClick={() => {
                const xml = exportExcelXmlWorkbook(sessions, demo);
                triggerDownload(
                  xml,
                  `CyberCampus_Statistical_Report_${new Date().toISOString().slice(0, 10)}.xls`,
                  "application/vnd.ms-excel;charset=utf-8",
                );
              }}
              title="Download full multi-sheet Excel workbook"
            >
              <FileSpreadsheet size={16} /> Excel Workbook
            </button>
            <button
              className="button primary"
              onClick={() => {
                const csv = exportDescriptiveStatsCsv(sessions, filters, demo);
                triggerDownload(csv, "descriptive-statistics.csv", "text/csv;charset=utf-8");
              }}
              title="Download summary CSV"
            >
              <Download size={16} /> Quick CSV
            </button>
          </div>
        </div>

        {/* Global Dataset Metrics Overview */}
        <div className="stats-metrics-strip">
          <div className="metric-cell">
            <span className="metric-label">Valid Analyzed Sample</span>
            <strong className="metric-val">{validSampleCount}</strong>
            <span className="metric-note">Filtered submitted records</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Total Submissions</span>
            <strong className="metric-val">{totalSubmissionsCount}</strong>
            <span className="metric-note">All submitted respondents</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Research Variables</span>
            <strong className="metric-val">25 Items + 6 Scales</strong>
            <span className="metric-note">4 IVs (Q6–Q18) · 1 DV (Q19–Q25)</span>
          </div>
          <div className="metric-cell">
            <span className="metric-label">Active Filter Scope</span>
            <strong className="metric-val text-xs font-mono truncate max-w-[200px]" title={filterText}>
              {filterText}
            </strong>
            <span className="metric-note">Colombo midnight boundaries</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <nav className="stats-tab-nav" aria-label="Statistical Analysis Navigation">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`stats-tab-btn ${isSelected ? "active" : ""}`}
              role="tab"
              aria-selected={isSelected}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      <main className="stats-tab-content">
        {activeTab === "descriptives" && (
          <DescriptivesTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "correlations" && (
          <CorrelationsTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "hypotheses" && (
          <HypothesesTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "friedman" && (
          <FriedmanTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "regression" && (
          <RegressionTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "reliability" && (
          <ReliabilityTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "diagnostics" && (
          <DiagnosticsTab sessions={sessions} triggerDownload={triggerDownload} />
        )}
        {activeTab === "reports" && (
          <ReportsTab
            sessions={sessions}
            demo={demo}
            filterText={filterText}
            triggerDownload={triggerDownload}
            copiedText={copiedText}
            setCopiedText={setCopiedText}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// 1. DESCRIPTIVE STATISTICS TAB
// ============================================================================

function DescriptivesTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const [selectedVarId, setSelectedVarId] = useState<string>("Q6");
  const [sectionFilter, setSectionFilter] = useState<string>("ALL");
  const [chartType, setChartType] = useState<"bar" | "column" | "histogram" | "box" | "pie">("bar");

  const filteredVars = useMemo(() => {
    if (sectionFilter === "ALL") return STANDARD_VARIABLES;
    if (sectionFilter === "COMPOSITES")
      return STANDARD_VARIABLES.filter((v) => v.type !== "single_item");
    return STANDARD_VARIABLES.filter((v) => v.section === sectionFilter);
  }, [sectionFilter]);

  const activeVar =
    STANDARD_VARIABLES.find((v) => v.id === selectedVarId) || STANDARD_VARIABLES[0];

  const values = useMemo(
    () => extractVariableValues(activeVar, sessions),
    [activeVar, sessions],
  );

  const stats = useMemo(() => {
    const rawQ = questions.find((q) => q.id === activeVar.id);
    const labelsMap: Record<number, string> = {};
    if (rawQ) {
      for (const opt of rawQ.options) {
        labelsMap[opt.code] = opt.label;
      }
    }
    return calculateDescriptiveStats(values, labelsMap);
  }, [activeVar, values]);

  const isNominal = activeVar.measurementLevel === "nominal";

  return (
    <div className="tab-pane">
      {/* Variable Selector & Filter Header */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted" />
            <span className="font-semibold text-sm">Filter Section:</span>
            <div className="flex flex-wrap gap-1">
              {[
                ["ALL", "All Items"],
                ["A", "A: Profile"],
                ["B", "B: Phishing"],
                ["C", "C: Pretexting"],
                ["D", "D: Impersonation"],
                ["E", "E: Scams/Links"],
                ["F", "F: User Privacy"],
                ["COMPOSITES", "Composite Scales"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSectionFilter(key)}
                  className={`btn-pill text-xs px-2.5 py-1 rounded-md border ${
                    sectionFilter === key
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-muted border-border hover:bg-hover"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="button secondary text-xs"
            onClick={() => {
              const csv = exportDescriptiveStatsCsv(sessions);
              triggerDownload(csv, "descriptives-all-variables.csv", "text/csv;charset=utf-8");
            }}
          >
            <Download size={14} /> Export All Descriptives CSV
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Select Analysis Variable
            </label>
            <select
              value={selectedVarId}
              onChange={(e) => setSelectedVarId(e.target.value)}
              className="select-field w-full"
            >
              {filteredVars.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} — {v.name} ({v.measurementLevel})
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm">
            <span className="font-semibold block text-ink">{activeVar.name}</span>
            <span className="text-muted text-xs block">{activeVar.description}</span>
            <span className="tag text-xs mt-1">Level: {activeVar.measurementLevel.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {isNominal && (
        <div className="notice text-sm">
          <strong>Nominal Measurement Level Notice:</strong> Categorical variables
          (e.g., Gender, University Type) represent non-numeric categories.
          Numeric averages (mean, variance) are not statistically appropriate;
          frequencies and percentage distributions are reported.
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid four mt-4">
        <div className="stat-card">
          <span>Valid Sample Size (N)</span>
          <strong>{stats.validN}</strong>
          <p>{stats.missingN} missing responses ({((stats.missingN / Math.max(1, stats.totalN)) * 100).toFixed(1)}%)</p>
        </div>
        <div className="stat-card">
          <span>{isNominal ? "Mode (Most Frequent)" : "Mean (Average)"}</span>
          <strong>{isNominal ? stats.modeDisplay : stats.mean?.toFixed(2) ?? "—"}</strong>
          <p>{isNominal ? "Modal category" : `SE = ${stats.sem?.toFixed(3) ?? "—"} · 95% CI: [${stats.ci95Lower?.toFixed(2) ?? "—"}, ${stats.ci95Upper?.toFixed(2) ?? "—"}]`}</p>
        </div>
        <div className="stat-card">
          <span>{isNominal ? "Unique Categories" : "Median (Q2)"}</span>
          <strong>{isNominal ? stats.frequencies.length : stats.median?.toFixed(2) ?? "—"}</strong>
          <p>{isNominal ? "Distinct response choices" : `IQR = ${stats.iqr?.toFixed(2) ?? "—"} (Q1: ${stats.q1?.toFixed(2) ?? "—"}, Q3: ${stats.q3?.toFixed(2) ?? "—"})`}</p>
        </div>
        <div className="stat-card">
          <span>{isNominal ? "Valid Response %" : "Std Deviation / Variance"}</span>
          <strong>
            {isNominal
              ? `${((stats.validN / Math.max(1, stats.totalN)) * 100).toFixed(1)}%`
              : stats.sd?.toFixed(2) ?? "—"}
          </strong>
          <p>{isNominal ? "Participation rate" : `Variance (s²) = ${stats.variance?.toFixed(2) ?? "—"}`}</p>
        </div>
      </div>

      {/* Parametric Shape & Range Indicators (if numeric/ordinal) */}
      {!isNominal && (
        <div className="stats-grid four mt-4">
          <div className="mini-stat-card card">
            <span className="text-xs text-muted">Skewness</span>
            <strong className="text-lg">{stats.skewness?.toFixed(3) ?? "—"}</strong>
            <small className="text-muted block text-xs">
              {Math.abs(stats.skewness ?? 0) <= 1 ? "Normal symmetry" : "Moderate skew"}
            </small>
          </div>
          <div className="mini-stat-card card">
            <span className="text-xs text-muted">Excess Kurtosis</span>
            <strong className="text-lg">{stats.kurtosis?.toFixed(3) ?? "—"}</strong>
            <small className="text-muted block text-xs">
              {Math.abs(stats.kurtosis ?? 0) <= 3 ? "Mesokurtic / Normal" : "Peaked/Flat"}
            </small>
          </div>
          <div className="mini-stat-card card">
            <span className="text-xs text-muted">Minimum / Maximum</span>
            <strong className="text-lg">{stats.min ?? "—"} / {stats.max ?? "—"}</strong>
            <small className="text-muted block text-xs">Range = {stats.range ?? "—"}</small>
          </div>
          <div className="mini-stat-card card">
            <span className="text-xs text-muted">Standard Error of Mean</span>
            <strong className="text-lg">{stats.sem?.toFixed(3) ?? "—"}</strong>
            <small className="text-muted block text-xs">Precision of sample estimate</small>
          </div>
        </div>
      )}

      {/* Interactive Visualizations */}
      <div className="card mt-4">
        <div className="card-top">
          <div>
            <h2>Data Distribution Visualization</h2>
            <p className="text-xs text-muted">
              Graphical representation of {activeVar.name} based on authentic participant records.
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setChartType("bar")}
              className={`btn-pill text-xs px-2.5 py-1 rounded border ${
                chartType === "bar" ? "bg-primary text-white border-primary" : "border-border text-muted"
              }`}
            >
              Horizontal Bar
            </button>
            <button
              onClick={() => setChartType("column")}
              className={`btn-pill text-xs px-2.5 py-1 rounded border ${
                chartType === "column" ? "bg-primary text-white border-primary" : "border-border text-muted"
              }`}
            >
              Vertical Column
            </button>
            {!isNominal && (
              <>
                <button
                  onClick={() => setChartType("histogram")}
                  className={`btn-pill text-xs px-2.5 py-1 rounded border ${
                    chartType === "histogram" ? "bg-primary text-white border-primary" : "border-border text-muted"
                  }`}
                >
                  Histogram
                </button>
                <button
                  onClick={() => setChartType("box")}
                  className={`btn-pill text-xs px-2.5 py-1 rounded border ${
                    chartType === "box" ? "bg-primary text-white border-primary" : "border-border text-muted"
                  }`}
                >
                  Box Plot
                </button>
              </>
            )}
            {isNominal && (
              <button
                onClick={() => setChartType("pie")}
                className={`btn-pill text-xs px-2.5 py-1 rounded border ${
                  chartType === "pie" ? "bg-primary text-white border-primary" : "border-border text-muted"
                }`}
              >
                Pie Chart
              </button>
            )}
          </div>
        </div>

        {/* Charts Body */}
        <div className="chart-render-area min-h-[300px] mt-4">
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height={Math.max(260, stats.frequencies.length * 52)}>
              <BarChart
                data={stats.frequencies.map((f) => ({
                  label: f.label || `Val ${f.value}`,
                  percentage: Number(f.percentage.toFixed(1)),
                  count: f.count,
                }))}
                layout="vertical"
                margin={{ top: 8, right: 30, left: 20, bottom: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e8f0" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => v + "%"} />
                <YAxis dataKey="label" type="category" width={180} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, n, item) => [`${v}% (${item.payload.count} responses)`, "Share"]} />
                <Bar dataKey="percentage" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "column" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.frequencies.map((f) => ({
                  label: f.label || `Val ${f.value}`,
                  count: f.count,
                  percentage: Number(f.percentage.toFixed(1)),
                }))}
                margin={{ top: 15, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8f0" />
                <XAxis dataKey="label" angle={-25} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v, n, item) => [`${v} participants (${item.payload.percentage}%)`, "Frequency"]} />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "histogram" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.histogramBins}
                margin={{ top: 15, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e8f0" />
                <XAxis dataKey="binLabel" angle={-20} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v) => [`${v} respondents`, "Bin Frequency"]} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === "pie" && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.frequencies}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ? name.slice(0, 15) : ""}: ${(((percent ?? 0)) * 100).toFixed(0)}%`
                  }
                >
                  {stats.frequencies.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n, item) => [`${v} respondents (${item.payload.percentage.toFixed(1)}%)`, item.payload.label || "Category"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {chartType === "box" && (
            <div className="box-plot-custom p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-lg bg-surface border border-border rounded-lg p-6">
                <h4 className="text-sm font-semibold mb-3 text-center">
                  Five-Number Summary (Tukey Box Plot)
                </h4>
                <div className="relative h-20 w-full flex items-center justify-center my-4">
                  {/* Whisker Line */}
                  <div className="absolute left-6 right-6 h-0.5 bg-muted"></div>
                  {/* Min tick */}
                  <div className="absolute left-6 h-6 w-0.5 bg-ink"></div>
                  {/* Max tick */}
                  <div className="absolute right-6 h-6 w-0.5 bg-ink"></div>
                  {/* Box (Q1 to Q3) */}
                  <div
                    className="absolute h-14 bg-indigo-100 border-2 border-indigo-600 rounded flex items-center justify-center"
                    style={{ left: "25%", width: "50%" }}
                  >
                    {/* Median Line */}
                    <div className="h-full w-1 bg-indigo-900"></div>
                  </div>
                </div>
                <div className="grid grid-cols-5 text-center text-xs mt-2 font-mono">
                  <div>
                    <span className="text-muted block">Min</span>
                    <strong>{stats.min ?? "—"}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Q1 (25%)</span>
                    <strong>{stats.q1?.toFixed(2) ?? "—"}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-bold block">Median</span>
                    <strong>{stats.median?.toFixed(2) ?? "—"}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Q3 (75%)</span>
                    <strong>{stats.q3?.toFixed(2) ?? "—"}</strong>
                  </div>
                  <div>
                    <span className="text-muted block">Max</span>
                    <strong>{stats.max ?? "—"}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Frequency Distribution Table */}
      <div className="card mt-4">
        <div className="card-top">
          <h3>Frequency & Percentage Distribution</h3>
          <span className="tag">Total Valid N = {stats.validN}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Response Category</th>
                <th>Raw Code</th>
                <th>Count (Frequency)</th>
                <th>Valid Percentage</th>
                <th>Cumulative Percentage</th>
              </tr>
            </thead>
            <tbody>
              {stats.frequencies.map((f) => (
                <tr key={f.value}>
                  <td className="font-medium">{f.label || `Category ${f.value}`}</td>
                  <td><code>{f.value}</code></td>
                  <td>{f.count}</td>
                  <td>{f.percentage.toFixed(1)}%</td>
                  <td>{f.cumulativePercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Valid Total</th>
                <td>—</td>
                <th>{stats.validN}</th>
                <th>100.0%</th>
                <td>—</td>
              </tr>
              <tr>
                <th>Missing / Skipped</th>
                <td>—</td>
                <td>{stats.missingN}</td>
                <td>Excluded</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CORRELATION ANALYSIS TAB
// ============================================================================

function CorrelationsTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const [var1Id, setVar1Id] = useState<string>("IV1_COMPOSITE");
  const [var2Id, setVar2Id] = useState<string>("DV_COMPOSITE");
  const [method, setMethod] = useState<"spearman" | "pearson">("spearman");

  const varOptions = useMemo(
    () => STANDARD_VARIABLES.filter((v) => v.measurementLevel !== "nominal"),
    [],
  );

  const var1Def = STANDARD_VARIABLES.find((v) => v.id === var1Id) || varOptions[0];
  const var2Def = STANDARD_VARIABLES.find((v) => v.id === var2Id) || varOptions[1];

  const vals1 = useMemo(
    () => extractVariableValues(var1Def, sessions),
    [var1Def, sessions],
  );
  const vals2 = useMemo(
    () => extractVariableValues(var2Def, sessions),
    [var2Def, sessions],
  );

  const result: CorrelationResult = useMemo(() => {
    return method === "spearman"
      ? calculateSpearman(vals1, vals2)
      : calculatePearson(vals1, vals2);
  }, [vals1, vals2, method]);

  // Heatmap matrix calculation across key research indicators & composites
  const matrixVars = useMemo(() => {
    return [
      "IV1_COMPOSITE",
      "IV2_COMPOSITE",
      "IV3_COMPOSITE",
      "IV4_COMPOSITE",
      "DV_COMPOSITE",
      "DV_CONCERN",
      "DV_BEHAVIOUR",
      "Q9",
      "Q12",
      "Q15",
      "Q18",
      "Q25",
    ]
      .map((id) => STANDARD_VARIABLES.find((v) => v.id === id)!)
      .filter(Boolean)
      .map((v) => ({
        id: v.id,
        label: v.name,
        values: extractVariableValues(v, sessions),
      }));
  }, [sessions]);

  const matrixData = useMemo(() => {
    return calculateCorrelationMatrix(matrixVars, method);
  }, [matrixVars, method]);

  return (
    <div className="tab-pane">
      {/* Method & Variables Config Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2>Bivariate Correlation Analysis</h2>
            <p className="text-xs text-muted">
              Examine the direction and strength of association between two operationalized research constructs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Method:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setMethod("spearman")}
                className={`btn-pill text-xs px-3 py-1 rounded border ${
                  method === "spearman"
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted"
                }`}
                title="Recommended for ordinal Likert scales"
              >
                Spearman Rank (rs)
              </button>
              <button
                onClick={() => setMethod("pearson")}
                className={`btn-pill text-xs px-3 py-1 rounded border ${
                  method === "pearson"
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted"
                }`}
                title="Parametric linear correlation"
              >
                Pearson (r)
              </button>
            </div>
            <button
              className="button secondary text-xs ml-2"
              onClick={() => {
                const csv = exportCorrelationMatrixCsv(sessions, method);
                triggerDownload(csv, `correlation-matrix-${method}.csv`, "text/csv;charset=utf-8");
              }}
            >
              <Download size={14} /> Matrix CSV
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Variable X (Predictor / Dimension 1)
            </label>
            <select
              value={var1Id}
              onChange={(e) => setVar1Id(e.target.value)}
              className="select-field w-full"
            >
              {varOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id}: {v.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Variable Y (Outcome / Dimension 2)
            </label>
            <select
              value={var2Id}
              onChange={(e) => setVar2Id(e.target.value)}
              className="select-field w-full"
            >
              {varOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id}: {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Correlation KPI Cards */}
      <div className="stats-grid four mt-4">
        <div className="stat-card">
          <span>{method === "spearman" ? "Spearman Rho (rs)" : "Pearson (r)"}</span>
          <strong>
            {result.coefficient !== null ? result.coefficient.toFixed(3) : "—"}
          </strong>
          <p>
            {result.direction.toUpperCase()} · {result.strength.toUpperCase()}
          </p>
        </div>
        <div className="stat-card">
          <span>p-value (Two-Tailed)</span>
          <strong>
            {result.pValue !== null
              ? result.pValue < 0.001
                ? "< .001"
                : result.pValue.toFixed(4)
              : "—"}
          </strong>
          <p>
            {result.isStatisticallySignificant
              ? "Statistically Significant (p < .05)"
              : "Not Significant (p ≥ .05)"}
          </p>
        </div>
        <div className="stat-card">
          <span>Paired Observations (N)</span>
          <strong>{result.validN}</strong>
          <p>Degrees of freedom (df) = {result.degreesOfFreedom}</p>
        </div>
        <div className="stat-card">
          <span>
            {method === "pearson" ? "95% Confidence Interval" : "t-Statistic"}
          </span>
          <strong>
            {method === "pearson" && result.ciLower !== null && result.ciUpper !== null
              ? `[${result.ciLower.toFixed(2)}, ${result.ciUpper.toFixed(2)}]`
              : result.tStatistic?.toFixed(2) ?? "—"}
          </strong>
          <p>{method === "pearson" ? "Fisher Z interval" : "Student&apos;s t test"}</p>
        </div>
      </div>

      {/* Academic Non-Causal Interpretation Notice */}
      <div className="notice text-sm mt-4">
        <strong>Academic Interpretation:</strong> {result.interpretation}
        <span className="block mt-1 text-xs opacity-90">
          Methodological reminder: In this cross-sectional study, statistical
          correlation evaluates concurrent association and does NOT demonstrate
          causality, temporal precedence, or absence of confounding variables.
        </span>
      </div>

      {/* Scatter Plot with Scatter Data */}
      <div className="card mt-4">
        <div className="card-top">
          <div>
            <h3>Bivariate Scatter Plot</h3>
            <p className="text-xs text-muted">
              Individual paired respondent ratings on {var1Def.name} vs. {var2Def.name}
            </p>
          </div>
          <span className="tag">N = {result.validN} complete pairs</span>
        </div>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" />
              <XAxis
                type="number"
                dataKey="x"
                name={var1Def.name}
                domain={["auto", "auto"]}
                label={{ value: var1Def.name, position: "insideBottom", offset: -10, fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={var2Def.name}
                domain={["auto", "auto"]}
                label={{ value: var2Def.name, angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Respondents" data={result.scatterData} fill="#4f46e5" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Correlation Heatmap */}
      <div className="card mt-4">
        <div className="card-top">
          <div>
            <h3>Correlation Matrix & Interactive Heatmap</h3>
            <p className="text-xs text-muted">
              Click any cell to inspect that specific bivariate pair above.
            </p>
          </div>
          <span className="tag">{method.toUpperCase()} COEFFICIENTS</span>
        </div>

        <div className="table-scroll mt-2">
          <table className="heatmap-table text-xs">
            <thead>
              <tr>
                <th>Construct</th>
                {matrixData.variableLabels.map((v) => (
                  <th key={v.id} className="text-center px-2 py-1 font-mono">
                    {v.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.matrix.map((row, i) => (
                <tr key={matrixData.variableLabels[i].id}>
                  <th className="text-left font-semibold pr-3 whitespace-nowrap">
                    {matrixData.variableLabels[i].id} ({matrixData.variableLabels[i].label.slice(0, 18)})
                  </th>
                  {row.map((cell, j) => {
                    const r = cell.coefficient;
                    // Color calculation: blue for positive, red for negative
                    let bg = "transparent";
                    let textColor = "inherit";
                    if (r !== null) {
                      const alpha = Math.min(0.85, Math.max(0.1, Math.abs(r)));
                      if (r > 0) {
                        bg = `rgba(79, 70, 229, ${alpha})`;
                        if (alpha > 0.4) textColor = "#ffffff";
                      } else if (r < 0) {
                        bg = `rgba(239, 68, 68, ${alpha})`;
                        if (alpha > 0.4) textColor = "#ffffff";
                      }
                    }
                    return (
                      <td
                        key={j}
                        className="text-center font-mono cursor-pointer transition-all hover:ring-2 hover:ring-indigo-400"
                        style={{ backgroundColor: bg, color: textColor }}
                        title={`${cell.var1} vs ${cell.var2}: r = ${r !== null ? r.toFixed(3) : "—"}, p = ${cell.pValue !== null ? cell.pValue.toFixed(3) : "—"}`}
                        onClick={() => {
                          setVar1Id(cell.var1);
                          setVar2Id(cell.var2);
                        }}
                      >
                        {r !== null ? r.toFixed(2) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. HYPOTHESIS TESTING TAB
// ============================================================================

function HypothesesTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const [alpha, setAlpha] = useState<number>(0.05);
  const [multipleTesting, setMultipleTesting] = useState<"none" | "bonferroni">("none");
  const [testType, setTestType] = useState<"spearman" | "pearson" | "regression">("spearman");

  // Operational definition selections for IVs and DV
  const [iv1Selection, setIv1Selection] = useState<string>("IV1_COMPOSITE");
  const [iv2Selection, setIv2Selection] = useState<string>("IV2_COMPOSITE");
  const [iv3Selection, setIv3Selection] = useState<string>("IV3_COMPOSITE");
  const [iv4Selection, setIv4Selection] = useState<string>("IV4_COMPOSITE");
  const [dvSelection, setDvSelection] = useState<string>("DV_COMPOSITE");

  const dvDef = STANDARD_VARIABLES.find((v) => v.id === dvSelection)!;
  const dvVals = useMemo(() => extractVariableValues(dvDef, sessions), [dvDef, sessions]);

  // Compute test for H1
  const iv1Def = STANDARD_VARIABLES.find((v) => v.id === iv1Selection)!;
  const iv1Vals = useMemo(() => extractVariableValues(iv1Def, sessions), [iv1Def, sessions]);
  const h1 = useMemo(
    () =>
      runHypothesisTest(
        "H1",
        iv1Def.name,
        iv1Vals,
        dvDef.name,
        dvVals,
        testType,
        alpha,
        multipleTesting,
      ),
    [iv1Def, iv1Vals, dvDef, dvVals, testType, alpha, multipleTesting],
  );

  // Compute test for H2
  const iv2Def = STANDARD_VARIABLES.find((v) => v.id === iv2Selection)!;
  const iv2Vals = useMemo(() => extractVariableValues(iv2Def, sessions), [iv2Def, sessions]);
  const h2 = useMemo(
    () =>
      runHypothesisTest(
        "H2",
        iv2Def.name,
        iv2Vals,
        dvDef.name,
        dvVals,
        testType,
        alpha,
        multipleTesting,
      ),
    [iv2Def, iv2Vals, dvDef, dvVals, testType, alpha, multipleTesting],
  );

  // Compute test for H3
  const iv3Def = STANDARD_VARIABLES.find((v) => v.id === iv3Selection)!;
  const iv3Vals = useMemo(() => extractVariableValues(iv3Def, sessions), [iv3Def, sessions]);
  const h3 = useMemo(
    () =>
      runHypothesisTest(
        "H3",
        iv3Def.name,
        iv3Vals,
        dvDef.name,
        dvVals,
        testType,
        alpha,
        multipleTesting,
      ),
    [iv3Def, iv3Vals, dvDef, dvVals, testType, alpha, multipleTesting],
  );

  // Compute test for H4
  const iv4Def = STANDARD_VARIABLES.find((v) => v.id === iv4Selection)!;
  const iv4Vals = useMemo(() => extractVariableValues(iv4Def, sessions), [iv4Def, sessions]);
  const h4 = useMemo(
    () =>
      runHypothesisTest(
        "H4",
        iv4Def.name,
        iv4Vals,
        dvDef.name,
        dvVals,
        testType,
        alpha,
        multipleTesting,
      ),
    [iv4Def, iv4Vals, dvDef, dvVals, testType, alpha, multipleTesting],
  );

  const hypotheses = [h1, h2, h3, h4];

  return (
    <div className="tab-pane">
      {/* Configuration & Controls */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2>Formal Hypothesis Testing Framework</h2>
            <p className="text-xs text-muted">
              Inferential evaluation of proposed academic hypotheses (H01–H14) with exact p-values and explicit decisions.
            </p>
          </div>
          <button
            className="button secondary text-xs"
            onClick={() => {
              const csv = exportHypothesisSummaryCsv(
                sessions,
                alpha,
                multipleTesting,
                testType,
              );
              triggerDownload(csv, "hypotheses-test-results.csv", "text/csv;charset=utf-8");
            }}
          >
            <Download size={14} /> Export Hypotheses CSV
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Statistical Test Method
            </label>
            <select
              value={testType}
              onChange={(e) =>
                setTestType(
                  e.target.value as "spearman" | "pearson" | "regression",
                )
              }
              className="select-field w-full text-xs"
            >
              <option value="spearman">Spearman Rank Correlation (Non-Parametric · Recommended)</option>
              <option value="pearson">Pearson Linear Correlation (Parametric)</option>
              <option value="regression">Simple Linear Regression t-Test</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Significance Threshold (α)
            </label>
            <select
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="select-field w-full text-xs"
            >
              <option value={0.05}>α = 0.05 (Standard 95% Confidence)</option>
              <option value={0.01}>α = 0.01 (Stringent 99% Confidence)</option>
              <option value={0.10}>α = 0.10 (Exploratory 90% Confidence)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Multiple Testing Correction
            </label>
            <select
              value={multipleTesting}
              onChange={(e) =>
                setMultipleTesting(e.target.value as "none" | "bonferroni")
              }
              className="select-field w-full text-xs"
            >
              <option value="none">None (Per-Hypothesis α = {alpha})</option>
              <option value="bonferroni">
                Bonferroni Correction (α/4 = {(alpha / 4).toFixed(4)})
              </option>
            </select>
          </div>
        </div>

        {/* Operationalization Settings Dropdowns */}
        <details className="mt-4 pt-3 border-t border-border">
          <summary className="text-xs font-semibold text-indigo-600 cursor-pointer">
            Configure Operational Definitions (Indicators vs Composites)
          </summary>
          <div className="grid md:grid-cols-5 gap-3 mt-3 text-xs">
            <div>
              <span className="block font-semibold mb-1">IV1: Phishing</span>
              <select
                value={iv1Selection}
                onChange={(e) => setIv1Selection(e.target.value)}
                className="select-field w-full text-xs"
              >
                <option value="IV1_COMPOSITE">Composite Mean (Q6,Q8,Q9)</option>
                <option value="Q6">Q6: Awareness</option>
                <option value="Q8">Q8: Protective Action</option>
                <option value="Q9">Q9: Perceived Privacy Risk</option>
              </select>
            </div>
            <div>
              <span className="block font-semibold mb-1">IV2: Pretexting</span>
              <select
                value={iv2Selection}
                onChange={(e) => setIv2Selection(e.target.value)}
                className="select-field w-full text-xs"
              >
                <option value="IV2_COMPOSITE">Composite Mean (Q10,Q12)</option>
                <option value="Q10">Q10: Awareness</option>
                <option value="Q12">Q12: Susceptibility</option>
              </select>
            </div>
            <div>
              <span className="block font-semibold mb-1">IV3: Impersonation</span>
              <select
                value={iv3Selection}
                onChange={(e) => setIv3Selection(e.target.value)}
                className="select-field w-full text-xs"
              >
                <option value="IV3_COMPOSITE">Composite Mean (Q13,Q15)</option>
                <option value="Q13">Q13: Awareness</option>
                <option value="Q15">Q15: Recognition Difficulty</option>
              </select>
            </div>
            <div>
              <span className="block font-semibold mb-1">IV4: Scams & Links</span>
              <select
                value={iv4Selection}
                onChange={(e) => setIv4Selection(e.target.value)}
                className="select-field w-full text-xs"
              >
                <option value="IV4_COMPOSITE">Composite Mean (Q17,Q18)</option>
                <option value="Q17">Q17: Link Verification</option>
                <option value="Q18">Q18: Perceived Privacy Risk</option>
              </select>
            </div>
            <div>
              <span className="block font-semibold mb-1">DV: User Privacy</span>
              <select
                value={dvSelection}
                onChange={(e) => setDvSelection(e.target.value)}
                className="select-field w-full text-xs"
              >
                <option value="DV_COMPOSITE">Overall Scale (Q19–Q25)</option>
                <option value="DV_CONCERN">Concerns Subscale (Q19–Q22)</option>
                <option value="DV_BEHAVIOUR">Behaviour Subscale (Q23–Q24)</option>
                <option value="Q25">Q25: Overall Perceived Impact</option>
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* 4 Configurable Hypothesis Panels */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {hypotheses.map((h) => {
          const isReject = h.decision === "Reject H0";
          return (
            <article key={h.hypothesisId} className="card hypothesis-card p-5 border-l-4" style={{ borderLeftColor: isReject ? "#10b981" : "#f59e0b" }}>
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <span className="tag text-xs font-bold">{h.hypothesisId} · {h.selectedTest.toUpperCase()}</span>
                  <h3 className="text-base font-semibold mt-1">
                    {h.independentVariable} → {h.dependentVariable}
                  </h3>
                </div>
                <div
                  className={`decision-pill px-3 py-1 rounded-full text-xs font-bold ${
                    isReject
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {h.decision}
                </div>
              </div>

              <div className="text-xs space-y-1 mb-3 text-muted">
                <p><strong>Null (H0):</strong> {h.nullHypothesis}</p>
                <p><strong>Alternative (H1):</strong> {h.alternativeHypothesis}</p>
              </div>

              <div className="stats-grid four my-3 text-center">
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-xs text-muted block">Test Stat</span>
                  <strong className="text-sm font-mono">{h.testStatisticValue !== null ? h.testStatisticValue.toFixed(3) : "—"}</strong>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-xs text-muted block">p-value</span>
                  <strong className="text-sm font-mono">
                    {h.pValue !== null ? (h.pValue < 0.001 ? "< .001" : h.pValue.toFixed(3)) : "—"}
                  </strong>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-xs text-muted block">Effect Size</span>
                  <strong className="text-sm font-mono">{h.effectSizeValue !== null ? h.effectSizeValue.toFixed(3) : "—"}</strong>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-xs text-muted block">Threshold α</span>
                  <strong className="text-sm font-mono">{h.adjustedAlpha.toFixed(4)}</strong>
                </div>
              </div>

              <p className="text-xs text-ink bg-paper p-3 rounded border border-border">
                {h.plainLanguageInterpretation}
              </p>
            </article>
          );
        })}
      </div>

      {/* Summary Table */}
      <div className="card mt-4">
        <div className="card-top">
          <h3>Summary Hypothesis Testing Matrix</h3>
          <span className="tag">α = {alpha} ({multipleTesting} correction)</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Hypothesis</th>
                <th>Independent Construct</th>
                <th>Dependent Construct</th>
                <th>Test</th>
                <th>N</th>
                <th>Statistic</th>
                <th>p-value</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {hypotheses.map((h) => (
                <tr key={h.hypothesisId}>
                  <td><strong>{h.hypothesisId}</strong></td>
                  <td>{h.independentVariable}</td>
                  <td>{h.dependentVariable}</td>
                  <td>{h.selectedTest}</td>
                  <td>{h.sampleSize}</td>
                  <td><code>{h.testStatisticValue !== null ? h.testStatisticValue.toFixed(3) : "—"}</code></td>
                  <td><code>{h.pValue !== null ? (h.pValue < 0.001 ? "< .001" : h.pValue.toFixed(3)) : "—"}</code></td>
                  <td>
                    <span
                      className={`tag text-xs ${
                        h.decision === "Reject H0" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                      }`}
                    >
                      {h.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. REGRESSION ANALYSIS TAB
// ============================================================================

function RegressionTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const [outcomeId, setOutcomeId] = useState<string>("DV_COMPOSITE");
  const [selectedPredictors, setSelectedPredictors] = useState<string[]>([
    "IV1_COMPOSITE",
    "IV2_COMPOSITE",
    "IV3_COMPOSITE",
    "IV4_COMPOSITE",
  ]);
  const [confirmed, setConfirmed] = useState<boolean>(true);

  const dvDef = STANDARD_VARIABLES.find((v) => v.id === outcomeId)!;
  const dvVals = useMemo(() => extractVariableValues(dvDef, sessions), [dvDef, sessions]);

  const ivDefs = useMemo(
    () => selectedPredictors.map((id) => STANDARD_VARIABLES.find((v) => v.id === id)!).filter(Boolean),
    [selectedPredictors],
  );

  const ivs = useMemo(
    () =>
      ivDefs.map((def) => ({
        name: def.name,
        values: extractVariableValues(def, sessions),
      })),
    [ivDefs, sessions],
  );

  const reg: RegressionResult = useMemo(() => {
    return calculateLinearRegression({ name: dvDef.name, values: dvVals }, ivs);
  }, [dvDef, dvVals, ivs]);

  function togglePredictor(id: string) {
    if (selectedPredictors.includes(id)) {
      if (selectedPredictors.length > 1) {
        setSelectedPredictors(selectedPredictors.filter((p) => p !== id));
      }
    } else {
      setSelectedPredictors([...selectedPredictors, id]);
    }
  }

  return (
    <div className="tab-pane">
      {/* Model Specifier Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2>Multiple Linear Regression (OLS Estimation)</h2>
            <p className="text-xs text-muted">
              Model specification: User Privacy = β₀ + β₁(Phishing) + β₂(Pretexting) + β₃(Impersonation) + β₄(Online Scams) + ε
            </p>
          </div>
          <button
            className="button secondary text-xs"
            onClick={() => {
              const csv = exportRegressionResultsCsv(sessions, outcomeId, selectedPredictors);
              triggerDownload(csv, "regression-model-results.csv", "text/csv;charset=utf-8");
            }}
          >
            <Download size={14} /> Export Regression CSV
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Dependent Variable (Outcome)
            </label>
            <select
              value={outcomeId}
              onChange={(e) => setOutcomeId(e.target.value)}
              className="select-field w-full text-xs"
            >
              <option value="DV_COMPOSITE">DV: User Privacy Overall Scale (Q19–Q25)</option>
              <option value="DV_CONCERN">DV: Privacy Concerns Subscale (Q19–Q22)</option>
              <option value="DV_BEHAVIOUR">DV: Privacy Protection Behaviour Subscale (Q23–Q24)</option>
              <option value="Q25">Q25: Overall Perceived Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Select Predictor Variables (IVs)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ["IV1_COMPOSITE", "IV1: Phishing"],
                ["IV2_COMPOSITE", "IV2: Pretexting"],
                ["IV3_COMPOSITE", "IV3: Impersonation"],
                ["IV4_COMPOSITE", "IV4: Scams & Links"],
              ].map(([id, label]) => {
                const checked = selectedPredictors.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => togglePredictor(id)}
                    className={`btn-pill text-xs px-3 py-1 rounded border ${
                      checked ? "bg-primary text-white border-primary" : "border-border text-muted"
                    }`}
                  >
                    {checked ? "✓ " : "+ "}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
          <input
            type="checkbox"
            id="reg-confirm"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="reg-confirm" className="text-xs text-muted">
            Researcher verification: I confirm the predictor operational definitions, listwise missing handling, and non-causal observational interpretation.
          </label>
        </div>
      </div>

      {reg.isSingular && (
        <div className="card text-amber-600 p-4 mt-4 border border-amber-300">
          <AlertTriangle size={24} className="mb-2" />
          <h3 className="font-semibold">Model Estimation Limitation</h3>
          <p className="text-xs mt-1">{reg.unsuitableReason}</p>
        </div>
      )}

      {/* Model Summary Metrics */}
      <div className="stats-grid four mt-4">
        <div className="stat-card">
          <span>Multiple R / R-Squared (R²)</span>
          <strong>{reg.rSquared.toFixed(3)}</strong>
          <p>Multiple R = {reg.r.toFixed(3)} (Variance Explained: {(reg.rSquared * 100).toFixed(1)}%)</p>
        </div>
        <div className="stat-card">
          <span>Adjusted R-Squared</span>
          <strong>{reg.adjustedRSquared.toFixed(3)}</strong>
          <p>Penalized for {selectedPredictors.length} predictors</p>
        </div>
        <div className="stat-card">
          <span>Overall ANOVA F-Statistic</span>
          <strong>F = {reg.anova.fStatistic.toFixed(2)}</strong>
          <p>p = {reg.anova.pValue < 0.001 ? "< .001" : reg.anova.pValue.toFixed(3)} (df: {reg.anova.dfReg}, {reg.anova.dfRes})</p>
        </div>
        <div className="stat-card">
          <span>Durbin-Watson / SE of Estimate</span>
          <strong>DW = {reg.durbinWatson?.toFixed(2) ?? "—"}</strong>
          <p>Standard Error = {reg.stdErrorEstimate.toFixed(3)}</p>
        </div>
      </div>

      {/* Regression Coefficients Table */}
      <div className="card mt-4">
        <div className="card-top">
          <h3>Regression Parameter Estimates & Multicollinearity (VIF)</h3>
          <span className="tag">N = {reg.validN} complete cases</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Model Parameter</th>
                <th>Unstandardized B</th>
                <th>Std. Error</th>
                <th>Standardized Beta (β)</th>
                <th>t-statistic</th>
                <th>p-value</th>
                <th>95% Confidence Interval</th>
                <th>Tolerance</th>
                <th>VIF</th>
              </tr>
            </thead>
            <tbody>
              {reg.coefficients.map((c) => (
                <tr key={c.variableName}>
                  <td className="font-semibold">{c.variableName}</td>
                  <td><code>{c.unstandardizedB.toFixed(3)}</code></td>
                  <td>{c.stdError.toFixed(3)}</td>
                  <td>{c.standardizedBeta !== null ? c.standardizedBeta.toFixed(3) : "—"}</td>
                  <td><code>{c.tStatistic.toFixed(2)}</code></td>
                  <td>
                    <span className={c.pValue < 0.05 ? "font-bold text-primary" : ""}>
                      {c.pValue < 0.001 ? "< .001" : c.pValue.toFixed(3)}
                    </span>
                  </td>
                  <td>[{c.ciLower.toFixed(2)}, {c.ciUpper.toFixed(2)}]</td>
                  <td>{c.tolerance !== null ? c.tolerance.toFixed(3) : "—"}</td>
                  <td>
                    {c.vif !== null ? (
                      <span className={c.vif > 5 ? "tag bg-amber-100 text-amber-800" : ""}>
                        {c.vif.toFixed(2)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ANOVA Table */}
      <div className="card mt-4">
        <div className="card-top">
          <h3>ANOVA Model Diagnostics</h3>
          <span className="tag">df_total = {reg.anova.dfTot}</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Sum of Squares (SS)</th>
                <th>df</th>
                <th>Mean Square (MS)</th>
                <th>F</th>
                <th>Significance (p)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Regression</th>
                <td>{reg.anova.ssReg.toFixed(3)}</td>
                <td>{reg.anova.dfReg}</td>
                <td>{reg.anova.msReg.toFixed(3)}</td>
                <td><code>{reg.anova.fStatistic.toFixed(2)}</code></td>
                <td><code>{reg.anova.pValue < 0.001 ? "< .001" : reg.anova.pValue.toFixed(3)}</code></td>
              </tr>
              <tr>
                <th>Residual (Error)</th>
                <td>{reg.anova.ssRes.toFixed(3)}</td>
                <td>{reg.anova.dfRes}</td>
                <td>{reg.anova.msRes.toFixed(3)}</td>
                <td>—</td>
                <td>—</td>
              </tr>
              <tr>
                <th>Total</th>
                <td>{reg.anova.ssTot.toFixed(3)}</td>
                <td>{reg.anova.dfTot}</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Residual Diagnostics Visualizations */}
      <div className="card mt-4">
        <div className="card-top">
          <div>
            <h3>Residual Diagnostics (Fitted vs. Residuals)</h3>
            <p className="text-xs text-muted">
              Inspect for homoscedasticity and non-linear patterns.
            </p>
          </div>
          <span className="tag">Mean Residual: {reg.residuals.mean.toFixed(3)}</span>
        </div>
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e8f0" />
              <XAxis
                type="number"
                dataKey="fitted"
                name="Fitted Values"
                label={{ value: "Fitted Values (Ŷ)", position: "insideBottom", offset: -10, fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="residual"
                name="Residual"
                label={{ value: "Residuals (e)", angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Residuals" data={reg.residuals.values} fill="#f43f5e" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. RELIABILITY ANALYSIS TAB (CRONBACH'S ALPHA)
// ============================================================================

function ReliabilityTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const [scalePreset, setScalePreset] = useState<string>("DV_ALL");
  const [reverseMap, setReverseMap] = useState<Record<string, boolean>>({});

  const scalePresets: Record<
    string,
    { title: string; items: { id: string; name: string }[] }
  > = {
    DV_ALL: {
      title: "DV: User Privacy Overall Scale (Q19–Q25)",
      items: [
        { id: "Q19", name: "Q19: Info Exposure Concern" },
        { id: "Q20", name: "Q20: Account Access Concern" },
        { id: "Q21", name: "Q21: Misuse Concern" },
        { id: "Q22", name: "Q22: General Risk Perception" },
        { id: "Q23", name: "Q23: Sharing Avoidance Behaviour" },
        { id: "Q24", name: "Q24: Privacy Settings Management" },
        { id: "Q25", name: "Q25: Overall Perceived Impact" },
      ],
    },
    DV_CONCERNS: {
      title: "DV: Privacy Concerns Subscale (Q19–Q22)",
      items: [
        { id: "Q19", name: "Q19: Info Exposure Concern" },
        { id: "Q20", name: "Q20: Account Access Concern" },
        { id: "Q21", name: "Q21: Misuse Concern" },
        { id: "Q22", name: "Q22: General Risk Perception" },
      ],
    },
    DV_BEHAVIOUR: {
      title: "DV: Privacy Protection Behaviour Subscale (Q23–Q24)",
      items: [
        { id: "Q23", name: "Q23: Sharing Avoidance Behaviour" },
        { id: "Q24", name: "Q24: Privacy Settings Management" },
      ],
    },
    IV1_PHISHING: {
      title: "IV1: Phishing Scale (Q6, Q8, Q9)",
      items: [
        { id: "Q6", name: "Q6: Phishing Awareness" },
        { id: "Q8", name: "Q8: Link Avoidance Behaviour" },
        { id: "Q9", name: "Q9: Perceived Privacy Risk" },
      ],
    },
    IV2_PRETEXTING: {
      title: "IV2: Pretexting Scale (Q10, Q12)",
      items: [
        { id: "Q10", name: "Q10: Pretexting Awareness" },
        { id: "Q12", name: "Q12: Susceptibility" },
      ],
    },
    IV3_IMPERSONATION: {
      title: "IV3: Impersonation Scale (Q13, Q15)",
      items: [
        { id: "Q13", name: "Q13: Impersonation Awareness" },
        { id: "Q15", name: "Q15: Difficulty Recognising" },
      ],
    },
    IV4_SCAMS: {
      title: "IV4: Scams & Malicious Links Scale (Q17, Q18)",
      items: [
        { id: "Q17", name: "Q17: Link Verification Behaviour" },
        { id: "Q18", name: "Q18: Perceived Privacy Risk" },
      ],
    },
  };

  const activeScale = scalePresets[scalePreset] || scalePresets.DV_ALL;

  const itemsWithValues = useMemo(() => {
    return activeScale.items.map((it) => {
      const vDef = STANDARD_VARIABLES.find((v) => v.id === it.id)!;
      return {
        id: it.id,
        name: it.name,
        values: extractVariableValues(vDef, sessions),
      };
    });
  }, [activeScale, sessions]);

  const rel = useMemo(() => {
    return calculateReliability(itemsWithValues, reverseMap);
  }, [itemsWithValues, reverseMap]);

  function toggleReverse(id: string) {
    setReverseMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="tab-pane">
      {/* Scale Selector */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2>Internal Consistency & Reliability Analysis</h2>
            <p className="text-xs text-muted">
              Evaluation of multi-item instrument scales using Cronbach&apos;s Alpha (α) and item-total correlations.
            </p>
          </div>
          <button
            className="button secondary text-xs"
            onClick={() => {
              const csv = exportReliabilityCsv(sessions, activeScale.items);
              triggerDownload(csv, "scale-reliability-results.csv", "text/csv;charset=utf-8");
            }}
          >
            <Download size={14} /> Export Reliability CSV
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Select Construct Scale for Reliability Verification
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(scalePresets).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setScalePreset(key)}
                className={`btn-pill text-xs px-3 py-1.5 rounded border ${
                  scalePreset === key
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reliability KPI Cards */}
      <div className="stats-grid four mt-4">
        <div className="stat-card">
          <span>Cronbach&apos;s Alpha (α)</span>
          <strong className="text-2xl text-primary">
            {rel.cronbachAlpha !== null ? rel.cronbachAlpha.toFixed(3) : "—"}
          </strong>
          <p>{rel.evaluation}</p>
        </div>
        <div className="stat-card">
          <span>Number of Items (k)</span>
          <strong>{rel.itemCount}</strong>
          <p>Complete observations N = {rel.validN}</p>
        </div>
        <div className="stat-card">
          <span>Scale Mean & Variance</span>
          <strong>{rel.scaleMean?.toFixed(2) ?? "—"}</strong>
          <p>Variance (s²) = {rel.scaleVariance?.toFixed(2) ?? "—"} · SD = {rel.scaleSd?.toFixed(2) ?? "—"}</p>
        </div>
        <div className="stat-card">
          <span>Benchmark Threshold</span>
          <strong>α ≥ 0.70</strong>
          <p>Standard Nunnally (1978) threshold for academic research</p>
        </div>
      </div>

      {/* Methodological Guidance Warning */}
      <div className="notice text-sm mt-4">
        <strong>Academic Measurement Note:</strong> Construct validity cannot be established
        by Cronbach&apos;s Alpha alone. Alpha measures internal consistency under tau-equivalence,
        not unidimensionality or external validity. Do not combine conceptually distinct questions
        into a single composite score without theoretical justification.
      </div>

      {/* Item-Total Statistics Table */}
      <div className="card mt-4">
        <div className="card-top">
          <h3>Item-Total Correlation & Sensitivity Analysis</h3>
          <span className="tag">Reverse Coding Configurable</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Description</th>
                <th>Item Mean</th>
                <th>Item SD</th>
                <th>Corrected Item-Total r</th>
                <th>Cronbach&apos;s α if Deleted</th>
                <th>Reverse Coding</th>
              </tr>
            </thead>
            <tbody>
              {rel.items.map((it) => (
                <tr key={it.id}>
                  <td><code>{it.id}</code></td>
                  <td className="font-medium">{it.name}</td>
                  <td>{it.itemMean.toFixed(2)}</td>
                  <td>{it.itemSd.toFixed(2)}</td>
                  <td>
                    <span className={it.correctedItemTotalCorrelation !== null && it.correctedItemTotalCorrelation < 0.3 ? "text-amber-600 font-bold" : ""}>
                      {it.correctedItemTotalCorrelation !== null ? it.correctedItemTotalCorrelation.toFixed(3) : "—"}
                    </span>
                  </td>
                  <td>
                    <code>{it.alphaIfItemDeleted !== null ? it.alphaIfItemDeleted.toFixed(3) : "—"}</code>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleReverse(it.id)}
                      className={`text-xs px-2 py-0.5 rounded border ${
                        reverseMap[it.id] ? "bg-amber-100 text-amber-800 border-amber-300" : "border-border text-muted"
                      }`}
                    >
                      {reverseMap[it.id] ? "Inverted (6-x)" : "Standard"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. ASSUMPTION DIAGNOSTICS TAB
// ============================================================================

function DiagnosticsTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, name: string, mime: string) => void;
}) {
  const dvDef = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;
  const dvVals = useMemo(() => extractVariableValues(dvDef, sessions), [dvDef, sessions]);

  const ivDefs = useMemo(
    () => ["IV1_COMPOSITE", "IV2_COMPOSITE", "IV3_COMPOSITE", "IV4_COMPOSITE"].map(
      (id) => STANDARD_VARIABLES.find((v) => v.id === id)!,
    ),
    [],
  );

  const ivs = useMemo(
    () =>
      ivDefs.map((def) => ({
        name: def.name,
        values: extractVariableValues(def, sessions),
      })),
    [ivDefs, sessions],
  );

  const reg = useMemo(
    () => calculateLinearRegression({ name: dvDef.name, values: dvVals }, ivs),
    [dvDef, dvVals, ivs],
  );

  const diag = useMemo(
    () => runAssumptionDiagnostics({ name: dvDef.name, values: dvVals }, ivs, reg),
    [dvDef, dvVals, ivs, reg],
  );

  return (
    <div className="tab-pane">
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Statistical Assumption Diagnostics</h2>
            <p className="text-xs text-muted mt-1">
              Systematic verification of statistical assumptions required for parametric tests, correlation, and multiple regression models.
            </p>
          </div>
          <button
            className="button secondary text-xs"
            onClick={() => {
              const csv = exportDescriptiveStatsCsv(sessions);
              triggerDownload(csv, "assumption-diagnostics-data.csv", "text/csv;charset=utf-8");
            }}
          >
            <Download size={14} /> Export Diagnostics CSV
          </button>
        </div>
      </div>

      {/* Assumption Checklist Grid */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {diag.checks.map((c) => {
          const isSatisfied = c.status === "satisfied";
          const isWarning = c.status === "warning";
          return (
            <div
              key={c.assumption}
              className="card p-4 border-l-4"
              style={{
                borderLeftColor: isSatisfied
                  ? "#10b981"
                  : isWarning
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="font-semibold text-sm">{c.assumption}</h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isSatisfied
                      ? "bg-emerald-100 text-emerald-800"
                      : isWarning
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {c.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-muted space-y-1 mb-2">
                <p><strong>Observed Metric:</strong> {c.metric}</p>
                <p><strong>Rule / Benchmark:</strong> {c.threshold}</p>
              </div>
              <p className="text-xs text-ink mb-2">{c.details}</p>
              <div className="text-xs text-muted bg-paper p-2 rounded border border-border">
                <strong>Methodological Guidance:</strong> {c.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 7. STATISTICAL REPORTS & THESIS EXPORT TAB
// ============================================================================

function ReportsTab({
  sessions,
  demo,
  filterText,
  triggerDownload,
  copiedText,
  setCopiedText,
}: {
  sessions: Session[];
  demo: boolean;
  filterText: string;
  triggerDownload: (content: string, name: string, mime: string) => void;
  copiedText: boolean;
  setCopiedText: (val: boolean) => void;
}) {
  const dvDef = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;
  const dvVals = extractVariableValues(dvDef, sessions);

  const ivDefs = ["IV1_COMPOSITE", "IV2_COMPOSITE", "IV3_COMPOSITE", "IV4_COMPOSITE"].map(
    (id) => STANDARD_VARIABLES.find((v) => v.id === id)!,
  );
  const ivs = ivDefs.map((def) => ({
    name: def.name,
    values: extractVariableValues(def, sessions),
  }));

  const reg = calculateLinearRegression({ name: dvDef.name, values: dvVals }, ivs);
  const h1 = runHypothesisTest("H1", "Phishing", extractVariableValues(ivDefs[0], sessions), "User Privacy", dvVals, "spearman");
  const h2 = runHypothesisTest("H2", "Pretexting", extractVariableValues(ivDefs[1], sessions), "User Privacy", dvVals, "spearman");
  const h3 = runHypothesisTest("H3", "Impersonation", extractVariableValues(ivDefs[2], sessions), "User Privacy", dvVals, "spearman");
  const h4 = runHypothesisTest("H4", "Online Scams & Links", extractVariableValues(ivDefs[3], sessions), "User Privacy", dvVals, "spearman");

  const relItems = [
    { id: "Q19", name: "Q19" },
    { id: "Q20", name: "Q20" },
    { id: "Q21", name: "Q21" },
    { id: "Q22", name: "Q22" },
    { id: "Q23", name: "Q23" },
    { id: "Q24", name: "Q24" },
    { id: "Q25", name: "Q25" },
  ].map((it) => ({
    id: it.id,
    name: it.name,
    values: extractVariableValues(STANDARD_VARIABLES.find((v) => v.id === it.id)!, sessions),
  }));
  const rel = calculateReliability(relItems);

  const apaSummary = `An empirical analysis was conducted with N = ${sessions.length} university students in Sri Lanka to investigate the relationship between social engineering threats (Phishing, Pretexting, Impersonation, and Online Scams) and User Privacy. The User Privacy dependent variable scale exhibited an internal consistency of Cronbach's α = ${rel.cronbachAlpha?.toFixed(3) ?? "N/A"}. Non-parametric rank correlation revealed: Phishing (rs = ${h1.testStatisticValue?.toFixed(3) ?? "N/A"}, ${h1.pValue !== null && h1.pValue < 0.001 ? "p < .001" : `p = ${h1.pValue?.toFixed(3)}`}), Pretexting (rs = ${h2.testStatisticValue?.toFixed(3) ?? "N/A"}, ${h2.pValue !== null && h2.pValue < 0.001 ? "p < .001" : `p = ${h2.pValue?.toFixed(3)}`}), Impersonation (rs = ${h3.testStatisticValue?.toFixed(3) ?? "N/A"}, ${h3.pValue !== null && h3.pValue < 0.001 ? "p < .001" : `p = ${h3.pValue?.toFixed(3)}`}), and Online Scams (rs = ${h4.testStatisticValue?.toFixed(3) ?? "N/A"}, ${h4.pValue !== null && h4.pValue < 0.001 ? "p < .001" : `p = ${h4.pValue?.toFixed(3)}`}). Multiple linear regression indicated that the threat predictors accounted for ${(reg.rSquared * 100).toFixed(1)}% of variance in User Privacy (R² = ${reg.rSquared.toFixed(3)}, F(${reg.anova.dfReg}, ${reg.anova.dfRes}) = ${reg.anova.fStatistic.toFixed(2)}, p = ${reg.anova.pValue.toFixed(3)}). Due to the cross-sectional observational design, these results indicate associative relationships rather than confirmed causal mechanisms.`;

  return (
    <div className="tab-pane">
      {/* Export Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2>Academic Research Report & Export Hub</h2>
            <p className="text-xs text-muted">
              Thesis-ready APA tables, statistical narrative summaries, and multi-format research downloads.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="button secondary text-xs"
              onClick={() => {
                const xml = exportExcelXmlWorkbook(sessions, demo);
                triggerDownload(xml, "CyberCampus_Full_Statistical_Report.xls", "application/vnd.ms-excel;charset=utf-8");
              }}
            >
              <FileSpreadsheet size={14} /> Full Excel Workbook
            </button>
            <button
              className="button secondary text-xs"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              className="button primary text-xs"
              onClick={() => {
                navigator.clipboard.writeText(apaSummary);
                setCopiedText(true);
                setTimeout(() => setCopiedText(false), 3000);
              }}
            >
              {copiedText ? <Check size={14} /> : <Copy size={14} />}
              {copiedText ? "Copied APA Text" : "Copy APA Summary"}
            </button>
          </div>
        </div>
      </div>

      {/* APA Narrative Summary Card */}
      <div className="card mt-4 p-5 bg-paper border border-border">
        <div className="card-top mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
              APA-Formatted Findings Narrative (Thesis Ready)
            </h3>
            <span className="tag text-xs">{filterText}</span>
          </div>
          <span className="tag text-xs">APA 7th Edition</span>
        </div>
        <p className="text-sm leading-relaxed text-ink font-serif italic">
          &ldquo;{apaSummary}&rdquo;
        </p>
      </div>

      {/* Formatted Report Tables */}
      <div className="space-y-4 mt-4">
        {/* Hypotheses Summary Table */}
        <div className="card">
          <div className="card-top">
            <h4>Table 1: Hypothesis Testing Decisions Summary</h4>
            <span className="tag">α = 0.05</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Hypothesis</th>
                  <th>Relationship Under Investigation</th>
                  <th>Test Statistic</th>
                  <th>p-value</th>
                  <th>Decision</th>
                  <th>Statistical Conclusion</th>
                </tr>
              </thead>
              <tbody>
                {[h1, h2, h3, h4].map((h) => (
                  <tr key={h.hypothesisId}>
                    <td><strong>{h.hypothesisId}</strong></td>
                    <td>{h.independentVariable} → {h.dependentVariable}</td>
                    <td><code>{h.testStatisticName} = {h.testStatisticValue?.toFixed(3) ?? "—"}</code></td>
                    <td><code>{h.pValue !== null && h.pValue < 0.001 ? "p < .001" : `p = ${h.pValue?.toFixed(3)}`}</code></td>
                    <td><span className="font-bold">{h.decision}</span></td>
                    <td className="text-xs">{h.decision === "Reject H0" ? "Significant association supported" : "No significant association"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multiple Regression Table */}
        <div className="card">
          <div className="card-top">
            <h4>Table 2: Multiple Linear Regression Model</h4>
            <span className="tag">R² = {reg.rSquared.toFixed(3)} (Adj R² = {reg.adjustedRSquared.toFixed(3)})</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Predictor Variable</th>
                  <th>B</th>
                  <th>SE B</th>
                  <th>β</th>
                  <th>t</th>
                  <th>p</th>
                  <th>VIF</th>
                </tr>
              </thead>
              <tbody>
                {reg.coefficients.map((c) => (
                  <tr key={c.variableName}>
                    <td className="font-medium">{c.variableName}</td>
                    <td>{c.unstandardizedB.toFixed(3)}</td>
                    <td>{c.stdError.toFixed(3)}</td>
                    <td>{c.standardizedBeta !== null ? c.standardizedBeta.toFixed(3) : "—"}</td>
                    <td>{c.tStatistic.toFixed(2)}</td>
                    <td>{c.pValue < 0.001 ? "< .001" : c.pValue.toFixed(3)}</td>
                    <td>{c.vif !== null ? c.vif.toFixed(2) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Limitations Statement Card */}
      <div className="card mt-4 p-4 text-xs text-muted space-y-2">
        <h4 className="font-semibold text-ink text-sm">Methodological Limitations Statement</h4>
        <p>
          1. <strong>Cross-Sectional Design:</strong> Data were collected concurrently; observed statistical relationships reflect non-causal associations.
        </p>
        <p>
          2. <strong>Self-Report Instrument:</strong> Participant answers may be subject to social desirability and recall bias regarding security practices.
        </p>
        <p>
          3. <strong>Sample Representation:</strong> Findings describe participating higher education students in Sri Lanka under voluntary consent protocol.
        </p>
      </div>
    </div>
  );
}

function FriedmanTab({
  sessions,
  triggerDownload,
}: {
  sessions: Session[];
  triggerDownload: (content: string, filename: string, mime: string) => void;
}) {
  const [alpha, setAlpha] = useState<number>(0.05);
  const [includeProposed, setIncludeProposed] = useState<boolean>(false);

  const friedmanResult: FriedmanResult = useMemo(() => {
    return calculateFriedmanTest(sessions, alpha, includeProposed);
  }, [sessions, alpha, includeProposed]);

  function exportFriedmanCsv() {
    const lines = [
      `"FRIEDMAN REPEATED-MEASURES ANALYSIS & WILCOXON POST-HOC COMPARISONS"`,
      `"Study: Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka"`,
      `"Generated: ${new Date().toISOString()}"`,
      "",
      `"OMNIBUS FRIEDMAN TEST"`,
      `"Sample Size (N)",${friedmanResult.n}`,
      `"Conditions (k)",${friedmanResult.k}`,
      `"Degrees of Freedom (df)",${friedmanResult.df}`,
      `"Friedman Chi-Square (Q)",${friedmanResult.qStatistic}`,
      `"p-value",${friedmanResult.pValue}`,
      `"Kendall's W Effect Size",${friedmanResult.kendallW}`,
      `"Statistically Significant (p < alpha)",${friedmanResult.significant}`,
      "",
      `"CONDITION MEAN RANKS & PRIVACY RISK"`,
      `"Threat Key","Threat Name","Sum of Ranks","Mean Rank","Mean Privacy Risk (0-4)","Std Dev"`,
      ...friedmanResult.conditionRanks.map(
        (r) =>
          `"${r.threatKey}","${r.threatName}",${r.rankSum},${r.meanRank},${r.meanRisk},${r.stdDevRisk}`,
      ),
      "",
      `"PAIRWISE WILCOXON SIGNED-RANK POST-HOC COMPARISONS (BONFERRONI CORRECTED)"`,
      `"Comparison","Mean A","Mean B","Wilcoxon W","Z-Score","p-value (Raw)","p-value (Bonferroni)","Effect Size (r)","Significant"`,
      ...friedmanResult.postHocComparisons.map(
        (c) =>
          `"${c.nameA} vs ${c.nameB}",${c.meanA},${c.meanB},${c.wStatistic},${c.zScore},${c.pValueUnadjusted},${c.pValueBonferroni},${c.effectSizeR},${c.significant}`,
      ),
      "",
      `"ACADEMIC INTERPRETATION"`,
      `"${friedmanResult.interpretation.replace(/"/g, '""')}"`,
    ];
    triggerDownload(
      lines.join("\n"),
      "friedman-wilcoxon-repeated-measures.csv",
      "text/csv;charset=utf-8",
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header & Control Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-lg bg-surface border">
        <div>
          <h3 className="text-lg font-bold">Non-Parametric Repeated Measures Analysis</h3>
          <p className="text-xs text-muted mt-0.5">
            Friedman test across threat conditions with post-hoc pairwise Wilcoxon signed-rank tests (Bonferroni corrected).
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-medium">
            <span>Significance level (α):</span>
            <select
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="text-xs p-1.5 rounded border bg-surface-raised"
            >
              <option value={0.05}>α = 0.05</option>
              <option value={0.01}>α = 0.01</option>
              <option value={0.001}>α = 0.001</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={includeProposed}
              onChange={(e) => setIncludeProposed(e.target.checked)}
            />
            <span>Include Archived IV5 (Deepfakes)</span>
          </label>
          <button
            type="button"
            className="button secondary small"
            onClick={exportFriedmanCsv}
          >
            <Download size={14} aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Omnibus Test Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-3 text-center">
          <span className="text-xs text-muted block">FRIEDMAN Q (χ²)</span>
          <strong className="text-xl font-bold font-mono text-cyan">
            {friedmanResult.qStatistic.toFixed(2)}
          </strong>
          <span className="text-[11px] text-muted block mt-0.5">df = {friedmanResult.df}</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-muted block">ASYMPTOTIC p-VALUE</span>
          <strong className="text-xl font-bold font-mono text-foreground">
            {friedmanResult.pValue < 0.001 ? "< .001" : friedmanResult.pValue.toFixed(3)}
          </strong>
          <span className="text-[11px] text-muted block mt-0.5">
            {friedmanResult.significant ? (
              <span className="text-emerald font-semibold">Significant (p &lt; α)</span>
            ) : (
              <span>Not Significant</span>
            )}
          </span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-muted block">KENDALL&apos;S W</span>
          <strong className="text-xl font-bold font-mono text-foreground">
            {friedmanResult.kendallW.toFixed(3)}
          </strong>
          <span className="text-[11px] text-muted block mt-0.5">
            {friedmanResult.kendallW >= 0.5
              ? "Strong concordance"
              : friedmanResult.kendallW >= 0.3
                ? "Moderate concordance"
                : "Weak concordance"}
          </span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-muted block">CONDITIONS (k)</span>
          <strong className="text-xl font-bold font-mono text-foreground">
            {friedmanResult.k}
          </strong>
          <span className="text-[11px] text-muted block mt-0.5">Threat Categories</span>
        </div>
        <div className="card p-3 text-center">
          <span className="text-xs text-muted block">PAIRED SAMPLE (N)</span>
          <strong className="text-xl font-bold font-mono text-foreground">
            {friedmanResult.n}
          </strong>
          <span className="text-[11px] text-muted block mt-0.5">Complete Sessions</span>
        </div>
      </div>

      {/* Threat Condition Mean Ranks Table */}
      <div className="card">
        <h4 className="text-sm font-semibold mb-2">Threat Category Mean Ranks &amp; Simulated Privacy Risk</h4>
        <div className="table-scroll">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2">Threat Module</th>
                <th className="py-2">Rank Sum (Rj)</th>
                <th className="py-2">Mean Rank (R̄)</th>
                <th className="py-2">Mean Privacy Risk (0–4)</th>
                <th className="py-2">Std Dev (SD)</th>
              </tr>
            </thead>
            <tbody>
              {friedmanResult.conditionRanks.map((r) => (
                <tr key={r.threatKey} className="border-b border-surface-raised">
                  <td className="py-2 font-medium">{r.threatName}</td>
                  <td className="py-2 font-mono">{r.rankSum.toFixed(1)}</td>
                  <td className="py-2 font-mono font-bold text-cyan">{r.meanRank.toFixed(2)}</td>
                  <td className="py-2 font-mono">{r.meanRisk.toFixed(2)}</td>
                  <td className="py-2 font-mono">{r.stdDevRisk.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pairwise Wilcoxon Signed-Rank Post-Hoc Tests */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">
            Post-Hoc Pairwise Wilcoxon Signed-Rank Tests (Bonferroni Corrected)
          </h4>
          <span className="text-xs text-muted">
            Number of Comparisons (c) = {friedmanResult.postHocComparisons.length} · α_adj = {(alpha / (friedmanResult.postHocComparisons.length || 1)).toFixed(4)}
          </span>
        </div>
        <div className="table-scroll">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2">Comparison</th>
                <th className="py-2">Mean A vs Mean B</th>
                <th className="py-2">Wilcoxon W</th>
                <th className="py-2">Z-Score</th>
                <th className="py-2">p-value (raw)</th>
                <th className="py-2">p-value (Bonferroni)</th>
                <th className="py-2">Effect Size (r)</th>
                <th className="py-2">Significance</th>
              </tr>
            </thead>
            <tbody>
              {friedmanResult.postHocComparisons.map((c, i) => (
                <tr key={i} className="border-b border-surface-raised">
                  <td className="py-2 font-medium">
                    {c.nameA} <span className="text-muted">vs</span> {c.nameB}
                  </td>
                  <td className="py-2 font-mono">
                    {c.meanA.toFixed(2)} vs {c.meanB.toFixed(2)}
                  </td>
                  <td className="py-2 font-mono">{c.wStatistic.toFixed(1)}</td>
                  <td className="py-2 font-mono">{c.zScore.toFixed(3)}</td>
                  <td className="py-2 font-mono">
                    {c.pValueUnadjusted < 0.001 ? "< .001" : c.pValueUnadjusted.toFixed(3)}
                  </td>
                  <td className="py-2 font-mono font-semibold">
                    {c.pValueBonferroni < 0.001 ? "< .001" : c.pValueBonferroni.toFixed(3)}
                  </td>
                  <td className="py-2 font-mono">{c.effectSizeR.toFixed(3)}</td>
                  <td className="py-2">
                    {c.significant ? (
                      <span className="badge-status-tag unlocked text-[11px]">
                        Significant (p &lt; α)
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">Not Sig</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Methodology Interpretation Box */}
      <div className="card p-4 bg-surface-subtle border">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-cyan mb-1.5">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>Academic Thesis Interpretation</span>
        </h4>
        <p className="text-xs text-muted leading-relaxed">
          {friedmanResult.interpretation}
        </p>
      </div>
    </div>
  );
}
