import type { CurrentAffairItem, QuizQuestion } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ca_token");
}

async function authFetch<T>(method: string, path: string, body?: object): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`);
  return data;
}

export interface QuizBookmarkItem {
  id: string;
  question_data: QuizQuestion;
  created_at: string | null;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  created_at: string | null;
}

export const userApi = {
  // Article bookmarks
  getBookmarkIds: () => authFetch<string[]>("GET", "/user/bookmarks/ids"),
  getBookmarks: () => authFetch<CurrentAffairItem[]>("GET", "/user/bookmarks"),
  addBookmark: (article_id: string) => authFetch<void>("POST", "/user/bookmarks", { article_id }),
  removeBookmark: (article_id: string) => authFetch<void>("DELETE", `/user/bookmarks/${article_id}`),

  // Quiz bookmarks
  getQuizBookmarks: () => authFetch<QuizBookmarkItem[]>("GET", "/user/quiz-bookmarks"),
  addQuizBookmark: (question_data: QuizQuestion) =>
    authFetch<{ id: string }>("POST", "/user/quiz-bookmarks", { question_data }),
  removeQuizBookmark: (id: string) => authFetch<void>("DELETE", `/user/quiz-bookmarks/${id}`),

  // Notes
  getNotes: () => authFetch<NoteItem[]>("GET", "/user/notes"),
  addNote: (title: string, content: string) =>
    authFetch<NoteItem>("POST", "/user/notes", { title, content }),
  deleteNote: (id: string) => authFetch<void>("DELETE", `/user/notes/${id}`),
};
