"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  Compass,
  FileCheck,
  Award,
  Zap,
} from "lucide-react";

interface JourneyStep {
  step: number;
  stepStr: string;
  title: string;
  subtitle: string;
  duration: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorKey: "lavender" | "cyan" | "emerald" | "amber";
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  deliverables: string[];
  privacyGuarantee: string;
  directActionLabel: string;
  directActionHref: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    stepStr: "STEP 01",
    title: "Research Information & Consent",
    subtitle: "Informed, voluntary confirmation of participation rights.",
    duration: "1–2 Mins",
    badge: "Voluntary & Informed",
    icon: BookOpen,
    colorKey: "lavender",
    themeColor: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
    accentBorder: "border-indigo-200 dark:border-indigo-800",
    deliverables: [
      "Read empirical research objectives and academic governance scope",
      "Confirm university student eligibility (18+ undergraduate or postgraduate)",
      "Acknowledge right to pause, skip, or withdraw at any moment",
    ],
    privacyGuarantee: "No real identity or contact details collected during consent",
    directActionLabel: "Start Step 01",
    directActionHref: "/consent",
  },
  {
    step: 2,
    stepStr: "STEP 02",
    title: "Participant Demographics",
    subtitle: "Non-identifying academic background for statistical stratification.",
    duration: "1 Min",
    badge: "5 Profile Indicators",
    icon: UserCheck,
    colorKey: "cyan",
    themeColor: "text-teal-700 dark:text-cyan-400",
    accentBg: "bg-teal-50 dark:bg-teal-950/40",
    accentBorder: "border-teal-200 dark:border-teal-800",
    deliverables: [
      "Select age category, year of study, and faculty discipline",
      "Indicate university type (State, Private, Foreign Branch Campus)",
      "Generate an isolated, cryptographically random Participant Token",
    ],
    privacyGuarantee: "Demographics are strictly aggregated and never linked to your identity",
    directActionLabel: "View Demographics",
    directActionHref: "/demographics",
  },
  {
    step: 3,
    stepStr: "STEP 03",
    title: "Cyber Investigation Missions",
    subtitle: "The core simulation lab evaluating 4 social engineering threat variables.",
    duration: "8–10 Mins",
    badge: "20 Research Challenges",
    icon: ShieldAlert,
    colorKey: "emerald",
    themeColor: "text-emerald-700 dark:text-emerald-400",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/40",
    accentBorder: "border-emerald-200 dark:border-emerald-800",
    deliverables: [
      "5 Phishing scenarios: deceptive email domains & urgency hooks (IV1)",
      "5 Pretexting scenarios: fabricated stories & OTP solicitations (IV2)",
      "5 Impersonation scenarios: faculty & peer account spoofing (IV3)",
      "5 Malicious link & scam scenarios: URL tricks & fake grants (IV4)",
    ],
    privacyGuarantee: "Safe simulated environment — no actual links or malware executed",
    directActionLabel: "Explore Missions",
    directActionHref: "/play",
  },
  {
    step: 4,
    stepStr: "STEP 04",
    title: "Complete & Review",
    subtitle: "Immediate personalized educational debrief and safe defense guidance.",
    duration: "2 Mins",
    badge: "Educational Debrief",
    icon: CheckCircle2,
    colorKey: "amber",
    themeColor: "text-amber-800 dark:text-amber-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
    accentBorder: "border-amber-200 dark:border-amber-800",
    deliverables: [
      "Confirm secure submission under your anonymous Participant Token",
      "Review your decisions alongside expert recommended protective actions",
      "Understand psychological triggers exploited in each scenario",
    ],
    privacyGuarantee: "Data sealed for academic research analysis only",
    directActionLabel: "Review Sample",
    directActionHref: "/survey/review",
  },
];

export function ParticipationJourney() {
  const [activeStep, setActiveStep] = useState<number>(3); // Step 3 highlighted by default (core missions)

  const selectedStepData = JOURNEY_STEPS.find((s) => s.step === activeStep) || JOURNEY_STEPS[2];

  return (
    <section
      className="how-it-works-section container my-16 lg:my-24"
      aria-labelledby="journey-heading"
    >
      {/* Centered Section Header with Modern Badge */}
      <div className="section-header-centered text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-primary/10 border border-primary/20 text-primary mb-3">
          <Compass size={14} className="animate-spin-slow" aria-hidden="true" />
          <span>PARTICIPATION JOURNEY</span>
        </div>
        <h2 id="journey-heading" className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          How Cyber Campus Works
        </h2>
        <p className="text-muted-foreground mt-3 text-base md:text-lg leading-relaxed">
          A structured, self-paced 4-step research experience designed for undergraduate students
          across all disciplines in Sri Lanka.
        </p>

        {/* Quick Journey Highlights Strip */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-5 text-xs text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Clock size={14} className="text-primary" /> Total Time: ~12–15 Mins
          </span>
          <span className="text-border" aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Lock size={14} className="text-cyan-400" /> Anonymous Participant Token
          </span>
          <span className="text-border" aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-400" /> 100% Voluntary &amp; Ethical
          </span>
        </div>
      </div>

      {/* Interactive 4-Step Stepper Cards Grid */}
      <div className="relative mt-12">
        {/* Visual Connector Line (Visible on desktop) */}
        <div
          className="hidden lg:block absolute top-[72px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-indigo-500/30 via-emerald-500/40 to-amber-500/30 z-0 pointer-events-none"
          aria-hidden="true"
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10"
          role="list"
          aria-label="Four Participation Steps"
        >
          {JOURNEY_STEPS.map((s) => {
            const Icon = s.icon;
            const isSelected = activeStep === s.step;

            return (
              <div
                key={s.step}
                role="listitem"
                tabIndex={0}
                onClick={() => setActiveStep(s.step)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveStep(s.step);
                  }
                }}
                className={`group relative rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-100/80 dark:shadow-indigo-950/40 -translate-y-1.5 ring-2 ring-indigo-500/25"
                    : "bg-white/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 hover:-translate-y-1 hover:shadow-md"
                }`}
              >
                {/* Step Top Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                      }`}
                    >
                      {s.stepStr}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700">
                      <Clock size={11} className="text-indigo-600 dark:text-indigo-400" />
                      {s.duration}
                    </span>
                  </div>

                  {/* Icon Tile */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 border shrink-0 ${s.accentBg} ${s.accentBorder} ${s.themeColor} shadow-2xs`}
                    >
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {s.title}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {s.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Key Highlights list */}
                  <ul className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-300">
                    {s.deliverables.slice(0, 2).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          size={13}
                          className={`mt-0.5 shrink-0 ${
                            isSelected ? s.themeColor : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step Card Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {s.badge}
                  </span>

                  <span
                    className={`inline-flex items-center text-xs font-semibold gap-1 transition-transform group-hover:translate-x-1 ${
                      isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span>Details</span>
                    <ChevronRight size={13} />
                  </span>
                </div>

                {/* Active Indicator Glow Pip */}
                {isSelected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Step Deep-Dive Showcase Box */}
      <div className="mt-8 rounded-2xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 lg:p-8 shadow-sm dark:shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-600 text-white tracking-wider shadow-2xs">
                {selectedStepData.stepStr} Active Inspection
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Clock size={12} className="text-indigo-600 dark:text-indigo-400" />
                Duration: {selectedStepData.duration}
              </span>
            </div>

            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {selectedStepData.title}
            </h4>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedStepData.subtitle}
            </p>

            {/* Detailed Key Activities Grid (2x2 layout, clean contrast) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {selectedStepData.deliverables.map((deliv, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 transition-all hover:border-indigo-300 hover:bg-indigo-50/20 shadow-2xs"
                >
                  <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{deliv}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 px-3.5 py-1.5 rounded-lg shadow-2xs">
                <ShieldCheck size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Academic Assurance: {selectedStepData.privacyGuarantee}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button for this step */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <Link
              href={selectedStepData.directActionHref}
              prefetch={true}
              className="button primary large text-center justify-center font-bold shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg"
            >
              <span>{selectedStepData.directActionLabel}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <a
              href="#threats-heading"
              className="button secondary text-center justify-center text-xs font-semibold px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
            >
              <span>View Threat Scenarios</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner (Redesigned & Professional for Light and Dark Modes) */}
      <div className="journey-cta-banner mt-8 p-6 lg:p-8 rounded-2xl border border-indigo-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-indigo-700 dark:text-cyan-400 uppercase tracking-wider">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span>Ready for Empirical Participation?</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Start with Step 01 (Consent &amp; Rights) at any time.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Takes approximately 12–15 minutes total. Self-paced, autosaved, and zero login credentials required.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-center shrink-0">
          <Link
            href="/consent"
            prefetch={true}
            className="button primary large w-full sm:w-auto font-bold shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg"
          >
            <span>Start Research Participation</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
