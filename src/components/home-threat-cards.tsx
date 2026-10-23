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
    themeColor: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-50 dark:bg-blue-950/40",
    accentBorder: "border-blue-200/80 dark:border-blue-800/60",
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
    themeColor: "text-teal-600 dark:text-teal-400",
    accentBg: "bg-teal-50 dark:bg-teal-950/40",
    accentBorder: "border-teal-200/80 dark:border-teal-800/60",
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
    themeColor: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
    accentBorder: "border-indigo-200/80 dark:border-indigo-800/60",
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
    themeColor: "text-sky-600 dark:text-sky-400",
    accentBg: "bg-sky-50 dark:bg-sky-950/40",
    accentBorder: "border-sky-200/80 dark:border-sky-800/60",
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
    phishing: false,
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
            className="threat-info-card relative rounded-2xl border border-border/80 bg-card p-6 transition-all duration-300 hover:border-border hover:shadow-md flex flex-col justify-between"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${card.accentBg} ${card.accentBorder} ${card.themeColor} shadow-xs`}
                  >
                    <Icon size={22} aria-hidden="true" className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug truncate">
                      {card.title}
                    </h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium truncate">
                      <Target size={12} className="text-muted-foreground/70" />
                      Target: {card.threatTarget}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
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
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3 mb-4 flex-wrap">
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/90 p-0.5 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setCardView(card.id, "simulation")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      currentView === "simulation"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    Simulated Scenario
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardView(card.id, "defense")}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                      currentView === "defense"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                      isInspected
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                    title="Toggle highlight markers on deceptive text"
                    aria-pressed={isInspected}
                  >
                    {isInspected ? (
                      <EyeOff size={13} className="text-amber-700 dark:text-amber-300" />
                    ) : (
                      <Eye size={13} className="text-slate-500 dark:text-slate-400" />
                    )}
                    <span>{isInspected ? "Hide Traps" : "Spot Red Flags"}</span>
                  </button>
                )}
              </div>

              {/* View Content 1: Simulated Artifact with Interactive Inspection */}
              {currentView === "simulation" ? (
                <div
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 transition-colors"
                  aria-label="Simulated Scenario Preview"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70 dark:border-slate-800 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700/60 text-[10px]">
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
                      className={`font-semibold px-1.5 py-0.5 rounded-sm transition-all ${
                        isInspected
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-b-2 border-amber-500 dark:border-amber-400"
                          : "text-foreground"
                      }`}
                    >
                      {card.exampleSnippet.highlightDeception}
                    </span>
                    {card.exampleSnippet.highlightTrail}
                  </p>

                  {/* Red Flag Warning Callout when Inspected */}
                  {isInspected && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/50 -mx-4 -mb-4 p-3 rounded-b-xl flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-snug">{card.exampleSnippet.deceptionNote}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* View Content 2: Defense & Key Indicators */
                <div className="space-y-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 text-xs sm:text-sm">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                      <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
                      <span>Key Warning Sign:</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {card.keyWarningSign}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold mb-1">
                      <Flame size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Attacker Objective:</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {card.attackerGoal}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
                      <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
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
            <div className="threat-card-footer mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">
                5 Research Questions
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href="/consent"
                  prefetch={true}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
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
