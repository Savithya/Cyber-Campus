"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  ArrowRight,
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  Check,
  Lock,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ThreatPreview {
  id: "phishing" | "pretexting" | "impersonation" | "links";
  iv: string;
  tabLabel: string;
  sender: string;
  senderRole: string;
  avatarBg: string;
  headline: string;
  snippet: string;
  tag: string;
}

const THREAT_PREVIEWS: ThreatPreview[] = [
  {
    id: "phishing",
    iv: "IV1",
    tabLabel: "Phishing (IV1)",
    sender: "IT Helpdesk",
    senderRole: "to: you · Research simulation",
    avatarBg: "bg-blue-600 text-white",
    headline: "Urgent LMS Account Verification",
    snippet:
      "Your campus portal login will expire in 2 hours due to an unverified security audit. Please confirm your password immediately.",
    tag: "Domain Spoofing & Urgency",
  },
  {
    id: "pretexting",
    iv: "IV2",
    tabLabel: "Pretexting (IV2)",
    sender: "Campus IT Support Assistant",
    senderRole: "to: you · Research simulation",
    avatarBg: "bg-teal-600 text-white",
    headline: "Critical Exam Server Alert",
    snippet:
      "We detected an emergency database error affecting your course registrations. Share your phone SMS OTP so our desk can restore access.",
    tag: "Fabricated Crisis & OTP",
  },
  {
    id: "impersonation",
    iv: "IV3",
    tabLabel: "Impersonation (IV3)",
    sender: "Prof. K. L. Wickramasinghe",
    senderRole: "to: you · Research simulation",
    avatarBg: "bg-indigo-600 text-white",
    headline: "Departmental Committee Notice",
    snippet:
      "I am stuck in an urgent faculty meeting without access to university funds. Could you urgently transfer Rs. 5,000 for student badges?",
    tag: "Authority & Social Trust",
  },
  {
    id: "links",
    iv: "IV4",
    tabLabel: "Scams & Links (IV4)",
    sender: "Campus Laptop Scheme",
    senderRole: "to: you · Research simulation",
    avatarBg: "bg-amber-600 text-white",
    headline: "85% Student Tech Subsidy Won",
    snippet:
      "Exclusive grant for university students in Sri Lanka! Limited to the first 20 applicants. Pay Rs. 2,500 courier deposit right now.",
    tag: "Fake Grants & Typosquatting",
  },
];

export function SpotHero() {
  const [activeThreatId, setActiveThreatId] = useState<ThreatPreview["id"]>("phishing");

  const activeThreat =
    THREAT_PREVIEWS.find((t) => t.id === activeThreatId) || THREAT_PREVIEWS[0];

  return (
    <section className="spot-hero-section" aria-label="Cyber Campus Research Overview">
      <div className="spot-hero-container">
        {/* Left Column: Heading, Subhead, CTA */}
        <div className="spot-hero-content">
          {/* Eyebrow badge */}
          <div className="spot-eyebrow">
            <span className="spot-dot" aria-hidden="true" />
            <span>A little curiosity. A safer campus.</span>
          </div>

          {/* Main Display Brand Title */}
          <div className="spot-brand-title-wrap">
            <h1 className="spot-brand-title">
              Spot the{" "}
              <span className="spot-accent-threat">
                Threat
                <svg
                  className="spot-brush-underline"
                  viewBox="0 0 200 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C50 4 150 2 197 12C160 8 70 7 12 16"
                    stroke="#e08a3c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <span className="spot-subtitle-tag">
              SOCIAL ENGINEERING CHALLENGES
            </span>
          </div>

          {/* Core Question Headline */}
          <h2 className="spot-question-heading">
            Can you spot the signs before your privacy is compromised?
          </h2>

          {/* Research Topic Description */}
          <p className="spot-body-text">
            Real-looking campus messages. Clever social engineering tricks. Can
            you spot the threats? Bring your instincts to an interactive
            research activity exploring the impact of social engineering on user
            privacy among university students in Sri Lanka.
          </p>

          {/* Action Row: Start Challenge Button + Duration */}
          <div className="spot-action-row">
            <Link
              href="/consent"
              prefetch={true}
              className="spot-start-button"
              aria-label="Start Cyber Campus Challenge"
            >
              <span>Start Challenge</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <div className="spot-duration-badge">
              <Clock size={16} aria-hidden="true" />
              <span>Around 12–15 minutes</span>
            </div>
          </div>

          {/* Academic Trust Subtext */}
          <div className="spot-study-note">
            <ShieldCheck size={16} className="spot-study-icon" aria-hidden="true" />
            <span>This activity is part of an academic research study.</span>
          </div>
        </div>

        {/* Right Column: Interactive Mockup Card */}
        <div className="spot-hero-visual">
          {/* Decorative Sparkles */}
          <div className="spot-sparkle spot-sparkle-top" aria-hidden="true">
            <Sparkles size={20} />
          </div>

          {/* Top Floating Pill */}
          <div className="spot-floating-top-pill">
            <span className="spot-pill-icon">🔍</span>
            <div className="spot-pill-text">
              <strong>Look a little closer</strong>
              <small>Your next mission awaits</small>
            </div>
          </div>

          {/* The Challenge Inbox Preview Card */}
          <div className="spot-inbox-card">
            {/* Inbox Header */}
            <div className="spot-inbox-header">
              <div className="spot-inbox-header-title">
                <Mail size={15} aria-hidden="true" />
                <span>YOUR CHALLENGE INBOX</span>
              </div>
              <span className="spot-inbox-counter">
                4 Threat Categories (IV1–IV4)
              </span>
            </div>

            {/* Interactive Threat Variable Tabs Inside Card */}
            <div className="spot-inbox-tabs" role="tablist" aria-label="Select threat variable to preview">
              {THREAT_PREVIEWS.map((threat) => (
                <button
                  key={threat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeThreatId === threat.id}
                  onClick={() => setActiveThreatId(threat.id)}
                  className={`spot-inbox-tab ${
                    activeThreatId === threat.id ? "active" : ""
                  }`}
                >
                  <span className="spot-tab-iv">{threat.iv}</span>
                  <span className="spot-tab-name">
                    {threat.id === "links" ? "Scams" : threat.id}
                  </span>
                </button>
              ))}
            </div>

            {/* Simulated Message Preview Box */}
            <div className="spot-inbox-message">
              {/* Message Header */}
              <div className="spot-msg-sender-row">
                <div className={`spot-msg-avatar ${activeThreat.avatarBg}`}>
                  <GraduationCap size={16} aria-hidden="true" />
                </div>
                <div className="spot-msg-meta">
                  <span className="spot-msg-sender">{activeThreat.sender}</span>
                  <span className="spot-msg-dest">{activeThreat.senderRole}</span>
                </div>
                <span className="spot-msg-time">Now</span>
              </div>

              {/* Message Content */}
              <div className="spot-msg-body">
                <h3 className="spot-msg-subject">{activeThreat.headline}</h3>
                <p className="spot-msg-snippet">{activeThreat.snippet}</p>
                <div className="spot-msg-flag-badge">
                  <span>Category: {activeThreat.tag}</span>
                </div>
              </div>

              {/* Interactive Action Button Inside Card */}
              <div className="spot-msg-action">
                <Link
                  href="/consent"
                  prefetch={true}
                  className="spot-msg-cta"
                  aria-label="What would you do? Start Challenge"
                >
                  <span>What would you do?</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {/* Card Bottom Indicator */}
              <div className="spot-inbox-footer">
                <span className="spot-footer-dot" />
                <span>20 interactive research scenarios</span>
              </div>
            </div>
          </div>

          {/* Floating Safety Badge (Bottom-Right) */}
          <div className="spot-floating-safety-badge">
            <div className="spot-safety-icon-wrap">
              <ShieldCheck size={18} aria-hidden="true" />
            </div>
            <div className="spot-safety-text">
              <strong>Safe space to explore</strong>
              <small>No real attacks. No credentials.</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
