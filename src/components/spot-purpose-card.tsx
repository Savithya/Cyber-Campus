"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight } from "lucide-react";

export function SpotPurposeCard() {
  return (
    <section className="spot-purpose-section" aria-label="Research Purpose">
      <div className="spot-purpose-container">
        <div className="spot-purpose-card">
          {/* Left Icon Badge */}
          <div className="spot-purpose-icon-box">
            <GraduationCap size={24} aria-hidden="true" />
          </div>

          {/* Center Text Block */}
          <div className="spot-purpose-text">
            <span className="spot-purpose-kicker">A CHALLENGE WITH A PURPOSE</span>
            <h3 className="spot-purpose-title">
              Your perspective supports student research.
            </h3>
            <p className="spot-purpose-desc">
              Help us understand factors associated with university students&apos;
              responses to social engineering threats and user privacy in Sri Lanka.
            </p>
          </div>

          {/* Right Action Link */}
          <div className="spot-purpose-action">
            <Link
              href="/privacy"
              prefetch={true}
              className="spot-purpose-link"
              aria-label="Read about the study"
            >
              <span>Read about the study</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
