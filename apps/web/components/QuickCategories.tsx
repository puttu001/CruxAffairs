import Link from "next/link";
import {
  Landmark, TrendingUp, Building2,
  FlaskConical, Leaf, Globe,
} from "lucide-react";

const CATEGORIES = [
  { label: "Banking", slug: "Banking Awareness", icon: Landmark, cls: "cat-banking" },
  { label: "Economy", slug: "Economy", icon: TrendingUp, cls: "cat-economy" },
  { label: "Polity", slug: "Polity", icon: Building2, cls: "cat-polity" },
  { label: "Science & Tech", slug: "Science & Technology", icon: FlaskConical, cls: "cat-science" },
  { label: "Environment", slug: "Environment", icon: Leaf, cls: "cat-environment" },
  { label: "International", slug: "International Relations", icon: Globe, cls: "cat-international" },
];

export default function QuickCategories() {
  return (
    <div className="categories-grid">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories?c=${encodeURIComponent(cat.slug)}`}
          className={`category-btn ${cat.cls}`}
        >
          <div className="category-icon">
            <cat.icon size={22} />
          </div>
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
