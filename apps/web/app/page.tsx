import Link from "next/link";
import { Flame } from "lucide-react";
import { fetchTodayAffairs } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";
import QuickCategories from "@/components/QuickCategories";
import FeatureCards from "@/components/FeatureCards";
import FooterBadges from "@/components/FooterBadges";

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof fetchTodayAffairs>> = [];
  try {
    articles = await fetchTodayAffairs();
  } catch {
    /* API not reachable — show empty state */
  }

  const top3 = articles.slice(0, 3);

  return (
    <>
      {/* Search bar */}
      <Link href="/search" className="search-bar">
        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Search Current Affairs...</span>
      </Link>

      {/* Today's Top */}
      <div className="section-header">
        <h2 className="section-title">
          <Flame size={20} style={{ color: "var(--accent-orange)" }} />
          Today&apos;s Top Current Affairs
        </h2>
        <Link href="/today" className="section-link">View All</Link>
      </div>

      {top3.length > 0 ? (
        <div className="card-grid card-grid-horizontal" style={{ marginBottom: "1rem" }}>
          {top3.map((item, i) => (
            <ArticleCard key={i} item={item} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginBottom: "1rem" }}>
          <p>No articles yet for today. Run the ingestion pipeline first.</p>
        </div>
      )}

      {/* Quick Categories */}
      <div className="section-header">
        <h2 className="section-title">Quick Categories</h2>
      </div>
      <QuickCategories />

      {/* Feature Cards (static) */}
      <FeatureCards />

      {/* Footer */}
      <FooterBadges />
    </>
  );
}
