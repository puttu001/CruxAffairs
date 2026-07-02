"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { authApi } from "../auth.api";
import BrandLogo from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="auth-form-container">
        {/* Logo */}
        <div className="auth-mobile-logo" style={{ display: "flex" }}>
          <BrandLogo imgHeight={32} textSize="1.05rem" />
        </div>

        <div className="auth-card">
          {sent ? (
            <div className="auth-success">
              <div style={{ width: 56, height: 56, background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <svg width="28" height="28" fill="none" stroke="var(--primary)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="auth-heading" style={{ textAlign: "center" }}>Check your email</h2>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center", marginTop: "0.5rem", lineHeight: 1.6 }}>
                If <strong style={{ color: "var(--text)" }}>{email}</strong> is registered,
                you&apos;ll receive a reset link shortly. The link expires in 1 hour.
              </p>
              <Link
                href="/auth/login"
                className="auth-submit"
                style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: "1.5rem" }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ width: 48, height: 48, background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                  <svg width="24" height="24" fill="none" stroke="var(--primary)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="auth-heading">Forgot password?</h2>
                <p className="auth-subheading" style={{ marginBottom: 0 }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-field">
                  <label htmlFor="email">Email address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    />
                  </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="auth-switch">
                Remember your password?{" "}
                <Link href="/auth/login">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
