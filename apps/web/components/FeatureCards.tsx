import Link from "next/link";
import { ClipboardCheck, RotateCcw, FileText } from "lucide-react";

const FEATURES = [
  {
    title: "Daily Quiz",
    desc: "10 Questions from Today's News",
    icon: ClipboardCheck,
    cls: "feature-icon-quiz",
    href: "/quiz",
    active: true,
  },
  {
    title: "Revision",
    desc: "Saved News, Questions & Notes",
    icon: RotateCcw,
    cls: "feature-icon-revision",
    href: "/revision",
    active: true,
  },
  {
    title: "Monthly Compilation",
    desc: "June 2026 Current Affairs",
    icon: FileText,
    cls: "feature-icon-compilation",
    href: "#",
    active: false,
  },
];

export default function FeatureCards() {
  return (
    <div className="features-grid">
      {FEATURES.map((f) =>
        f.active ? (
          <Link key={f.title} href={f.href} className="feature-card" style={{ opacity: 1 }}>
            <div className={`feature-icon ${f.cls}`}>
              <f.icon size={22} />
            </div>
            <div className="feature-info">
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </Link>
        ) : (
          <div key={f.title} className="feature-card">
            <div className={`feature-icon ${f.cls}`}>
              <f.icon size={22} />
            </div>
            <div className="feature-info">
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
            <span className="coming-soon-badge">Coming Soon</span>
          </div>
        )
      )}
    </div>
  );
}