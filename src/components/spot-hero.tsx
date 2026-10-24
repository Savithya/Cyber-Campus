"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  ArrowRight,
  Mail,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Info,
  CheckCircle2,
} from "lucide-react";

interface ThreatExample {
  id: "all" | "phishing" | "pretexting" | "impersonation" | "links";
  iv: string;
  name: string;
  sender: string;
  senderRole: string;
  subject: string;
  teaser: string;
  redFlag: string;
}

const THREAT_EXAMPLES: ThreatExample[] = [
  {
    id: "all",
    iv: "IV1–IV4",
    name: "Overview",
    sender: "Student Services",
    senderRole: "to: you · Research simulation",
    subject: "You've got a new message.",
    teaser: "Some messages are routine. Others deserve a second look.",
    redFlag: "4 threat categories tested: Phishing, Pretexting, Impersonation & Scams.",
  },
  {
    id: "phishing",
    iv: "IV1",
    name: "Phishing",
    sender: "Campus IT Webmail Desk",
    senderRole: "to: you · Research simulation",
    subject: "Urgent LMS Account Verification",
    teaser: "Your university account will be locked in 2 hours. Confirm your password now.",
    redFlag: "Red Flag: Artificial 2-hour deadline & lookalike verification link.",
  },
  {
    id: "pretexting",
    iv: "IV2",
    name: "Pretexting",
    sender: "Exam Database Support",
    senderRole: "to: you · Research simulation",
    subject: "Critical Server Registration Failure",
    teaser: "We detected an emergency database error. Share your SMS OTP to restore subjects.",
    redFlag: "Red Flag: University staff never ask for private 2FA codes or SMS OTPs.",
  },
  {
    id: "impersonation",
    iv: "IV3",
    name: "Impersonation",
    sender: "Prof. K. L. Wickramasinghe",
    senderRole: "to: you · Research simulation",
    subject: "Department Committee Badges",
    teaser: "I am stuck in a board meeting. Could you transfer Rs. 5,000 for symposium badges?",
    redFlag: "Red Flag: Fake profile with 0 mutuals demanding direct personal money transfers.",
  },
  {
    id: "links",
    iv: "IV4",
    name: "Scams & Links",
    sender: "Campus Tech Grant Scheme",
    senderRole: "to: you · Research simulation",
    subject: "85% Student Laptop Subsidy",
    teaser: "Exclusive student subsidy! First 20 applicants only. Pay shipping fee immediately.",
    redFlag: "Red Flag: Advance-fee scam exploiting student discounts with unverified links.",
  },
];

export function SpotHero() {
  const [selectedThreat, setSelectedThreat] = useState<ThreatExample["id"]>("all");
  const [showClue, setShowClue] = useState<boolean>(false);

  const activeExample =
    THREAT_EXAMPLES.find((t) => t.id === selectedThreat) || THREAT_EXAMPLES[0];

  const handleSelectThreat = (id: ThreatExample["id"]) => {
    setSelectedThreat(id);
    setShowClue(false);
  };

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

        {/* Right Column: User-Friendly Interactive Mockup Card */}
        <div className="spot-hero-visual">
          {/* Subtle Sparkle Accent */}
          <div className="spot-sparkle spot-sparkle-top" aria-hidden="true">
            <Sparkles size={22} />
          </div>

          {/* Top Floating Badge */}
          <div className="spot-floating-top-pill">
            <span className="spot-pill-icon" aria-hidden="true">🔍</span>
            <div className="spot-pill-text">
              <strong>Look a little closer</strong>
              <small>Your next mission awaits</small>
            </div>
          </div>

          {/* The Challenge Inbox Preview Card */}
          <div className="spot-inbox-card">
            {/* Inbox Top Bar */}
            <div className="spot-inbox-header">
              <div className="spot-inbox-header-title">
                <Mail size={15} aria-hidden="true" className="spot-inbox-mail-icon" />
                <span>YOUR CHALLENGE INBOX</span>
              </div>
              <div className="spot-inbox-counter">
                <span>Simulation Ready</span>
              </div>
            </div>

            {/* Interactive Threat Selector Pills (User-Friendly & Clean) */}
            <div
              className="spot-threat-pills-bar"
              role="tablist"
              aria-label="Choose threat variable preview"
            >
              {THREAT_EXAMPLES.map((example) => {
                const isActive = selectedThreat === example.id;
                return (
                  <button
                    key={example.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectThreat(example.id)}
                    className={`spot-threat-pill ${isActive ? "active" : ""}`}
                    title={`Preview ${example.name} scenario`}
                  >
                    <span className="spot-pill-name">{example.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Inside Message Mockup */}
            <div className="spot-inbox-message">
              {/* Sender Info Row */}
              <div className="spot-msg-sender-row">
                <div className="spot-msg-avatar">
                  <GraduationCap size={17} aria-hidden="true" />
                </div>
                <div className="spot-msg-meta">
                  <span className="spot-msg-sender">{activeExample.sender}</span>
                  <span className="spot-msg-dest">{activeExample.senderRole}</span>
                </div>
                <span className="spot-msg-time">Now</span>
              </div>

              {/* Message Content */}
              <div className="spot-msg-body">
                <h3 className="spot-msg-subject">{activeExample.subject}</h3>
                <p className="spot-msg-snippet">{activeExample.teaser}</p>
              </div>

              {/* User-Friendly "Spot Red Flag" Clue Toggle */}
              {selectedThreat !== "all" && (
                <div className="spot-clue-container">
                  <button
                    type="button"
                    onClick={() => setShowClue(!showClue)}
                    className={`spot-clue-toggle ${showClue ? "active" : ""}`}
                    aria-expanded={showClue}
                  >
                    <Info size={13} aria-hidden="true" />
                    <span>{showClue ? "Hide Red Flag" : "💡 Spot the Trap"}</span>
                  </button>

                  {showClue && (
                    <div className="spot-clue-box animate-fadeIn">
                      <p>{activeExample.redFlag}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button: What would you do? */}
              <div className="spot-msg-action">
                <Link
                  href="/consent"
                  prefetch={true}
                  className="spot-msg-cta"
                  aria-label="What would you do? Start Challenge"
                >
                  <span>What would you do?</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {/* Card Footer Counter */}
              <div className="spot-inbox-footer">
                <span className="spot-footer-dot" aria-hidden="true" />
                <span>20 interactive fictional scenarios · 4 threat categories</span>
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
