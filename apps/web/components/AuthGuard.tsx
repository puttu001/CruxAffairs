"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "@/app/auth/auth";

const PUBLIC_PATHS = ["/auth/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    const loggedIn = isLoggedIn();

    if (!isPublic && !loggedIn) {
      router.replace("/auth/login");
      return;
    }

    if (isPublic && loggedIn && pathname !== "/auth/verify-email") {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
