"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { searchAffairs, type CurrentAffairItem } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CurrentAffairItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchAffairs(query.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Search</h1>
      <p className="page-subtitle">Find articles across all sources and categories</p>

      <form onSubmit={handleSearch}>
        <div className="search-input-large">
          <Search size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search for RBI, ISRO, Delimitation Bill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </form>

      {loading && <div className="loading">Searching...</div>}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <p>No results found for &quot;{query}&quot;. Try a different keyword.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="page-subtitle">{results.length} results for &quot;{query}&quot;</p>
          <div className="card-grid">
            {results.map((item, i) => (
              <ArticleCard key={i} item={item} showSummary />
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="empty-state">
          <Search size={40} style={{ color: "var(--border)", marginBottom: "0.75rem" }} />
          <p>Type a keyword and press Enter to search.</p>
        </div>
      )}
    </>
  );
}
