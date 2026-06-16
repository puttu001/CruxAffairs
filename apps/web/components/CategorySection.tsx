import type { CurrentAffairItem } from "@/lib/api";
import styles from "./CategorySection.module.css";

interface Props {
  category: string;
  items: CurrentAffairItem[];
}

export default function CategorySection({ category, items }: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{category}</h2>
      <div className={styles.articles}>
        {items.map((item, i) => (
          <article key={i} className={styles.card}>
            <p className={styles.title}>{item.title}</p>
            <ul className={styles.summary}>
              {item.summary.map((point, j) => (
                <li key={j}>{point}</li>
              ))}
            </ul>
            <div className={styles.keywords}>
              {item.keywords.map((kw, k) => (
                <span key={k} className={styles.tag}>
                  {kw}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
