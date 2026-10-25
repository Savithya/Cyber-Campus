"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  HeartHandshake,
  KeyRound,
  Activity,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="home"
      className="hero-section relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24"
      aria-label="Cyber Campus Research Overview"
    >
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-14 items-center">
          {/* Left Column: Balanced Two-Column Hero Layout */}
          <div className="space-y-6 text-left max-w-2xl">
            {/* Introductory Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse" />
              <span>ACADEMIC CYBERSECURITY RESEARCH • SRI LANKA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Explore Cyber Threats.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Protect Your Digital Privacy.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Participate in interactive cybersecurity scenarios investigating how social engineering threats relate to user privacy among university students in Sri Lanka.
            </p>

            {/* Action Row: Primary Research CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/consent"
                prefetch={true}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-blue-500 text-base"
                aria-label="Start Research participation"
              >
                <span className="text-white font-bold">Start Research</span>
                <ArrowRight size={18} className="text-white" aria-hidden="true" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <HeartHandshake size={15} className="text-emerald-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium">Voluntary Participation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-cyan-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium">Anonymous Research ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-indigo-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium">Safe Simulated Scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <KeyRound size={15} className="text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="font-medium">No Real Passwords</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Balanced Two-Column Hero Layout (Max 650px, Right-Aligned on Desktop) */}
          <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end w-full">
            <div className="cyber-hero-image-wrapper hero-pro-visual-wrapper relative w-full">
              {/* Glow Aura */}
              <div className="hero-pro-ambient-glow" aria-hidden="true" />

              {/* Main Interactive Workstation Frame */}
              <div className="hero-pro-image-card relative rounded-2xl lg:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-900 overflow-hidden shadow-2xl transition-all duration-300 group w-full">
                {/* Responsive Picture Artwork */}
                <picture>
                  <source srcSet="/images/cyber-hero-lab-8x5.webp" type="image/webp" />
                  <source srcSet="/images/cyber-hero-lab-8x5.png" type="image/png" />
                  <img
                    src="/images/cyber-hero-lab-8x5.jpg"
                    alt="Cyber Campus Hybrid Cyber Research Lab — Cybersecurity Command Console & Simulation Environment"
                    className="cyber-hero-image hero-pro-image w-full h-auto object-contain transition-transform duration-700 group-hover:scale-102"
                    width={1376}
                    height={768}
                    loading="eager"
                  />
                </picture>

              {/* Scanning Laser Beam (Micro Animation) */}
              <div className="cyber-laser-scanner" aria-hidden="true" />

              {/* Top-Left: Live Console Status Pill */}
              <div className="hero-pro-live-pill absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="tracking-wide">CYBER THREAT LAB · CONSOLE</span>
              </div>

              {/* Top-Right: User Privacy Shield Badge */}
              <div className="hero-pro-shield-pill absolute top-3 sm:top-4 right-3 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[11px] font-bold text-emerald-300 shadow-lg">
                <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
                <span>User Privacy Shield</span>
              </div>

              {/* Floating Holographic Threat Panels */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-center gap-2 z-10 hidden sm:flex">
                <div className="flex justify-between items-center">
                  {/* Panel 1: Phishing */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 text-[11px] text-white flex items-center gap-2 shadow-xl animate-float-slow">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Mail size={12} />
                    </div>
                    <div>
                      <span className="font-bold block leading-tight">Phishing</span>
                      <span className="text-[9px] text-indigo-300">IV1 · 5 Scenarios</span>
                    </div>
                  </div>

                  {/* Panel 2: Pretexting */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-[11px] text-white flex items-center gap-2 shadow-xl animate-float-medium">
                    <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <MessagesSquare size={12} />
                    </div>
                    <div>
                      <span className="font-bold block leading-tight">Pretexting</span>
                      <span className="text-[9px] text-cyan-300">IV2 · 5 Scenarios</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  {/* Panel 3: Impersonation */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-violet-500/40 text-[11px] text-white flex items-center gap-2 shadow-xl animate-float-medium">
                    <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center text-violet-400">
                      <UserRoundSearch size={12} />
                    </div>
                    <div>
                      <span className="font-bold block leading-tight">Impersonation</span>
                      <span className="text-[9px] text-violet-300">IV3 · 5 Scenarios</span>
                    </div>
                  </div>

                  {/* Panel 4: Online Scams & Malicious Links */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-rose-500/40 text-[11px] text-white flex items-center gap-2 shadow-xl animate-float-slow">
                    <div className="w-5 h-5 rounded-md bg-rose-500/20 flex items-center justify-center text-rose-400">
                      <Link2 size={12} />
                    </div>
                    <div>
                      <span className="font-bold block leading-tight">Online Scams</span>
                      <span className="text-[9px] text-rose-300">IV4 · 5 Scenarios</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Glassmorphic Telemetry Ribbon */}
              <div className="hero-pro-bottom-ribbon absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md border-t border-white/10 p-3 sm:p-3.5 z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white text-xs font-semibold">
                    <Activity size={14} className="text-cyan-400 shrink-0" aria-hidden="true" />
                    <span className="tracking-wide">Threat Telemetry &amp; Privacy Simulation</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-300 font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Phishing</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Pretexting</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Impersonation</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">Scams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
