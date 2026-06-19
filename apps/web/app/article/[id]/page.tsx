import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { fetchArticleById, getImportanceLabel, getReadTime } from "@/lib/api";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article: Awaited<ReturnType<typeof fetchArticleById>> | null = null;
  try {
    article = await fetchArticleById(id);
  } catch {
    /* not found */
  }

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

      <div className="detail-summary">
        <h2>Key Points</h2>
        <ul>
          {article.summary.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="detail-keywords">
        <h3>Keywords</h3>
        <div className="detail-keyword-list">
          {article.keywords.map((kw, i) => (
            <span key={i} className="detail-keyword">{kw}</span>
          ))}
        </div>
      </div>

      <p className="detail-original-title">
        Original: {article.title}
      </p>
    </div>
  );
}