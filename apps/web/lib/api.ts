const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface AdditionalInfoItem {
  subject: string;
  facts: string[];
}

export interface CurrentAffairItem {
  id: string;
  category: string;
  sub_category: string;
  short_title: string;
  title: string;
  url: string;
  summary: string[];
  keywords: string[];
  additional_info: AdditionalInfoItem[];
  relevance_score: number;
  source: string;
}

async function apiFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function fetchTodayAffairs() {
  return apiFetch<CurrentAffairItem[]>("/current-affairs/today");
}

export function fetchAllAffairs(params?: {
  date?: string;
  source?: string;
  category?: string;
  sub_category?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);
  if (params?.source) qs.set("source", params.source);
  if (params?.category) qs.set("category", params.category);
  if (params?.sub_category) qs.set("sub_category", params.sub_category);
  const query = qs.toString();
  return apiFetch<CurrentAffairItem[]>(`/current-affairs/${query ? `?${query}` : ""}`);
}

export function fetchArticleById(id: string) {
  return apiFetch<CurrentAffairItem>(`/current-affairs/detail/${id}`);
}

export function searchAffairs(q: string) {
  return apiFetch<CurrentAffairItem[]>(`/current-affairs/search?q=${encodeURIComponent(q)}`);
}

// Quiz types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  source_title: string;
}

export interface DailyQuiz {
  date: string;
  total_questions: number;
  questions: QuizQuestion[];
}

export function fetchDailyQuiz() {
  return apiFetch<DailyQuiz>("/quiz/daily");
}

export function getImportanceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 8) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

export function getReadTime(summary: string[]): number {
  const words = summary.join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 80));
}
