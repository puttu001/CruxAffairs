"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <span className="mobile-header-logo">CruxAffairs</span>
      <div className="mobile-header-actions">
        <ThemeToggle />
        <Link href="/search">
          <Search size={20} style={{ color: "var(--text-secondary)" }} />
        </Link>
      </div>
    </header>
  );
}