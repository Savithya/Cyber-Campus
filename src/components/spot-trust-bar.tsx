"use client";

import React from "react";
import { Lock, MailCheck, GraduationCap } from "lucide-react";

export function SpotTrustBar() {
  return (
    <section className="spot-trust-bar-section" aria-label="Research Safeguards">
      <div className="spot-trust-bar-container">
        {/* Item 1 */}
        <div className="spot-trust-item">
          <div className="spot-trust-icon-wrap">
            <Lock size={16} aria-hidden="true" />
          </div>
          <span className="spot-trust-label">Anonymous participation</span>
        </div>

        <div className="spot-trust-divider" aria-hidden="true" />

        {/* Item 2 */}
        <div className="spot-trust-item">
          <div className="spot-trust-icon-wrap">
            <MailCheck size={16} aria-hidden="true" />
          </div>
          <span className="spot-trust-label">Fictional scenarios only (IV1–IV4)</span>
        </div>

        <div className="spot-trust-divider" aria-hidden="true" />

        {/* Item 3 */}
        <div className="spot-trust-item">
          <div className="spot-trust-icon-wrap">
            <GraduationCap size={16} aria-hidden="true" />
          </div>
          <span className="spot-trust-label">For students in Sri Lanka, aged 18+</span>
        </div>
      </div>
    </section>
  );
}
