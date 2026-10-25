"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  FileCheck,
  Lock,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Scale,
} from "lucide-react";

interface EthicsCard {
  title: string;
  icon: typeof HeartHandshake;
  badge: string;
  description: string;
  guarantee: string;
  linkHref: string;
  linkText: string;
}

const ETHICS_CARDS: EthicsCard[] = [
  {
    title: "Voluntary Participation",
    icon: HeartHandshake,
    badge: "100% Optional",
    description:
      "Your participation is completely optional. You may pause, skip challenges, or exit the platform at any time before final submission without any academic, institutional, or personal penalty.",
    guarantee: "Right to pause or withdraw anytime without consequence",
    linkHref: "/consent",
    linkText: "Read Consent Protocol",
  },
  {
    title: "Data Minimization",
    icon: FileCheck,
    badge: "Non-Identifying",
    description:
      "We collect only aggregated, non-identifying academic demographic indicators and your simulated scenario choices. We never request or store real student passwords, National Identity Card numbers, or banking details.",
    guarantee: "Zero real passwords or institutional credentials recorded",
    linkHref: "/privacy",
    linkText: "View Minimization Policy",
  },
  {
    title: "Confidentiality & Protection",
    icon: Lock,
    badge: "Anonymous Code",
    description:
      "All responses are associated solely with an anonymous Participant ID code. Study data is stored securely in accordance with academic standards and used exclusively for scholarly statistical analysis.",
    guarantee: "Responses linked strictly to an anonymous participant code",
    linkHref: "/privacy",
    linkText: "Data Governance Details",
  },
  {
    title: "Research Transparency",
    icon: BookOpen,
    badge: "Full Rights Access",
    description:
      "Complete study information, research objectives, participant rights, and formal withdrawal procedures are publicly documented and accessible to all participating university students.",
    guarantee: "Published protocols and dedicated withdrawal mechanism",
    linkHref: "/withdraw",
    linkText: "Withdrawal Procedure",
  },
];

export function ResearchEthics() {
  return (
    <section
      id="research-ethics"
      className="research-ethics-section py-12 lg:py-20 relative bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800/80"
      aria-labelledby="ethics-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 mb-3 shadow-2xs">
            <Scale size={14} aria-hidden="true" />
            <span>ACADEMIC GOVERNANCE &amp; ETHICS</span>
          </div>
          <h2
            id="ethics-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Research Ethics &amp; Your Privacy
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Your participation is voluntary, and the study is designed to protect participant information.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {ETHICS_CARDS.map((card, idx) => {
            const Icon = card.icon;

            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-200"
              >
                <div>
                  {/* Top: Icon + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                {/* Footer with Safeguard & Link */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    <ShieldCheck size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                    <span className="leading-tight">{card.guarantee}</span>
                  </div>

                  <Link
                    href={card.linkHref}
                    prefetch={true}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline pt-1"
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
