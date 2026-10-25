"use client";

import React from "react";
import { ShieldCheck, Activity } from "lucide-react";

export function HeroCyberVisual() {
  return (
    <div
      className="cyber-hero-image-wrapper hero-pro-visual-wrapper"
      role="region"
      aria-label="Academic Cybersecurity Research Workstation & Simulation Environment"
    >
      {/* Ambient soft glow */}
      <div className="hero-pro-ambient-glow" aria-hidden="true" />

      {/* Main Professional Image Frame */}
      <div className="hero-pro-image-card">
        {/* Crisp High-Resolution Professional Artwork */}
        <picture>
          <source srcSet="/images/cyber-hero-professional.jpg" type="image/jpeg" />
          <source srcSet="/images/cyber-hero-lab-8x5.webp" type="image/webp" />
          <source srcSet="/images/cyber-hero-lab-8x5.png" type="image/png" />
          <img
            src="/images/cyber-hero-lab-8x5.jpg"
            alt="Professional University Cybersecurity Research Workstation — Live Threat Telemetry & Academic Privacy Simulation"
            className="cyber-hero-image hero-pro-image"
            width={1376}
            height={768}
            loading="eager"
          />
        </picture>

        {/* Refined Glassmorphic Status Header Pill (Top-Left) */}
        <div className="hero-pro-live-pill" aria-hidden="true">
          <span className="hero-pro-pulse-dot" />
          <span>CYBER THREAT LAB · RESEARCH CONSOLE</span>
        </div>

        {/* Dependent Variable Privacy Shield Badge (Top-Right) */}
        <div className="hero-pro-shield-pill" aria-hidden="true">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>User Privacy Shield</span>
        </div>

        {/* Elegant Bottom Glassmorphic Telemetry Ribbon */}
        <div className="hero-pro-bottom-ribbon">
          <div className="hero-pro-ribbon-content">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-teal-400 shrink-0" aria-hidden="true" />
              <strong className="text-xs font-semibold text-white tracking-wide">
                Social Engineering Threat Investigations
              </strong>
            </div>

            {/* Clean 4 Threat Category Pills */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-200">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-medium">
                Phishing
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-medium">
                Pretexting
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-medium">
                Impersonation
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-medium">
                Scams &amp; Links
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
