"use client";

import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { HeroCyberVisual } from "./hero-cyber-visual";

export function SpotHero() {
  return (
    <section className="spot-hero-section" aria-label="Cyber Campus Research Overview">
      <div className="spot-hero-container">
        {/* Left Column: Heading, Subhead, CTA */}
        <div className="spot-hero-content">
          {/* Eyebrow badge */}
          <div className="spot-eyebrow">
            <span className="spot-dot" aria-hidden="true" />
            <span>A little curiosity. A safer campus.</span>
          </div>

          {/* Main Display Brand Title */}
          <div className="spot-brand-title-wrap">
            <h1 className="spot-brand-title">
              Spot the{" "}
              <span className="spot-accent-threat">
                Threat
                <svg
                  className="spot-brush-underline"
                  viewBox="0 0 200 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C50 4 150 2 197 12C160 8 70 7 12 16"
                    stroke="#e08a3c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <span className="spot-subtitle-tag">
              SOCIAL ENGINEERING CHALLENGES
            </span>
          </div>

          {/* Core Question Headline */}
          <h2 className="spot-question-heading">
            Can you spot the signs before your privacy is compromised?
          </h2>

          {/* Research Topic Description */}
          <p className="spot-body-text">
            Real-looking campus messages. Clever social engineering tricks. Can
            you spot the threats? Bring your instincts to an interactive
            research activity exploring the impact of social engineering on user
            privacy among university students in Sri Lanka.
          </p>

          {/* Action Row: Start Challenge Button + Duration */}
          <div className="spot-action-row">
            <Link
              href="/consent"
              prefetch={true}
              className="spot-start-button"
              aria-label="Start Cyber Campus Challenge"
            >
              <span>Start Challenge</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <div className="spot-duration-badge">
              <Clock size={16} aria-hidden="true" />
              <span>Around 12–15 minutes</span>
            </div>
          </div>

          {/* Academic Trust Subtext */}
          <div className="spot-study-note">
            <ShieldCheck size={16} className="spot-study-icon" aria-hidden="true" />
            <span>This activity is part of an academic research study.</span>
          </div>
        </div>

        {/* Right Column: Cyber Visual Image Artwork */}
        <div className="spot-hero-visual flex justify-center lg:justify-end w-full">
          <HeroCyberVisual />
        </div>
      </div>
    </section>
  );
}
