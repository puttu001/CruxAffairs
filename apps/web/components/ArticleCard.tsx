"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { CurrentAffairItem } from "@/lib/api";
import { getImportanceLabel, getReadTime } from "@/lib/api";

interface Props {
  item: CurrentAffairItem;
  rank?: number;
  showSummary?: boolean;
}

function getSavedNews(): CurrentAffairItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("saved-news") || "[]");
  } catch { return []; }
}

function isNewsSaved(id: string): boolean {
  return getSavedNews().some((n) => n.id === id);
}

export default function ArticleCard({ item, rank, showSummary = false }: Props) {
  const importance = getImportanceLabel(item.relevance_score);
  const importanceClass =
    importance === "High" ? "tag-high" : importance === "Medium" ? "tag-medium" : "tag-low";
  const readTime = getReadTime(item.summary);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isNewsSaved(item.id));
  }, [item.id]);

  function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    let list = getSavedNews();
    if (saved) {
      list = list.filter((n) => n.id !== item.id);
    } else {
      list.push(item);
    }
    localStorage.setItem("saved-news", JSON.stringify(list));
    setSaved(!saved);
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
              onClick={toggleBookmark}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}