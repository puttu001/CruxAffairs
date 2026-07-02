"use client";

import { Bell } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import BrandLogo from "./BrandLogo";

export default function MobileHeader() {
  return (
    <header className="mobile-header">
      <BrandLogo imgHeight={26} textSize="0.95rem" />
      <div className="mobile-header-actions">
        <ThemeToggle />
        <button style={{ color: "var(--text-secondary)", opacity: 0.4 }} aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}