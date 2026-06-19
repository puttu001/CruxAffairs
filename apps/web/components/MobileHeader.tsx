"use client";

import { Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <span className="mobile-header-logo">CruxAffairs</span>
      <div className="mobile-header-actions">
        <ThemeToggle />
        <button style={{ color: "var(--text-secondary)", opacity: 0.4 }} aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}