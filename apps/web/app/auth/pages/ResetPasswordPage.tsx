"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../auth.api";
import BrandLogo from "@/components/BrandLogo";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pwRules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ];

  if (!token) {
    return (
      <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="auth-form-container">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#fff7ed", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="28" fill="none" stroke="#f97316" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="auth-heading">Invalid link</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              This password reset link is missing or invalid. Request a new one.
            </p>
            <Link href="/auth/forgot-password" className="auth-submit"
              style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: "1.5rem" }}>
              Request reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <div className="auth-form-container">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="28" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="auth-heading">Password reset!</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <button className="auth-submit" style={{ marginTop: "1.5rem" }}
              onClick={() => router.push("/auth/login")}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      const msg = (err.message ?? "").toLowerCase();
      if (msg.includes("expired") || msg.includes("invalid")) {
        setError("This reset link has expired. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div style={{ marginBottom: "1.5rem" }}>
              <BrandLogo imgHeight={44} textSize="1.3rem" onDark />
            </div>
          <h2>New password,<br />same account.</h2>
          <p>Choose a strong password to keep your CruxAffairs account secure.</p>
          <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {["At least 8 characters long", "One uppercase letter (A–Z)", "At least one number (0–9)"].map((l) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.6rem", opacity: 0.9 }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ fontSize: "0.88rem" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <BrandLogo imgHeight={32} textSize="1.05rem" />
          </div>

          <div className="auth-card">
          <h1 className="auth-heading">Set new password</h1>
          <p className="auth-subheading">Must be at least 8 characters.</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* New password */}
            <div className="auth-field">
              <label htmlFor="password">New password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                />
                <button type="button" className="auth-eye" tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.4rem" }}>
                  {pwRules.map((r) => (
                    <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <svg width="13" height="13" fill="none" stroke={r.ok ? "#22c55e" : "#d1d5db"} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: "0.78rem", color: r.ok ? "#16a34a" : "var(--text-muted)" }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label htmlFor="confirm">Confirm password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <input
                  id="confirm"
                  type={showCf ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                />
                <button type="button" className="auth-eye" tabIndex={-1}
                  onClick={() => setShowCf((v) => !v)}>
                  <EyeIcon open={showCf} />
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Saving…" : "Reset Password"}
            </button>
          </form>

          <p className="auth-switch">
            <Link href="/auth/login">Back to Login</Link>
          </p>
          </div>{/* end auth-card */}
        </div>
      </div>
    </div>
  );
}
