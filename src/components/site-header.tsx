"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  House,
  Gamepad2,
  ListChecks,
  Lightbulb,
  KeyRound,
  Menu,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open & handle Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  // Smooth scroll to Home Hero Section
  const handleHomeClick = useCallback(
    (e: React.MouseEvent) => {
      setMobileMenuOpen(false);
      if (pathname === "/") {
        e.preventDefault();
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const heroEl = document.getElementById("home");
        if (heroEl) {
          heroEl.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
          window.history.pushState(null, "", "/#home");
        } else {
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
          window.history.pushState(null, "", "/");
        }
      }
    },
    [pathname]
  );

  // Research onboarding portal always directs to consent where participants can start fresh or resume
  const joinHref = "/consent";

  // Determine active states accurately based on route
  const isHomeActive = pathname === "/";
  const isChallengesActive = pathname?.startsWith("/play");
  const isJoinActive =
    pathname === "/consent" ||
    pathname === "/demographics" ||
    pathname?.startsWith("/survey") ||
    pathname === "/results";
  const isAboutActive = pathname === "/privacy";
  const isResearcherActive = pathname?.startsWith("/admin");

  return (
    <header className="site-header" role="banner">
      <div className="site-header-inner">
        {/* Left: Clickable Logo and Brand */}
        <Link
          href="/#home"
          onClick={handleHomeClick}
          prefetch={true}
          className="brand"
          aria-label="Cyber Campus Home - Return to Hero Section"
        >
          <span className="brand-icon" aria-hidden="true">
            <span className="brand-icon-glow" />
            <svg
              className="brand-shield-svg"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2L23 5.5V13C23 19 19.2 24 14 25.5C8.8 24 5 19 5 13V5.5L14 2Z"
                fill="url(#brand-shield-grad)"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M14 4.5L21 7.2V13C21 17.8 17.8 22 14 23.3C10.2 22 7 17.8 7 13V7.2L14 4.5Z"
                fill="url(#brand-shield-inner)"
                opacity="0.85"
              />
              <path
                d="M9.5 13.5L12.8 16.8L18.5 10.5"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="18.5" cy="10.5" r="1.3" fill="#38bdf8" />
              <defs>
                <linearGradient
                  id="brand-shield-grad"
                  x1="4"
                  y1="2"
                  x2="24"
                  y2="26"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#6366f1" />
                  <stop offset="0.5" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient
                  id="brand-shield-inner"
                  x1="7"
                  y1="4.5"
                  x2="21"
                  y2="23.3"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="0.4" stopColor="#818cf8" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#1e1b4b" stopOpacity="0.35" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-title-wrap">
              <span className="brand-title">
                cyber<span className="brand-light">campus</span>
              </span>
              <span className="brand-badge">
                <span className="brand-badge-pulse" aria-hidden="true" />
                <span className="brand-badge-text">RESEARCH</span>
              </span>
            </span>
            <span className="brand-subtitle">
              <span className="brand-subtitle-dot" aria-hidden="true" />
              Cybersecurity Research Platform
            </span>
          </span>
        </Link>

        {/* Center: Gamified Pill Navigation */}
        <nav
          className="desktop-nav desktop-pill-nav"
          aria-label="Main navigation"
        >
          <Link
            href="/#home"
            onClick={handleHomeClick}
            prefetch={true}
            className={`nav-pill ${isHomeActive ? "active" : ""}`}
            aria-current={isHomeActive ? "page" : undefined}
          >
            <House size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link
            href="/play"
            prefetch={true}
            className={`nav-pill ${isChallengesActive ? "active" : ""}`}
            aria-current={isChallengesActive ? "page" : undefined}
          >
            <Gamepad2 size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Cyber Challenges</span>
          </Link>

          <Link
            href={joinHref}
            prefetch={true}
            className={`nav-pill ${isJoinActive ? "active" : ""}`}
            aria-current={isJoinActive ? "page" : undefined}
          >
            <ListChecks size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Join Research</span>
          </Link>

          <Link
            href="/privacy"
            prefetch={true}
            className={`nav-pill ${isAboutActive ? "active" : ""}`}
            aria-current={isAboutActive ? "page" : undefined}
          >
            <Lightbulb size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>About the Study</span>
          </Link>
        </nav>

        {/* Right: Researcher Access & Appearance Switcher */}
        <div className="desktop-header-right">
          <Link
            href="/admin/login"
            prefetch={true}
            className={`nav-admin nav-researcher-pill ${
              isResearcherActive ? "active" : ""
            }`}
            aria-current={isResearcherActive ? "page" : undefined}
          >
            <KeyRound
              size={18}
              strokeWidth={1.9}
              className="researcher-icon"
              aria-hidden="true"
            />
            <span>Researcher Access</span>
            <ArrowUpRight
              size={14}
              className="ml-1 opacity-70"
              aria-hidden="true"
            />
          </Link>

          <div className="header-theme-wrapper">
            <ThemeToggle variant="pill" />
          </div>
        </div>

        {/* Mobile Header Menu Trigger */}
        <div className="mobile-header-actions">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
          >
            {mobileMenuOpen ? (
              <X size={22} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-navigation-drawer"
            className="mobile-menu-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">
                <span className="brand-icon mobile-drawer-brand-icon" aria-hidden="true">
                  <ShieldCheck size={18} strokeWidth={2.2} />
                </span>
                <span className="mobile-brand-title">
                  cyber<span className="brand-light">campus</span>
                </span>
                <span className="brand-badge mobile-drawer-badge">
                  <span className="brand-badge-pulse" aria-hidden="true" />
                  <span>RESEARCH</span>
                </span>
              </span>
              <button
                type="button"
                className="mobile-close-button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {/* Mobile Navigation Links in Required Order */}
            <nav
              className="mobile-nav-links"
              aria-label="Mobile main navigation"
            >
              {/* 1. House — Home */}
              <Link
                href="/#home"
                onClick={handleHomeClick}
                prefetch={true}
                className={`mobile-nav-item mobile-nav-pill ${
                  isHomeActive ? "active" : ""
                }`}
                aria-current={isHomeActive ? "page" : undefined}
              >
                <House size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>Home</span>
              </Link>

              {/* 2. Gamepad2 — Cyber Challenges */}
              <Link
                href="/play"
                onClick={() => setMobileMenuOpen(false)}
                prefetch={true}
                className={`mobile-nav-item mobile-nav-pill ${
                  isChallengesActive ? "active" : ""
                }`}
                aria-current={isChallengesActive ? "page" : undefined}
              >
                <Gamepad2 size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>Cyber Challenges</span>
              </Link>

              {/* 3. ListChecks — Join Research */}
              <Link
                href={joinHref}
                onClick={() => setMobileMenuOpen(false)}
                prefetch={true}
                className={`mobile-nav-item mobile-nav-pill ${
                  isJoinActive ? "active" : ""
                }`}
                aria-current={isJoinActive ? "page" : undefined}
              >
                <ListChecks size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>Join Research</span>
              </Link>

              {/* 4. Lightbulb — About the Study */}
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                prefetch={true}
                className={`mobile-nav-item mobile-nav-pill ${
                  isAboutActive ? "active" : ""
                }`}
                aria-current={isAboutActive ? "page" : undefined}
              >
                <Lightbulb size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>About the Study</span>
              </Link>

              {/* 5. KeyRound — Researcher Access */}
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                prefetch={true}
                className={`mobile-nav-item mobile-nav-pill mobile-researcher-pill ${
                  isResearcherActive ? "active" : ""
                }`}
                aria-current={isResearcherActive ? "page" : undefined}
              >
                <KeyRound
                  size={18}
                  strokeWidth={1.9}
                  className="researcher-icon"
                  aria-hidden="true"
                />
                <span>Researcher Access</span>
              </Link>
            </nav>

            {/* Appearance Section in Mobile Drawer */}
            <div className="mobile-theme-section">
              <span className="mobile-section-label">APPEARANCE</span>
              <ThemeToggle
                variant="pill"
                className="mobile-appearance-toggle"
              />
            </div>

            <div className="mobile-menu-footer">
              <Sparkles size={14} aria-hidden="true" />
              <span>Cybersecurity Student Research · Sri Lanka</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
