"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Shield,
  GraduationCap,
  Lock,
  ArrowUp,
  ArrowUpRight,
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

  if (pathname === "/" || pathname === "/consent" || pathname === "/join") {
    return (
      <footer
        className="spot-site-footer"
        role="contentinfo"
        aria-label="Cyber Campus Research Footer"
      >
        <div className="spot-footer-container">
          <div className="spot-footer-left">
            <span>Spot the Phish · AI Email Challenge</span>
          </div>

          <div className="spot-footer-center">
            <span>An academic research activity · Sri Lanka</span>
          </div>

          <div className="spot-footer-right">
            <Link href="/privacy" prefetch={true} className="spot-footer-link">
              Participation &amp; privacy
            </Link>
            <span className="spot-footer-bullet" aria-hidden="true">·</span>
            <Link href="/withdraw" prefetch={true} className="spot-footer-link">
              Withdrawal
            </Link>
            <span className="spot-footer-bullet" aria-hidden="true">·</span>
            <Link href="/admin/login" prefetch={true} className="spot-footer-link">
              <span>Researcher access</span>
              <ArrowUpRight size={12} className="inline ml-0.5 opacity-75" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  if (showCompact) {
    return (
      <footer
        className="cyber-site-footer site-footer-compact"
        role="contentinfo"
        aria-label="Cyber Campus Research Footer"
      >
        <div className="footer-compact-container">
          <div className="footer-compact-brand">
            <div className="footer-compact-icon-box">
              <ShieldCheck size={16} aria-hidden="true" />
            </div>
            <div className="footer-compact-title-group">
              <span className="footer-compact-title">CyberCampus</span>
              <span className="footer-compact-sub">· Academic Cybersecurity Study (Sri Lanka)</span>
            </div>
          </div>

          <nav className="footer-compact-links" aria-label="Footer Quick Links">
            <Link href="/" prefetch={true} className="footer-compact-link">Home</Link>
            <Link href="/play" prefetch={true} className="footer-compact-link">Cyber Missions</Link>
            <Link href="/privacy" prefetch={true} className="footer-compact-link">Privacy &amp; Rights</Link>
            <Link href="/withdraw" prefetch={true} className="footer-compact-link">Withdrawal Protocol</Link>
          </nav>

          <div className="footer-compact-actions">
            <Link href="/admin/login" prefetch={true} className="footer-compact-admin-link">
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
      <div className="footer-grid-container">
        {/* Column 1 — Brand & Research Overview */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <div className="footer-brand-icon-box">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div className="footer-brand-title-group">
              <span className="footer-brand-title">CyberCampus</span>
              <span className="footer-brand-tag">Academic Research Study</span>
            </div>
          </div>

          <p className="footer-brand-description">
            An empirical academic research platform investigating social engineering threats,
            cybersecurity behaviors, and user privacy risks among university students in Sri Lanka.
          </p>

          <div className="footer-brand-meta">
            <div className="footer-meta-item">
              <GraduationCap size={14} className="footer-meta-icon" aria-hidden="true" />
              <span>University Research Initiative</span>
            </div>
            <div className="footer-meta-item">
              <Lock size={14} className="footer-meta-icon" aria-hidden="true" />
              <span>IRB Protocol Governed &amp; Anonymized</span>
            </div>
          </div>
        </div>

        {/* Column 2 — Quick Navigation */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Quick Navigation</h3>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/" prefetch={true} className="footer-nav-link">
                Home Overview
              </Link>
            </li>
            <li>
              <Link href="/#challenges" prefetch={true} className="footer-nav-link">
                Cyber Challenges
              </Link>
            </li>
            <li>
              <Link href="/consent" prefetch={true} className="footer-nav-link">
                Join Research
              </Link>
            </li>
            <li>
              <Link href="/#about-study" prefetch={true} className="footer-nav-link">
                About the Study
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 — Research & Ethics */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Research &amp; Ethics</h3>
          <ul className="footer-nav-list" role="list">
            <li>
              <Link href="/consent" prefetch={true} className="footer-nav-link">
                Study Information &amp; Ethics
              </Link>
            </li>
            <li>
              <Link href="/privacy" prefetch={true} className="footer-nav-link">
                Privacy &amp; Data Protection
              </Link>
            </li>
            <li>
              <Link href="/privacy#rights" prefetch={true} className="footer-nav-link">
                Participant Rights
              </Link>
            </li>
            <li>
              <Link href="/withdraw" prefetch={true} className="footer-nav-link">
                Withdrawal Protocol
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4 — Platform Governance */}
        <div className="footer-col platform-col">
          <h3 className="footer-col-heading">Platform Governance</h3>
          <div className="footer-gov-list">
            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap">
                <Shield size={14} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <span className="footer-gov-label">4 Threat Vectors</span>
                <p className="footer-gov-text">
                  Phishing, pretexting, impersonation &amp; scam risk scenarios.
                </p>
              </div>
            </div>

            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap">
                <GraduationCap size={14} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <span className="footer-gov-label">Academic Inquiry</span>
                <p className="footer-gov-text">
                  Dedicated to scientific research with zero commercial tracking.
                </p>
              </div>
            </div>

            <div className="footer-gov-item">
              <div className="footer-gov-icon-wrap">
                <Lock size={14} aria-hidden="true" />
              </div>
              <div className="footer-gov-content">
                <span className="footer-gov-label">Data Protection</span>
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
              <Lock size={12} aria-hidden="true" />
              <span>Researcher Portal</span>
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-scroll-top-btn"
              aria-label="Scroll back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={12} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
