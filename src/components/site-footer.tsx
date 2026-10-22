"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Lock,
  ChevronRight,
  ArrowUp,
  Compass,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface SiteFooterProps {
  compact?: boolean;
}

export function SiteFooter({ compact }: SiteFooterProps) {
  const pathname = usePathname();
  const isMissionActive = pathname.startsWith("/play/") || pathname === "/play";
  const showCompact = compact ?? isMissionActive;

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  if (showCompact) {
    return (
      <footer
        className="cyber-site-footer site-footer-compact"
        role="contentinfo"
        aria-label="Cyber Campus Research Footer"
      >
        <div className="footer-top-accent" aria-hidden="true" />
        <div className="footer-compact-container">
          <div className="footer-compact-brand">
            <div className="footer-compact-icon-box">
              <ShieldCheck size={18} className="text-cyan shrink-0" aria-hidden="true" />
            </div>
            <div className="footer-compact-title-group">
              <span className="footer-compact-title">Cyber Campus</span>
              <span className="footer-compact-sub">· Academic Cybersecurity Study (Sri Lanka)</span>
            </div>
          </div>

          <nav className="footer-compact-links" aria-label="Footer Quick Links">
            <Link href="/" className="footer-compact-link">Home</Link>
            <Link href="/play" className="footer-compact-link">Cyber Missions</Link>
            <Link href="/privacy" className="footer-compact-link">Privacy &amp; Rights</Link>
            <Link href="/withdraw" className="footer-compact-link">Withdrawal Protocol</Link>
          </nav>

          <div className="footer-compact-actions">
            <Link href="/admin/login" className="footer-compact-admin-link">
              <Lock size={12} aria-hidden="true" />
              <span>Researcher Access</span>
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-compact-top-btn"
              aria-label="Scroll back to top"
            >
              <ArrowUp size={12} aria-hidden="true" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="cyber-site-footer site-footer-full"
      role="contentinfo"
      aria-label="Cyber Campus Platform Footer"
    >
      {/* Sleek top glowing border line */}
      <div className="footer-top-accent" aria-hidden="true" />

      <div className="footer-grid-container">
        {/* Column 1 — Cyber Campus Brand & Overview */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <div className="footer-brand-icon-box">
              <ShieldCheck size={24} className="footer-brand-icon" aria-hidden="true" />
            </div>
            <div className="footer-brand-title-group">
              <div className="footer-brand-title">
                Cyber<span>Campus</span>
              </div>
              <div className="footer-brand-badge-row">
                <span className="footer-brand-tag">RESEARCH PLATFORM</span>
                <span className="footer-status-pill">
                  <span className="footer-status-dot" aria-hidden="true" />
                  <span>IRB Active</span>
                </span>
              </div>
            </div>
          </div>

          <p className="footer-brand-description">
            An empirical academic research platform investigating social engineering threats,
            cybersecurity behaviors, and user privacy risks among university students in Sri Lanka.
          </p>

          <div className="footer-trust-badges">
            <div className="footer-trust-chip">
              <GraduationCap size={14} className="footer-chip-icon text-primary" aria-hidden="true" />
              <span>Academic Research Initiative</span>
            </div>
            <div className="footer-trust-chip">
              <CheckCircle2 size={14} className="footer-chip-icon text-emerald" aria-hidden="true" />
              <span>Confidential &amp; Anonymized Study</span>
            </div>
          </div>
        </div>

        {/* Column 2 — Quick Navigation */}
        <div className="footer-col">
          <div className="footer-col-header">
            <Compass size={15} className="footer-col-icon text-cyan" aria-hidden="true" />
            <h3 className="footer-col-heading">Quick Navigation</h3>
          </div>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Home Overview</span>
              </Link>
            </li>
            <li>
              <Link href="/#challenges" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Cyber Challenges</span>
                <span className="footer-link-badge">Interactive</span>
              </Link>
            </li>
            <li>
              <Link href="/consent" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Join Research</span>
                <span className="footer-link-badge highlight">Enroll</span>
              </Link>
            </li>
            <li>
              <Link href="/#about-study" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>About the Study</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Research Information & Ethics */}
        <div className="footer-col">
          <div className="footer-col-header">
            <FileText size={15} className="footer-col-icon text-primary" aria-hidden="true" />
            <h3 className="footer-col-heading">Research &amp; Ethics</h3>
          </div>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/consent" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Study Information &amp; Ethics</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Privacy &amp; Data Protection</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy#rights" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Participant Rights</span>
              </Link>
            </li>
            <li>
              <Link href="/withdraw" className="footer-nav-link">
                <ChevronRight size={13} className="footer-nav-arrow" aria-hidden="true" />
                <span>Withdrawal Protocol</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4 — Platform Governance (Enhanced Trust Cards) */}
        <div className="footer-col platform-col">
          <div className="footer-col-header">
            <Sparkles size={15} className="footer-col-icon text-amber" aria-hidden="true" />
            <h3 className="footer-col-heading">Platform Governance</h3>
          </div>
          <div className="footer-governance-cards">
            {/* Governance Card 1 */}
            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap amber">
                <ShieldAlert size={16} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <div className="footer-gov-title-row">
                  <strong className="footer-gov-label">4 Threat Vectors</strong>
                  <span className="footer-gov-tag">Simulated</span>
                </div>
                <p className="footer-gov-text">
                  Phishing, pretexting, impersonation &amp; scam risk scenarios.
                </p>
              </div>
            </div>

            {/* Governance Card 2 */}
            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap cyan">
                <GraduationCap size={16} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <div className="footer-gov-title-row">
                  <strong className="footer-gov-label">Academic Inquiry</strong>
                  <span className="footer-gov-tag">Non-Commercial</span>
                </div>
                <p className="footer-gov-text">
                  Dedicated to scientific research with zero commercial tracking.
                </p>
              </div>
            </div>

            {/* Governance Card 3 */}
            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap emerald">
                <Lock size={16} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <div className="footer-gov-title-row">
                  <strong className="footer-gov-label">Data Protection</strong>
                  <span className="footer-gov-tag">Anonymized</span>
                </div>
                <p className="footer-gov-text">
                  Anonymized records governed under strict academic ethics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-bottom-copy-block">
            <p className="footer-bottom-copy">
              &copy; {new Date().getFullYear()} <strong>Cyber Campus Research Initiative</strong> · Sri Lanka.
            </p>
            <p className="footer-bottom-subcopy">
              All research data is governed under academic ethics, voluntary consent, and confidentiality protocols.
            </p>
          </div>

          <div className="footer-bottom-actions">
            <Link href="/admin/login" className="footer-admin-link">
              <Lock size={13} aria-hidden="true" />
              <span>Researcher Portal</span>
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-scroll-top-btn"
              aria-label="Scroll back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
