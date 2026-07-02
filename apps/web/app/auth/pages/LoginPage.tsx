"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "../auth.api";
import { setAuth } from "../auth";
import BrandLogo from "@/components/BrandLogo";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, opts: object) => void;
        };
      };
    };
  }
}

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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "google_auth_failed") {
      setError("Google sign-in failed. Please try again.");
    }
  }, [searchParams]);

  function initGoogle() {
    if (!window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null);
        try {
          const data = await authApi.googleAuth(response.credential);
          setAuth(data.user, data.access_token);
          router.push("/");
        } catch (err: any) {
          setError(err.message || "Google sign-in failed");
        }
      },
    });
    const w = googleBtnRef.current.parentElement?.offsetWidth || googleBtnRef.current.offsetWidth || 320;
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: w,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />

      <div className="auth-page">
        {/* Left brand panel — desktop only */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div style={{ marginBottom: "1.5rem" }}>
              <BrandLogo imgHeight={44} textSize="1.3rem" onDark />
            </div>
            <h2>Stay ahead.<br />Score higher.</h2>
            <p>
              AI-curated current affairs from PIB, RBI, PRS and The Hindu —
              processed for UPSC, SSC and Banking exams.
            </p>
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                "Daily articles from primary government sources",
                "AI summaries optimised for exam relevance",
                "Quiz, revision & topic-wise archives",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", opacity: 0.9 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontSize: "0.88rem" }}>{f}</span>
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
              <h1 className="auth-heading">Welcome back!</h1>
              <p className="auth-subheading">Log in to your account to continue</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email" type="email" autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password" type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  />
                  <button type="button" className="auth-eye" tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <Link href="/auth/forgot-password" className="auth-forgot">
                Forgot Password?
              </Link>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Signing in…" : "Log In"}
              </button>
            </form>

            <div className="auth-divider"><span>OR</span></div>

            <div className="auth-google-wrap">
              <div ref={googleBtnRef} style={{ width: "100%" }} />
            </div>

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup">Sign Up</Link>
            </p>
            </div>{/* end auth-card */}

            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem" }}>
              {["Privacy Policy", "Terms of Service", "Contact Us"].map((l) => (
                <a key={l} href="#" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
