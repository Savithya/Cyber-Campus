"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  House,
  Trophy,
  ListChecks,
  Lightbulb,
  KeyRound,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
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

  // Track active section on the homepage
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const checkHash = () => {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#challenges") {
        setActiveSection("challenges");
      } else if (window.location.hash === "#home") {
        setActiveSection("home");
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    // Setup IntersectionObserver for sections on the homepage
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "challenges") {
            setActiveSection("challenges");
          } else if (entry.target.id === "home") {
            setActiveSection("home");
          }
        }
      });
    }, observerOptions);

    const homeEl = document.getElementById("home");
    const challengesEl = document.getElementById("challenges");

    if (homeEl) observer.observe(homeEl);
    if (challengesEl) observer.observe(challengesEl);

    return () => {
      window.removeEventListener("hashchange", checkHash);
      observer.disconnect();
    };
  }, [pathname]);

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
        setActiveSection("home");
      }
    },
    [pathname]
  );

  // Smooth scroll to Cyber Challenges Section
  const handleChallengesClick = useCallback(
    (e: React.MouseEvent) => {
      setMobileMenuOpen(false);
      if (pathname === "/") {
        e.preventDefault();
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const chalEl = document.getElementById("challenges");
        if (chalEl) {
          chalEl.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
          window.history.pushState(null, "", "/#challenges");
          setActiveSection("challenges");
        }
      }
    },
    [pathname]
  );

  // Determine active states accurately based on route and section
  const isHomeActive = pathname === "/" && activeSection !== "challenges";
  const isChallengesActive =
    pathname?.startsWith("/play") ||
    (pathname === "/" && activeSection === "challenges");
  const isJoinActive =
    pathname === "/consent" ||
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
          className="brand"
          aria-label="Cyber Campus Home - Return to Hero Section"
        >
          <span className="brand-icon">
            <ShieldCheck size={24} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="brand-text">
            <span className="brand-title">
              cyber<span className="brand-light">campus</span>
            </span>
            <small>Cybersecurity Gaming &amp; Research Platform</small>
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
            className={`nav-pill ${isHomeActive ? "active" : ""}`}
            aria-current={isHomeActive ? "page" : undefined}
          >
            <House size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Home</span>
          </Link>

          <Link
            href="/#challenges"
            onClick={handleChallengesClick}
            className={`nav-pill ${isChallengesActive ? "active" : ""}`}
            aria-current={isChallengesActive ? "page" : undefined}
          >
            <Trophy size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Cyber Challenges</span>
          </Link>

          <Link
            href="/consent"
            className={`nav-pill ${isJoinActive ? "active" : ""}`}
            aria-current={isJoinActive ? "page" : undefined}
          >
            <ListChecks size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>Join Research</span>
          </Link>

          <Link
            href="/privacy"
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
                <ShieldCheck size={18} strokeWidth={2} aria-hidden="true" />
                <span>CYBER CAMPUS</span>
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
                className={`mobile-nav-item mobile-nav-pill ${
                  isHomeActive ? "active" : ""
                }`}
                aria-current={isHomeActive ? "page" : undefined}
              >
                <House size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>Home</span>
              </Link>

              {/* 2. Trophy — Cyber Challenges */}
              <Link
                href="/#challenges"
                onClick={handleChallengesClick}
                className={`mobile-nav-item mobile-nav-pill ${
                  isChallengesActive ? "active" : ""
                }`}
                aria-current={isChallengesActive ? "page" : undefined}
              >
                <Trophy size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>Cyber Challenges</span>
              </Link>

              {/* 3. ListChecks — Join Research */}
              <Link
                href="/consent"
                onClick={() => setMobileMenuOpen(false)}
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
