"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchAllAffairs, type CurrentAffairItem } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";

const BROAD = [
  "Economy", "Polity", "Science & Technology", "Environment",
  "International Relations", "Defense", "Social",
];

const SUB = [
  "Banking Awareness", "RBI Circulars", "Government Schemes",
  "Reports & Indices", "Appointments", "Awards", "Sports",
  "International Organizations", "Bills & Acts", "Committees",
  "Summits & Conferences", "Defence", "Science & Tech",
];

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("c") || "";

  const [activeCategory, setActiveCategory] = useState(initial);
  const [articles, setArticles] = useState<CurrentAffairItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);

    const isBroad = BROAD.includes(activeCategory);
    const params = isBroad
      ? { category: activeCategory }
      : { sub_category: activeCategory };

    fetchAllAffairs(params)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <h1 className="page-title">Categories</h1>
      <p className="page-subtitle">Browse by broad subject or specific topic</p>

      <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
        Broad Categories
      </h3>
      <div className="filter-chips">
        {BROAD.map((c) => (
          <button
            key={c}
            className={`filter-chip ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
        Specific Topics
      </h3>
      <div className="filter-chips">
        {SUB.map((c) => (
          <button
            key={c}
            className={`filter-chip ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {!activeCategory && (
        <div className="empty-state">
          <p>Select a category or topic above to browse articles.</p>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {!loading && activeCategory && articles.length === 0 && (
        <div className="empty-state">
          <p>No articles found for &quot;{activeCategory}&quot;.</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="card-grid" style={{ marginTop: "1rem" }}>
          {articles.map((item, i) => (
            <ArticleCard key={i} item={item} showSummary />
          ))}
        </div>
      )}
    </>
  );
}
