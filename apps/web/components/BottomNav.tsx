"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Archive, PenSquare, RotateCcw, User } from "lucide-react";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Archives", href: "/archives", icon: Archive },
  { label: "Quiz", href: "#", icon: PenSquare, disabled: true },
  { label: "Revision", href: "#", icon: RotateCcw, disabled: true },
  { label: "Profile", href: "#", icon: User, disabled: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`bottom-nav-item ${pathname === item.href ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
