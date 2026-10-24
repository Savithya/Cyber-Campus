"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Shield,
  ArrowRight,
  Target,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface ResearchVariable {
  iv: string;
  name: string;
  subtitle: string;
  threatTarget: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  mechanism: string;
  privacyImpact: string;
  sampleIndicator: string;
}

const VARIABLES: ResearchVariable[] = [
  {
    iv: "IV1",
    name: "Phishing",
    subtitle: "Urgency & Domain Spoofing",
    threatTarget: "LMS & Student Portal Logins",
    icon: Mail,
    accentColor: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50/70 dark:bg-blue-950/30",
    borderLight: "border-blue-200/80 dark:border-blue-900/50",
    mechanism:
      "Deceptive campus webmails using artificial 2-hour deadlines and lookalike domain URLs.",
    privacyImpact:
      "Compromises student credentials, leading to unauthorized access to grades and private academic records.",
    sampleIndicator: "Lookalike domains like @campus-portal-verify.example",
  },
  {
    iv: "IV2",
    name: "Pretexting",
    subtitle: "Fabricated Crisis Scenarios",
    threatTarget: "2FA Codes & Phone OTPs",
    icon: MessagesSquare,
    accentColor: "text-teal-600 dark:text-teal-400",
    bgLight: "bg-teal-50/70 dark:bg-teal-950/30",
    borderLight: "border-teal-200/80 dark:border-teal-900/50",
    mechanism:
      "Deceptive IT personas inventing emergency server collapses to extract one-time verification passcodes.",
    privacyImpact:
      "Bypasses two-factor security, exposing personal phone numbers and student identity verification.",
    sampleIndicator: "Urgent chat messages claiming emergency server failures",
  },
  {
    iv: "IV3",
    name: "Impersonation",
    subtitle: "Authority & Social Trust",
    threatTarget: "Personal Funds & Contact Lists",
    icon: UserRoundSearch,
    accentColor: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50/70 dark:bg-indigo-950/30",
    borderLight: "border-indigo-200/80 dark:border-indigo-900/50",
    mechanism:
      "Duplicate social profiles mimicking professors or student council officers demanding sudden assistance.",
    privacyImpact:
      "Exploits academic deference, extracting private banking numbers and personal contact channels.",
    sampleIndicator: "New social profiles with zero campus mutual connections",
  },
  {
    iv: "IV4",
    name: "Online Scams & Malicious Links",
    subtitle: "Fake Grants & Typosquatting",
    threatTarget: "Device Integrity & Payment Info",
    icon: Link2,
    accentColor: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50/70 dark:bg-amber-950/30",
    borderLight: "border-amber-200/80 dark:border-amber-900/50",
    mechanism:
      "Fake 85% laptop subsidies, misleading survey URLs, and disguised malware attachments.",
    privacyImpact:
      "Triggers unauthorized financial transactions and exposes local device storage to tracking payloads.",
    sampleIndicator: "Too-good-to-be-true subsidies requiring upfront deposits",
  },
];

export function SpotResearchVariables() {
  const [activeTab, setActiveTab] = useState<string>("IV1");

  const currentVar = VARIABLES.find((v) => v.iv === activeTab) || VARIABLES[0];
  const Icon = currentVar.icon;

  return (
    <section id="variables" className="spot-variables-section" aria-label="Research Variables">
      <div className="spot-variables-container">
        {/* Section Header */}
        <div className="spot-variables-header">
          <div className="spot-variables-badge">
            <span>RESEARCH VARIABLES (IV1–IV4)</span>
          </div>
          <h2 className="spot-variables-title">
            Four Threat Vectors. One Privacy Shield.
          </h2>
          <p className="spot-variables-desc">
            Empirical investigation of how four distinct social engineering
            threats impact user privacy behaviors among university students in
            Sri Lanka.
          </p>
        </div>

        {/* 4 Interactive Variable Tabs */}
        <div className="spot-var-tabs" role="tablist" aria-label="Threat variables">
          {VARIABLES.map((v) => {
            const VIcon = v.icon;
            const isActive = activeTab === v.iv;
            return (
              <button
                key={v.iv}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(v.iv)}
                className={`spot-var-tab ${isActive ? "active" : ""}`}
              >
                <div className={`spot-var-tab-icon ${v.accentColor}`}>
                  <VIcon size={18} aria-hidden="true" />
                </div>
                <div className="spot-var-tab-text">
                  <span className="spot-var-tab-iv">{v.iv}</span>
                  <strong className="spot-var-tab-name">{v.name}</strong>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Variable Highlight Panel */}
        <div className="spot-var-panel">
          <div className="spot-var-panel-grid">
            {/* Left side: Threat Anatomy */}
            <div className="spot-var-panel-left">
              <div className="spot-var-panel-heading-row">
                <div className={`spot-var-badge-icon ${currentVar.bgLight} ${currentVar.borderLight} ${currentVar.accentColor}`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <div className="spot-var-kicker">
                    {currentVar.iv} · 5 INTERACTIVE CHALLENGES
                  </div>
                  <h3 className="spot-var-name">{currentVar.name}</h3>
                </div>
              </div>

              <div className="spot-var-detail-row mt-4">
                <div className="spot-var-detail-item">
                  <div className="spot-detail-label">
                    <Target size={14} className="text-muted" aria-hidden="true" />
                    <span>Target Asset:</span>
                  </div>
                  <p className="spot-detail-text font-semibold">
                    {currentVar.threatTarget}
                  </p>
                </div>

                <div className="spot-var-detail-item mt-3">
                  <div className="spot-detail-label">
                    <AlertTriangle size={14} className="text-amber-500" aria-hidden="true" />
                    <span>Threat Mechanism:</span>
                  </div>
                  <p className="spot-detail-text">{currentVar.mechanism}</p>
                </div>
              </div>
            </div>

            {/* Right side: Privacy Impact (DV) */}
            <div className="spot-var-panel-right">
              <div className="spot-dv-card">
                <div className="spot-dv-header">
                  <div className="spot-dv-icon-wrap">
                    <Shield size={16} aria-hidden="true" />
                  </div>
                  <span className="spot-dv-badge">
                    DEPENDENT VARIABLE (DV) IMPACT
                  </span>
                </div>
                <h4 className="spot-dv-title">User Privacy Risk</h4>
                <p className="spot-dv-desc">{currentVar.privacyImpact}</p>

                <div className="spot-dv-sample">
                  <strong>Key Red Flag:</strong> {currentVar.sampleIndicator}
                </div>

                <div className="spot-dv-action mt-4">
                  <Link
                    href="/consent"
                    prefetch={true}
                    className="spot-dv-cta"
                    aria-label={`Test your instincts on ${currentVar.name}`}
                  >
                    <span>Test your instincts on {currentVar.iv}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
