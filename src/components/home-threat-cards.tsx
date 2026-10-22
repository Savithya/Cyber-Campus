"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessagesSquare,
  UserRoundSearch,
  Link2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Target,
} from "lucide-react";

interface ThreatCardData {
  id: string;
  iv: string;
  title: string;
  badge: string;
  categoryTag: string;
  threatTarget: string;
  icon: typeof Mail;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  summary: string;
  exampleSnippet: {
    type: string;
    sender: string;
    content: string;
    suspiciousElement: string;
    // Highlighted fragments for interactive inspection
    highlightLead: string;
    highlightDeception: string;
    highlightTrail: string;
    deceptionNote: string;
  };
  keyWarningSign: string;
  attackerGoal: string;
  safeDecision: string;
}

const THREAT_CARDS: ThreatCardData[] = [
  {
    id: "phishing",
    iv: "IV1",
    title: "Phishing",
    badge: "5 Challenges · IV1",
    categoryTag: "Urgency & Domain Spoofing",
    threatTarget: "LMS & Student Portal Passwords",
    icon: Mail,
    themeColor: "text-indigo-400",
    accentBg: "bg-indigo-500/10",
    accentBorder: "border-indigo-500/30",
    accentGlow: "shadow-[0_0_25px_rgba(99,102,241,0.18)]",
    summary:
      "Investigate suspicious emails and messages designed to deceive students into surrendering university credentials.",
    exampleSnippet: {
      type: "Simulated Webmail",
      sender: "IT Helpdesk <security@campus-portal-verify.example>",
      content:
        "Your university account will be locked in 2 hours due to an unverified security audit. Click here to confirm your password immediately.",
      suspiciousElement:
        "Urgent 2-hour deadline & lookalike domain name differing from the real university web address.",
      highlightLead: "Your university account will be locked in ",
      highlightDeception: "2 hours due to unverified audit",
      highlightTrail: ". Click here to confirm password immediately at @campus-portal-verify.example.",
      deceptionNote: "FLAGGED: Artificial deadline + external lookalike domain (@campus-portal-verify.example)",
    },
    keyWarningSign: "Artificial deadlines and mismatched web addresses disguised as official campus portals.",
    attackerGoal: "Student single-sign-on credentials to access LMS, exams, and personal student communications.",
    safeDecision: "Never click verification links in emails. Open the portal independently via official bookmarks.",
  },
  {
    id: "pretexting",
    iv: "IV2",
    title: "Pretexting",
    badge: "5 Challenges · IV2",
    categoryTag: "Crisis Fabrication",
    threatTarget: "Two-Factor Auth & Phone OTPs",
    icon: MessagesSquare,
    themeColor: "text-emerald-400",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    accentGlow: "shadow-[0_0_25px_rgba(16,185,129,0.18)]",
    summary:
      "Identify fabricated crisis stories and deceptive support requests used to persuade people to reveal private verification codes.",
    exampleSnippet: {
      type: "Simulated Live Chat",
      sender: "Campus IT Support Assistant (Unverified Bot)",
      content:
        "Hello! We detected an emergency server failure affecting your exam registrations. Please share your phone OTP so we can restore your subjects.",
      suspiciousElement:
        "Asking for a one-time passcode (OTP) that university staff are never permitted to request.",
      highlightLead: "Hello! We detected an emergency server failure. Please ",
      highlightDeception: "share your phone OTP right now",
      highlightTrail: " so our tech desk can restore your exam registrations.",
      deceptionNote: "FLAGGED: University IT never requests 2FA codes or SMS OTPs over chat or phone.",
    },
    keyWarningSign: "Someone fabricating an urgent administrative emergency and demanding a one-time secret passcode.",
    attackerGoal: "2FA bypass passcodes to take over authenticated accounts without knowing the user's password.",
    safeDecision: "Verify the contact through official campus helpdesk telephone directories before taking action.",
  },
  {
    id: "impersonation",
    iv: "IV3",
    title: "Impersonation",
    badge: "5 Challenges · IV3",
    categoryTag: "Authority & Social Trust",
    threatTarget: "Personal Funds & Student Directory",
    icon: UserRoundSearch,
    themeColor: "text-amber-400",
    accentBg: "bg-amber-500/10",
    accentBorder: "border-amber-500/30",
    accentGlow: "shadow-[0_0_25px_rgba(245,158,11,0.18)]",
    summary:
      "Recognise suspicious accounts and individuals pretending to be trusted professors, university staff, or student council members.",
    exampleSnippet: {
      type: "Social Profile DM",
      sender: "Prof. K. L. Wickramasinghe (Duplicate Account · 0 Mutuals)",
      content:
        "I am stuck in an urgent departmental committee meeting and cannot access university funds. Could you transfer Rs. 5,000 for student conference badges?",
      suspiciousElement:
        "New profile with no mutual campus connections requesting financial assistance.",
      highlightLead: "I am stuck in an urgent faculty meeting. Could you ",
      highlightDeception: "urgently transfer Rs. 5,000 to this personal account",
      highlightTrail: " for conference badges? I will reimburse you tomorrow.",
      deceptionNote: "FLAGGED: Senior academic staff never request direct personal peer-to-peer bank transfers.",
    },
    keyWarningSign: "Senior faculty or student leaders making sudden personal payment requests via unofficial messaging accounts.",
    attackerGoal: "Direct financial extraction and exploiting student deference to academic authority.",
    safeDecision: "Confirm the request in person at the departmental office or call published university extensions.",
  },
  {
    id: "links",
    iv: "IV4",
    title: "Online Scams & Malicious Links",
    badge: "5 Challenges · IV4",
    categoryTag: "Typosquatting & Scam Schemes",
    threatTarget: "Banking Cards & Device Integrity",
    icon: Link2,
    themeColor: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/30",
    accentGlow: "shadow-[0_0_25px_rgba(6,182,212,0.18)]",
    summary:
      "Examine fraudulent student offers, deceptive domain structures, misleading links, and disguised malicious attachments.",
    exampleSnippet: {
      type: "Deceptive Offer & Link",
      sender: "Campus Student Laptop Scheme <promos@laptop-grant-deals.site>",
      content:
        "85% discount on Apple laptops exclusively for university students! Limited to the first 20 applicants. Pay Rs. 2,500 shipping deposit right now.",
      suspiciousElement:
        "Unrealistically cheap prices requiring non-refundable advance deposits.",
      highlightLead: "85% student laptop discount! Limited to 20 applicants. ",
      highlightDeception: "Pay Rs. 2,500 shipping deposit immediately",
      highlightTrail: " via unverified third-party payment link.",
      deceptionNote: "FLAGGED: Advance fee fraud combined with artificial scarcity and an unverified checkout link.",
    },
    keyWarningSign: "Offers that seem too good to be true with pressure to deposit money immediately onto third-party links.",
    attackerGoal: "Credit/debit card numbers and non-refundable advance deposits via fake checkout gates.",
    safeDecision: "Verify deals with recognized vendors and check official student union partnerships.",
  },
];

export function HomeThreatCards() {
  // Track inspected mode for each card
  const [inspectedCards, setInspectedCards] = useState<Record<string, boolean>>({
    phishing: true, // Opened by default for immediate user visual delight!
  });

  // Track active tab view per card: "simulation" | "defense"
  const [cardViews, setCardViews] = useState<Record<string, "simulation" | "defense">>({
    phishing: "simulation",
    pretexting: "simulation",
    impersonation: "simulation",
    links: "simulation",
  });

  const toggleInspect = (id: string) => {
    setInspectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setCardView = (id: string, view: "simulation" | "defense") => {
    setCardViews((prev) => ({
      ...prev,
      [id]: view,
    }));
  };

  return (
    <div
      className="home-threat-cards-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10 max-w-6xl mx-auto"
      role="region"
      aria-label="Four Social Engineering Threats"
    >
      {THREAT_CARDS.map((card) => {
        const Icon = card.icon;
        const isInspected = !!inspectedCards[card.id];
        const currentView = cardViews[card.id] || "simulation";

        return (
          <article
            key={card.id}
            className={`threat-info-card relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 transition-all duration-300 hover:border-border hover:shadow-xl flex flex-col justify-between ${card.accentGlow}`}
          >
            {/* Card Header */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.accentBg} ${card.accentBorder} ${card.themeColor} shadow-sm`}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground leading-snug">
                      {card.title}
                    </h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Target size={12} className={card.themeColor} />
                      Target: {card.threatTarget}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-background border border-border text-foreground/80 shadow-sm">
                    {card.badge}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline-block">
                    {card.categoryTag}
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {card.summary}
              </p>

              {/* View Switcher Pills */}
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 mb-4">
                <div className="inline-flex rounded-lg bg-background/80 p-0.5 border border-border/70 text-xs">
                  <button
                    type="button"
                    onClick={() => setCardView(card.id, "simulation")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      currentView === "simulation"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Simulated Scenario
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardView(card.id, "defense")}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      currentView === "defense"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Defense &amp; Strategy
                  </button>
                </div>

                {/* Inspect Red Flag Toggle Button (Available in simulation view) */}
                {currentView === "simulation" && (
                  <button
                    type="button"
                    onClick={() => toggleInspect(card.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                      isInspected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm"
                        : "bg-background/60 border-border text-muted-foreground hover:text-foreground"
                    }`}
                    title="Toggle highlight markers on deceptive text"
                    aria-pressed={isInspected}
                  >
                    {isInspected ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{isInspected ? "Hide Traps" : "Spot Red Flags"}</span>
                  </button>
                )}
              </div>

              {/* View Content 1: Simulated Artifact with Interactive Inspection */}
              {currentView === "simulation" ? (
                <div
                  className="rounded-xl border border-border/70 bg-background/70 p-4 transition-colors"
                  aria-label="Simulated Scenario Preview"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50 text-[11px]">
                    <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {card.exampleSnippet.type}
                    </span>
                    <span
                      className="font-mono text-muted-foreground truncate max-w-[220px]"
                      title={card.exampleSnippet.sender}
                    >
                      {card.exampleSnippet.sender}
                    </span>
                  </div>

                  {/* Body Text with Interactive Inspection Highlights */}
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans mt-2">
                    {card.exampleSnippet.highlightLead}
                    <span
                      className={`font-semibold px-1 py-0.5 rounded transition-all ${
                        isInspected
                          ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                          : "text-foreground"
                      }`}
                    >
                      {card.exampleSnippet.highlightDeception}
                    </span>
                    {card.exampleSnippet.highlightTrail}
                  </p>

                  {/* Red Flag Warning Callout when Inspected */}
                  {isInspected && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/30 text-xs text-amber-300 bg-amber-500/10 -mx-4 -mb-4 p-3 rounded-b-xl flex items-start gap-2">
                      <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-snug">{card.exampleSnippet.deceptionNote}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* View Content 2: Defense & Key Indicators */
                <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4 text-xs sm:text-sm">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                      <AlertTriangle size={14} />
                      <span>Key Warning Sign:</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {card.keyWarningSign}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-primary font-bold mb-1">
                      <Flame size={14} />
                      <span>Attacker Objective:</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {card.attackerGoal}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle2 size={14} />
                      <span>Safe Decision Protocol:</span>
                    </div>
                    <p className="text-foreground/90 font-medium text-xs leading-relaxed">
                      {card.safeDecision}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Action Footer */}
            <div className="threat-card-footer mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                5 Research Questions
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href="/consent"
                  prefetch={true}
                  className="threat-investigate-link button primary small inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3.5 shadow-sm"
                  title={`Participate in ${card.title} challenges`}
                >
                  <span>Investigate Challenges</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
