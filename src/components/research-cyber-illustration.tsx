"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  Key,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ResearchCyberIllustration() {
  const shouldReduceMotion = useReducedMotion();

  // Floating animation variant
  const floatVariant = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [-6, 6, -6],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  const chipFloat1 = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [-4, 5, -4],
          x: [-2, 3, -2],
          transition: {
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  const chipFloat2 = {
    animate: shouldReduceMotion
      ? {}
      : {
          y: [5, -5, 5],
          x: [2, -2, 2],
          transition: {
            duration: 5.4,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };

  return (
    <div className="cyber-illustration-wrapper" aria-hidden="true">
      {/* Background ambient radial glow */}
      <div className="cyber-glow-orb glow-cyan" />
      <div className="cyber-glow-orb glow-purple" />
      <div className="cyber-glow-orb glow-blue" />

      {/* Main 3D isometric graphic container */}
      <motion.div
        className="cyber-stage"
        variants={floatVariant}
        animate="animate"
      >
        {/* Isometric SVG Illustration Layer */}
        <svg
          viewBox="0 0 520 460"
          className="cyber-svg-stage"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="shieldGrad" x1="160" y1="80" x2="360" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#7c6cfc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="shieldFill" x1="260" y1="90" x2="260" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="gridGrad" x1="0" y1="0" x2="520" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#7c6cfc" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="beamGrad" x1="260" y1="40" x2="260" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#7c6cfc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7c6cfc" stopOpacity="0" />
            </linearGradient>

            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#7c6cfc" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>

            {/* Hexagon Pattern */}
            <pattern id="hexPattern" width="28" height="48.49" patternUnits="userSpaceOnUse" patternTransform="scale(0.7)">
              <path
                d="M14 0 L28 8.08 L28 24.24 L14 32.32 L0 24.24 L0 8.08 Z M14 48.49 L28 40.41 L28 24.24 L14 16.16 L0 24.24 L0 40.41 Z"
                fill="none"
                stroke="#7c6cfc"
                strokeWidth="0.8"
                strokeOpacity="0.25"
              />
            </pattern>

            {/* Filter for Cyber Glow */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Perspective Ground Grid */}
          <g opacity="0.85">
            {/* Isometric Grid Lines */}
            <path
              d="M60 360 L260 250 L460 360 L260 440 Z"
              fill="url(#gridGrad)"
              stroke="#22324f"
              strokeWidth="1.2"
            />
            <path d="M110 335 L310 225 M160 310 L360 200 M210 285 L410 175" stroke="#7c6cfc" strokeWidth="0.8" strokeOpacity="0.2" />
            <path d="M410 335 L210 225 M360 310 L160 200 M310 285 L110 175" stroke="#00f2fe" strokeWidth="0.8" strokeOpacity="0.2" />

            {/* Glowing Ground Rings */}
            <ellipse cx="260" cy="350" rx="160" ry="60" stroke="#7c6cfc" strokeWidth="1.5" strokeDasharray="6 8" strokeOpacity="0.4" />
            <ellipse cx="260" cy="350" rx="110" ry="40" stroke="#00f2fe" strokeWidth="1.8" strokeDasharray="4 6" strokeOpacity="0.6" />
          </g>

          {/* Central Vertical Security Beam */}
          <line x1="260" y1="40" x2="260" y2="350" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="8 6" />

          {/* Ambient Core Glow */}
          <circle cx="260" cy="210" r="140" fill="url(#coreGlow)" />

          {/* 3D Shield Layer - Outer Shadow/Bevel */}
          <path
            d="M260 90 L365 135 C365 240 320 300 260 340 C200 300 155 240 155 135 Z"
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            opacity="0.6"
          />

          {/* 3D Shield Layer - Main Body */}
          <path
            d="M260 95 L360 138 C360 236 316 295 260 335 C204 295 160 236 160 138 Z"
            fill="url(#shieldFill)"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            filter="url(#neonGlow)"
          />

          {/* Hexagonal Mesh Overlay inside Shield */}
          <path
            d="M260 102 L350 142 C350 230 310 285 260 322 C210 285 170 230 170 142 Z"
            fill="url(#hexPattern)"
            opacity="0.8"
          />

          {/* Inner Shield Accent Lines */}
          <path
            d="M260 115 L335 150 C335 220 300 268 260 300 C220 268 185 220 185 150 Z"
            fill="none"
            stroke="#00f2fe"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeOpacity="0.5"
          />

          {/* Center Cryptographic Lock Motif */}
          <g transform="translate(232, 172)">
            {/* Shackle */}
            <path
              d="M16 20 V12 C16 5.37 21.37 0 28 0 C34.63 0 40 5.37 40 12 V20"
              fill="none"
              stroke="#00f2fe"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Lock Body */}
            <rect
              x="6"
              y="20"
              width="44"
              height="36"
              rx="9"
              fill="#0b1329"
              stroke="#7c6cfc"
              strokeWidth="2.5"
            />
            {/* Keyhole */}
            <circle cx="28" cy="34" r="4.5" fill="#00f2fe" />
            <polygon points="26,35 30,35 31,46 25,46" fill="#00f2fe" />
          </g>

          {/* Circuit Connector Traces */}
          <g stroke="#00f2fe" strokeWidth="1.6" opacity="0.65" strokeLinecap="round">
            {/* Left Upper Trace */}
            <path d="M160 150 L105 150 L75 190" />
            <circle cx="75" cy="190" r="4" fill="#00f2fe" />

            {/* Left Lower Trace */}
            <path d="M180 270 L115 270 L85 305" />
            <circle cx="85" cy="305" r="4" fill="#7c6cfc" />

            {/* Right Upper Trace */}
            <path d="M360 150 L415 150 L445 190" />
            <circle cx="445" cy="190" r="4" fill="#00f2fe" />

            {/* Right Lower Trace */}
            <path d="M340 270 L405 270 L435 305" />
            <circle cx="435" cy="305" r="4" fill="#7c6cfc" />
          </g>

          {/* Floating Data Pulses */}
          <circle cx="260" cy="95" r="5" fill="#00f2fe" />
          <circle cx="360" cy="138" r="4" fill="#7c6cfc" />
          <circle cx="160" cy="138" r="4" fill="#7c6cfc" />
          <circle cx="260" cy="335" r="5" fill="#3b82f6" />
        </svg>

        {/* Floating Holographic Cyber Badge 1: User Privacy DV */}
        <motion.div
          className="hologram-chip chip-top-left"
          variants={chipFloat1}
          animate="animate"
        >
          <div className="chip-icon-box cyan-glow">
            <ShieldCheck size={18} className="text-cyan-400" />
          </div>
          <div className="chip-content">
            <span className="chip-label">DEPENDENT VARIABLE</span>
            <strong className="chip-title">User Privacy Protected</strong>
          </div>
          <span className="chip-status-dot active" />
        </motion.div>

        {/* Floating Holographic Cyber Badge 2: 100% Anonymous Token */}
        <motion.div
          className="hologram-chip chip-bottom-left"
          variants={chipFloat2}
          animate="animate"
        >
          <div className="chip-icon-box purple-glow">
            <Key size={18} className="text-purple-400" />
          </div>
          <div className="chip-content">
            <span className="chip-label">DATA ETHICS</span>
            <strong className="chip-title">Anonymous Session Token</strong>
          </div>
          <span className="chip-status-dot active" />
        </motion.div>

        {/* Floating Holographic Cyber Badge 3: Threat Mitigation */}
        <motion.div
          className="hologram-chip chip-top-right"
          variants={chipFloat2}
          animate="animate"
        >
          <div className="chip-icon-box blue-glow">
            <ShieldAlert size={18} className="text-blue-400" />
          </div>
          <div className="chip-content">
            <span className="chip-label">FOCUS DIMENSION</span>
            <strong className="chip-title">Threat Mitigation Active</strong>
          </div>
          <span className="chip-status-dot active" />
        </motion.div>

        {/* Floating Holographic Cyber Badge 4: Zero PII Collected */}
        <motion.div
          className="hologram-chip chip-bottom-right"
          variants={chipFloat1}
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

        {/* Floating Mini Campus Banner */}
        <div className="cyber-campus-badge">
          <Sparkles size={13} className="text-cyan-300" />
          <span>Sri Lanka Higher Education · Computing Research</span>
        </div>
      </motion.div>
    </div>
  );
}
