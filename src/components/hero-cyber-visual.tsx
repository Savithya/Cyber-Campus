"use client";

import React from "react";
import { ShieldCheck, Layers, Lock } from "lucide-react";

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
          <source srcSet="/images/professional-cyber-lab.png" type="image/png" />
          <img
            src="/images/professional-cyber-lab.jpg"
            alt="Futuristic Academic Cybersecurity Research Laboratory — Digital Privacy Shield and Threat Telemetry"
            className="hero-full-cyber-image"
            width={1376}
            height={768}
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

        {/* Discreet Live Telemetry Badge (Top-Left) */}
        <div className="hero-live-beacon-pill" aria-hidden="true">
          <span className="live-pulse-emerald" />
          <span>CYBER THREAT LAB · SRI LANKA</span>
        </div>

        {/* Floating Holographic Glass Chip 1 (Top-Right) */}
        <div className="hero-floating-glass-chip top-right">
          <div className="chip-icon-circle cyan">
            <ShieldCheck size={16} className="text-cyan" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">DEPENDENT VARIABLE (DV)</span>
            <strong className="chip-main">User Privacy Protected</strong>
          </div>
        </div>

        {/* Floating Holographic Glass Chip 2 (Bottom-Left) */}
        <div className="hero-floating-glass-chip bottom-left">
          <div className="chip-icon-circle purple">
            <Layers size={16} className="text-purple" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">EMPIRICAL SCOPE</span>
            <strong className="chip-main">4 Threats · 20 Challenges</strong>
          </div>
        </div>

        {/* Subtle Bottom Trust Badges (Bottom-Right) */}
        <div className="hero-floating-glass-chip bottom-right">
          <div className="chip-icon-circle emerald">
            <Lock size={15} className="text-emerald" aria-hidden="true" />
          </div>
          <div className="chip-text-content">
            <span className="chip-sup">RESEARCH PROTOCOL</span>
            <strong className="chip-main">100% Anonymous &amp; Safe</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
