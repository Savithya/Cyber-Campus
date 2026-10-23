"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  HeartHandshake,
  FileText,
  LockKeyhole,
  Database,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Fingerprint,
  Info,
} from "lucide-react";

type FilterCategory = "all" | "governance" | "rights" | "privacy";

interface EthicsCardData {
  id: string;
  category: "governance" | "rights" | "privacy";
  categoryLabel: string;
  takeaway: string;
  title: string;
  description: string;
  icon: typeof GraduationCap;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  guarantees: string[];
}

const ETHICS_CARDS: EthicsCardData[] = [
  {
    id: "purpose",
    category: "governance",
    categoryLabel: "Academic Governance",
    takeaway: "Empirical Social Science",
    title: "Purpose of the Study",
    description:
      "Investigating which social engineering threat category—phishing, pretexting, impersonation, or online scams—has the strongest observed association with user privacy risks among participating university students in Sri Lanka.",
    icon: GraduationCap,
    themeColor: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
    accentBorder: "border-indigo-200 dark:border-indigo-800",
    guarantees: [
      "Rigorous quantitative analysis of 4 threat variables (IV1–IV4)",
      "Advances evidence-based student cybersecurity curricula across Sri Lanka",
    ],
  },
  {
    id: "eligibility",
    category: "governance",
    categoryLabel: "Participant Eligibility",
    takeaway: "18+ Higher Education",
    title: "Who Can Participate",
    description:
      "Undergraduate and postgraduate students aged 18 and above currently enrolled at any state university, private higher education institute, or foreign branch campus in Sri Lanka.",
    icon: BookOpen,
    themeColor: "text-teal-700 dark:text-cyan-400",
    accentBg: "bg-teal-50 dark:bg-teal-950/40",
    accentBorder: "border-teal-200 dark:border-teal-800",
    guarantees: [
      "Open across all academic faculties: STEM, Management, Arts, Law & Medicine",
      "No specialized technical or coding background required to participate",
    ],
  },
  {
    id: "voluntary",
    category: "rights",
    categoryLabel: "Participant Rights",
    takeaway: "100% Voluntary · Zero Penalty",
    title: "Voluntary Participation",
    description:
      "Your involvement is entirely voluntary. You may pause, skip challenges, or exit the platform at any time before final submission without any academic, institutional, or personal penalty.",
    icon: HeartHandshake,
    themeColor: "text-rose-600 dark:text-rose-400",
    accentBg: "bg-rose-50 dark:bg-rose-950/40",
    accentBorder: "border-rose-200 dark:border-rose-800",
    guarantees: [
      "Exit or pause anytime with zero penalty or academic consequence",
      "Option to skip challenges you do not wish to answer",
    ],
  },
  {
    id: "collected",
    category: "privacy",
    categoryLabel: "Data Minimization",
    takeaway: "No Real Passwords Collected",
    title: "Information Collected",
    description:
      "Only aggregated non-identifying demographic indicators (age group, faculty, year of study) and your interactive challenge decisions. We never ask for or collect real passwords, student registration IDs, or banking details.",
    icon: FileText,
    themeColor: "text-emerald-700 dark:text-emerald-400",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/40",
    accentBorder: "border-emerald-200 dark:border-emerald-800",
    guarantees: [
      "Zero collection of student registration numbers, names, or email IDs",
      "All scenario forms operate strictly in sandbox simulation mode",
    ],
  },
  {
    id: "confidentiality",
    category: "privacy",
    categoryLabel: "Cryptographic Protection",
    takeaway: "Cryptographic Anonymity",
    title: "Data Confidentiality",
    description:
      "All submissions are associated solely with an anonymous participant code. Research data is stored securely, separated from identifying contact information, and used exclusively for scholarly statistical analysis.",
    icon: LockKeyhole,
    themeColor: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-50 dark:bg-blue-950/40",
    accentBorder: "border-blue-200 dark:border-blue-800",
    guarantees: [
      "Isolated participant tokens with zero IP tracking or fingerprinting",
      "Encrypted storage adhering to international scientific repository norms",
    ],
  },
  {
    id: "governance",
    category: "rights",
    categoryLabel: "Ethics & Withdrawal",
    takeaway: "Direct Researcher Contact",
    title: "Withdrawal & Governance",
    description:
      "You may withdraw your unsubmitted draft at any time. For questions regarding the research protocol or ethics clearance, you may consult our published information documents or contact the research team directly.",
    icon: Database,
    themeColor: "text-amber-700 dark:text-amber-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
    accentBorder: "border-amber-200 dark:border-amber-800",
    guarantees: [
      "Draft cancellation instantly purges all temporary in-memory responses",
      "Dedicated researcher contact channels for inquiries and protocol verification",
    ],
  },
];

export function StudyEthicsPrinciples() {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  const filteredCards =
    selectedFilter === "all"
      ? ETHICS_CARDS
      : ETHICS_CARDS.filter((c) => c.category === selectedFilter);

  return (
    <section
      id="about-study"
      className="why-participate-section container my-16 lg:my-24"
      aria-labelledby="ethics-heading"
    >
      {/* Header Block */}
      <div className="section-header-centered text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-teal-50 dark:bg-cyan-500/10 border border-teal-200 dark:border-cyan-500/20 text-teal-800 dark:text-cyan-400 mb-3 shadow-2xs">
          <Scale size={14} aria-hidden="true" />
          <span>RESEARCH INFORMATION &amp; ETHICS</span>
        </div>
        <h2 id="ethics-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Study Information &amp; Ethical Principles
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mt-3 text-base md:text-lg leading-relaxed">
          Cyber Campus operates under rigorous academic research governance, protecting participant
          privacy and ensuring full transparency.
        </p>

        {/* Category Filters */}
        <div
          className="flex items-center justify-center gap-2 mt-8 flex-wrap"
          role="tablist"
          aria-label="Filter ethics principles by topic"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "all"}
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            All Principles (6)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "governance"}
            onClick={() => setSelectedFilter("governance")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "governance"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Governance &amp; Scope (2)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "rights"}
            onClick={() => setSelectedFilter("rights")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "rights"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Participant Rights (2)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "privacy"}
            onClick={() => setSelectedFilter("privacy")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "privacy"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Data Privacy &amp; Security (2)
          </button>
        </div>
      </div>

      {/* 6 Cards Grid (Responsive 1/2/3 columns) */}
      <div className="why-participate-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
        {filteredCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.id}
              className="why-card group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between shadow-xs"
            >
              <div>
                {/* Card Top Row: Icon + Takeaway Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.accentBg} ${card.accentBorder} ${card.themeColor} shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-background border border-border text-foreground/80 shadow-sm">
                    {card.takeaway}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  {card.categoryLabel}
                </div>

                <h3 className="text-lg font-bold text-foreground leading-snug mb-2.5 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  {card.description}
                </p>

                {/* Specific Guarantees */}
                <ul className="space-y-2 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  {card.guarantees.map((guarantee, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        size={14}
                        className={`mt-0.5 flex-shrink-0 ${card.themeColor}`}
                      />
                      <span className="leading-snug">{guarantee}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Status */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Academic Safeguard Verified
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Institutional Ethics & Data Governance Trust Banner */}
      <div className="mt-10 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 max-w-5xl mx-auto shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Academic Protocol Clearance
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Supervised under institutional empirical guidelines with full participant rights transparency.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Fingerprint size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Sri Lanka PDPA Aligned
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Respects Personal Data Protection Act No. 9 of 2022 principles of minimization and purpose limitation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Zero Tracker Guarantee
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                No third-party advertising scripts, marketing cookies, or external device fingerprinting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visible Links to Legal & Ethical Documents as Interactive Cards */}
      <div className="ethics-links-strip mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Link
          href="/consent"
          className="ethics-doc-link group p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 transition-all flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                Consent Protocol
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Complete participant rights declaration
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/privacy"
          className="ethics-doc-link group p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-cyan-500/50 transition-all flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <LockKeyhole size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="text-xs font-bold text-foreground block group-hover:text-cyan-400 transition-colors">
                Privacy Policy
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Zero-password &amp; aggregation policy
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/withdraw"
          className="ethics-doc-link group p-4 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-amber-500/50 transition-all flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <HeartHandshake size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="text-xs font-bold text-foreground block group-hover:text-amber-400 transition-colors">
                Withdrawal Protocol
              </span>
              <span className="text-[10px] text-muted-foreground block">
                Revoke draft anytime without penalty
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </section>
  );
}
