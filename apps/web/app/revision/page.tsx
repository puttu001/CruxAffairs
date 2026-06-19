"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, HelpCircle, StickyNote, Trash2, Plus,
  Bookmark, BookmarkCheck, X,
} from "lucide-react";
import type { CurrentAffairItem, QuizQuestion } from "@/lib/api";
import { getImportanceLabel, getReadTime } from "@/lib/api";

type Tab = "news" | "questions" | "notes";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function RevisionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("news");
  const [savedNews, setSavedNews] = useState<CurrentAffairItem[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<QuizQuestion[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [showAnswers, setShowAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    try { setSavedNews(JSON.parse(localStorage.getItem("saved-news") || "[]")); } catch { /* */ }
    try { setSavedQuestions(JSON.parse(localStorage.getItem("quiz-bookmarks") || "[]")); } catch { /* */ }
    try { setNotes(JSON.parse(localStorage.getItem("revision-notes") || "[]")); } catch { /* */ }
  }, []);

  function removeNews(id: string) {
    const updated = savedNews.filter((n) => n.id !== id);
    setSavedNews(updated);
    localStorage.setItem("saved-news", JSON.stringify(updated));
  }

  function removeQuestion(questionText: string) {
    const updated = savedQuestions.filter((q) => q.question !== questionText);
    setSavedQuestions(updated);
    localStorage.setItem("quiz-bookmarks", JSON.stringify(updated));
  }

  function toggleAnswer(qId: number) {
    setShowAnswers((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  }

  function saveNote() {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem("revision-notes", JSON.stringify(updated));
    setNoteTitle("");
    setNoteContent("");
    setShowEditor(false);
  }

  function deleteNote(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("revision-notes", JSON.stringify(updated));
  }

  const TABS = [
    { key: "news" as Tab, label: "Saved News", icon: Newspaper, count: savedNews.length },
    { key: "questions" as Tab, label: "Saved Questions", icon: HelpCircle, count: savedQuestions.length },
    { key: "notes" as Tab, label: "Notes", icon: StickyNote, count: notes.length },
  ];

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
          {savedQuestions.length === 0 ? (
            <div className="empty-state">
              <BookmarkCheck size={36} style={{ color: "var(--border)" }} />
              <p>No saved questions yet. Bookmark questions from the Daily Quiz to review them here.</p>
            </div>
          ) : (
            <div className="revision-list">
              {savedQuestions.map((q, i) => (
                <div key={i} className="revision-q-card">
                  <div className="revision-q-top">
                    <span className="quiz-qnum">Q</span>
                    <button className="revision-remove" onClick={() => removeQuestion(q.question)} aria-label="Remove">
                      <X size={16} />
                    </button>
                  </div>
                  <p className="quiz-question">{q.question}</p>
                  <div className="quiz-options">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`quiz-option ${showAnswers.has(q.id) && idx === q.correct ? "quiz-option-correct" : ""}`}
                        style={{ cursor: "default" }}
                      >
                        <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <button
                    className="revision-show-answer"
                    onClick={() => toggleAnswer(q.id)}
                  >
                    {showAnswers.has(q.id) ? "Hide Answer" : "Show Answer"}
                  </button>
                  {showAnswers.has(q.id) && (
                    <div className="quiz-explanation">
                      <strong>✓ Answer: {String.fromCharCode(65 + q.correct)}</strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
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
                <button className="note-save-btn" onClick={saveNote}>Save Note</button>
                <button className="note-cancel-btn" onClick={() => { setShowEditor(false); setNoteTitle(""); setNoteContent(""); }}>Cancel</button>
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
                  <span className="note-card-date">{note.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}