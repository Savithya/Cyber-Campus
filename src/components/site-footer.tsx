"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SiteFooterProps {
  compact?: boolean;
}

export function SiteFooter({ compact }: SiteFooterProps = {}) {
  void compact;

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
