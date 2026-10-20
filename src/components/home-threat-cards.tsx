"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
} from "lucide-react";

interface ThreatCardData {
  id: string;
  iv: string;
  title: string;
  badge: string;
  icon: typeof Mail;
  colorClass: string;
  glowClass: string;
  summary: string;
  exampleSnippet: {
    type: string;
    sender: string;
    content: string;
    suspiciousElement: string;
  };
  keyWarningSign: string;
  safeDecision: string;
}

const THREAT_CARDS: ThreatCardData[] = [
  {
    id: "phishing",
    iv: "IV1",
    title: "Phishing",
    badge: "5 Challenges · IV1",
    icon: Mail,
    colorClass: "purple",
    glowClass: "purple-glow",
    summary:
      "Investigate suspicious emails and messages designed to steal personal information.",
    exampleSnippet: {
      type: "Simulated Email",
      sender: "IT Helpdesk <security@campus-portal-verify.example>",
      content:
        "Your university account will be locked in 2 hours due to an unverified security audit. Click here to confirm your password immediately.",
      suspiciousElement:
        "Urgent 2-hour deadline & lookalike domain name differing from the real university web address.",
    },
    keyWarningSign: "Artificial deadlines and mismatched web addresses.",
    safeDecision: "Never click verification links in emails. Check the portal directly.",
  },
  {
    id: "pretexting",
    iv: "IV2",
    title: "Pretexting",
    badge: "5 Challenges · IV2",
    icon: MessagesSquare,
    colorClass: "teal",
    glowClass: "emerald-glow",
    summary:
      "Identify fabricated stories and requests used to persuade people to reveal private information.",
    exampleSnippet: {
      type: "Simulated Chat",
      sender: "Campus IT Support Assistant",
      content:
        "Hello! We detected an emergency server failure affecting your exam registrations. Please share your phone OTP so we can restore your subjects.",
      suspiciousElement:
        "Asking for a one-time passcode (OTP) that university staff are never permitted to request.",
    },
    keyWarningSign: "Someone asking for private codes or passwords to 'solve' an urgent problem.",
    safeDecision: "Verify the contact through official campus helpdesk channels first.",
  },
  {
    id: "impersonation",
    iv: "IV3",
    title: "Impersonation",
    badge: "5 Challenges · IV3",
    icon: UserRoundSearch,
    colorClass: "amber",
    glowClass: "amber-glow",
    summary:
      "Recognise suspicious accounts and individuals pretending to be trusted people or organisations.",
    exampleSnippet: {
      type: "Social Profile",
      sender: "Prof. K. L. Wickramasinghe (Duplicate)",
      content:
        "I am stuck in an urgent departmental committee meeting and cannot access university funds. Could you transfer Rs. 5,000 for student conference badges?",
      suspiciousElement:
        "New profile with no mutual campus connections requesting financial assistance.",
    },
    keyWarningSign: "Senior faculty or student leaders making sudden personal payment requests.",
    safeDecision: "Confirm the request in person or through published faculty directories.",
  },
  {
    id: "links",
    iv: "IV4",
    title: "Online Scams & Malicious Links",
    badge: "5 Challenges · IV4",
    icon: Link2,
    colorClass: "cyan",
    glowClass: "cyan-glow",
    summary:
      "Examine fraudulent offers, misleading websites, and potentially dangerous links.",
    exampleSnippet: {
      type: "Online Offer",
      sender: "Campus Student Laptop Scheme",
      content:
        "85% discount on Apple laptops exclusively for university students! Limited to the first 20 applicants. Pay Rs. 2,500 shipping deposit right now.",
      suspiciousElement:
        "Unrealistically cheap prices requiring non-refundable advance deposits.",
    },
    keyWarningSign: "Offers that seem too good to be true with pressure to pay immediately.",
    safeDecision: "Verify deals with recognized vendors and avoid unverified payment portals.",
  },
];

export function HomeThreatCards() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="home-threat-cards-grid" role="region" aria-label="Four Social Engineering Threats">
      {THREAT_CARDS.map((card) => {
        const Icon = card.icon;
        const isExpanded = expandedId === card.id;

        return (
          <article
            key={card.id}
            className={`threat-info-card ${card.colorClass} ${isExpanded ? "expanded" : ""}`}
          >
            <div className="threat-card-top">
              <div className="threat-card-header-row">
                <div className={`threat-icon-box ${card.glowClass}`}>
                  <Icon size={24} aria-hidden="true" />
                </div>
                <span className="threat-iv-pill">{card.badge}</span>
              </div>

              <h3 className="threat-card-title">{card.title}</h3>
              <p className="threat-card-summary">{card.summary}</p>
            </div>

            {/* Small Visual Example / Preview */}
            <div className="threat-example-preview" aria-label="Simulated Scenario Preview">
              <div className="example-preview-header">
                <span className="example-tag">{card.exampleSnippet.type}</span>
                <span className="example-sender-truncate" title={card.exampleSnippet.sender}>
                  {card.exampleSnippet.sender}
                </span>
              </div>
              <p className="example-snippet-text">&ldquo;{card.exampleSnippet.content}&rdquo;</p>
            </div>

            {/* Expandable Details Section */}
            {isExpanded && (
              <div className="threat-expanded-details" role="region" aria-label={`${card.title} Details`}>
                <div className="detail-item">
                  <div className="detail-label-row">
                    <AlertTriangle size={14} className="text-amber" aria-hidden="true" />
                    <strong>Key Warning Sign:</strong>
                  </div>
                  <p>{card.keyWarningSign}</p>
                </div>

                <div className="detail-item">
                  <div className="detail-label-row">
                    <ShieldAlert size={14} className="text-primary" aria-hidden="true" />
                    <strong>What Attackers Seek:</strong>
                  </div>
                  <p>{card.exampleSnippet.suspiciousElement}</p>
                </div>

                <div className="detail-item">
                  <div className="detail-label-row">
                    <CheckCircle2 size={14} className="text-emerald" aria-hidden="true" />
                    <strong>Protective Decision:</strong>
                  </div>
                  <p>{card.safeDecision}</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="threat-card-footer">
              <button
                type="button"
                className="threat-learn-more-btn"
                onClick={() => toggleExpand(card.id)}
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? "Show Less" : "Learn More"}</span>
                {isExpanded ? (
                  <ChevronUp size={16} aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} aria-hidden="true" />
                )}
              </button>

              <Link
                href="/consent"
                className="threat-investigate-link"
                title={`Participate in ${card.title} challenges`}
              >
                <span>Investigate Challenges</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
