"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, HelpCircle, StickyNote, Trash2, Plus,
  Bookmark, BookmarkCheck, X, Loader2,
} from "lucide-react";
import type { CurrentAffairItem } from "@/lib/api";
import { getImportanceLabel, getReadTime } from "@/lib/api";
import { userApi, type NoteItem, type QuizBookmarkItem } from "@/lib/user-api";
import type { QuizQuestion } from "@/lib/api";

type Tab = "news" | "questions" | "notes";

export default function RevisionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [savedNews, setSavedNews] = useState<CurrentAffairItem[]>([]);
  const [quizBookmarks, setQuizBookmarks] = useState<QuizBookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      userApi.getBookmarks(),
      userApi.getQuizBookmarks(),
      userApi.getNotes(),
    ]).then(([bookmarks, quizBms, userNotes]) => {
      setSavedNews(bookmarks);
      setQuizBookmarks(quizBms);
      setNotes(userNotes);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function removeNews(articleId: string) {
    setSavedNews((prev) => prev.filter((n) => n.id !== articleId));
    await userApi.removeBookmark(articleId).catch(() => {});
  }

  async function removeQuizBookmark(id: string) {
    setQuizBookmarks((prev) => prev.filter((b) => b.id !== id));
    await userApi.removeQuizBookmark(id).catch(() => {});
  }

  function toggleAnswer(id: string) {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function saveNote() {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSavingNote(true);
    try {
      const note = await userApi.addNote(noteTitle.trim(), noteContent.trim());
      setNotes((prev) => [note, ...prev]);
      setNoteTitle("");
      setNoteContent("");
      setShowEditor(false);
    } catch { /* ignore */ } finally {
      setSavingNote(false);
    }
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await userApi.deleteNote(id).catch(() => {});
  }

  function formatDate(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  const TABS = [
    { key: "news" as Tab, label: "Saved News", icon: Newspaper, count: savedNews.length },
    { key: "questions" as Tab, label: "Saved Questions", icon: HelpCircle, count: quizBookmarks.length },
    { key: "notes" as Tab, label: "Notes", icon: StickyNote, count: notes.length },
  ];

  if (loading) {
    return (
      <div className="revision-page">
        <h1 className="page-title">Revision</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginTop: "2rem" }}>
          <Loader2 size={18} className="spin" /> Loading your saved content…
        </div>
      </div>
    );
  }

  return (
    <div className="revision-page">
      <h1 className="page-title">Revision</h1>
      <p className="page-subtitle">Your saved articles, quiz questions, and study notes</p>

      {/* Tabs */}
      <div className="revision-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`revision-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count > 0 && <span className="revision-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Saved News */}
      {activeTab === "news" && (
        <div className="revision-content">
          {savedNews.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={36} style={{ color: "var(--border)" }} />
              <p>No saved articles yet. Tap the bookmark icon on any news card to save it here.</p>
            </div>
          ) : (
            <div className="revision-list">
              {savedNews.map((item) => {
                const importance = getImportanceLabel(item.relevance_score);
                const cls = importance === "High" ? "tag-high" : importance === "Medium" ? "tag-medium" : "tag-low";
                return (
                  <div key={item.id} className="revision-news-card">
                    <Link href={`/article/${item.id}`} className="revision-news-body">
                      <p className="revision-news-title">{item.short_title || item.title}</p>
                      <div className="article-tags">
                        <span className="tag tag-category">{item.sub_category || item.category}</span>
                        <span className={`tag ${cls}`}>{importance}</span>
                      </div>
                      <span className="revision-news-meta">
                        {getReadTime(item.summary)} min read · {item.source}
                      </span>
                    </Link>
                    <button className="revision-remove" onClick={() => removeNews(item.id)} aria-label="Remove">
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Saved Questions */}
      {activeTab === "questions" && (
        <div className="revision-content">
          {quizBookmarks.length === 0 ? (
            <div className="empty-state">
              <BookmarkCheck size={36} style={{ color: "var(--border)" }} />
              <p>No saved questions yet. Bookmark questions from the Daily Quiz to review them here.</p>
            </div>
          ) : (
            <div className="revision-list">
              {quizBookmarks.map((b) => {
                const q = b.question_data as QuizQuestion;
                return (
                  <div key={b.id} className="revision-q-card">
                    <div className="revision-q-top">
                      <span className="quiz-qnum">Q</span>
                      <button className="revision-remove" onClick={() => removeQuizBookmark(b.id)} aria-label="Remove">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="quiz-question">{q.question}</p>
                    <div className="quiz-options">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`quiz-option ${showAnswers.has(b.id) && idx === q.correct ? "quiz-option-correct" : ""}`}
                          style={{ cursor: "default" }}
                        >
                          <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <button className="revision-show-answer" onClick={() => toggleAnswer(b.id)}>
                      {showAnswers.has(b.id) ? "Hide Answer" : "Show Answer"}
                    </button>
                    {showAnswers.has(b.id) && (
                      <div className="quiz-explanation">
                        <strong>✓ Answer: {String.fromCharCode(65 + q.correct)}</strong>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {activeTab === "notes" && (
        <div className="revision-content">
          {!showEditor && (
            <button className="revision-add-note" onClick={() => setShowEditor(true)}>
              <Plus size={18} />
              Create New Note
            </button>
          )}

          {showEditor && (
            <div className="note-editor">
              <input
                type="text"
                className="note-editor-title"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="note-editor-body"
                placeholder="Write your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
              />
              <div className="note-editor-actions">
                <button className="note-save-btn" onClick={saveNote} disabled={savingNote}>
                  {savingNote ? "Saving…" : "Save Note"}
                </button>
                <button className="note-cancel-btn" onClick={() => { setShowEditor(false); setNoteTitle(""); setNoteContent(""); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {notes.length === 0 && !showEditor ? (
            <div className="empty-state">
              <StickyNote size={36} style={{ color: "var(--border)" }} />
              <p>No notes yet. Create a note to jot down key points for revision.</p>
            </div>
          ) : (
            <div className="revision-list">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-card-top">
                    <h3>{note.title}</h3>
                    <button className="revision-remove" onClick={() => deleteNote(note.id)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="note-card-body">{note.content}</p>
                  <span className="note-card-date">{formatDate(note.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
