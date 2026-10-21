"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  AlertTriangle,
  Activity,
  FileCheck2,
  Sparkles,
  Layers,
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
  scenarioBrief: string;
}

const SIGNALS: ThreatSignal[] = [
  {
    id: "sig-phish",
    name: "Urgent LMS Deactivation Notice",
    category: "Phishing",
    iv: "IV1",
    riskLevel: "Critical",
    indicator: "Lookalike university portal domain & spoofed envelope",
    status: "Flagged",
    icon: Mail,
    scenarioBrief: "Deceptive credential harvesting attempt mimicking the official student learning portal.",
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
    scenarioBrief: "Social engineering persona claiming urgent security maintenance to acquire user login data.",
  },
  {
    id: "sig-imperson",
    name: "Duplicate Faculty Social Profile",
    category: "Impersonation",
    iv: "IV3",
    riskLevel: "High",
    indicator: "Fabricated department head profile soliciting student survey files",
    status: "Flagged",
    icon: UserRoundSearch,
    scenarioBrief: "Synthetic identity masquerading as academic staff to harvest confidential research files.",
  },
  {
    id: "sig-scam",
    name: "Counterfeit Laptop Discount Link",
    category: "Scams & Links",
    iv: "IV4",
    riskLevel: "Critical",
    indicator: "Deceptive advance-fee voucher URL with synthetic gateway",
    status: "Simulated",
    icon: Link2,
    scenarioBrief: "Malicious web trap exploiting student budget discounts to harvest payment information.",
  },
];

export function HeroCyberVisual() {
  const [activeTab, setActiveTab] = useState<"lab" | "telemetry">("lab");
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through threat telemetry every 4.5s when not paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSignalIndex((prev) => (prev + 1) % SIGNALS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeSignal = SIGNALS[activeSignalIndex];
  const Icon = activeSignal.icon;

  return (
    <div
      className="hero-cyber-visual-container"
      role="region"
      aria-label="Interactive Cybersecurity Research Animation and Telemetry"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
            <span className="live-simulation-beacon" aria-hidden="true" />
            <span className="window-title-text">Cyber Threat Lab · Sri Lanka</span>
          </div>

          {/* Mode View Switcher */}
          <div className="window-view-switcher" role="tablist" aria-label="Visual Mode">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "lab"}
              className={`view-switch-btn ${activeTab === "lab" ? "active" : ""}`}
              onClick={() => setActiveTab("lab")}
              title="3D Cyber Lab Animation"
            >
              <Sparkles size={12} aria-hidden="true" />
              <span>3D Lab Animation</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "telemetry"}
              className={`view-switch-btn ${activeTab === "telemetry" ? "active" : ""}`}
              onClick={() => setActiveTab("telemetry")}
              title="Interactive Threat Telemetry"
            >
              <Activity size={12} aria-hidden="true" />
              <span>Live Telemetry</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: 3D CYBER LAB ANIMATION (PROFESSIONAL ANIMATED VISUAL)
            ========================================================================= */}
        {activeTab === "lab" && (
          <div className="hero-lab-animation-stage" tabIndex={0} aria-label="3D Cybersecurity Simulation Stage">
            {/* Base Futuristic 3D Lab Rendering */}
            <div className="hero-lab-image-wrapper">
              <picture>
                <source srcSet="/images/professional-cyber-lab.png" type="image/png" />
                <img
                  src="/images/professional-cyber-lab.jpg"
                  alt="Futuristic Academic Cybersecurity Research Laboratory with Digital Privacy Shield and Threat Telemetry"
                  className="hero-lab-img"
                  width={1376}
                  height={768}
                  loading="eager"
                />
              </picture>

              {/* Animated Laser Scanning Beam */}
              <div className="cyber-laser-scanner" aria-hidden="true">
                <div className="laser-beam-line" />
                <div className="laser-beam-glow" />
              </div>

              {/* Holographic Radial Grid Overlay */}
              <div className="cyber-holographic-overlay" aria-hidden="true" />

              {/* Interactive Threat Beacon Pins pinned on the 3D scene */}
              <div className="scene-threat-pin pin-phishing" title="IV1: Phishing Vector">
                <div className="pin-pulse purple" />
                <div className="pin-badge">IV1 Phishing</div>
              </div>

              <div className="scene-threat-pin pin-pretext" title="IV2: Pretexting Vector">
                <div className="pin-pulse cyan" />
                <div className="pin-badge">IV2 Pretexting</div>
              </div>

              <div className="scene-threat-pin pin-imperson" title="IV3: Impersonation Vector">
                <div className="pin-pulse amber" />
                <div className="pin-badge">IV3 Impersonation</div>
              </div>

              <div className="scene-threat-pin pin-scam" title="IV4: Malicious Links Vector">
                <div className="pin-pulse emerald" />
                <div className="pin-badge">IV4 Malicious Links</div>
              </div>

              {/* Central Shield HUD Reticle */}
              <div className="center-shield-reticle" aria-hidden="true">
                <div className="reticle-ring ring-outer" />
                <div className="reticle-ring ring-inner" />
                <div className="reticle-center">
                  <ShieldCheck size={18} className="text-cyan animate-pulse" />
                </div>
                <div className="reticle-status-tag">DV: PRIVACY SHIELD 100%</div>
              </div>

              {/* Floating Holographic Glass Badges */}
              <div className="hero-floating-glass-chip top-right">
                <div className="chip-icon-circle cyan">
                  <ShieldCheck size={14} className="text-cyan" aria-hidden="true" />
                </div>
                <div className="chip-text-content">
                  <span className="chip-sup">DEPENDENT VARIABLE (DV)</span>
                  <strong className="chip-main">User Privacy Protected</strong>
                </div>
              </div>

              <div className="hero-floating-glass-chip bottom-left">
                <div className="chip-icon-circle purple">
                  <Layers size={14} className="text-purple" aria-hidden="true" />
                </div>
                <div className="chip-text-content">
                  <span className="chip-sup">EMPIRICAL SCOPE</span>
                  <strong className="chip-main">4 Threats · 20 Challenges</strong>
                </div>
              </div>
            </div>

            {/* Bottom Real-time Telemetry Strip */}
            <div className="lab-telemetry-status-strip">
              <div className="telemetry-chip">
                <span className="telemetry-live-dot" aria-hidden="true" />
                <span>SANDBOX: 100% SAFE</span>
              </div>
              <div className="telemetry-chip">
                <Lock size={11} className="text-cyan" aria-hidden="true" />
                <span>ZERO PASSWORDS REQUIRED</span>
              </div>
              <div className="telemetry-chip hidden-xs">
                <Activity size={11} className="text-emerald" aria-hidden="true" />
                <span>LATENCY: 12ms</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: LIVE THREAT TELEMETRY RADAR & SCENARIO INSPECTOR
            ========================================================================= */}
        {activeTab === "telemetry" && (
          <div className="hero-telemetry-radar-stage">
            {/* Central Shield & Animated Radar Telemetry Header */}
            <div className="hero-cyber-center-telemetry">
              <div className="shield-ring-wrapper" aria-hidden="true">
                {/* Rotating Conic Radar Sweep */}
                <div className="radar-sweep-beam" />
                <div className="shield-glow-ring" />
                <div className="shield-center-circle">
                  <ShieldCheck size={36} className="shield-icon" />
                </div>

                {/* 4 Orbiting Threat Nodes */}
                <div
                  className={`shield-orbital-node node-1 ${activeSignalIndex === 0 ? "highlighted" : ""}`}
                  title="IV1: Phishing"
                  onClick={() => setActiveSignalIndex(0)}
                >
                  <Mail size={12} />
                </div>
                <div
                  className={`shield-orbital-node node-2 ${activeSignalIndex === 1 ? "highlighted" : ""}`}
                  title="IV2: Pretexting"
                  onClick={() => setActiveSignalIndex(1)}
                >
                  <MessagesSquare size={12} />
                </div>
                <div
                  className={`shield-orbital-node node-3 ${activeSignalIndex === 2 ? "highlighted" : ""}`}
                  title="IV3: Impersonation"
                  onClick={() => setActiveSignalIndex(2)}
                >
                  <UserRoundSearch size={12} />
                </div>
                <div
                  className={`shield-orbital-node node-4 ${activeSignalIndex === 3 ? "highlighted" : ""}`}
                  title="IV4: Malicious Links"
                  onClick={() => setActiveSignalIndex(3)}
                >
                  <Link2 size={12} />
                </div>
              </div>

              <div className="telemetry-info-text">
                <div className="telemetry-eyebrow">
                  <Activity size={13} className="text-emerald" aria-hidden="true" />
                  <span>EMPIRICAL THREAT LAB · SRI LANKA</span>
                </div>
                <h3 className="telemetry-heading">Interactive Threat Telemetry</h3>
                <p className="telemetry-sub">
                  Investigating student privacy decisions across 4 social engineering vectors.
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
                    {isSelected && (
                      <div className="signal-tab-progress-bar" aria-hidden="true" />
                    )}
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
                    <span className="signal-category-pill">
                      {activeSignal.category} · {activeSignal.iv}
                    </span>
                    <h4 className="signal-title">{activeSignal.name}</h4>
                  </div>
                </div>
                <span className={`signal-risk-badge risk-${activeSignal.riskLevel.toLowerCase()}`}>
                  <AlertTriangle size={12} aria-hidden="true" />
                  <span>{activeSignal.riskLevel} Risk</span>
                </span>
              </div>

              <p className="signal-brief-text">{activeSignal.scenarioBrief}</p>

              <div className="signal-indicator-row">
                <span className="indicator-label">Detection Marker:</span>
                <span className="indicator-value">{activeSignal.indicator}</span>
              </div>

              <div className="signal-bottom-row">
                <div className="signal-status-pill">
                  <span className="status-dot green" aria-hidden="true" />
                  <span>Scenario: 5 Challenges in Module</span>
                </div>
                <span className="signal-dv-tag">DV: User Privacy Shielded</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Privacy Trust Indicator Footer */}
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
