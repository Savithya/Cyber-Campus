"use client";

import React from "react";
import { Layers, Gamepad2, Clock, GraduationCap, ArrowUpRight } from "lucide-react";

export function ResearchMetrics() {
  const scrollToThreats = (e: React.MouseEvent) => {
    const el = document.getElementById("threat-categories");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="research-metrics-section relative -mt-4 mb-12 sm:mb-16 lg:mb-20"
      aria-label="Research Scope and Design Metrics"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1 — Threat Categories */}
          <div
            className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            role="article"
            aria-label="Threat Categories: 04"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Layers size={20} className="sm:w-[22px] sm:h-[22px]" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  IV1–IV4
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 break-words">
                Threat Categories
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Phishing, Pretexting, Impersonation, and Online Scams &amp; Malicious Links.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              <button
                type="button"
                onClick={scrollToThreats}
                className="inline-flex items-center gap-1 hover:underline cursor-pointer min-h-[32px]"
              >
                <span>View categories</span>
                <ArrowUpRight size={12} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Card 2 — Interactive Challenges */}
          <div
            className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            role="article"
            aria-label="Interactive Challenges: 20"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/90 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Gamepad2 size={20} className="sm:w-[22px] sm:h-[22px]" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  5 Per Module
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                20
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 break-words">
                Interactive Challenges
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Five realistic scenarios for each research threat category.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
              <span>Safe sandbox simulation</span>
            </div>
          </div>

          {/* Card 3 — Estimated Time */}
          <div
            className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            role="article"
            aria-label="Estimated Participation Time: 15–20 Min"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/90 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Clock size={20} className="sm:w-[22px] sm:h-[22px]" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  Self-Paced
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
                15–20 <span className="text-lg font-bold text-slate-500 dark:text-slate-400">Min</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 break-words">
                Estimated Participation Time
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Complete the research activities at your own pace.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Auto-saved · Pause anytime</span>
            </div>
          </div>

          {/* Card 4 — Research Population */}
          <div
            className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            role="article"
            aria-label="Research Population: University Students Sri Lanka"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <GraduationCap size={20} className="sm:w-[22px] sm:h-[22px]" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  Sri Lanka
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 break-words">
                University Students
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 break-words">
                Target Research Population
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Students from eligible higher education institutions across Sri Lanka.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              <span>State &amp; Private Institutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
