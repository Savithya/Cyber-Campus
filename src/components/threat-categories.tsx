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
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

interface ThreatCardData {
  id: string;
  iv: string;
  title: string;
  badge: string;
  actionText: string;
  colorTheme: string;
  accentBg: string;
  accentBorder: string;
  icon: typeof Mail;
  description: string;
  visualType: string;
  sender: string;
  previewText: string;
  flaggedText: string;
  flaggedExplanation: string;
  targetAsset: string;
  destinationHref: string;
}

const THREAT_CARDS: ThreatCardData[] = [
  {
    id: "phishing",
    iv: "IV1",
    title: "Phishing",
    badge: "5 Challenges",
    actionText: "Explore Phishing",
    colorTheme: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/60",
    accentBorder: "border-indigo-200 dark:border-indigo-800",
    icon: Mail,
    description:
      "Investigate deceptive emails and messages designed to trick users into revealing sensitive information.",
    visualType: "Suspicious Campus Email",
    sender: "IT Services <verify@campus-portal-alert.example>",
    previewText:
      "Your university account will be locked in 2 hours due to an unverified security audit. Confirm your credentials now.",
    flaggedText: "2 hours deadline & lookalike domain (@campus-portal-alert.example)",
    flaggedExplanation:
      "Artificial urgency combined with external lookalike domain designed to harvest student single sign-on passwords.",
    targetAsset: "LMS & Student Portal Credentials",
    destinationHref: "/play",
  },
  {
    id: "pretexting",
    iv: "IV2",
    title: "Pretexting",
    badge: "5 Challenges",
    actionText: "Explore Pretexting",
    colorTheme: "text-cyan-600 dark:text-cyan-400",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/60",
    accentBorder: "border-cyan-200 dark:border-cyan-800",
    icon: MessagesSquare,
    description:
      "Recognize fabricated stories and convincing requests designed to manipulate personal-information disclosure.",
    visualType: "Deceptive Support Chat",
    sender: "Support Bot (Unverified Live Helpdesk)",
    previewText:
      "Hello! We detected an emergency server failure affecting your exam registrations. Please share your phone OTP to restore your subjects.",
    flaggedText: "Demanding one-time passcode (OTP)",
    flaggedExplanation:
      "Fabricating an urgent academic crisis to trick the student into surrendering two-factor authentication passcodes.",
    targetAsset: "2FA Verification Codes & Phone Numbers",
    destinationHref: "/play",
  },
  {
    id: "impersonation",
    iv: "IV3",
    title: "Impersonation",
    badge: "5 Challenges",
    actionText: "Explore Impersonation",
    colorTheme: "text-violet-600 dark:text-violet-400",
    accentBg: "bg-violet-50 dark:bg-violet-950/60",
    accentBorder: "border-violet-200 dark:border-violet-800",
    icon: UserRoundSearch,
    description:
      "Identify deceptive accounts or individuals pretending to represent trusted people or organizations.",
    visualType: "Social Media Direct Message",
    sender: "Prof. K. L. Wickramasinghe (Duplicate Account · 0 Mutuals)",
    previewText:
      "I am stuck in an urgent departmental committee meeting and cannot access university funds. Could you transfer Rs. 5,000 for student badges?",
    flaggedText: "Unverified profile requesting direct money transfer",
    flaggedExplanation:
      "Exploiting student deference to academic authority with a newly created duplicate social profile.",
    targetAsset: "Student Identity & Banking Funds",
    destinationHref: "/play",
  },
  {
    id: "online-scams",
    iv: "IV4",
    title: "Online Scams & Malicious Links",
    badge: "5 Challenges",
    actionText: "Explore Online Scams & Malicious Links",
    colorTheme: "text-rose-600 dark:text-rose-400",
    accentBg: "bg-rose-50 dark:bg-rose-950/60",
    accentBorder: "border-rose-200 dark:border-rose-800",
    icon: Link2,
    description:
      "Examine fraudulent offers, deceptive websites, and links that may expose personal information.",
    visualType: "Deceptive Offer & Link Preview",
    sender: "Campus Laptop Scheme <deals@laptop-grant.site>",
    previewText:
      "85% discount on laptops exclusively for university students! Limited to first 20 applicants. Pay Rs. 2,500 shipping deposit at link.",
    flaggedText: "Unrealistic 85% discount + unverified checkout link",
    flaggedExplanation:
      "Advance-fee fraud combining false scarcity with an unverified third-party checkout link to compromise payment cards.",
    targetAsset: "Card Details & Device Security",
    destinationHref: "/play",
  },
];

export function ThreatCategories() {
  const [inspectedCards, setInspectedCards] = useState<Record<string, boolean>>({
    phishing: true, // Default one opened for immediate educational value
  });

  const toggleInspect = (id: string) => {
    setInspectedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="threat-categories"
      className="threat-categories-section py-12 lg:py-20 relative"
      aria-labelledby="threats-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 mb-3 shadow-2xs">
            <ShieldAlert size={14} aria-hidden="true" />
            <span>INDEPENDENT VARIABLES (IV1–IV4)</span>
          </div>
          <h2
            id="threats-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Explore the Four Social Engineering Threats
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover the deceptive techniques explored in this study through realistic digital scenarios.
          </p>
        </div>

        {/* 4 Cards Grid (2x2 layout on desktop, 1 col on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {THREAT_CARDS.map((card) => {
            const Icon = card.icon;
            const isInspected = !!inspectedCards[card.id];

            return (
              <article
                key={card.id}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-6 lg:p-7 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between"
                aria-label={`${card.iv}: ${card.title}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border shrink-0 ${card.accentBg} ${card.accentBorder} ${card.colorTheme} shadow-2xs group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={22} className="sm:w-6 sm:h-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {card.iv}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate sm:whitespace-normal">
                            {card.targetAsset}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                          {card.title}
                        </h3>
                      </div>
                    </div>

                    <span className="self-start sm:self-auto text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                      {card.badge}
                    </span>
                  </div>

                  {/* Short Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
                    {card.description}
                  </p>

                  {/* Simulated Visual Artifact Box */}
                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 mb-5 shadow-2xs transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {card.visualType}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleInspect(card.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          isInspected
                            ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        }`}
                        aria-pressed={isInspected}
                        title="Toggle red flag analysis"
                      >
                        {isInspected ? <EyeOff size={12} className="text-white" /> : <Eye size={12} className="text-white" />}
                        <span className="text-white">{isInspected ? "Hide Red Flags" : "Spot Red Flags"}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2 truncate" title={card.sender}>
                      From: {card.sender}
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                      &ldquo;{card.previewText}&rdquo;
                    </div>

                    {isInspected && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-fadeIn">
                        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="font-bold">Deception Analysis: </strong>
                          {card.flaggedExplanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>Safe Simulation</span>
                  </div>

                  <Link
                    href={card.destinationHref}
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-md transition-all group-hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-blue-500"
                    aria-label={`Participate in ${card.title} scenarios`}
                  >
                    <span className="text-white font-bold">{card.actionText}</span>
                    <ArrowRight size={13} className="text-white" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
