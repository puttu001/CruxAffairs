"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../auth.api";
import { setAuth } from "../auth";
import BrandLogo from "@/components/BrandLogo";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setDigits(value.split(""));
      inputRefs.current[5]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) { setError("Enter the 6-digit code from your email"); return; }
    if (!email) { setError("Email missing — go back and register again"); return; }

    setVerifying(true);
    setError("");
    try {
      const data = await authApi.verifyEmail(email, otp);
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resending || countdown > 0 || !email) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="auth-form-container">
        <div className="auth-mobile-logo" style={{ display: "flex" }}>
          <BrandLogo imgHeight={32} textSize="1.05rem" />
        </div>

        <div className="auth-card">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: 56, height: 56, background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="28" fill="none" stroke="var(--primary)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="auth-heading">Check your email</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.5 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: "var(--text)" }}>{email || "your email"}</strong>
            </p>
          </div>

          {/* OTP boxes */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "0.5rem" }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  style={{
                    width: 44, height: 52,
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    borderRadius: 10,
                    border: `2px solid ${error ? "var(--accent-red)" : d ? "var(--primary)" : "var(--border)"}`,
                    background: error ? "color-mix(in srgb, var(--accent-red) 5%, var(--bg))" : d ? "color-mix(in srgb, var(--primary) 8%, var(--bg))" : "var(--bg)",
                    color: "var(--text)",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="auth-error" style={{ textAlign: "center", marginBottom: "0.75rem" }}>{error}</p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={verifying || digits.join("").length < 6}
              style={{ marginTop: "1rem" }}
            >
              {verifying ? "Verifying…" : "Verify Email"}
            </button>
          </form>

          {/* Resend */}
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: countdown > 0 || resending ? "var(--text-muted)" : "var(--primary)",
                background: "none",
                border: "none",
                cursor: countdown > 0 || resending ? "default" : "pointer",
                padding: 0,
              }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : resending ? "Sending…" : "Resend code"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
            Code expires in 15 minutes
          </p>

          <Link href="/auth/login"
            style={{ display: "block", textAlign: "center", fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
