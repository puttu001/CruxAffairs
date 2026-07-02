"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Trophy, Loader2, AlertCircle, Send } from "lucide-react";
import { fetchDailyQuiz, type QuizQuestion, type DailyQuiz } from "@/lib/api";
import { userApi } from "@/lib/user-api";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<number, number>>({});
  // Maps question text → DB bookmark UUID (present = bookmarked)
  const [bookmarkMap, setBookmarkMap] = useState<Map<string, string>>(new Map());
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    userApi.getQuizBookmarks()
      .then((items) => {
        const map = new Map<string, string>();
        items.forEach((b) => map.set(b.question_data.question, b.id));
        setBookmarkMap(map);
      })
      .catch(() => {});
  }, []);

  async function startQuiz() {
    setLoading(true);
    setError("");
    setSelected({});
    setSubmitted(false);
    try {
      const data = await fetchDailyQuiz();
      setQuiz(data);
      setStarted(true);
    } catch {
      setError("Could not generate quiz. Make sure today's articles are ingested and processed.");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(questionId: number, optionIndex: number) {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function submitQuiz() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleBookmark(question: QuizQuestion) {
    const isBookmarked = bookmarkMap.has(question.question);
    if (isBookmarked) {
      const dbId = bookmarkMap.get(question.question)!;
      setBookmarkMap((prev) => { const next = new Map(prev); next.delete(question.question); return next; });
      try {
        await userApi.removeQuizBookmark(dbId);
      } catch {
        setBookmarkMap((prev) => new Map(prev).set(question.question, dbId));
      }
    } else {
      // Optimistic: use a placeholder until the API responds
      setBookmarkMap((prev) => new Map(prev).set(question.question, "pending"));
      try {
        const res = await userApi.addQuizBookmark(question);
        setBookmarkMap((prev) => new Map(prev).set(question.question, res.id));
      } catch {
        setBookmarkMap((prev) => { const next = new Map(prev); next.delete(question.question); return next; });
      }
    }
  }

  const answered = Object.keys(selected).length;
  const allAnswered = quiz ? answered === quiz.total_questions : false;
  const correct = quiz
    ? quiz.questions.filter((q) => selected[q.id] === q.correct).length
    : 0;

  if (!started) {
    return (
      <div className="quiz-start">
        <div className="quiz-start-card">
          <Trophy size={40} style={{ color: "var(--accent-green)" }} />
          <h1>Daily Quiz</h1>
          <p>10 tricky MCQ questions from today&apos;s current affairs. Test your exam readiness.</p>
          <ul className="quiz-rules">
            <li>Questions are generated from today&apos;s news using AI</li>
            <li>Each question has 4 options — only 1 is correct</li>
            <li>Answer all 10, then submit to see your score and explanations</li>
            <li>Bookmark questions for future revision</li>
          </ul>
          <button className="quiz-start-btn" onClick={startQuiz} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="spin" /> Generating Quiz...</>
            ) : (
              "Start Quiz →"
            )}
          </button>
          {error && <p className="quiz-error"><AlertCircle size={14} /> {error}</p>}
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1 className="page-title">Daily Quiz</h1>
        <div className="quiz-score">
          {submitted ? (
            <span className="quiz-final-score">{correct}/{quiz.total_questions}</span>
          ) : (
            <span>{answered}/{quiz.total_questions} attempted</span>
          )}
        </div>
      </div>

      {submitted && (
        <div className={`quiz-result ${correct >= 7 ? "quiz-result-good" : correct >= 4 ? "quiz-result-ok" : "quiz-result-low"}`}>
          <Trophy size={20} />
          <span>
            {correct >= 8
              ? "Excellent! You're well-prepared."
              : correct >= 5
                ? "Good effort! Review the explanations below."
                : "Keep studying! Bookmark questions for revision."}
          </span>
        </div>
      )}

      <div className="quiz-questions">
        {quiz.questions.map((q) => {
          const userPick = selected[q.id];
          const hasAnswer = userPick !== undefined;
          const isBookmarked = bookmarkMap.has(q.question);

          return (
            <div key={q.id} className="quiz-card">
              <div className="quiz-card-top">
                <span className="quiz-qnum">Q{q.id}</span>
                <div style={{ flex: 1 }} />
                <button
                  className={`quiz-bookmark ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={() => toggleBookmark(q)}
                  aria-label="Bookmark"
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>

              <p className="quiz-question">{q.question}</p>

              <div className="quiz-options">
                {q.options.map((opt, idx) => {
                  let cls = "quiz-option";
                  if (submitted) {
                    if (idx === q.correct) cls += " quiz-option-correct";
                    else if (idx === userPick) cls += " quiz-option-wrong";
                    else cls += " quiz-option-disabled";
                  } else if (idx === userPick) {
                    cls += " quiz-option-selected";
                  }

                  return (
                    <button
                      key={idx}
                      className={cls}
                      onClick={() => selectOption(q.id, idx)}
                      disabled={submitted}
                    >
                      <span className="quiz-option-letter">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="quiz-explanation">
                  <strong>{userPick === q.correct ? "✓ Correct!" : hasAnswer ? "✗ Incorrect" : "⊘ Skipped"}</strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          className="quiz-start-btn"
          onClick={submitQuiz}
          disabled={!allAnswered}
          style={{ marginTop: "1.5rem" }}
        >
          <Send size={18} />
          {allAnswered ? "Submit Quiz" : `Answer all questions (${answered}/${quiz.total_questions})`}
        </button>
      )}

      {submitted && (
        <button className="quiz-start-btn" onClick={startQuiz} style={{ marginTop: "1.5rem" }}>
          {loading ? (
            <><Loader2 size={18} className="spin" /> Regenerating...</>
          ) : (
            "Generate New Quiz →"
          )}
        </button>
      )}
    </div>
  );
}
