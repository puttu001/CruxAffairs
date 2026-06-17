import { fetchTodayAffairs } from "@/lib/api";
import ArticleCard from "@/components/ArticleCard";

export default async function TodayPage() {
  let articles: Awaited<ReturnType<typeof fetchTodayAffairs>> = [];
  try {
    articles = await fetchTodayAffairs();
  } catch {
    /* API not reachable */
  }

  return (
    <>
      <h1 className="page-title">Today&apos;s Current Affairs</h1>
      <p className="page-subtitle">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
        {" "}&middot; {articles.length} articles
      </p>

      {articles.length > 0 ? (
        <div className="card-grid">
          {articles.map((item, i) => (
            <ArticleCard key={i} item={item} rank={i + 1} showSummary />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No articles for today yet. Run the ingestion pipeline first.</p>
        </div>
      )}
    </>
  );
}
