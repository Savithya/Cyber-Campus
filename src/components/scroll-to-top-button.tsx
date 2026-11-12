"use client";

import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 rounded text-left"
    >
      <span>Back to Top</span>
      <ArrowUp size={13} aria-hidden="true" />
    </button>
  );
}
