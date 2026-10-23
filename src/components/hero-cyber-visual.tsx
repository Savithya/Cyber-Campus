"use client";

import React from "react";
import { ShieldCheck, Mail, MessagesSquare, UserRoundSearch, Link2, Lock } from "lucide-react";

export function HeroCyberVisual() {
  return (
    <div
      className="hero-full-visual-container"
      role="region"
      aria-label="Academic Cybersecurity Research Laboratory Animation"
    >
      {/* Background Ambient Neon Glows */}
      <div className="hero-cyber-glow glow-primary" aria-hidden="true" />
      <div className="hero-cyber-glow glow-secondary" aria-hidden="true" />
      <div className="hero-cyber-glow glow-accent" aria-hidden="true" />

      {/* Main Full-Image Animated Frame */}
      <div className="hero-full-image-frame">
        {/* Full Image Artwork */}
        <picture>
          <source srcSet="/images/cyber-hero-lab-8x5.webp" type="image/webp" />
          <source srcSet="/images/cyber-hero-lab-8x5.png" type="image/png" />
          <img
            src="/images/cyber-hero-lab-8x5.jpg"
            alt="Futuristic Academic Cybersecurity Research Laboratory — Digital Research Console, Privacy Shield and Threat Telemetry"
            className="hero-full-cyber-image"
            width={1200}
            height={750}
            loading="eager"
          />
        </picture>

        {/* Animated Cyber Laser Scanner Beam */}
        <div className="cyber-laser-scanner" aria-hidden="true">
          <div className="laser-beam-line" />
          <div className="laser-beam-glow" />
        </div>

        {/* Holographic Radial Grid Light Accent */}
        <div className="cyber-holographic-overlay" aria-hidden="true" />

        {/* Live Research Console Telemetry Badge (Top-Left) */}
        <div className="hero-live-beacon-pill" aria-hidden="true">
          <span className="live-pulse-emerald" />
          <span>CYBER THREAT LAB · RESEARCH CONSOLE</span>
        </div>

        {/* Glowing Privacy Shield Indicator (Center-Top) */}
        <div className="hero-floating-glass-chip top-center-shield">
          <div className="chip-icon-circle cyan pulse-glow">
            <ShieldCheck size={18} className="text-cyan" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">DEPENDENT VARIABLE (DV)</span>
            <strong className="chip-main">User Privacy Shield</strong>
          </div>
        </div>

        {/* 4 Floating Threat-Category Indicators */}
        {/* Indicator 1: IV1 Phishing */}
        <div className="hero-floating-glass-chip chip-threat-iv1">
          <div className="chip-icon-circle purple">
            <Mail size={15} className="text-indigo-400" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">IV1 · 5 CHALLENGES</span>
            <strong className="chip-main">Phishing</strong>
          </div>
        </div>

        {/* Indicator 2: IV2 Pretexting */}
        <div className="hero-floating-glass-chip chip-threat-iv2">
          <div className="chip-icon-circle emerald">
            <MessagesSquare size={15} className="text-emerald" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">IV2 · 5 CHALLENGES</span>
            <strong className="chip-main">Pretexting</strong>
          </div>
        </div>

        {/* Indicator 3: IV3 Impersonation */}
        <div className="hero-floating-glass-chip chip-threat-iv3">
          <div className="chip-icon-circle amber">
            <UserRoundSearch size={15} className="text-amber" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">IV3 · 5 CHALLENGES</span>
            <strong className="chip-main">Impersonation</strong>
          </div>
        </div>

        {/* Indicator 4: IV4 Online Scams & Malicious Links */}
        <div className="hero-floating-glass-chip chip-threat-iv4">
          <div className="chip-icon-circle cyan">
            <Link2 size={15} className="text-cyan" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">IV4 · 5 CHALLENGES</span>
            <strong className="chip-main">Scams &amp; Links</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
