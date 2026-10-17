"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ShieldCheck, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "./theme-provider";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: "dark" | "light";
          size?: "normal" | "compact";
          tabindex?: number;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoaded?: () => void;
  }
}

// Google reCAPTCHA v2 official public test key (always passes, displays "I'm not a robot")
export const DEFAULT_RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

interface RecaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function RecaptchaWidget({
  onVerify,
  onExpire,
  onError,
  disabled = false,
}: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Measure viewport width for compact vs normal sizing
  useEffect(() => {
    setMounted(true);
    const checkWidth = () => {
      if (typeof window !== "undefined") {
        setIsCompact(window.innerWidth < 380);
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Stable callbacks
  const handleVerify = useCallback(
    (token: string) => {
      onVerify(token);
    },
    [onVerify],
  );

  const handleExpire = useCallback(() => {
    if (onExpire) onExpire();
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }
    }
  }, [onExpire]);

  const handleError = useCallback(() => {
    const msg = "Verification service connection error. Please try again.";
    if (onError) onError(msg);
  }, [onError]);

  // Load Google reCAPTCHA v2 explicit script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
      setScriptLoaded(true);
      return;
    }

    const scriptId = "google-recaptcha-v2-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    window.onRecaptchaLoaded = () => {
      setScriptLoaded(true);
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setLoadError(
          "Could not load Google reCAPTCHA. Please check your network or ad blocker settings.",
        );
        setIsRendering(false);
      };
      document.head.appendChild(script);
    } else {
      if (window.grecaptcha) {
        setScriptLoaded(true);
      }
    }
  }, []);

  // Render or re-render the reCAPTCHA widget when script is loaded or theme changes
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || typeof window === "undefined") {
      return;
    }

    const grecaptcha = window.grecaptcha;
    if (!grecaptcha || typeof grecaptcha.render !== "function") return;

    try {
      setIsRendering(true);
      containerRef.current.innerHTML = "";

      const widgetTheme = theme === "light" ? "light" : "dark";
      const widgetSize = isCompact ? "compact" : "normal";

      const id = grecaptcha.render(containerRef.current, {
        sitekey: DEFAULT_RECAPTCHA_SITE_KEY,
        theme: widgetTheme,
        size: widgetSize,
        tabindex: 0,
        callback: (token: string) => {
          handleVerify(token);
        },
        "expired-callback": () => {
          handleExpire();
        },
        "error-callback": () => {
          handleError();
        },
      });

      widgetIdRef.current = id;
      setIsRendering(false);
      setLoadError(null);
    } catch {
      // In case render failed or element was unmounted
      setIsRendering(false);
    }

    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [scriptLoaded, theme, isCompact, handleVerify, handleExpire, handleError]);

  // Retry loading script
  const handleRetry = () => {
    setLoadError(null);
    setIsRendering(true);
    const existing = document.getElementById("google-recaptcha-v2-script");
    if (existing) {
      existing.remove();
    }
    const script = document.createElement("script");
    script.id = "google-recaptcha-v2-script";
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError(
        "Could not load Google reCAPTCHA. Please check your network or ad blocker settings.",
      );
      setIsRendering(false);
    };
    document.head.appendChild(script);
  };

  return (
    <div
      className={`recaptcha-component-wrapper ${disabled ? "disabled" : ""}`}
      role="region"
      aria-label="Human Verification"
    >
      {/* Test helper for automated headless test suites */}
      {mounted &&
        (process.env.NODE_ENV === "test" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "localhost") && (
        <button
          type="button"
          className="e2e-captcha-simulate-btn sr-only focus:not-sr-only"
          data-testid="e2e-captcha-simulate"
          onClick={() =>
            handleVerify(
              "test-captcha-token-valid-" +
                Date.now() +
                "-" +
                Math.random().toString(36).slice(2)
            )
          }
          title="E2E Verification Bypass for Automated Test Suites"
        >
          [Dev/Test: Verify &quot;I&apos;m not a robot&quot;]
        </button>
      )}

      <div className="recaptcha-inner-container">
        {/* Loading placeholder skeleton */}
        {isRendering && !loadError && (
          <div className="recaptcha-skeleton" aria-live="polite">
            <Loader2 className="animate-spin text-primary" size={20} aria-hidden="true" />
            <span className="skeleton-text">
              Loading &quot;I&apos;m not a robot&quot; verification…
            </span>
          </div>
        )}

        {/* Load Error State */}
        {loadError && (
          <div className="recaptcha-error-state" role="alert">
            <div className="recaptcha-error-header">
              <AlertCircle size={16} className="text-red" aria-hidden="true" />
              <span>Verification Service Unavailable</span>
            </div>
            <p className="recaptcha-error-desc">{loadError}</p>
            <button
              type="button"
              className="recaptcha-retry-btn"
              onClick={handleRetry}
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Retry verification</span>
            </button>
          </div>
        )}

        {/* Container where Google reCAPTCHA v2 iframe renders */}
        <div
          ref={containerRef}
          className={`recaptcha-mount-target ${isRendering ? "hidden" : "visible"}`}
          data-testid="recaptcha-container"
        />
      </div>

      <div className="recaptcha-subtext">
        <ShieldCheck size={13} className="text-muted" aria-hidden="true" />
        <span>Official Google reCAPTCHA v2 Security Verification</span>
      </div>
    </div>
  );
}
