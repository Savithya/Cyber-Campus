"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

export function ResearchCTA() {
  return (
    <section
      className="research-cta-section py-16 lg:py-24 relative overflow-hidden"
      aria-label="Final Research Participation Call to Action"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-indigo-950/60 dark:to-slate-900 shadow-xl overflow-hidden text-center max-w-5xl mx-auto">
          {/* Ambient decorative blur glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Icon Badge */}
          <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 mb-6">
            <GraduationCap size={28} aria-hidden="true" />
          </div>

          {/* Heading */}
          <h2 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Contribute to Cybersecurity Research in Sri Lanka
          </h2>

          {/* Description */}
          <p className="relative z-10 mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Help researchers better understand how social engineering threats relate to digital privacy among university students.
          </p>

          {/* Action Buttons */}
          <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/consent"
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-base focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label="Start Your Research Journey"
            >
              <span className="text-white font-bold">Start Your Research Journey</span>
              <ArrowRight size={18} className="text-white" aria-hidden="true" />
            </Link>

            <Link
              href="/privacy"
              prefetch={true}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-base focus-visible:outline-2 focus-visible:outline-blue-500"
              aria-label="Learn About the Study"
            >
              <BookOpen size={18} className="text-white" aria-hidden="true" />
              <span className="text-white font-bold">Learn About the Study</span>
            </Link>
          </div>

          {/* Subtle trust tag */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Voluntary Academic Participation · 15–20 Mins · Sri Lanka Higher Education</span>
          </div>
        </div>
      </div>
    </section>
  );
}
