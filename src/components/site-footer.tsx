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
  FileText,
  Shield,
  HelpCircle,
  Database,
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
      <footer
        className="cyber-site-footer site-footer-compact"
        role="contentinfo"
        aria-label="Cyber Campus Research Footer"
      >
        <div className="footer-compact-container">
          <div className="footer-compact-brand">
            <ShieldCheck size={18} className="text-cyan shrink-0" aria-hidden="true" />
            <span className="footer-compact-title">Cyber Campus</span>
            <span className="footer-compact-sub">· Academic Cybersecurity Study (Sri Lanka)</span>
          </div>

          <nav className="footer-compact-links" aria-label="Footer Quick Links">
            <Link href="/" className="footer-compact-link">Home</Link>
            <Link href="/play" className="footer-compact-link">Cyber Missions</Link>
            <Link href="/privacy" className="footer-compact-link">Privacy &amp; Rights</Link>
            <Link href="/withdraw" className="footer-compact-link">Withdrawal Protocol</Link>
          </nav>

          <div className="footer-compact-admin">
            <Link href="/admin/login" className="footer-compact-admin-link">
              <Lock size={12} aria-hidden="true" />
              <span>Researcher Access</span>
            </Link>
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
      <div className="footer-grid-container">
        {/* Column 1 — Cyber Campus Brand & Overview */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <div className="footer-brand-icon-box">
              <ShieldCheck size={24} className="text-cyan" aria-hidden="true" />
            </div>
            <div className="footer-brand-title-group">
              <div className="footer-brand-title">Cyber Campus</div>
              <span className="footer-brand-tag">RESEARCH PLATFORM</span>
            </div>
          </div>
          <p className="footer-brand-description">
            An interactive academic cybersecurity research platform investigating social engineering
            threats and user privacy risks among university students in Sri Lanka.
          </p>
          <div className="footer-meta-pill">
            <GraduationCap size={16} className="text-primary shrink-0" aria-hidden="true" />
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
                <span>Home Overview</span>
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
                <span>Study Information &amp; Ethics</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="footer-nav-link">
                <ChevronRight size={14} className="footer-nav-arrow" aria-hidden="true" />
                <span>Privacy &amp; Data Protection</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy#rights" className="footer-nav-link">
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

        {/* Column 4 — Platform & Data Governance */}
        <div className="footer-col platform-col">
          <h3 className="footer-col-heading">Platform Governance</h3>
          <div className="footer-governance-cards">
            <div className="footer-gov-item">
              <span className="footer-gov-dot" aria-hidden="true" />
              <div>
                <strong className="footer-gov-label">4 Threat Variables:</strong>
                <p className="footer-gov-text">Phishing, Pretexting, Impersonation &amp; Scams</p>
              </div>
            </div>
            <div className="footer-gov-item">
              <span className="footer-gov-dot" aria-hidden="true" />
              <div>
                <strong className="footer-gov-label">Academic Inquiry:</strong>
                <p className="footer-gov-text">Dedicated to scientific research, not commercial tracking</p>
              </div>
            </div>
            <div className="footer-gov-item">
              <span className="footer-gov-dot" aria-hidden="true" />
              <div>
                <strong className="footer-gov-label">Data Protection:</strong>
                <p className="footer-gov-text">Anonymized records governed under strict ethical protocols</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="footer-bottom-copy">
            &copy; {new Date().getFullYear()} Cyber Campus Research Initiative · Sri Lanka. All research data
            governed under academic ethics and confidentiality protocols.
          </p>
          <div className="footer-bottom-links">
            <Link href="/admin/login" className="footer-admin-link">
              <Lock size={13} aria-hidden="true" />
              <span>Researcher Access</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
