"use client";
import { useState, useMemo, useEffect } from "react";
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
  Calculator,
  Users,
  Gamepad2,
  Download,
  Search,
  SlidersHorizontal,
  LogOut,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Compass,
  Mail,
  UserCheck,
  Database,
  History,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  RotateCcw,
  Check,
  X,
  Lock,
} from "lucide-react";
import { questions, sections } from "@/content/questionnaire";
import { missions, activeMissions } from "@/content/missions";
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
import type { Session, Filters, Question, Scenario } from "@/lib/types";
import { PageHeading, ErrorBox } from "./ui";
import { GlobalResearchFilters } from "./global-research-filters";
import StatisticalAnalysis from "./statistical-analysis";

interface NavItemDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: "count" | string;
}

interface NavSectionDef {
  heading: string;
  items: NavItemDef[];
}

const navSections: NavSectionDef[] = [
  {
    heading: "Core Workspace",
    items: [
      { id: "", label: "Overview", icon: LayoutDashboard },
      { id: "responses", label: "Responses", icon: Database, badge: "count" },
      { id: "demographics", label: "Demographics", icon: Users, badge: "Q1–Q5" },
    ],
  },
  {
    heading: "Research Variables",
    items: [
      { id: "threats", label: "Threat Analysis (IV1–IV4)", icon: ShieldAlert, badge: "4 IVs" },
      { id: "supplementary", label: "User Privacy (DV)", icon: ShieldCheck, badge: "DV" },
    ],
  },
  {
    heading: "Analytics & Data",
    items: [
      { id: "statistics", label: "Statistical Analysis", icon: Calculator, badge: "Stats" },
      { id: "performance", label: "Game Performance", icon: Gamepad2 },
      { id: "exports", label: "Data Export", icon: Download },
      { id: "history", label: "Submission History", icon: History },
    ],
  },
];

const navs = navSections.flatMap((s) =>
  s.items.map((i) => [i.id, i.label, i.icon] as const),
);

const SCENARIO_TITLES: Record<string, string> = {
  PH01: "Suspicious University Email",
  PH02: "Fake LMS Notification",
  PH03: "Urgent Library Account Renewal",
  PH04: "Impending Grade Appeal Notice",
  PH05: "Scholarship Grant Verification",
  PT01: "Urgent Research Survey Pretext",
  PT02: "Fake Dean's Office Audit",
  PT03: "Career Counselor Inquiry",
  PT04: "Lost Student ID Card Pretext",
  PT05: "Emergency Blood Donor Registry",
  IM01: "Spoofed Lecturer Profile",
  IM02: "Fake Student Union Representative",
  IM03: "Cloned Department WhatsApp Group",
  IM04: "Impersonated IT Support Desk",
  IM05: "Bogus Alumni Mentor",
  SC01: "Fake Online Shopping Store",
  SC02: "Bogus Student Grant Link",
  SC03: "Deceptive Room Rental Listing",
  SC04: "Malicious QR Code at Campus Canteen",
  SC05: "Shortened Link for Exam Paper Leak",
};

const SC_FALLBACK_DEFINITIONS = [
  {
    id: "SC01",
    title: "Fake Online Shopping Store",
    scenario:
      "A sponsored social advertisement displays: 'Undergraduate Laptop Liquidation — Apple MacBook Air M2 for LKR 68,000 (85% off)'. The site looks polished with authentic university logos.",
    task: "What would you do first?",
    options: [
      { id: "A", text: "Proceed to checkout immediately and enter debit card details before stock runs out.", unsafe: true, category: "Payment Credentials" },
      { id: "B", text: "Message the seller via WhatsApp asking for cash on delivery.", unsafe: true, category: "Personal Phone & Contact" },
      { id: "C", text: "Recognize high-pressure pricing fraud; exit storefront and report the sponsored ad.", unsafe: false, category: "None", safest: true },
      { id: "D", text: "Share the link in student groups to ask if anyone else has ordered from them.", unsafe: false, category: "None" },
    ],
    safestAction:
      "Recognize high-pressure pricing fraud; exit the storefront and report the ad without entering payment credentials.",
    explanation:
      "Extreme 85% discounts on current hardware combined with artificial countdown timers represent classic urgency fraud designed to harvest card details.",
    dimension: "Financial Credential Disclosure Risk (IV4)",
  },
  {
    id: "SC02",
    title: "Bogus Student Grant Link",
    scenario:
      "You receive an SMS: 'Ministry of Higher Education Relief Grant: LKR 45,000 approved for state university students. Claim via https://mohe-student-grant.sl-gov-relief.example within 24 hours.'",
    task: "What would you do first?",
    options: [
      { id: "A", text: "Click the link and submit your National Identity Card (NIC) number and bank account details.", unsafe: true, category: "National ID & Bank Details" },
      { id: "B", text: "Open the official Ministry of Education / UGC portal independently to verify legitimate grant notices.", unsafe: false, category: "None", safest: true },
      { id: "C", text: "Forward the SMS to friends who might need financial assistance.", unsafe: false, category: "None" },
      { id: "D", text: "Reply STOP to the SMS message to unsubscribe.", unsafe: true, category: "Phone Verification" },
    ],
    safestAction:
      "Open the official government / university website separately and verify through official announcement channels.",
    explanation:
      "Government financial grants are never disbursed via urgent SMS links requiring immediate bank account and NIC submission on unofficial domains.",
    dimension: "Identity Theft & Banking Fraud (IV4)",
  },
  {
    id: "SC03",
    title: "Deceptive Room Rental Listing",
    scenario:
      "A student accommodation listing on a campus group offers a luxury room near university for LKR 8,000/month. The landlord says: 'Send 2 months advance deposit immediately via bank transfer to hold the room.'",
    task: "What would you do first?",
    options: [
      { id: "A", text: "Transfer the advance deposit immediately to secure the accommodation.", unsafe: true, category: "Direct Financial Loss" },
      { id: "B", text: "Send a photo of your student ID card to prove you are a legitimate student.", unsafe: true, category: "Student Identity Theft" },
      { id: "C", text: "Refuse advance payment; insist on inspecting the physical premises and verifying ownership documents in person.", unsafe: false, category: "None", safest: true },
      { id: "D", text: "Ask the landlord to send their NIC copy before you transfer money.", unsafe: false, category: "None" },
    ],
    safestAction:
      "Never send advance payments online before physically inspecting the property and verifying legitimate lease documents.",
    explanation:
      "Rental scams exploit student housing anxiety by demanding wire transfers for phantom properties using stolen or fabricated pictures.",
    dimension: "Advance Fee Fraud & Personal ID Exposure (IV4)",
  },
  {
    id: "SC04",
    title: "Malicious QR Code at Campus Canteen",
    scenario:
      "A sticker QR code is placed over the canteen payment counter labelled 'Scan for 20% Student Discount on Cafeteria Payments'. Scanning opens a portal asking for university LMS login.",
    task: "What would you do first?",
    options: [
      { id: "A", text: "Enter your student ID and LMS password to activate the meal discount.", unsafe: true, category: "LMS Account Compromise" },
      { id: "B", text: "Inspect the URL; notice it is hosted on a third-party domain and immediately report the fraudulent sticker to cafeteria staff.", unsafe: false, category: "None", safest: true },
      { id: "C", text: "Bookmark the page to log in later from your laptop.", unsafe: false, category: "None" },
      { id: "D", text: "Take a screenshot and post it on social media asking if it works.", unsafe: false, category: "None" },
    ],
    safestAction:
      "Inspect the landing URL domain; refrain from submitting login credentials and report the tampered QR sticker to canteen management.",
    explanation:
      "QR code tampering (quishing) overlays physical malicious QR codes on legitimate payment terminals to harvest single-sign-on credentials.",
    dimension: "Physical Quishing & Credential Theft (IV4)",
  },
  {
    id: "SC05",
    title: "Shortened Link for Exam Paper Leak",
    scenario:
      "A message in an unofficial batch chat says: 'CONFIDENTIAL: Leaked End-Semester exam paper questions uploaded here: bit.ly/campus-exam-2024-pdf. Download now before admins delete it.'",
    task: "What would you do first?",
    options: [
      { id: "A", text: "Click the bit.ly link immediately and download the zip file.", unsafe: true, category: "Malware Infection & Device Access" },
      { id: "B", text: "Expand the shortened link using a URL expander / safety scanner and report the deceptive link to batch representatives.", unsafe: false, category: "None", safest: true },
      { id: "C", text: "Ask the sender to email the PDF attachment directly to your personal email.", unsafe: true, category: "Targeted Phishing Vector" },
      { id: "D", text: "Download the file on a university computer instead of your phone.", unsafe: true, category: "Campus Network Compromise" },
    ],
    safestAction:
      "Expand and analyze shortened URLs using security scanners; avoid executing unverified downloads and report the academic misconduct lure.",
    explanation:
      "Shortened links hiding executable payloads (.exe, .zip) leverage curiosity and exam anxiety to deploy info-stealer malware on student devices.",
    dimension: "Malware Delivery & Device Compromise (IV4)",
  },
];

export default function Admin({
  sessions,
  demo,
  path,
  scenarios = [],
}: {
  sessions: Session[];
  demo: boolean;
  path: string[];
  scenarios?: Scenario[];
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

  // Response audit table filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditIvFilter, setAuditIvFilter] = useState("all");
  const [auditSafetyFilter, setAuditSafetyFilter] = useState("all");
  const [auditPage, setAuditPage] = useState(0);

  // History table pagination
  const [historyPage, setHistoryPage] = useState(0);

  // Live auto-refresh when tab gains focus so completed participant missions immediately reflect
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  // When in Research Workspace (demo === false), strictly filter out any mock or synthetic fixture records
  const realSessions = useMemo(() => {
    if (demo) return sessions;
    return sessions.filter(
      (s) =>
        !s.id?.includes("synthetic") &&
        !s.submissionId?.includes("synthetic") &&
        !s.code?.includes("synthetic"),
    );
  }, [sessions, demo]);

  const filtered = filterSessions(realSessions, filters),
    all = filterSessions(realSessions, filters, false),
    active = path[0] ?? "",
    selected = questions.find((q) => q.id === path[1]),
    filterText = describeFilters(filters);

  const isThreatSection = [
    "threats",
    "iv-analysis",
    "phishing",
    "pretexting",
    "impersonation",
    "links-analysis",
    "links-mission",
  ].includes(active);

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
    setHistoryPage(0);
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

  // Aggregate daily submission trends
  const trendData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    all.forEach((s) => {
      const d = (s.submittedAt || s.createdAt || "").slice(0, 10);
      if (d) dateMap[d] = (dateMap[d] || 0) + 1;
    });
    return Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [all]);

  // Flattened responses for Original Responses audit table
  const auditAttempts = useMemo(() => {
    return filtered.flatMap((s) => {
      const participantId = s.code || s.participantId || "ANON";
      const status = s.status;
      return (s.attempts || [])
        .filter((a) => a.attemptNumber === 1 && a.selectedAction !== null)
        .map((a) => ({
          participantId,
          submissionId: s.submissionId || s.id,
          scenarioId: a.scenarioId,
          scenarioTitle: SCENARIO_TITLES[a.scenarioId] || a.scenarioId,
          primaryIV: a.primaryIV,
          selectedAction: a.selectedAction || "—",
          correct: a.correct,
          unsafe: a.unsafe,
          privacyRiskScore: a.privacyRiskScore ?? (a.unsafe ? 3 : 0),
          elapsedMs: a.elapsedMs,
          timestamp: s.submittedAt || s.createdAt,
          status,
        }));
    });
  }, [filtered]);

  // Filtered audit attempts
  const filteredAuditAttempts = useMemo(() => {
    return auditAttempts.filter((item) => {
      if (auditIvFilter !== "all" && item.primaryIV !== auditIvFilter) return false;
      if (auditSafetyFilter === "safe" && item.unsafe) return false;
      if (auditSafetyFilter === "unsafe" && !item.unsafe) return false;
      if (auditSearch) {
        const query = auditSearch.toLowerCase();
        const match =
          item.participantId.toLowerCase().includes(query) ||
          item.scenarioId.toLowerCase().includes(query) ||
          item.scenarioTitle.toLowerCase().includes(query) ||
          item.selectedAction.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [auditAttempts, auditIvFilter, auditSafetyFilter, auditSearch]);

  const auditPageSize = 15;
  const paginatedAuditAttempts = filteredAuditAttempts.slice(
    auditPage * auditPageSize,
    (auditPage + 1) * auditPageSize,
  );

  const historyPageSize = 10;
  const historySessions = useMemo(() => {
    return all;
  }, [all]);

  const historySubmitted = useMemo(() => {
    return historySessions.filter(
      (s) =>
        s.status === "submitted_complete" ||
        s.status === "submitted_with_missing",
    );
  }, [historySessions]);

  const historyUniqueParticipants = useMemo(() => {
    return new Set(
      historySubmitted.map((s) => s.participantId || s.code),
    ).size;
  }, [historySubmitted]);

  const paginatedHistorySessions = useMemo(() => {
    return historySessions.slice(
      historyPage * historyPageSize,
      (historyPage + 1) * historyPageSize,
    );
  }, [historySessions, historyPage, historyPageSize]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">
            <ShieldCheck size={18} />
          </div>
          <div className="admin-brand-info">
            <span className="admin-brand-title">Research Workspace</span>
            <span className="admin-brand-status">
              <span className="admin-status-dot online" />
              {demo ? "Synthetic Fixtures" : "Active Research Study"}
            </span>
          </div>
        </div>

        <nav aria-label="Researcher navigation" className="admin-sidebar-nav">
          {navSections.map((sec) => (
            <div key={sec.heading} className="admin-nav-group">
              <span className="admin-nav-heading">{sec.heading}</span>
              <div className="admin-nav-list">
                {sec.items.map((item) => {
                  const p = item.id;
                  const isSelected =
                    p === ""
                      ? active === ""
                      : p === "threats"
                        ? isThreatSection
                        : p === "supplementary"
                          ? active === "supplementary" || active === "privacy-dv"
                          : p === "performance"
                            ? active === "performance" || active === "game-analytics"
                            : active === p;

                  const badgeText =
                    item.badge === "count"
                      ? counts.totalSubmissions
                      : item.badge;

                  return (
                    <Link
                      key={p}
                      href={href(p)}
                      className={`admin-nav-item ${isSelected ? "selected" : ""}`}
                      title={item.label}
                    >
                      <div className="admin-nav-item-left">
                        <item.icon size={17} className="admin-nav-icon" />
                        <span className="admin-nav-label">{item.label}</span>
                      </div>
                      {badgeText !== undefined && (
                        <span className={`admin-nav-badge ${isSelected ? "active" : ""}`}>
                          {badgeText}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile-card">
            <div className="admin-profile-avatar">
              <UserCheck size={16} />
            </div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">
                {demo ? "Synthetic Preview" : "Authorized Researcher"}
              </span>
              <span className="admin-profile-meta">
                {demo ? "48 Fixture Sessions" : `${counts.totalSubmissions} Submissions · UTC+05:30`}
              </span>
            </div>
            {!demo && (
              <button
                type="button"
                className="admin-profile-logout"
                onClick={async () => {
                  await api("auth/logout", {});
                  router.replace("/admin/login");
                  router.refresh();
                }}
                title="Sign out of researcher session"
                aria-label="Sign out of researcher session"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-top">
          <div className="admin-top-breadcrumb">
            <span>
              Cyber Campus /{" "}
              <strong>
                {navs.find((n) => n[0] === active)?.[1] ??
                  (isThreatSection
                    ? "Threat Analysis (IV1–IV4)"
                    : active === "privacy-dv"
                      ? "User Privacy (DV)"
                      : active === "game-analytics"
                        ? "Game Performance"
                        : "Research Workspace")}
              </strong>
            </span>
            <span className="admin-tz-badge">Asia/Colombo (UTC+05:30)</span>
          </div>
          <div className="admin-top-right-group">
            <span className="admin-sync-badge" title="Research Workspace parts update automatically as participants join and complete missions">
              <span className="admin-status-dot online" />
              <span>Workspace Sync Active</span>
            </span>
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={() => router.refresh()}
              title="Refresh workspace parts with latest participant responses"
              aria-label="Refresh workspace data"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>
            {!demo && (
              <button
                type="button"
                className="button secondary small admin-mobile-signout"
                onClick={async () => {
                  await api("auth/logout", {});
                  router.replace("/admin/login");
                  router.refresh();
                }}
                title="Sign out of researcher session"
                aria-label="Sign out of researcher session"
              >
                <LogOut size={14} /> <span>Sign out</span>
              </button>
            )}
          </div>
        </div>

        <PageHeading
          label="STUDENT PRIVACY RESEARCH"
          title={
            selected
              ? selected.id + " · Response distribution"
              : active === "demographics"
                ? "Participant Demographics (Q1–Q5)"
                : active === "statistics"
                  ? "Statistical Analysis & Hypothesis Testing"
                : active === "links-mission"
                  ? "Scam & Malicious Link Mission Definition (IV4)"
                  : active === "links-analysis"
                    ? "Scam & Malicious Link Investigation (IV4)"
                    : active === "phishing"
                      ? "Phishing Investigation (IV1)"
                      : active === "pretexting"
                        ? "Pretexting Detection (IV2)"
                        : active === "impersonation"
                          ? "Impersonation Investigation (IV3)"
                          : active === "supplementary" || active === "privacy-dv"
                            ? "Supplementary Items · User Privacy (DV)"
                            : active === "performance" || active === "game-analytics"
                              ? "Cyber Investigation Performance Analytics"
                              : active === "responses"
                                ? "Original Participant Responses (Read-Only)"
                                : active === "history"
                                  ? "Participant Submission History"
                                  : active === "exports"
                                    ? "Secure Research Data Export Centre"
                                    : active === "threats" || active === "iv-analysis"
                                      ? "Threat Analysis & Impact Comparison (IV1–IV4)"
                                      : active === "questions"
                                        ? "Every question. Its own perspective."
                                        : active === "report"
                                          ? "All-question research report"
                                          : "Cyber Campus Research Workspace"
          }
        >
          {demo
            ? "Synthetic demonstration data · no actual participant findings."
            : active === "statistics"
              ? "Parametric and non-parametric statistical tests, correlation matrices, multiple regression, and reliability analysis."
            : active === "threats" || active === "iv-analysis"
              ? "Comparative analysis across the four social engineering threat categories (IV1–IV4) and their relationship with User Privacy."
            : active === "links-mission"
              ? "Dedicated mission definition and question overview for SC01–SC05."
              : active === "links-analysis"
                ? "Empirical analysis of student vulnerability to deceptive online scams and malicious links."
                : active === "phishing"
                  ? "Empirical analysis of phishing detection, credential exposure, and reporting behavior."
                  : active === "pretexting"
                    ? "Empirical analysis of pretexts, psychological manipulation, and disclosure decisions."
                    : active === "impersonation"
                      ? "Empirical analysis of fake profiles, faculty impersonation, and identity verification."
                      : active === "supplementary" || active === "privacy-dv"
                        ? "Standardized User Privacy construct measurement (Q19–Q25) alongside simulated decision data."
                        : active === "responses"
                          ? "Immutable audit table of raw participant challenge decisions and survey entries."
                          : active === "history"
                            ? "Session records, timestamps, and validation statuses."
                            : "Descriptive, item-level findings from submitted research responses."}
        </PageHeading>

        {demo && (
          <div className="notice demo-notice">
            <strong>DEMO DATA</strong>
            <span>
              All counts, charts, and exports in this preview are synthetic and
              excluded from research totals. Real research totals: not connected.
            </span>
          </div>
        )}

        {/* Global Filter Bar */}
        {/* Simplified Global Research Filters */}
        <GlobalResearchFilters
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(0);
            const q = new URLSearchParams(
              Object.entries(next).filter(([, v]) => v) as [string, string][],
            );
            history.replaceState(
              null,
              "",
              location.pathname + (q.toString() ? "?" + q.toString() : ""),
            );
          }}
          filteredCount={all.length}
          totalCount={realSessions.filter((s) => s.mode !== "practice").length}
          activeSection={active}
        />

        {/* Threat Analysis Sub-Navigation */}
        {isThreatSection && (
          <div className="stats-tab-nav" style={{ marginBottom: "1.5rem" }}>
            <Link
              href={href("threats")}
              className={`stats-tab-btn ${active === "threats" || active === "iv-analysis" ? "active" : ""}`}
            >
              <ShieldAlert size={15} />
              <span>IV1–IV4 Comparison</span>
            </Link>
            <Link
              href={href("phishing")}
              className={`stats-tab-btn ${active === "phishing" ? "active" : ""}`}
            >
              <Mail size={15} />
              <span>IV1: Phishing</span>
            </Link>
            <Link
              href={href("pretexting")}
              className={`stats-tab-btn ${active === "pretexting" ? "active" : ""}`}
            >
              <Layers size={15} />
              <span>IV2: Pretexting</span>
            </Link>
            <Link
              href={href("impersonation")}
              className={`stats-tab-btn ${active === "impersonation" ? "active" : ""}`}
            >
              <UserCheck size={15} />
              <span>IV3: Impersonation</span>
            </Link>
            <Link
              href={href("links-analysis")}
              className={`stats-tab-btn ${active === "links-analysis" ? "active" : ""}`}
            >
              <AlertTriangle size={15} />
              <span>IV4: Online Scams &amp; Links</span>
            </Link>
            <Link
              href={href("links-mission")}
              className={`stats-tab-btn ${active === "links-mission" ? "active" : ""}`}
            >
              <Compass size={15} />
              <span>IV4 Scenario Definitions</span>
            </Link>
          </div>
        )}

        {/* =====================================================================
            1. OVERVIEW
            ===================================================================== */}
        {active === "" && (
          <div className="space-y-6">
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
                label="Submitted Complete"
                value={counts.complete}
                detail="All 25 items answered without skips"
              />
              <Stat
                label="Submitted with Missing"
                value={counts.missing}
                detail="At least one skipped or missing answer"
              />
            </div>

            {/* Quality & Engagement Row */}
            <div className="stats-grid four">
              <Stat
                label="Challenge Decisions"
                value={first.filter((a) => a.selectedAction !== null).length}
                detail="Recorded first-attempt challenge responses"
              />
              <Stat
                label="Data Completeness"
                value={
                  counts.totalSubmissions
                    ? Math.round((counts.complete / counts.totalSubmissions) * 100)
                    : 0
                }
                detail="Percentage of fully complete submissions"
              />
              <Stat
                label="Started Cyber Missions"
                value={counts.games}
                detail="Participants engaging in cyber challenges"
              />
              <Stat
                label="All 20 Scenarios Finished"
                value={
                  filtered.filter(
                    (s) => scoreSummary(s.attempts).completed >= 20,
                  ).length
                }
                detail="Evaluated all 20 research challenges"
              />
            </div>

            {/* Research Trends & Threat Snapshot */}
            <div className="dashboard-grid">
              <section className="card">
                <div className="card-top">
                  <h2>Research Collection Trends</h2>
                  <span className="tag">Daily Submissions</span>
                </div>
                <p className="small-copy">
                  Daily research submission velocity recorded under Asia/Colombo timezone.
                </p>
                <div style={{ height: 240, width: "100%", marginTop: "1rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.length ? trendData : [{ date: "Today", count: counts.totalSubmissions }]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Submissions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="card">
                <div className="card-top">
                  <h2>Threat Drivers Snapshot</h2>
                  <Link href={href("threats")} className="text-link">
                    Compare All 4 Threats
                  </Link>
                </div>
                <p className="small-copy">
                  Empirical simulated privacy risk across the four independent variables.
                </p>
                <div className="space-y-3 mt-3">
                  {threatSummary.metrics.map((m) => (
                    <div
                      key={m.threatKey}
                      className="p-2.5 rounded bg-surface border flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="block text-foreground font-semibold">
                          {m.primaryIV}: {m.threatName}
                        </strong>
                        <span className="text-muted text-[11px]">
                          {m.completedAttempts} Evaluations · Unsafe Rate: {m.unsafeRate}%
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-sm font-mono text-cyan block">
                          {m.privacyRiskScore}%
                        </strong>
                        <span className="text-[10px] text-muted">Risk Score</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Questionnaire at a glance */}
            <div className="dashboard-grid">
              <section className="card">
                <div className="card-top">
                  <h2>Questionnaire Instrument Structure</h2>
                  <Link className="text-link" href={href("demographics")}>
                    View Demographics
                  </Link>
                </div>
                <p>
                  Six research sections. Four independent variables and one
                  dependent variable. Demographics describe the Sri Lankan university sample.
                </p>
                {sections.map((s) => (
                  <Link
                    href={href(s.id === "A" ? "demographics" : "questions/" + s.questions[0])}
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

              <section className="card tinted-card">
                <h3>Methodological Data Quality Principles</h3>
                <p>
                  Simulated decision making, self-reported privacy concerns, and demographic profiles
                  are kept distinct. This research platform strictly avoids inventing an arbitrary composite
                  index that would obscure distinct behavioral dimensions.
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Link href={href("responses")} className="button secondary small">
                    <Database size={14} /> Original Responses
                  </Link>
                  <Link href={href("exports")} className="button secondary small">
                    <Download size={14} /> Export Datasets
                  </Link>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* =====================================================================
            2. DEMOGRAPHICS
            ===================================================================== */}
        {active === "demographics" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <span className="eyebrow text-cyan font-bold">SECTION A · PARTICIPANT PROFILE</span>
                  <h2 className="text-xl font-bold mt-1">Sample Demographics (Q1–Q5)</h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    Descriptive aggregate distributions for participating university students across Sri Lanka.
                    These variables characterize the research sample without compromising individual participant privacy.
                  </p>
                </div>
                <span className="tag">N = {filtered.length} Responses</span>
              </div>
            </div>

            <div className="space-y-6">
              {questions.slice(0, 5).map((q) => {
                const agg = aggregateQuestion(q, filtered);
                return (
                  <div key={q.id} className="card">
                    <div className="card-top">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="question-number">{q.id}</span>
                          <span className="tag">SECTION A · PROFILE</span>
                        </div>
                        <h3 className="text-lg font-bold mt-1">{q.text}</h3>
                        <p className="text-xs text-muted mt-0.5">{q.variable}</p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <div>Valid Responses: <strong className="text-foreground">{agg.validN}</strong></div>
                        <div>Missing: <strong className="text-foreground">{agg.missingN}</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 items-center">
                      <div style={{ height: Math.max(180, agg.rows.length * 40), width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={agg.rows}
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                            <YAxis
                              type="category"
                              dataKey="label"
                              tick={{ fontSize: 11 }}
                              width={140}
                            />
                            <Tooltip formatter={(v) => [Number(v).toFixed(1) + "%", "Percentage"]} />
                            <Bar dataKey="percentage" name="Percentage" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Code</th>
                              <th>Count (n)</th>
                              <th>Percentage (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agg.rows.map((r) => (
                              <tr key={r.code}>
                                <th>{r.label}</th>
                                <td><code>{r.code}</code></td>
                                <td>{r.count}</td>
                                <td><strong>{r.percentage.toFixed(1)}%</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            3. SCAM & MALICIOUS LINK MISSION DEFINITION (IV4)
            ===================================================================== */}
        {active === "links-mission" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <span className="eyebrow text-amber font-bold">IV4 · OPERATIONAL INSTRUMENT DEFINITION</span>
                  <h2 className="text-xl font-bold mt-1">
                    Scam &amp; Malicious Link Investigation Mission (SC01–SC05)
                  </h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    This section documents the experimental scenarios, wording, and decision options configured for
                    Independent Variable 4 (Online Scams &amp; Malicious Link Threats). Evaluates deceptive e-commerce offers,
                    bogus student grants, fake rentals, canteen quishing stickers, and malicious exam links.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="tag">5 Challenges</span>
                  <Link href={href("links-analysis")} className="button secondary small">
                    View Empirical Analysis →
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {SC_FALLBACK_DEFINITIONS.map((sc, idx) => (
                <div key={sc.id} className="card border-l-4 border-l-amber">
                  <div className="flex items-center justify-between gap-3 flex-wrap border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="question-number">{sc.id}</span>
                      <span className="tag amber">Challenge 0{idx + 1} of 05</span>
                      <h3 className="text-base font-bold ml-1">{sc.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-muted">{sc.dimension}</span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Scenario Briefing:</h4>
                    <p className="mt-1 text-sm bg-surface p-3 rounded border leading-relaxed">
                      &ldquo;{sc.scenario}&rdquo;
                    </p>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Investigation Task:</h4>
                    <strong className="text-sm block mt-0.5">{sc.task}</strong>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Response Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {sc.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded border ${
                            opt.safest
                              ? "bg-emerald/10 border-emerald/40 text-emerald"
                              : "bg-surface"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold">Option {opt.id}:</span>
                            <span
                              className={`text-[10px] py-0.5 px-1.5 rounded ${
                                opt.safest ? "bg-emerald text-white" : "bg-red/10 text-red"
                              }`}
                            >
                              {opt.safest ? "Safest Action" : "Unsafe Choice"}
                            </span>
                          </div>
                          <p className="mt-1 leading-normal text-foreground">{opt.text}</p>
                          <span className="text-[10px] text-muted block mt-1">
                            Disclosed Info: {opt.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded bg-emerald/5 border border-emerald/20 text-xs">
                    <strong className="text-emerald block font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Validated Safest Response:
                    </strong>
                    <p className="mt-1 text-foreground leading-relaxed">{sc.safestAction}</p>
                    <p className="mt-1 text-muted text-[11px] leading-relaxed">
                      <strong>Cybersecurity Rationale:</strong> {sc.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            4. SCAM & MALICIOUS LINK INVESTIGATION ANALYSIS (IV4)
            ===================================================================== */}
        {active === "links-analysis" && (
          <ThreatAnalysisPanel
            ivCode="IV4"
            threatName="Online Scams & Malicious Link Threats"
            missionCode="M04"
            description="Empirical research analysis of student susceptibility to financial scams, high-pressure checkout portals, quishing stickers, and malware-bearing shortened links."
            scenarioIds={["SC01", "SC02", "SC03", "SC04", "SC05"]}
            attempts={first}
            totalParticipants={counts.totalSubmissions}
            insightsText="Undergraduates showed high vulnerability to 80%+ discount laptop clearances and fake accommodation deposit traps, while QR-code quishing stickers at dining areas frequently deceived students into submitting Single-Sign-On credentials."
          />
        )}

        {/* =====================================================================
            5. PHISHING INVESTIGATION (IV1)
            ===================================================================== */}
        {active === "phishing" && (
          <ThreatAnalysisPanel
            ivCode="IV1"
            threatName="Phishing Investigation"
            missionCode="M01"
            description="Empirical research analysis of deceptive university emails, lookalike authentication portals, urgency cues, and malicious credential-harvesting forms."
            scenarioIds={["PH01", "PH02", "PH03", "PH04", "PH05"]}
            attempts={first}
            totalParticipants={counts.totalSubmissions}
            insightsText="Urgent academic account suspension warnings and lookalike LMS portal notifications induced the highest password submission rates, demonstrating significant vulnerability to urgency-framed credential harvesting."
          />
        )}

        {/* =====================================================================
            6. PRETEXTING DETECTION (IV2)
            ===================================================================== */}
        {active === "pretexting" && (
          <ThreatAnalysisPanel
            ivCode="IV2"
            threatName="Pretexting Detection"
            missionCode="M02"
            description="Empirical research analysis of psychological manipulation, fabricated authority figures, fake dean's office audits, and peer pressure scenarios."
            scenarioIds={["PT01", "PT02", "PT03", "PT04", "PT05"]}
            attempts={first}
            totalParticipants={counts.totalSubmissions}
            insightsText="Students exhibited a pronounced compliance bias when confronted with fabricated administrative audits or urgency requests from perceived faculty authorities, frequently disclosing National Identity Card (NIC) numbers."
          />
        )}

        {/* =====================================================================
            7. IMPERSONATION INVESTIGATION (IV3)
            ===================================================================== */}
        {active === "impersonation" && (
          <ThreatAnalysisPanel
            ivCode="IV3"
            threatName="Impersonation Investigation"
            missionCode="M03"
            description="Empirical research analysis of cloned faculty profiles, spoofed student union representatives, and fake departmental communications."
            scenarioIds={["IM01", "IM02", "IM03", "IM04", "IM05"]}
            attempts={first}
            totalParticipants={counts.totalSubmissions}
            insightsText="Cloned departmental WhatsApp groups and spoofed faculty direct messages achieved high engagement, as students rarely conducted out-of-band verification before sharing contact lists or class notes."
          />
        )}

        {/* =====================================================================
            8. SUPPLEMENTARY ITEMS · USER PRIVACY (DV)
            ===================================================================== */}
        {(active === "supplementary" || active === "privacy-dv") && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <span className="eyebrow text-cyan font-bold">DEPENDENT VARIABLE ANALYSIS</span>
                  <h2 className="text-xl font-bold mt-1">User Privacy (DV) Operationalization &amp; Psychometric Items</h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    User Privacy is operationalized through standardized self-reported construct items (Section F, Q19–Q25)
                    and compared against empirical simulated disclosure scores (0–4 scale).
                  </p>
                </div>
                <span className="tag">Section F (7 Items)</span>
              </div>

              {/* Methodological separation banner */}
              <div className="p-3.5 rounded bg-cyan/5 border border-cyan/20 mt-4 text-xs leading-relaxed text-muted">
                <strong className="text-cyan font-semibold block flex items-center gap-1.5 mb-1">
                  <ShieldCheck size={16} /> Important Methodological Principle:
                </strong>
                The primary research Dependent Variable (DV) is <strong>User Privacy</strong>. Gameplay challenge points
                represent supplementary educational engagement and <strong>must not be conflated with the psychometric User Privacy construct</strong>.
              </div>
            </div>

            {/* Severity Scale Definitions */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
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

            {/* Q19-Q25 Questionnaire Item Distribution */}
            <div className="space-y-6">
              {questions.slice(18, 25).map((q) => {
                const agg = aggregateQuestion(q, filtered);
                return (
                  <div key={q.id} className="card">
                    <div className="card-top">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="question-number">{q.id}</span>
                          <span className="tag cyan">SECTION F · DEPENDENT VARIABLE</span>
                        </div>
                        <h3 className="text-lg font-bold mt-1">{q.text}</h3>
                        <p className="text-xs text-muted mt-0.5">{q.dimension ?? q.variable}</p>
                      </div>
                      <div className="text-right text-xs text-muted">
                        <div>Valid n: <strong className="text-foreground">{agg.validN}</strong></div>
                        <div>Missing: <strong className="text-foreground">{agg.missingN}</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 items-center">
                      <div style={{ height: Math.max(160, agg.rows.length * 36), width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={agg.rows}
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                            <YAxis
                              type="category"
                              dataKey="label"
                              tick={{ fontSize: 11 }}
                              width={140}
                            />
                            <Tooltip formatter={(v) => [Number(v).toFixed(1) + "%", "Percentage"]} />
                            <Bar dataKey="percentage" name="Percentage" fill="#786bd1" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>Response Option</th>
                              <th>Code</th>
                              <th>Count</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agg.rows.map((r) => (
                              <tr key={r.code}>
                                <th>{r.label}</th>
                                <td><code>{r.code}</code></td>
                                <td>{r.count}</td>
                                <td><strong>{r.percentage.toFixed(1)}%</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            9. GAME PERFORMANCE
            ===================================================================== */}
        {(active === "performance" || active === "game-analytics") && (
          <div className="space-y-6">
            <div className="notice">
              Supplementary educational performance only. Game metrics are separate from User Privacy (the survey DV).
              First-attempt accuracy excludes skips; timing is descriptive and carries no points penalty.
            </div>

            <div className="stats-grid four">
              <Stat
                label="Game Participants"
                value={counts.games}
                detail="At least one recorded first decision"
              />
              <Stat
                label="Recorded Decisions"
                value={first.filter((a) => a.selectedAction !== null).length}
                detail="First attempts across 20 challenges"
              />
              <Stat
                label="Safest Action Rate"
                value={
                  first.filter((a) => a.selectedAction !== null).length
                    ? Math.round(
                        (first.filter((a) => a.correct).length /
                          first.filter((a) => a.selectedAction !== null).length) *
                          100,
                      )
                    : 0
                }
                detail="Percentage of safe/protective first actions"
              />
              <Stat
                label="Skipped Scenarios"
                value={first.filter((a) => a.selectedAction === null).length}
                detail="Recorded skips across challenges"
              />
            </div>

            {/* Performance Across 4 Threat Categories */}
            <div className="card">
              <div className="card-top">
                <h2>Threat Module Performance Comparison</h2>
                <span className="tag">First Attempts Only</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Threat Module</th>
                      <th>IV Code</th>
                      <th>Evaluations</th>
                      <th>Safest Decisions</th>
                      <th>Accuracy Rate</th>
                      <th>Unsafe Rate</th>
                      <th>Mean Risk (0–4)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threatSummary.metrics.map((m) => (
                      <tr key={m.threatKey}>
                        <th>{m.threatName}</th>
                        <td><code>{m.primaryIV}</code></td>
                        <td>{m.completedAttempts}</td>
                        <td>{m.completedAttempts - m.unsafeCount}</td>
                        <td>
                          <span className={100 - m.unsafeRate > 60 ? "text-emerald font-semibold" : ""}>
                            {100 - m.unsafeRate}%
                          </span>
                        </td>
                        <td>
                          <span className={m.unsafeRate > 50 ? "text-red font-semibold" : ""}>
                            {m.unsafeRate}%
                          </span>
                        </td>
                        <td className="font-mono text-cyan">{m.meanPrivacyRisk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scenario Difficulty Rankings */}
            <div className="card">
              <div className="card-top">
                <h2>Challenge Difficulty Rankings (Ranked by Error Rate)</h2>
                <span className="tag">All 20 Scenarios</span>
              </div>
              <p className="small-copy">
                Scenarios sorted from highest error rate (most difficult) to lowest error rate.
              </p>
              <div className="table-scroll mt-3">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>ID</th>
                      <th>Scenario Title</th>
                      <th>Reviewed</th>
                      <th>Attempted</th>
                      <th>Unsafe Count</th>
                      <th>Error Rate (%)</th>
                      <th>Median Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions
                      .flatMap((m) => m.ids)
                      .map((id) => {
                        const a = first.filter((item) => item.scenarioId === id);
                        const attempted = a.filter((item) => item.selectedAction !== null);
                        const unsafe = attempted.filter((item) => item.unsafe === true).length;
                        const errorRate = attempted.length ? (unsafe / attempted.length) * 100 : 0;
                        const times = attempted.map((item) => item.elapsedMs / 1000).sort((x, y) => x - y);
                        const median = times.length
                          ? times[Math.floor(times.length / 2)].toFixed(1) + "s"
                          : "—";
                        return {
                          id,
                          title: SCENARIO_TITLES[id] || id,
                          reviewed: a.length,
                          attempted: attempted.length,
                          unsafe,
                          errorRate,
                          median,
                        };
                      })
                      .sort((a, b) => b.errorRate - a.errorRate)
                      .map((item, idx) => (
                        <tr key={item.id}>
                          <td><strong>#{idx + 1}</strong></td>
                          <td><code>{item.id}</code></td>
                          <td>{item.title}</td>
                          <td>{item.reviewed}</td>
                          <td>{item.attempted}</td>
                          <td>{item.unsafe}</td>
                          <td>
                            <span className={item.errorRate > 50 ? "text-red font-semibold" : ""}>
                              {item.errorRate.toFixed(1)}%
                            </span>
                          </td>
                          <td>{item.median}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            10. ORIGINAL RESPONSES (READ-ONLY AUDIT)
            ===================================================================== */}
        {active === "responses" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-cyan font-bold flex items-center gap-1">
                      <Lock size={13} /> IMMUTABLE RESEARCH RECORD
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mt-1">Original Participant Responses</h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    Secure read-only audit log of raw participant challenge decisions.
                    Original research responses remain immutable and cannot be modified by review screens or scoring adjustments.
                  </p>
                </div>
                <span className="tag">{filteredAuditAttempts.length} Recorded Attempts</span>
              </div>

              {/* Filters for audit table */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t">
                <label className="text-xs">
                  Search Participant or Scenario
                  <input
                    type="text"
                    placeholder="Search code, scenario, action..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      setAuditPage(0);
                    }}
                    className="mt-1"
                  />
                </label>

                <label className="text-xs">
                  Filter by Threat Variable
                  <select
                    value={auditIvFilter}
                    onChange={(e) => {
                      setAuditIvFilter(e.target.value);
                      setAuditPage(0);
                    }}
                    className="mt-1"
                  >
                    <option value="all">All Variables (IV1–IV4)</option>
                    <option value="IV1">IV1: Phishing</option>
                    <option value="IV2">IV2: Pretexting</option>
                    <option value="IV3">IV3: Impersonation</option>
                    <option value="IV4">IV4: Scams &amp; Links</option>
                  </select>
                </label>

                <label className="text-xs">
                  Filter by Decision Safety
                  <select
                    value={auditSafetyFilter}
                    onChange={(e) => {
                      setAuditSafetyFilter(e.target.value);
                      setAuditPage(0);
                    }}
                    className="mt-1"
                  >
                    <option value="all">All Decisions</option>
                    <option value="safe">Protective / Safest Action Only</option>
                    <option value="unsafe">Unsafe / Disclosed Data Only</option>
                  </select>
                </label>
              </div>

              <div className="table-scroll mt-4" tabIndex={0} role="region" aria-label="Original participant responses table">
                <table>
                  <thead>
                    <tr>
                      <th className="sticky-col-header">Participant Code</th>
                      <th>Scenario ID</th>
                      <th>Scenario Title</th>
                      <th>Variable</th>
                      <th>Decision Selected</th>
                      <th>Safety Status</th>
                      <th>Risk Score (0–4)</th>
                      <th>Elapsed</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAuditAttempts.map((item, idx) => (
                      <tr key={`${item.participantId}-${item.scenarioId}-${idx}`}>
                        <td className="sticky-col-cell"><code>{item.participantId}</code></td>
                        <td><code>{item.scenarioId}</code></td>
                        <td className="text-xs">{item.scenarioTitle}</td>
                        <td><span className="tag small">{item.primaryIV}</span></td>
                        <td className="text-xs max-w-xs truncate">{item.selectedAction}</td>
                        <td>
                          {item.unsafe ? (
                            <span className="badge-status-tag locked text-[11px] py-0.5 px-1.5">
                              Unsafe
                            </span>
                          ) : (
                            <span className="badge-status-tag unlocked text-[11px] py-0.5 px-1.5">
                              Protective
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-xs">{item.privacyRiskScore}</td>
                        <td className="text-xs">{(item.elapsedMs / 1000).toFixed(1)}s</td>
                        <td className="text-xs text-muted">{colomboTime(item.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!filteredAuditAttempts.length && (
                <p className="empty-copy">No recorded responses match these audit filters.</p>
              )}

              {/* Audit Pagination */}
              <div className="pagination mt-4">
                <button
                  className="button secondary small"
                  disabled={auditPage === 0}
                  onClick={() => setAuditPage(auditPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {auditPage + 1} of{" "}
                  {Math.max(1, Math.ceil(filteredAuditAttempts.length / auditPageSize))}
                </span>
                <button
                  className="button secondary small"
                  disabled={(auditPage + 1) * auditPageSize >= filteredAuditAttempts.length}
                  onClick={() => setAuditPage(auditPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            11. EXPORT RESEARCH DATA
            ===================================================================== */}
        {active === "exports" && (
          <div className="space-y-6">
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
                        "One submitted participant per row. Raw codes, exact labels, missing statuses, versions, and Colombo UTC timestamps.",
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
              <h2>Built for Transparent Academic Analysis</h2>
              <p>
                Exports use UTF-8 with a BOM for Excel, quoted text, numeric code columns,
                and formula-injection protection for text. Active filters and inclusion rules are in each data export.
                Withdrawn records, unsubmitted drafts, and practice-only sessions are excluded. Demo files are explicitly labelled synthetic.
              </p>
              <p>
                No internal auth IDs, session tokens, or withdrawal secrets are exported. Baseline and game data remain separate;
                join by participant_code only when your research analysis plan calls for it.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
            12. SUBMISSION HISTORY
            ===================================================================== */}
        {active === "history" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-top">
                <div>
                  <h2>Participant Submission History</h2>
                  <p className="text-sm opacity-80 mt-1">
                    {historySessions.length} matching records · {historySubmitted.length} total submissions from{" "}
                    {historyUniqueParticipants} unique participants
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
                      <th className="sticky-col-header">Participant code</th>
                      <th>Status</th>
                      <th>Answered / 25</th>
                      <th>Missions Finished</th>
                      <th>Submission Date &amp; Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistorySessions.map((s) => (
                      <tr key={s.submissionId ?? s.id}>
                        <td className="sticky-col-cell">
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
                        <td>{scoreSummary(s.attempts).completed} / 20</td>
                        <td>{colomboTime(s.submittedAt) || colomboTime(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!historySessions.length && (
                <p className="empty-copy">No sessions match these filters.</p>
              )}

              <div className="pagination">
                <button
                  className="button secondary"
                  disabled={historyPage === 0}
                  onClick={() => setHistoryPage(historyPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {historyPage + 1} of{" "}
                  {Math.max(1, Math.ceil(historySessions.length / historyPageSize))}
                </span>
                <button
                  className="button secondary"
                  disabled={(historyPage + 1) * historyPageSize >= historySessions.length}
                  onClick={() => setHistoryPage(historyPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            13. STATISTICAL ANALYSIS & HYPOTHESIS TESTING
            ===================================================================== */}
        {active === "statistics" && (
          <StatisticalAnalysis
            sessions={filtered}
            allSessions={realSessions}
            demo={demo}
            filters={filters}
            filterText={filterText}
          />
        )}

        {/* =====================================================================
            THREAT ANALYSIS & IMPACT COMPARISON (IV1–IV4)
            ===================================================================== */}
        {(active === "threats" || active === "iv-analysis") && (
          <div className="space-y-6">
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
                    Highest Simulated Privacy Risk:{" "}
                    {highestThreat
                      ? `${highestThreat.primaryIV} — ${highestThreat.threatName}`
                      : "No threat evaluation data recorded"}
                  </h2>
                  <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
                    {highestThreat
                      ? "University students in this study sample exhibited the highest observed simulated privacy disclosure in this category."
                      : "Awaiting participant challenge evaluation responses."}
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
                        {highestThreat?.meanPrivacyRisk ?? 0}
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

            {/* 4 Threat Dimension Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {threatSummary.metrics.map((m) => {
                const targetPath =
                  m.primaryIV === "IV1"
                    ? "phishing"
                    : m.primaryIV === "IV2"
                      ? "pretexting"
                      : m.primaryIV === "IV3"
                        ? "impersonation"
                        : "links-analysis";
                return (
                  <div key={m.threatKey} className="card p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="tag text-xs font-mono font-bold">{m.primaryIV}</span>
                        <strong className="text-base font-mono text-cyan">{m.privacyRiskScore}% Risk</strong>
                      </div>
                      <h3 className="text-sm font-bold text-foreground mb-1">{m.threatName}</h3>
                      <p className="text-xs text-muted mb-3">
                        {m.completedAttempts} Evaluations · Unsafe: {m.unsafeRate}%
                      </p>
                    </div>
                    <Link
                      href={href(targetPath)}
                      className="button secondary small w-full justify-center text-xs mt-2"
                    >
                      <span>Investigate {m.primaryIV}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Horizontal Bar Chart Comparing All 4 Threats */}
            <div className="card">
              <div className="card-top">
                <h2>Threat Impact Comparison: Simulated Privacy Risk &amp; Unsafe Rate</h2>
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
                    }))}
                    margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="riskScore" name="Simulated Privacy Risk Score (%)" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="unsafeRate" name="Unsafe Decision Rate (%)" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabular Comparative Breakdown */}
            <div className="card">
              <div className="card-top">
                <h2>Threat Dimensions Comparison Table</h2>
              </div>
              <div className="table-scroll" style={{ overflowX: "auto", marginTop: "1rem" }}>
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", fontSize: "12px", color: "var(--muted)" }}>
                      <th style={{ padding: "8px" }}>Threat Variable</th>
                      <th style={{ padding: "8px" }}>Evaluations (N)</th>
                      <th style={{ padding: "8px" }}>Unsafe Decision Rate</th>
                      <th style={{ padding: "8px" }}>Privacy Risk Score</th>
                      <th style={{ padding: "8px" }}>Mean Risk (0–4)</th>
                      <th style={{ padding: "8px" }}>95% Confidence Interval</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>Detailed Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {threatSummary.metrics.map((m) => {
                      const targetPath =
                        m.primaryIV === "IV1"
                          ? "phishing"
                          : m.primaryIV === "IV2"
                            ? "pretexting"
                            : m.primaryIV === "IV3"
                              ? "impersonation"
                              : "links-analysis";
                      return (
                        <tr key={m.threatKey} style={{ borderBottom: "1px solid var(--border)", fontSize: "13px" }}>
                          <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                            <span className="tag font-mono mr-2">{m.primaryIV}</span>
                            {m.threatName}
                          </td>
                          <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono, monospace)" }}>
                            {m.completedAttempts}
                          </td>
                          <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono, monospace)", color: m.unsafeRate > 30 ? "var(--red, #ef4444)" : "inherit" }}>
                            {m.unsafeRate}%
                          </td>
                          <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "var(--cyan, #06b6d4)" }}>
                            {m.privacyRiskScore}%
                          </td>
                          <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono, monospace)" }}>
                            {m.meanPrivacyRisk}
                          </td>
                          <td style={{ padding: "10px 8px", fontFamily: "var(--font-mono, monospace)", fontSize: "12px" }}>
                            [{m.ciLow}, {m.ciHigh}]
                          </td>
                          <td style={{ padding: "10px 8px", textAlign: "right" }}>
                            <Link href={href(targetPath)} className="button secondary small text-xs">
                              Examine
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Legacy / Bookmark Question Explorer */}
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

        {error && <ErrorBox message={error} />}
      </div>
    </div>
  );
}

/* =========================================================================
   REUSABLE THREAT ANALYSIS COMPONENT (FOR IV1, IV2, IV3, IV4)
   ========================================================================= */
function ThreatAnalysisPanel({
  ivCode,
  threatName,
  missionCode,
  description,
  scenarioIds,
  attempts,
  totalParticipants,
  insightsText,
}: {
  ivCode: string;
  threatName: string;
  missionCode: string;
  description: string;
  scenarioIds: readonly string[];
  attempts: any[];
  totalParticipants: number;
  insightsText: string;
}) {
  const attemptedOnly = attempts.filter(
    (a) => a.primaryIV === ivCode && a.selectedAction !== null,
  );
  const unsafeCount = attemptedOnly.filter((a) => a.unsafe === true).length;
  const unsafeRate = attemptedOnly.length
    ? Math.round((unsafeCount / attemptedOnly.length) * 100)
    : 0;
  const protectiveRate = 100 - unsafeRate;
  const totalRisk = attemptedOnly.reduce(
    (sum, a) => sum + (a.privacyRiskScore ?? 0),
    0,
  );
  const meanRisk = attemptedOnly.length
    ? Number((totalRisk / attemptedOnly.length).toFixed(2))
    : 0;

  // Action breakdown
  const actionCounts: Record<string, number> = {
    report: 0,
    verify: 0,
    ignore: 0,
    proceed: 0,
  };
  attemptedOnly.forEach((a) => {
    if (a.selectedAction && actionCounts[a.selectedAction] !== undefined) {
      actionCounts[a.selectedAction]++;
    }
  });

  // Disclosed information breakdown
  const infoCounts: Record<string, number> = {};
  attemptedOnly.forEach((a) => {
    const cat = a.disclosedInfoCategory || (a.unsafe ? "Disclosed Info" : "None");
    infoCounts[cat] = (infoCounts[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-top">
          <div>
            <span className="eyebrow text-cyan font-bold">{ivCode} · EMPIRICAL RESEARCH ANALYSIS</span>
            <h2 className="text-xl font-bold mt-1">{threatName}</h2>
            <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">{description}</p>
          </div>
          <span className="tag">{missionCode}</span>
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
              {protectiveRate}%
            </strong>
            <span className="text-[11px] text-muted block mt-0.5">Safe Actions / Reported</span>
          </div>
        </div>
      </div>

      {/* Decision Actions & Disclosed Info Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold mb-3">Decision Action Distribution</h3>
          <div style={{ height: 220, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { action: "Report to IT", count: actionCounts.report, fill: "#10b981" },
                  { action: "Verify Channel", count: actionCounts.verify, fill: "#06b6d4" },
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
          <h3 className="text-sm font-semibold mb-3">Disclosed Information Categories</h3>
          <div className="space-y-2 mt-2">
            {Object.entries(infoCounts).map(([cat, count]) => {
              const pct = attemptedOnly.length
                ? Math.round((count / attemptedOnly.length) * 100)
                : 0;
              const isSafe = cat === "None";
              return (
                <div
                  key={cat}
                  className="p-2.5 rounded bg-surface border flex items-center justify-between text-xs"
                >
                  <div>
                    <span className={`font-semibold ${isSafe ? "text-emerald" : "text-red"}`}>
                      {cat}
                    </span>
                    <span className="text-muted block text-[11px]">
                      {isSafe ? "Protected: No credentials or info disclosed" : "Simulated personal info exposure"}
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

      {/* Per-Scenario Detailed Breakdown Table */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-2">Scenario Performance Breakdown ({threatName})</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Scenario ID</th>
                <th>Scenario Title</th>
                <th>Evaluations</th>
                <th>Unsafe Count</th>
                <th>Unsafe Rate</th>
                <th>Mean Risk (0–4)</th>
                <th>Median Time</th>
              </tr>
            </thead>
            <tbody>
              {scenarioIds.map((id) => {
                const scAttempts = attempts.filter(
                  (a) => a.scenarioId === id && a.selectedAction !== null,
                );
                const unsafe = scAttempts.filter((a) => a.unsafe === true).length;
                const rate = scAttempts.length
                  ? Math.round((unsafe / scAttempts.length) * 100)
                  : 0;
                const risk = scAttempts.length
                  ? Number(
                      (
                        scAttempts.reduce(
                          (s, a) => s + (a.privacyRiskScore ?? 0),
                          0,
                        ) / scAttempts.length
                      ).toFixed(2),
                    )
                  : 0;
                const times = scAttempts
                  .map((a) => a.elapsedMs / 1000)
                  .sort((a, b) => a - b);
                const med = times.length
                  ? times[Math.floor(times.length / 2)].toFixed(1) + "s"
                  : "—";
                return (
                  <tr key={id}>
                    <th><code>{id}</code></th>
                    <td className="text-xs">{SCENARIO_TITLES[id] || id}</td>
                    <td>{scAttempts.length}</td>
                    <td>{unsafe}</td>
                    <td>
                      <span className={rate > 50 ? "text-red font-semibold" : ""}>
                        {rate}%
                      </span>
                    </td>
                    <td className="font-mono text-cyan">{risk}</td>
                    <td>{med}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Qualitative Insights Box */}
      <div className="card p-4 bg-surface-subtle border">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-cyan mb-1.5">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>Research Vulnerability Observations: {threatName}</span>
        </h4>
        <p className="text-xs text-muted leading-relaxed">
          {attemptedOnly.length > 0
            ? `${unsafeRate}% unsafe decision rate across ${attemptedOnly.length} recorded participant evaluations (mean risk score: ${meanRisk}/4). ${insightsText}`
            : "No participant challenge evaluations have been recorded yet for this threat module."}
        </p>
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
