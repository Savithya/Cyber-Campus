"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  HeartHandshake,
  KeyRound,
  Database,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="home"
      className="hero-section relative overflow-hidden pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-16 lg:pb-24"
      aria-label="Cyber Campus Research Overview"
    >
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-14 items-center">
          {/* Left Column: Balanced Two-Column Hero Layout */}
          <div className="space-y-5 sm:space-y-6 text-left max-w-2xl min-w-0">
            {/* Introductory Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[10.5px] sm:text-xs font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs max-w-full flex-wrap break-words">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse shrink-0" />
              <span>ACADEMIC CYBERSECURITY RESEARCH • SRI LANKA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14] break-words">
              Explore Cyber Threats.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Protect Your Digital Privacy.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Participate in interactive cybersecurity scenarios investigating how social engineering threats relate to user privacy among university students in Sri Lanka.
            </p>

            {/* Action Row: Primary Research CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/consent"
                prefetch={true}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-500 text-sm sm:text-base min-h-[48px]"
                aria-label="Start Research participation"
              >
                <span className="text-white font-bold">Start Research</span>
                <ArrowRight size={18} className="text-white shrink-0" aria-hidden="true" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <HeartHandshake size={15} className="text-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate sm:whitespace-normal">Voluntary Participation</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Lock size={15} className="text-cyan-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate sm:whitespace-normal">Anonymous Research ID</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <ShieldCheck size={15} className="text-indigo-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate sm:whitespace-normal">Safe Simulated Scenarios</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <KeyRound size={15} className="text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate sm:whitespace-normal">No Real Passwords</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Research Intelligence Node Card (Matching Reference Design) */}
          <div className="relative mt-6 lg:mt-0 flex justify-center lg:justify-end w-full">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/15 via-cyan-500/20 to-blue-500/15 rounded-3xl blur-2xl pointer-events-none -z-10" />

            {/* Outer Card: White in Light Mode, Slate in Dark/Cyber Mode */}
            <div className="hero-intelligence-card cyber-hero-image-wrapper relative w-full max-w-[480px] rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/10 group">
              {/* Top: Dark Cybersecurity Console Visual */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-[#0c1428] border border-slate-800/90 shadow-inner">
                <picture>
                  <source srcSet="/images/cyber-research-node.png" type="image/png" />
                  <img
                    src="/images/cyber-research-node.png"
                    alt="Cyber Campus Research Intelligence Node - Cybersecurity Research Simulation Environment"
                    className="cyber-hero-image w-full h-auto object-cover aspect-square transition-transform duration-700 group-hover:scale-[1.02]"
                    width={436}
                    height={437}
                    loading="eager"
                  />
                </picture>

                {/* Subtle Laser Sweep Micro-Animation */}
                <div className="cyber-laser-scanner" aria-hidden="true" />

                {/* Overlay Node Badge (Matching Reference) */}
                <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 z-10 flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                  </span>
                  <span className="tracking-wide text-[10.5px] sm:text-xs font-semibold text-white break-words">
                    Research Intelligence Node - Active &amp; Protected
                  </span>
                </div>
              </div>

              {/* Bottom: 3 Security & Governance Trust Tags */}
              <div className="pt-3 sm:pt-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                  <ShieldCheck size={14} className="text-cyan-500 shrink-0" aria-hidden="true" />
                  <span>AES-256 Session Encryption</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Lock size={14} className="text-indigo-500 shrink-0" aria-hidden="true" />
                  <span>Rate-Limited Gateway</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-2xs">
                  <Database size={14} className="text-teal-500 shrink-0" aria-hidden="true" />
                  <span>IRB Ethics Protocol Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
