"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface JourneyStepData {
  step: string;
  number: number;
  title: string;
  icon: typeof FileText;
  description: string;
  badge: string;
  details: string[];
}

const JOURNEY_STEPS: JourneyStepData[] = [
  {
    step: "01",
    number: 1,
    title: "Research Information & Consent",
    icon: FileText,
    badge: "Step 01 · Consent",
    description: "Read the research information, confirm eligibility, and provide informed consent.",
    details: [
      "Confirm university student eligibility (18+ undergraduate or postgraduate)",
      "Voluntary participation rights with zero penalty to pause or exit",
      "No real names, student IDs, or contact details required",
    ],
  },
  {
    step: "02",
    number: 2,
    title: "Participant Demographics",
    icon: Users,
    badge: "Step 02 · Demographics",
    description: "Provide basic, non-identifying academic background information.",
    details: [
      "Age group & Gender",
      "Current year of study & Field of study",
      "University type (State, Private, Foreign Branch Campus)",
      "Anonymous Participant Research ID generated",
    ],
  },
  {
    step: "03",
    number: 3,
    title: "Cyber Investigation Missions",
    icon: Gamepad2,
    badge: "Step 03 · 20 Challenges",
    description: "Complete realistic simulated scenarios covering four social engineering threat categories.",
    details: [
      "Phishing: 5 challenges (IV1)",
      "Pretexting: 5 challenges (IV2)",
      "Impersonation: 5 challenges (IV3)",
      "Online Scams & Malicious Links: 5 challenges (IV4)",
    ],
  },
  {
    step: "04",
    number: 4,
    title: "Submit & Complete",
    icon: CheckCircle2,
    badge: "Step 04 · Complete",
    description: "Submit your responses and view any available educational feedback after completing the research.",
    details: [
      "Secure response submission under your anonymous token",
      "Immediate educational debrief on cyber threats and red flags",
      "Personalized protective defense guidelines",
    ],
  },
];

export function ParticipationJourney() {
  const [activeStep, setActiveStep] = useState<number>(3);

  return (
    <section
      id="how-it-works"
      className="participation-journey-section py-12 lg:py-20 relative bg-slate-50/60 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800/80"
      aria-labelledby="journey-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 mb-3 shadow-2xs">
            <Sparkles size={14} aria-hidden="true" />
            <span>PARTICIPATION JOURNEY</span>
          </div>
          <h2
            id="journey-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            How Cyber Campus Works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A simple four-step research experience designed for university students in Sri Lanka.
          </p>
        </div>

        {/* Desktop Connected Stepper & Mobile Vertical Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connected Horizontal Line on Desktop */}
          <div
            className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-indigo-500/30 via-cyan-500/40 to-emerald-500/40 z-0 pointer-events-none"
            aria-hidden="true"
          />

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
            role="list"
            aria-label="Four Participation Steps"
          >
            {JOURNEY_STEPS.map((s) => {
              const Icon = s.icon;
              const isSelected = activeStep === s.number;

              return (
                <div
                  key={s.step}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => setActiveStep(s.number)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveStep(s.number);
                    }
                  }}
                  className={`group relative rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 -translate-y-1 ring-2 ring-indigo-500/20"
                      : "bg-white/80 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Top Row: Number & Badge */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600"
                          }`}
                        >
                          {s.step}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {s.badge}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                      {s.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {s.description}
                    </p>

                    {/* Deliverables / Details Bullet points */}
                    <ul className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      {s.details.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-indigo-500 dark:text-cyan-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="mt-5 pt-3 border-t border-indigo-100 dark:border-indigo-950/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-cyan-400">
                      <span>Active Step</span>
                      <ShieldCheck size={14} aria-hidden="true" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear CTA beneath the workflow */}
        <div className="mt-12 text-center">
          <Link
            href="/consent"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm sm:text-base focus-visible:outline-2 focus-visible:outline-blue-500"
            aria-label="Begin Research Participation - Start with Step 01 Consent"
          >
            <span className="text-white font-bold">Begin Research Participation</span>
            <ArrowRight size={18} className="text-white" aria-hidden="true" />
          </Link>
          <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
            Takes approximately 15–20 minutes · Completely voluntary &amp; self-paced
          </p>
        </div>
      </div>
    </section>
  );
}
