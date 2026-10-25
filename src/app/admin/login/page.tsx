"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { api } from "@/lib/client";
import { ErrorBox } from "@/components/ui";

export default function Page() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    if (!pin.trim()) {
      setError("Please enter your access PIN.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await api("auth/login", {
        pin: pin.trim(),
      });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const isSubmitDisabled = busy || !pin.trim();

  return (
    <div className="research-portal-page page-space">
      <div className="research-portal-container">
        {/* Left Column — Research Workspace Introduction & 3D Illustration */}
        <section
          className="research-intro-section"
          aria-labelledby="research-portal-heading"
        >
          <div className="research-badge-wrapper">
            <span className="research-label-badge">
              <span className="pulse-indicator" aria-hidden="true" />
              RESEARCH WORKSPACE
            </span>
          </div>

          <h1 id="research-portal-heading" className="research-portal-title">
            Researcher Access
          </h1>

          <p className="research-portal-subtitle">
            Secure access to research administration and analysis tools.
          </p>

          {/* 3D Cybersecurity Research Illustration Container */}
          <div className="research-illustration-card">
            <div className="illustration-ambient-glow" aria-hidden="true" />
            <div className="illustration-image-frame">
              <Image
                src="/images/research-workspace-portal.jpg"
                alt="Cybersecurity research workspace 3D isometric visualization"
                width={540}
                height={540}
                priority
                className="research-illustration-asset"
              />

              <div className="illustration-status-overlay">
                <span className="illustration-status-dot" aria-hidden="true" />
                <span className="illustration-status-text">
                  Research Intelligence Node · Active &amp; Protected
                </span>
              </div>
            </div>

            {/* Academic security spec pills */}
            <div className="research-security-pills" aria-label="Portal security standards">
              <div className="security-pill">
                <ShieldCheck size={14} className="pill-icon text-cyan" aria-hidden="true" />
                <span>AES-256 Session Encryption</span>
              </div>
              <div className="security-pill">
                <Lock size={14} className="pill-icon text-purple" aria-hidden="true" />
                <span>Rate-Limited Gateway</span>
              </div>
              <div className="security-pill">
                <Database size={14} className="pill-icon text-cyan" aria-hidden="true" />
                <span>IRB Ethics Protocol Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column — Secure Researcher Login Card */}
        <section
          className="research-login-section"
          aria-labelledby="login-card-heading"
        >
          <div className="research-login-card">
            {/* 1. Researcher Access Heading & Icon */}
            <div className="login-card-header">
              <div className="login-icon-tile" aria-hidden="true">
                <LockKeyhole size={26} />
              </div>

              <h2
                id="login-card-heading"
                className="login-card-heading"
                aria-label="Welcome back, Researcher."
              >
                Welcome Back<span className="sr-only">, Researcher.</span>
              </h2>

              <p className="login-card-subtitle">
                Enter your authorised Researcher Access PIN to continue.
                <span className="sr-only">
                  {" "}
                  Enter your authorised Researcher Access PIN to securely access the
                  research dashboard.
                </span>
              </p>
            </div>

            <form className="login-form" onSubmit={login} noValidate>
              {/* 2. Researcher Access PIN input */}
              <div className="form-field-group">
                <label
                  htmlFor="researcher-access-pin"
                  className="field-label"
                >
                  Researcher Access PIN
                </label>
                <div className="pin-input-group">
                  <input
                    id="researcher-access-pin"
                    type={showPin ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your access PIN"
                    required
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      if (error) setError("");
                    }}
                    className="pin-input-field"
                    disabled={busy}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="pin-toggle-btn"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? "Hide access PIN" : "Show access PIN"}
                    title={showPin ? "Hide PIN" : "Show PIN"}
                    tabIndex={0}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error feedback */}
              {error && (
                <div className="login-error-wrapper">
                  <ErrorBox message={error} />
                </div>
              )}

              {/* 3. Primary Action Button */}
              <button
                className="button primary login-submit-btn"
                disabled={isSubmitDisabled}
                type="submit"
                aria-busy={busy}
              >
                {busy ? (
                  <span className="btn-loading-content">
                    <span className="spinner-dot" aria-hidden="true" />
                    Verifying PIN &amp; Credentials…
                  </span>
                ) : (
                  <span className="btn-normal-content">
                    Access Research Dashboard
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                )}
              </button>

              {/* 4. Authorised researchers only security notice */}
              <div className="security-notice-footer">
                <ShieldCheck size={14} className="notice-icon" aria-hidden="true" />
                <p className="security-notice-text">
                  Authorised researchers only.
                  <span className="sr-only">
                    {" "}
                    Researcher access is restricted to authorised personnel only.
                  </span>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
