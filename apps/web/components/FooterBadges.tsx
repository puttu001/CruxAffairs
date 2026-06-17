import { Shield, Sparkles, Target } from "lucide-react";

export default function FooterBadges() {
  return (
    <div className="footer-badges">
      <div className="footer-badge">
        <Shield size={16} />
        <span>Curated from Trusted Sources</span>
      </div>
      <div className="footer-badge">
        <Sparkles size={16} />
        <span>AI Summarized</span>
      </div>
      <div className="footer-badge">
        <Target size={16} />
        <span>Exam Focused</span>
      </div>
    </div>
  );
}
