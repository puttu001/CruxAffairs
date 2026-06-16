import { fetchCurrentAffairs, groupByCategory } from "@/lib/api";
import CategorySection from "@/components/CategorySection";
import styles from "./page.module.css";

export default async function HomePage() {
  let grouped: Record<string, import("@/lib/api").CurrentAffairItem[]> = {};
  let error: string | null = null;

  try {
    const items = await fetchCurrentAffairs();
    grouped = groupByCategory(items);
  } catch {
    error = "Could not connect to the API. Make sure the backend is running on port 8000.";
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.logo}>CruxAffairs</h1>
        <p className={styles.date}>Today's Current Affairs · {today}</p>
      </header>

      {error ? (
        <p className={styles.error}>{error}</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className={styles.empty}>
          No articles yet. Run <code>python fetch_pib.py</code> then{" "}
          <code>python process_articles.py</code> first.
        </p>
      ) : (
        <div className={styles.content}>
          {Object.entries(grouped).map(([category, items]) => (
            <CategorySection key={category} category={category} items={items} />
          ))}
        </div>
      )}
    </main>
  );
}
