"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList, Search, ShieldCheck, Check } from "lucide-react";

interface MissionStep {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  href: string;
}

const MISSION_STEPS: MissionStep[] = [
  {
    number: "01",
    title: "Tell us about you",
    description:
      "Read the study information, give consent, and share a little about your academic background.",
    icon: ClipboardList,
    tag: "Your perspective",
    href: "/consent",
  },
  {
    number: "02",
    title: "Meet the threats",
    description:
      "Examine 20 fictional scenarios across Phishing, Pretexting, Impersonation, and Online Scams. Take your time—there is no countdown.",
    icon: Search,
    tag: "Your decisions",
    href: "/consent",
  },
  {
    number: "03",
    title: "See how you did",
    description:
      "Submit your responses, see your Privacy Shield score, and explore debrief explanations.",
    icon: ShieldCheck,
    tag: "Your discoveries",
    href: "/consent",
  },
];

export function SpotMissionSteps() {
  return (
    <section id="how-it-works" className="spot-mission-section" aria-label="Participation Steps">
      <div className="spot-mission-container">
        {/* Section Header: Title on Left, Subtext on Right */}
        <div className="spot-mission-header">
          <div className="spot-mission-header-left">
            <span className="spot-mission-kicker">YOUR MISSION, SHOULD YOU ACCEPT IT</span>
            <h2 className="spot-mission-title">
              A few questions.
              <br />
              A fresh challenge.
            </h2>
          </div>
          <div className="spot-mission-header-right">
            <p className="spot-mission-lead">
              Share your perspective first. Then explore 20 simulated threat scenarios across Phishing, Pretexting, Impersonation, and Online Scams. Your honest answers matter more than your game score.
            </p>
          </div>
        </div>

        {/* 3 Numbered Cards in a Row */}
        <div className="spot-mission-cards-grid">
          {MISSION_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.number}
                href={step.href}
                className="spot-mission-card group"
              >
                {/* Top Row: Icon on left, Number on right */}
                <div className="spot-mission-card-top">
                  <div className="spot-card-icon-wrap">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <span className="spot-card-number">{step.number}</span>
                </div>

                {/* Content */}
                <div className="spot-mission-card-body">
                  <h3 className="spot-card-title">{step.title}</h3>
                  <p className="spot-card-desc">{step.description}</p>
                </div>

                {/* Bottom Status Checkmark */}
                <div className="spot-mission-card-footer">
                  <div className="spot-card-tag">
                    <Check size={14} className="spot-card-check" aria-hidden="true" />
                    <span>{step.tag}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
