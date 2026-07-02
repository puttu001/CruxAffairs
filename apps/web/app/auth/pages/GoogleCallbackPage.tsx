"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuth } from "../auth";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);
        router.replace("/");
        return;
      } catch { /* fall through */ }
    }

    router.replace("/auth/login?error=google_auth_failed");
  }, [router, searchParams]);

  return (
    <div className="auth-page" style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-muted)" }}>
        <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
          <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Completing sign in…
      </div>
    </div>
  );
}
