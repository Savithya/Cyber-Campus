"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Lock,
  ExternalLink,
  ChevronRight,
  Mail,
  Layers,
  HeartHandshake,
  FileText,
  RotateCcw,
} from "lucide-react";

interface SiteFooterProps {
  compact?: boolean;
}

export function SiteFooter({ compact }: SiteFooterProps) {
  const pathname = usePathname();
  const isMissionActive = pathname.startsWith("/play/") || pathname === "/play";
  const showCompact = compact ?? isMissionActive;

  if (showCompact) {
    return (
      <footer className="site-footer site-footer-compact" role="contentinfo" aria-label="Cyber Campus Research Footer">
        <div className="container footer-compact-inner">
          <div className="footer-compact-brand">
            <ShieldCheck size={18} className="text-cyan" aria-hidden="true" />
            <span className="font-semibold text-sm">Cyber Campus</span>
            <span className="text-muted text-xs">· Academic Research in Sri Lanka</span>
          </div>

          <nav className="footer-compact-links" aria-label="Footer Quick Links">
            <Link href="/" className="footer-link-compact">Home</Link>
            <Link href="/play" className="footer-link-compact">Cyber Missions</Link>
            <Link href="/privacy" className="footer-link-compact">Privacy &amp; Rights</Link>
            <Link href="/withdraw" className="footer-link-compact">Withdrawal</Link>
          </nav>

          <div className="footer-compact-copy text-xs text-muted">
            Voluntary Academic Research · Confidential &amp; Anonymized
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer site-footer-full" role="contentinfo" aria-label="Cyber Campus Platform Footer">
      <div className="container footer-grid-container">
        {/* Column 1 — Cyber Campus Brand & Overview */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <div className="footer-brand-icon-box">
              <ShieldCheck size={22} className="text-cyan" aria-hidden="true" />
            </div>
            <div>
              <span className="footer-brand-title">Cyber Campus</span>
              <span className="footer-brand-tag">RESEARCH PLATFORM</span>
            </div>
          </div>
          <p className="footer-brand-description">
            An interactive academic cybersecurity research platform exploring social engineering
            threats and user privacy among university students in Sri Lanka.
          </p>
          <div className="footer-meta-pill">
            <GraduationCap size={15} className="text-primary" aria-hidden="true" />
            <span>Empirical Cybersecurity Study · Sri Lanka</span>
          </div>
        </div>

        {/* Column 2 — Quick Navigation */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Quick Navigation</h3>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/#challenges" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Cyber Challenges</span>
              </Link>
            </li>
            <li>
              <Link href="/consent" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Join Research</span>
              </Link>
            </li>
            <li>
              <Link href="/#about-study" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>About the Study</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Research Information */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Research Information</h3>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/consent" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Study Information</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Privacy Information</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Participant Rights</span>
              </Link>
            </li>
            <li>
              <Link href="/withdraw" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Withdrawal Protocol</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4 — Platform Information */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Platform Information</h3>
          <ul className="footer-nav-list" role="list">
            <li className="footer-platform-item">
              <span className="footer-bullet-dot" aria-hidden="true" />
              <span><strong>4 Threat Categories:</strong> Phishing, Pretexting, Impersonation, Scams</span>
            </li>
            <li className="footer-platform-item">
              <span className="footer-bullet-dot" aria-hidden="true" />
              <span><strong>Academic Platform:</strong> Designed for scientific inquiry, not commercial marketing</span>
            </li>
            <li className="footer-platform-item">
              <span className="footer-bullet-dot" aria-hidden="true" />
              <span><strong>Data Integrity:</strong> Anonymized participant records and secure token hashing</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <div className="footer-bottom-copy">
            &copy; {new Date().getFullYear()} Cyber Campus Research Initiative · Sri Lanka.
            All research data governed under strict academic confidentiality protocols.
          </div>
          <div className="footer-bottom-links">
            <Link href="/admin/login" className="footer-admin-link">
              <Lock size={12} aria-hidden="true" />
              <span>Researcher Access</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
