"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Archive, PenSquare, RotateCcw, User } from "lucide-react";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Archives", href: "/archives", icon: Archive },
  { label: "Quiz", href: "/quiz", icon: PenSquare },
  { label: "Revision", href: "/revision", icon: RotateCcw },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`bottom-nav-item ${pathname === item.href ? "active" : ""}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
