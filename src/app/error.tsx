"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, RefreshCw } from "lucide-react";
import { clearDraft } from "@/lib/client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions for diagnostics
    console.error("Global application error boundary caught:", error);
  }, [error]);

  const handleResetSession = () => {
    try {
      clearDraft();
      sessionStorage.clear();
    } catch {
      // ignore storage errors
    }
    window.location.href = "/";
  };

  return (
    <div className="container page-space narrow py-12" role="alert">
      <div className="card p-8 md:p-10 text-center max-w-xl mx-auto border rounded-2xl shadow-sm bg-card">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950 text-red flex items-center justify-center mb-5">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-bold text-ink">We couldn&apos;t load this page</h1>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
          An unexpected issue occurred while rendering this view. You can retry loading the page, return to the home dashboard, or reset your current session.
        </p>

        {error?.message && (
          <div className="mt-4 p-3 rounded-lg bg-surface-2 border text-xs font-mono text-muted text-left overflow-x-auto max-h-28">
            <span className="font-semibold text-ink block mb-1">Details:</span>
            <span>{error.message}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button
            type="button"
            onClick={() => reset()}
            className="button primary flex items-center gap-2"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Try Again</span>
          </button>

          <Link href="/" className="button secondary flex items-center gap-2">
            <Home size={16} aria-hidden="true" />
            <span>Return to Home</span>
          </Link>

          <button
            type="button"
            onClick={handleResetSession}
            className="button ghost small text-muted flex items-center gap-1.5"
            title="Clear stored session draft and return home"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Reset Draft &amp; Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
