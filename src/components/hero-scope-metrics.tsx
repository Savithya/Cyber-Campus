"use client";

import React from "react";
import { Layers, ShieldAlert, Clock, ArrowUpRight, CheckCircle2, GraduationCap } from "lucide-react";

export function HeroScopeMetrics() {
  const scrollToChallenges = (e: React.MouseEvent) => {
    const el = document.getElementById("threats-heading") || document.getElementById("challenges");
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="hero-scope-metrics-grid grid-4"
      role="region"
      aria-label="Research Scope and Participation Metrics"
    >
      {/* Card 1: 4 Threat Categories */}
      <div
        className="hero-scope-card cat-purple"
        tabIndex={0}
        role="article"
        aria-label="Threat Categories: 4 common social engineering techniques"
        onClick={scrollToChallenges}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            scrollToChallenges(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div className="scope-card-glow-bg purple" aria-hidden="true" />
        <div className="scope-card-top">
          <div className="scope-icon-wrap purple">
            <Layers size={20} aria-hidden="true" />
          </div>
          <span className="scope-pill-badge purple">
            IV1 – IV4
          </span>
        </div>

        <div className="scope-metric-val">4</div>
        <div className="scope-metric-title">Threat Categories</div>
        <p className="scope-metric-desc">
          Explore four common social engineering techniques (IV1–IV4).
        </p>

        {/* User-friendly UX Chips */}
        <div className="scope-metric-tags" aria-label="Included categories">
          <span className="scope-tag-item">Phishing</span>
          <span className="scope-tag-item">Pretexting</span>
          <span className="scope-tag-item">Impersonation</span>
          <span className="scope-tag-item">Malicious Links</span>
        </div>

        <div className="scope-card-hint">
          <span>Explore Categories</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </div>
      </div>

      {/* Card 2: 20 Interactive Challenges */}
      <div
        className="hero-scope-card cat-cyan"
        tabIndex={0}
        role="article"
        aria-label="Interactive Challenges: 20 realistic situations"
        onClick={scrollToChallenges}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            scrollToChallenges(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div className="scope-card-glow-bg cyan" aria-hidden="true" />
        <div className="scope-card-top">
          <div className="scope-icon-wrap cyan">
            <ShieldAlert size={20} aria-hidden="true" />
          </div>
          <span className="scope-pill-badge cyan">
            5 Per Category
          </span>
        </div>

        <div className="scope-metric-val">20</div>
        <div className="scope-metric-title">Interactive Challenges</div>
        <p className="scope-metric-desc">
          Investigate realistic cybersecurity situations and make safe choices.
        </p>

        {/* User-friendly UX Chips */}
        <div className="scope-metric-tags" aria-label="Challenge features">
          <span className="scope-tag-item">Realistic Scenarios</span>
          <span className="scope-tag-item">Safe Sandbox</span>
          <span className="scope-tag-item">No Real Passwords</span>
        </div>

        <div className="scope-card-hint">
          <span>View Challenges</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </div>
      </div>

      {/* Card 3: 15–20 Min Estimated Time */}
      <div
        className="hero-scope-card cat-emerald"
        tabIndex={0}
        role="article"
        aria-label="Estimated Time: 15 to 20 minutes self paced"
      >
        <div className="scope-card-glow-bg emerald" aria-hidden="true" />
        <div className="scope-card-top">
          <div className="scope-icon-wrap emerald">
            <Clock size={20} aria-hidden="true" />
          </div>
          <span className="scope-pill-badge emerald">
            Self-Paced
          </span>
        </div>

        <div className="scope-metric-val">
          15–20 <span className="scope-metric-unit">Min</span>
        </div>
        <div className="scope-metric-title">Estimated Time</div>
        <p className="scope-metric-desc">
          Expected time to complete your voluntary research participation.
        </p>

        {/* User-friendly UX Chips */}
        <div className="scope-metric-tags" aria-label="Time and flexibility">
          <span className="scope-tag-item">Auto-Saved</span>
          <span className="scope-tag-item">Pause Anytime</span>
          <span className="scope-tag-item">100% Voluntary</span>
        </div>

        <div className="scope-card-hint static">
          <CheckCircle2 size={13} className="text-emerald" aria-hidden="true" />
          <span>Flexible &amp; Self-Paced</span>
        </div>
      </div>

      {/* Card 4: University Students in Sri Lanka */}
      <div
        className="hero-scope-card cat-amber"
        tabIndex={0}
        role="article"
        aria-label="Target Population: University Students in Sri Lanka"
      >
        <div className="scope-card-glow-bg amber" aria-hidden="true" />
        <div className="scope-card-top">
          <div className="scope-icon-wrap amber">
            <GraduationCap size={20} aria-hidden="true" />
          </div>
          <span className="scope-pill-badge amber">
            Target Population
          </span>
        </div>

        <div className="scope-metric-val">
          Sri Lanka
        </div>
        <div className="scope-metric-title">University Students</div>
        <p className="scope-metric-desc">
          Higher education undergraduates &amp; postgraduates across Sri Lanka.
        </p>

        {/* User-friendly UX Chips */}
        <div className="scope-metric-tags" aria-label="Target institutions">
          <span className="scope-tag-item">State Universities</span>
          <span className="scope-tag-item">Private Campuses</span>
          <span className="scope-tag-item">All Disciplines</span>
        </div>

        <div className="scope-card-hint static">
          <CheckCircle2 size={13} className="text-amber" aria-hidden="true" />
          <span>Higher Education Study</span>
        </div>
      </div>
    </div>
  );
}
