"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Radio,
  FileCheck2,
} from "lucide-react";

interface ThreatSignal {
  id: string;
  name: string;
  category: string;
  iv: string;
  riskLevel: "Critical" | "High" | "Moderate";
  indicator: string;
  status: "Flagged" | "Analyzed" | "Simulated";
  icon: typeof Mail;
}

const SIGNALS: ThreatSignal[] = [
  {
    id: "sig-phish",
    name: "Urgent LMS Deactivation Email",
    category: "Phishing",
    iv: "IV1",
    riskLevel: "Critical",
    indicator: "Lookalike university portal domain & spoofed envelope",
    status: "Flagged",
    icon: Mail,
  },
  {
    id: "sig-pretext",
    name: "IT Support Password Reset Request",
    category: "Pretexting",
    iv: "IV2",
    riskLevel: "High",
    indicator: "Urgent authority pretext requesting emergency credentials",
    status: "Analyzed",
    icon: MessagesSquare,
  },
  {
    id: "sig-imperson",
    name: "Impersonated Faculty Profile",
    category: "Impersonation",
    iv: "IV3",
    riskLevel: "High",
    indicator: "Faculty head duplicate social profile requesting research data",
    status: "Flagged",
    icon: UserRoundSearch,
  },
  {
    id: "sig-scam",
    name: "Counterfeit Laptop Discount Link",
    category: "Scams & Links",
    iv: "IV4",
    riskLevel: "Critical",
    indicator: "Deceptive advance-fee voucher with synthetic gateway",
    status: "Simulated",
    icon: Link2,
  },
];

export function HeroCyberVisual() {
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);
  const activeSignal = SIGNALS[activeSignalIndex];
  const Icon = activeSignal.icon;

  return (
    <div
      className="hero-cyber-visual-container"
      role="region"
      aria-label="Interactive Cybersecurity Research Telemetry"
    >
      {/* Background Ambient Glows */}
      <div className="hero-cyber-glow glow-primary" aria-hidden="true" />
      <div className="hero-cyber-glow glow-secondary" aria-hidden="true" />

      {/* Main Glass Simulation Interface */}
      <div className="hero-cyber-card">
        {/* Top Window Bar */}
        <div className="hero-cyber-window-bar">
          <div className="window-dots" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="window-title-badge">
            <Radio size={12} className="text-cyan animate-pulse" aria-hidden="true" />
            <span>Cyber Threat Simulation Hub · Sri Lanka</span>
          </div>
          <span className="window-version-tag">20 Challenges</span>
        </div>

        {/* Central Shield & Threat Telemetry Header */}
        <div className="hero-cyber-center-telemetry">
          <div className="shield-ring-wrapper">
            <div className="shield-glow-ring" aria-hidden="true" />
            <div className="shield-center-circle">
              <ShieldCheck size={40} className="shield-icon" aria-hidden="true" />
            </div>
            <div className="shield-orbital-node node-1" title="IV1: Phishing">
              <Mail size={13} aria-hidden="true" />
            </div>
            <div className="shield-orbital-node node-2" title="IV2: Pretexting">
              <MessagesSquare size={13} aria-hidden="true" />
            </div>
            <div className="shield-orbital-node node-3" title="IV3: Impersonation">
              <UserRoundSearch size={13} aria-hidden="true" />
            </div>
            <div className="shield-orbital-node node-4" title="IV4: Scams & Links">
              <Link2 size={13} aria-hidden="true" />
            </div>
          </div>

          <div className="telemetry-info-text">
            <div className="telemetry-eyebrow">
              <Activity size={13} className="text-emerald" aria-hidden="true" />
              <span>EMPIRICAL THREAT LAB</span>
            </div>
            <h3 className="telemetry-heading">Interactive Threat Simulation</h3>
            <p className="telemetry-sub">
              Evaluating student privacy decisions across 4 social engineering threat vectors.
            </p>
          </div>
        </div>

        {/* Interactive Threat Signal Selector */}
        <div className="hero-signal-selector" role="tablist" aria-label="Simulated Threat Categories">
          {SIGNALS.map((sig, idx) => {
            const isSelected = idx === activeSignalIndex;
            return (
              <button
                key={sig.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`signal-tab-btn ${isSelected ? "selected" : ""}`}
                onClick={() => setActiveSignalIndex(idx)}
              >
                <span className="signal-tab-iv">{sig.iv}</span>
                <span className="signal-tab-name">{sig.category}</span>
              </button>
            );
          })}
        </div>

        {/* Threat Detection Live Detail Box */}
        <div className="hero-signal-detail-box" role="tabpanel">
          <div className="signal-detail-top">
            <div className="signal-header-left">
              <div className="signal-icon-tile">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <span className="signal-category-pill">{activeSignal.category} · {activeSignal.iv}</span>
                <h4 className="signal-title">{activeSignal.name}</h4>
              </div>
            </div>
            <span className={`signal-risk-badge risk-${activeSignal.riskLevel.toLowerCase()}`}>
              <AlertTriangle size={12} aria-hidden="true" />
              <span>{activeSignal.riskLevel} Risk</span>
            </span>
          </div>

          <div className="signal-indicator-row">
            <span className="indicator-label">Detection Marker:</span>
            <span className="indicator-value">{activeSignal.indicator}</span>
          </div>

          <div className="signal-bottom-row">
            <div className="signal-status-pill">
              <span className="status-dot green" aria-hidden="true" />
              <span>Scenario Evaluated: 1 of 5 in module</span>
            </div>
            <span className="signal-dv-tag">DV: User Privacy Shielded</span>
          </div>
        </div>

        {/* Floating Privacy Trust Indicator */}
        <div className="hero-cyber-footer-stats">
          <div className="stat-pill">
            <Lock size={13} className="text-primary" aria-hidden="true" />
            <span>No real passwords required</span>
          </div>
          <div className="stat-pill">
            <FileCheck2 size={13} className="text-emerald" aria-hidden="true" />
            <span>Academic Research Data Isolated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
