"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

export function ResearchTitleIllustration() {
  const shouldReduceMotion = useReducedMotion();

  // Subtle floating animation for illustration
  const floatAnim = shouldReduceMotion
    ? {}
    : {
        y: [-3, 3, -3],
        transition: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const pulseAnim = shouldReduceMotion
    ? {}
    : {
        opacity: [0.35, 0.8, 0.35],
        scale: [0.98, 1.02, 0.98],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div className="research-title-illus-wrap" aria-hidden="true">
      <motion.svg
        viewBox="0 0 440 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="research-title-illus-svg"
        animate={floatAnim}
      >
        <defs>
          {/* Primary Gradients */}
          <linearGradient id="rtShieldGrad" x1="180" y1="20" x2="260" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="50%" stopColor="#7c6cfc" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="rtShieldFill" x1="220" y1="25" x2="220" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="rtLineGrad" x1="0" y1="90" x2="440" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#7c6cfc" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#7c6cfc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="rtGlowGrad" x1="220" y1="40" x2="220" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c6cfc" stopOpacity="0.05" />
          </linearGradient>

          <filter id="rtGlowFilter" x="160" y="10" width="120" height="160" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Network Grid Lines & Coordinates */}
        <g opacity="0.45" stroke="var(--border)" strokeWidth="0.75" strokeDasharray="3 3">
          <line x1="20" y1="40" x2="420" y2="40" />
          <line x1="20" y1="90" x2="420" y2="90" />
          <line x1="20" y1="140" x2="420" y2="140" />
          <line x1="80" y1="15" x2="80" y2="165" />
          <line x1="150" y1="15" x2="150" y2="165" />
          <line x1="290" y1="15" x2="290" y2="165" />
          <line x1="360" y1="15" x2="360" y2="165" />
        </g>

        {/* Abstract Cybersecurity Connection Paths */}
        <path
          d="M 40 90 H 120 L 150 55 H 190"
          stroke="url(#rtLineGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 400 90 H 320 L 290 125 H 250"
          stroke="url(#rtLineGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 120 90 L 150 125 H 190"
          stroke="url(#rtLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 320 90 L 290 55 H 250"
          stroke="url(#rtLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Ambient Glow behind shield */}
        <motion.ellipse
          cx="220"
          cy="90"
          rx="50"
          ry="60"
          fill="url(#rtGlowGrad)"
          animate={pulseAnim}
        />

        {/* Central Shield: Digital Security Emblem */}
        <g filter="url(#rtGlowFilter)">
          {/* Outer Shield Border */}
          <path
            d="M 220 30 L 260 48 V 95 C 260 122 242 142 220 150 C 198 142 180 122 180 95 V 48 Z"
            fill="url(#rtShieldFill)"
            stroke="url(#rtShieldGrad)"
            strokeWidth="2.2"
          />

          {/* Inner Accent Line */}
          <path
            d="M 220 38 L 252 53 V 93 C 252 116 238 133 220 140 C 202 133 188 116 188 93 V 53 Z"
            fill="none"
            stroke="#7c6cfc"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* Shield Core: Padlock / Privacy Core */}
          <rect
            x="210"
            y="85"
            width="20"
            height="18"
            rx="3"
            fill="#00f2fe"
            fillOpacity="0.9"
          />
          <path
            d="M 214 85 V 77 C 214 73.7 216.7 71 220 71 C 223.3 71 226 73.7 226 77 V 85"
            stroke="#00f2fe"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="220" cy="93" r="2" fill="#0f172a" />
          <path d="M 220 95 V 99" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Left Side: University Research Symbol (Graduation Cap Node) */}
        <g transform="translate(60, 45)">
          <circle cx="20" cy="20" r="18" fill="var(--card-bg)" stroke="#7c6cfc" strokeWidth="1.5" />
          {/* Academic Cap Icon */}
          <path
            d="M 20 11 L 30 16 L 20 21 L 10 16 Z"
            fill="#7c6cfc"
          />
          <path
            d="M 13 18 V 23.5 C 13 25.5 16 27.5 20 27.5 C 24 27.5 27 25.5 27 23.5 V 18"
            stroke="#7c6cfc"
            strokeWidth="1.3"
            fill="none"
          />
          <line x1="30" y1="16" x2="30" y2="24" stroke="#00f2fe" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Left Side Lower: Threat Awareness Node */}
        <g transform="translate(100, 105)">
          <circle cx="16" cy="16" r="14" fill="var(--card-bg)" stroke="#00f2fe" strokeWidth="1.5" />
          {/* Eye / Radar Icon */}
          <path
            d="M 10 16 C 12 12.5 14 11 16 11 C 18 11 20 12.5 22 16 C 20 19.5 18 21 16 21 C 14 21 12 19.5 10 16 Z"
            stroke="#00f2fe"
            strokeWidth="1.3"
            fill="none"
          />
          <circle cx="16" cy="16" r="2.2" fill="#00f2fe" />
        </g>

        {/* Right Side Upper: Privacy Shield Node */}
        <g transform="translate(340, 45)">
          <circle cx="20" cy="20" r="18" fill="var(--card-bg)" stroke="#10b981" strokeWidth="1.5" />
          {/* Shield Check Icon */}
          <path
            d="M 20 12 L 27 15 V 20 C 27 23.5 24 26 20 27.5 C 16 26 13 23.5 13 20 V 15 Z"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.4"
          />
          <path
            d="M 17.5 19.5 L 19.2 21.2 L 23 17"
            stroke="#10b981"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Right Side Lower: Secure Key / Token Node */}
        <g transform="translate(305, 105)">
          <circle cx="16" cy="16" r="14" fill="var(--card-bg)" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Key Icon */}
          <circle cx="14" cy="16" r="3.5" stroke="#38bdf8" strokeWidth="1.3" fill="none" />
          <path d="M 17.5 16 H 22.5 M 20.5 16 V 18 M 22.5 16 V 18" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        {/* Data Packet Pulse Dots */}
        <circle cx="150" cy="55" r="3" fill="#00f2fe" />
        <circle cx="290" cy="55" r="3" fill="#7c6cfc" />
        <circle cx="150" cy="125" r="3" fill="#7c6cfc" />
        <circle cx="290" cy="125" r="3" fill="#00f2fe" />
      </motion.svg>
    </div>
  );
}
