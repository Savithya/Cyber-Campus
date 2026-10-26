"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";

interface DemoChoice {
  id: string;
  label: string;
  isProtective: boolean;
  feedback: string;
  threatRisk: "None" | "Low" | "High" | "Critical";
}

interface DemoScenario {
  id: string;
  tabLabel: string;
  sender: string;
  subject: string;
  date: string;
  body: string;
  simulatedLink: string;
  choices: DemoChoice[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "lms-notice",
    tabLabel: "LMS Account Verification",
    sender: "University Portal Services <security@campus-serendib-verify.example>",
    subject: "URGENT: Mandatory Student Security Audit – Immediate Verification Required",
    date: "Today, 10:42 AM",
    body: "Dear Student, Our quarterly IT security audit flagged your university login credentials as unverified. To prevent automatic deactivation of your LMS and online examination access within the next 2 hours, you must verify your identity immediately.",
    simulatedLink: "https://campus-serendib-verify.example/student-portal/auth-gate",
    choices: [
      {
        id: "click",
        label: "Click the verification link immediately to avoid losing LMS access",
        isProtective: false,
        threatRisk: "Critical",
        feedback:
          "Vulnerability Triggered! Clicking this link navigates to an external credential-harvesting server masquerading as the university portal. The artificial 2-hour deadline was manufactured to induce panic.",
      },
      {
        id: "verify",
        label: "Verify the notice through an official university helpdesk or published phone directory",
        isProtective: true,
        threatRisk: "None",
        feedback:
          "Safest Decision! Out-of-band verification via official, independently sourced channels (like bookmarks or university switchboards) defeats domain spoofing attempts.",
      },
      {
        id: "ignore",
        label: "Ignore the email and take no action",
        isProtective: false,
        threatRisk: "Low",
        feedback:
          "Passive approach: While you avoid entering credentials, failing to report the spoofed email leaves your campus peers vulnerable to the ongoing campaign.",
      },
      {
        id: "report",
        label: "Report the message as a phishing attempt to university IT cybersecurity",
        isProtective: true,
        threatRisk: "None",
        feedback:
          "Excellent Protection! Reporting the suspicious message allows campus IT engineers to block the domain and protect the entire student community.",
      },
    ],
  },
  {
    id: "grant-offer",
    tabLabel: "Student Subsidy Scheme",
    sender: "National Student Welfare <grants-notification@student-subsidy.site>",
    subject: "Approved: Student Education Technology Grant (LKR 45,000)",
    date: "Yesterday, 3:15 PM",
    body: "Congratulations! You have been selected for the 2026 Student Technology Allowance. To release your fund voucher, enter your card details and verification code at the link below within 24 hours.",
    simulatedLink: "https://student-subsidy.site/claim/voucher?ref=9401",
    choices: [
      {
        id: "grant-click",
        label: "Click the link and enter debit card details to receive the grant",
        isProtective: false,
        threatRisk: "Critical",
        feedback:
          "Critical Financial Compromise! Legitimate student grants only require a bank account and branch number for deposits, never your 16-digit card number or CVV.",
      },
      {
        id: "grant-verify",
        label: "Check official university noticeboards and student affairs welfare lists",
        isProtective: true,
        threatRisk: "None",
        feedback:
          "Recommended Practice! All legitimate scholarship disbursements are confirmed via official university student welfare departments before any fund allocation.",
      },
      {
        id: "grant-report",
        label: "Forward to university student welfare and flag as deceptive",
        isProtective: true,
        threatRisk: "None",
        feedback:
          "Top Defense! Flagging unsolicited financial promises protects fellow students from advance-fee scams targeting university communities.",
      },
      {
        id: "grant-ignore",
        label: "Delete the message without replying or checking",
        isProtective: false,
        threatRisk: "Low",
        feedback:
          "Safe personally, but reporting helps university administrators issue campus-wide warnings about active scam campaigns.",
      },
    ],
  },
];

export function CyberLabPreview() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("lms-notice");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const activeScenario =
    DEMO_SCENARIOS.find((s) => s.id === activeScenarioId) || DEMO_SCENARIOS[0];

  const currentChoice = activeScenario.choices.find((c) => c.id === selectedChoiceId);

  const handleTabSwitch = (id: string) => {
    setActiveScenarioId(id);
    setSelectedChoiceId(null);
  };

  const handleReset = () => {
    setSelectedChoiceId(null);
  };

  return (
    <section
      id="cyber-lab-preview"
      className="cyber-lab-preview-section py-12 lg:py-20 relative"
      aria-labelledby="lab-preview-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 mb-3 shadow-2xs">
            <Sparkles size={14} aria-hidden="true" />
            <span>INTERACTIVE DEMO ENVIRONMENT</span>
          </div>
          <h2
            id="lab-preview-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Think Like a Cyber Investigator
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Explore a sample digital scenario and discover how online deception can threaten your privacy.
          </p>

          {/* Critical Research Validity Notice */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <Info size={14} className="text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <span>Optional Educational Demo — Not Part of Research Scoring</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap" role="tablist" aria-label="Demo Scenarios">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              role="tab"
              aria-selected={activeScenarioId === scenario.id}
              onClick={() => handleTabSwitch(scenario.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenarioId === scenario.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{scenario.tabLabel}</span>
            </button>
          ))}
        </div>

        {/* Two-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left Column (7 of 12 cols): Simulated Digital Message */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            {/* Mock Email Window Header */}
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 ml-2">
                  Campus Mail Client · Simulation
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                Safe Simulation
              </span>
            </div>

            {/* Email Metadata */}
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 min-w-0">
                  <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">From:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-left sm:text-right break-words sm:truncate max-w-full sm:max-w-md min-w-0">
                    {activeScenario.sender}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 min-w-0">
                  <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0">Subject:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-left sm:text-right break-words min-w-0">
                    {activeScenario.subject}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between text-slate-400 text-[11px] gap-1 pt-1">
                  <span>Date: {activeScenario.date}</span>
                  <span>Encryption: TLS (External Host)</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                <p>{activeScenario.body}</p>

                {/* Simulated Link (Non-operational, strictly safe) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Simulated Link Destination:
                  </span>
                  <span className="font-mono text-indigo-600 dark:text-cyan-400 underline break-all select-none cursor-not-allowed">
                    {activeScenario.simulatedLink}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1 italic">
                    (Link is disabled in educational simulation mode)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 of 12 cols): Interactive Decision Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-indigo-600 dark:text-cyan-400" aria-hidden="true" />
                  <span>What Would You Do?</span>
                </h3>
                {selectedChoiceId && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={12} className="text-white" />
                    <span className="text-white">Reset</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Select the action you would take if you received this message on your university account:
              </p>

              {/* Radio-card controls */}
              <div className="space-y-2.5" role="radiogroup" aria-label="Investigation decision choices">
                {activeScenario.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedChoiceId(choice.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? choice.isProtective
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                            : "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-100 ring-2 ring-red-500/20"
                          : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isSelected ? (
                          choice.isProtective ? (
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                          )
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 inline-block" />
                        )}
                      </span>
                      <span className="leading-snug">{choice.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Educational Feedback */}
              {currentChoice && (
                <div
                  className={`mt-5 p-4 rounded-xl border text-xs animate-fadeIn ${
                    currentChoice.isProtective
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200"
                  }`}
                >
                  <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                    {currentChoice.isProtective ? (
                      <>
                        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Protective Action Identified</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                        <span>Privacy Risk Identified</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">{currentChoice.feedback}</p>
                </div>
              )}
            </div>

            {/* Link to Full Research Challenges */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-5 flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Curious about the actual research study?
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Participate in all 20 interactive scenarios.
                </span>
              </div>
              <Link
                href="/consent"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-md transition-all"
              >
                <span className="text-white font-bold">Join Study</span>
                <ArrowRight size={13} className="text-white" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
