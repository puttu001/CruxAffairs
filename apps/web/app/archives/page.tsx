"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { fetchAllAffairs, type CurrentAffairItem } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";

export default function ArchivesPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [articles, setArticles] = useState<CurrentAffairItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setSearched(true);
    fetchAllAffairs({ date: selectedDate })
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <>
      <h1 className="page-title">Archives</h1>
      <p className="page-subtitle">Browse current affairs from any date</p>

      <div className="date-picker-wrapper">
        <CalendarDays size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
        <input
          type="date"
          className="date-picker-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      {loading && <div className="loading">Loading...</div>}

      {!loading && searched && articles.length === 0 && (
        <div className="empty-state">
          <p>No articles found for this date.</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <>
          <p className="page-subtitle" style={{ marginTop: "0.5rem" }}>
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
            {" "}&middot; {articles.length} articles
          </p>
          <div className="card-grid">
            {articles.map((item, i) => (
              <ArticleCard key={i} item={item} rank={i + 1} />
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="empty-state">
          <CalendarDays size={40} style={{ color: "var(--border)", marginBottom: "0.75rem" }} />
          <p>Pick a date above to view that day&apos;s current affairs.</p>
        </div>
      )}
    </>
  );
}