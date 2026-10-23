"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Key,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Radio,
} from "lucide-react";

export function ResearchCyberIllustration() {
  const shouldReduceMotion = useReducedMotion();

  // Floating animation variants for the HUD chips
  const chipFloatTL = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [-4, 4, -4],
          x: [-2, 2, -2],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  const chipFloatTR = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [4, -4, 4],
          x: [2, -2, 2],
          transition: {
            duration: 5.6,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  const chipFloatBL = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [3, -5, 3],
          x: [-1, 2, -1],
          transition: {
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  const chipFloatBR = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [-5, 3, -5],
          x: [2, -1, 2],
          transition: {
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  return (
    <div className="cyber-illustration-wrapper" aria-hidden="true">
      {/* Background ambient radial glows */}
      <div className="cyber-glow-orb glow-cyan" />
      <div className="cyber-glow-orb glow-purple" />
      <div className="cyber-glow-orb glow-blue" />

      {/* Main Animated Visual Stage */}
      <div className="cyber-stage-container">
        {/* Glassmorphic Frame with Glowing Border */}
        <div className="cyber-image-frame">
          {/* High-Resolution 3D Cybersecurity Shield Artwork */}
          <picture>
            <source srcSet="/images/cyber-privacy-shield-hero.webp" type="image/webp" />
            <source srcSet="/images/cyber-privacy-shield-hero.png" type="image/png" />
            <img
              src="/images/cyber-privacy-shield-hero.jpg"
              alt="Futuristic 3D Cybersecurity Shield & Cryptographic Privacy Core for Academic Research"
              className="cyber-hero-image"
              width={1280}
              height={720}
              loading="eager"
            />
          </picture>

          {/* Animated Cyber Laser Scanner Beam */}
          {!shouldReduceMotion && (
            <div className="cyber-laser-scanner" aria-hidden="true">
              <div className="laser-beam-line" />
              <div className="laser-beam-glow" />
            </div>
          )}

          {/* Holographic Radial Grid Light Accent */}
          <div className="cyber-holographic-overlay" aria-hidden="true" />

          {/* Central Cryptographic Lock Aura Pulse */}
          {!shouldReduceMotion && (
            <div className="central-crypto-aura" aria-hidden="true" />
          )}

          {/* Live Telemetry Beacon Pill (Top-Center) */}
          <div className="cyber-live-beacon">
            <Radio size={13} className="text-emerald-400 animate-pulse" />
            <span className="live-pulse-dot" />
            <span>CYBER PRIVACY LAB · LIVE TELEMETRY</span>
          </div>

          {/* Floating Holographic Cyber Badge 1: User Privacy DV (Top-Left) */}
          <motion.div
            className="hologram-chip chip-top-left"
            variants={chipFloatTL}
            animate="animate"
          >
            <div className="chip-icon-box cyan-glow">
              <ShieldCheck size={18} className="text-cyan-400" />
            </div>
            <div className="chip-content">
              <span className="chip-label">DEPENDENT VARIABLE (DV)</span>
              <strong className="chip-title">User Privacy Sovereignty</strong>
            </div>
            <span className="chip-status-dot active" />
          </motion.div>

          {/* Floating Holographic Cyber Badge 2: Threat Mitigation (Top-Right) */}
          <motion.div
            className="hologram-chip chip-top-right"
            variants={chipFloatTR}
            animate="animate"
          >
            <div className="chip-icon-box blue-glow">
              <ShieldAlert size={18} className="text-blue-400" />
            </div>
            <div className="chip-content">
              <span className="chip-label">FOCUS DIMENSIONS</span>
              <strong className="chip-title">4 Threat Vectors Active</strong>
            </div>
            <span className="chip-status-dot active" />
          </motion.div>

          {/* Floating Holographic Cyber Badge 3: Anonymous Token (Bottom-Left) */}
          <motion.div
            className="hologram-chip chip-bottom-left"
            variants={chipFloatBL}
            animate="animate"
          >
            <div className="chip-icon-box purple-glow">
              <Key size={18} className="text-purple-400" />
            </div>
            <div className="chip-content">
              <span className="chip-label">RESEARCH ETHICS</span>
              <strong className="chip-title">Anonymous Session Token</strong>
            </div>
            <span className="chip-status-dot active" />
          </motion.div>

          {/* Floating Holographic Cyber Badge 4: Zero PII (Bottom-Right) */}
          <motion.div
            className="hologram-chip chip-bottom-right"
            variants={chipFloatBR}
            animate="animate"
          >
            <div className="chip-icon-box green-glow">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="chip-content">
              <span className="chip-label">ACADEMIC STANDARDS</span>
              <strong className="chip-title">Zero PII Collected</strong>
            </div>
            <span className="chip-status-dot active" />
          </motion.div>

          {/* Bottom Campus Research Accreditation Badge */}
          <div className="cyber-campus-badge">
            <Sparkles size={13} className="text-cyan-300" />
            <span>Sri Lanka Higher Education · Computing Research Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
}
