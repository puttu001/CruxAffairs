import { ClipboardCheck, RotateCcw, FileText } from "lucide-react";

const FEATURES = [
  {
    title: "Daily Quiz",
    desc: "10 Questions from Today's News",
    icon: ClipboardCheck,
    cls: "feature-icon-quiz",
  },
  {
    title: "Revision Due",
    desc: "5 Topics Need Revision Today",
    icon: RotateCcw,
    cls: "feature-icon-revision",
  },
  {
    title: "Monthly Compilation",
    desc: "June 2026 Current Affairs",
    icon: FileText,
    cls: "feature-icon-compilation",
  },
];

export default function FeatureCards() {
  return (
    <div className="features-grid">
      {FEATURES.map((f) => (
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
      ))}
    </div>
  );
}
