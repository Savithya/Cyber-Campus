"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowUp, ShieldCheck } from "lucide-react";

interface SiteFooterProps {
  compact?: boolean;
}

export function SiteFooter({ compact }: SiteFooterProps = {}) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  if (compact) {
    return (
      <footer
        className="site-footer border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-6"
        role="contentinfo"
        aria-label="Cyber Campus Compact Footer"
      >
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">CyberCampus</span>
            <span>· Academic Cybersecurity Research · Sri Lanka</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Privacy &amp; Rights
            </Link>
            <Link href="/withdraw" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Withdrawal
            </Link>
            <Link href="/admin/login" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
              <span>Researcher Access</span>
              <ArrowUpRight size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="site-footer border-t border-slate-200/90 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors"
      role="contentinfo"
      aria-label="Cyber Campus Research Footer"
    >
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1 — Platform */}
          <div className="space-y-4">
            <Link
              href="/#home"
              className="inline-flex items-center gap-2.5 text-slate-900 dark:text-white group focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-lg"
              aria-label="Cyber Campus Home"
            >
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck size={18} strokeWidth={2.2} />
              </span>
              <span className="font-extrabold text-lg tracking-tight">
                cyber<span className="text-indigo-600 dark:text-cyan-400">campus</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              An academic cybersecurity research platform exploring social engineering threats and user privacy among university students in Sri Lanka.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Empirical Research Active
              </span>
            </div>
          </div>

          {/* Column 2 — Quick Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/#home"
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/consent"
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
                >
                  Join Research
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded"
                >
                  About the Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Research & Ethics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Research &amp; Ethics
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Study Information
                </Link>
              </li>
              <li>
                <Link
                  href="/consent"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Participant Rights
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/consent"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Consent Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Platform Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform Access
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  <span>Researcher Access</span>
                  <ArrowUpRight size={13} className="opacity-75" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  href="/withdraw"
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 rounded"
                >
                  Participant Withdrawal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 rounded text-left"
                >
                  <span>Back to Top</span>
                  <ArrowUp size={13} aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 w-full">
          <p className="text-center sm:text-left font-medium leading-relaxed">
            © 2026 Cyber Campus Research Initiative • Sri Lanka
          </p>
          <p className="text-center sm:text-right font-medium leading-relaxed">
            Voluntary Higher Education Study · Empirical Research Protocol Aligned
          </p>
        </div>
      </div>
    </footer>
  );
}
