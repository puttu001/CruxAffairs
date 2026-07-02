"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { CurrentAffairItem } from "@/lib/api";
import { getImportanceLabel, getReadTime } from "@/lib/api";
import { useBookmarks } from "@/components/BookmarkProvider";

interface Props {
  item: CurrentAffairItem;
  rank?: number;
  showSummary?: boolean;
}

export default function ArticleCard({ item, rank, showSummary = false }: Props) {
  const importance = getImportanceLabel(item.relevance_score);
  const importanceClass =
    importance === "High" ? "tag-high" : importance === "Medium" ? "tag-medium" : "tag-low";
  const readTime = getReadTime(item.summary);

  const { bookmarkedIds, toggle } = useBookmarks();
  const saved = bookmarkedIds.has(item.id);

  function handleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  return (
    <Link href={`/article/${item.id}`} className="article-card">
      <div className="article-card-header">
        {rank && <span className="article-rank">{rank}</span>}
        <div className="article-body">
          <p className="article-title">{item.short_title || item.title}</p>

          {showSummary && (
            <p className="article-summary desktop-only">
              {item.summary[0]}
            </p>
          )}

          <div className="article-tags">
            <span className="tag tag-category">{item.sub_category || item.category}</span>
            <span className={`tag ${importanceClass}`}>{importance}</span>
          </div>

          <div className="article-meta">
            <span className="article-meta-left">
              {readTime} min read &middot; {item.source}
            </span>
            <button
              className={`bookmark-btn ${saved ? "bookmark-active" : ""}`}
              aria-label="Bookmark"
              onClick={handleBookmark}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
