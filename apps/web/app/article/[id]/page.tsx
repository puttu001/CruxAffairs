"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink, BookOpen } from "lucide-react";
import { fetchArticleById, getImportanceLabel, getReadTime, type CurrentAffairItem } from "@/lib/api";

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<CurrentAffairItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    fetchArticleById(id)
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;

  if (!article) {
    return (
      <div className="empty-state">
        <p>Article not found.</p>
        <Link href="/" className="section-link" style={{ marginTop: "1rem", display: "inline-block" }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  const importance = getImportanceLabel(article.relevance_score);
  const importanceClass =
    importance === "High" ? "tag-high" : importance === "Medium" ? "tag-medium" : "tag-low";
  const readTime = getReadTime(article.summary);

  return (
    <div className="article-detail">
      <Link href="/" className="back-link">
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="detail-tags">
        <span className="tag tag-category">{article.sub_category || article.category}</span>
        <span className={`tag ${importanceClass}`}>{importance}</span>
        <span className="tag" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
          {article.source}
        </span>
      </div>

      <h1 className="detail-title">{article.short_title || article.title}</h1>

      <div className="detail-meta">
        <span><Clock size={14} /> {readTime} min read</span>
        <span>{article.category}</span>
      </div>

      {/* Key Points */}
      <div className="detail-summary">
        <h2>Key Points</h2>
        <ul>
          {article.summary.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      {/* Additional Information */}
      {article.additional_info && article.additional_info.length > 0 && (
        <div className="detail-additional">
          <h2>
            <BookOpen size={18} />
            Additional Information
          </h2>
          {article.additional_info.map((info, i) => (
            <div key={i} className="additional-block">
              <h3>{info.subject}</h3>
              <ul>
                {info.facts.map((fact, j) => (
                  <li key={j}>{fact}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Keywords */}
      <div className="detail-keywords">
        <h3>Keywords</h3>
        <div className="detail-keyword-list">
          {article.keywords.map((kw, i) => (
            <span key={i} className="detail-keyword">{kw}</span>
          ))}
        </div>
      </div>

      {/* View Original Source button */}
      <div className="detail-original-section">
        <button
          className="original-toggle-btn"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <ExternalLink size={14} />
          {showOriginal ? "Hide Original" : "View Original Source"}
        </button>

        {showOriginal && (
          <div className="original-content">
            <p className="original-title">{article.title}</p>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="original-link"
              >
                Open on {article.source} website →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}