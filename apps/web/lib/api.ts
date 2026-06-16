export interface CurrentAffairItem {
  category: string;
  title: string;
  summary: string[];
  keywords: string[];
  relevance_score: number;
  source: string;
}

export async function fetchCurrentAffairs(): Promise<CurrentAffairItem[]> {
  const res = await fetch("http://localhost:8000/current-affairs/", {
    cache: "no-store", // always fetch fresh data
  });
  if (!res.ok) throw new Error("Failed to fetch current affairs");
  return res.json();
}

/** Group a flat list into { category → items[] } preserving insertion order */
export function groupByCategory(
  items: CurrentAffairItem[]
): Record<string, CurrentAffairItem[]> {
  return items.reduce<Record<string, CurrentAffairItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}
