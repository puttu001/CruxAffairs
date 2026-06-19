"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Archive, LayoutGrid, PenSquare, RotateCcw,
  FileText, Search, Bookmark, User, Star,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Today", href: "/today", icon: Calendar },
  { label: "Archives", href: "/archives", icon: Archive },
  { label: "Categories", href: "/categories", icon: LayoutGrid },
  { label: "Quiz", href: "/quiz", icon: PenSquare },
  { label: "Revision", href: "/revision", icon: RotateCcw },
  { label: "Monthly Notes", href: "#", icon: FileText, disabled: true },
  { label: "Search", href: "/search", icon: Search },
  { label: "Bookmarks", href: "#", icon: Bookmark, disabled: true },
  { label: "Profile", href: "#", icon: User, disabled: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">CA</div>
        <span className="sidebar-logo-text">CruxAffairs</span>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-premium">
          <Star size={20} style={{ color: "var(--accent-orange)" }} />
          <h4>Upgrade to Premium</h4>
          <p>Unlock quizzes, PDFs, flashcards and more.</p>
          <button className="premium-btn">Coming Soon</button>
        </div>
      </div>
    </aside>
  );
}
