import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:8001";

export default function LearnPythonCourse({ user }) {
  const userEmail = user?.email || "";
  const userName = user?.name || user?.email || "Learner";
  const [course, setCourse] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("course");

  const selectedModule = useMemo(
    () => course?.modules?.find((m) => m.module_id === selectedModuleId) || null,
    [course, selectedModuleId]
  );

  const loadCourse = async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const [courseRes, progressRes] = await Promise.all([
        fetch(`${API_BASE}/learn-python/course?user_email=${encodeURIComponent(userEmail)}`),
        fetch(`${API_BASE}/learn-python/progress?user_email=${encodeURIComponent(userEmail)}`)
      ]);
      const courseJson = await courseRes.json();
      const progressJson = await progressRes.json();
      setCourse(courseJson);
      setHistory(Array.isArray(progressJson.score_history) ? progressJson.score_history.slice().reverse() : []);
    } catch (e) {
      console.error("Error loading Python course:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [userEmail]);

  const openModule = async (moduleId) => {
    setLoading(true);
    setResult(null);
    setQuizData(null);
    try {
      const res = await fetch(`${API_BASE}/learn-python/module/${moduleId}?user_email=${encodeURIComponent(userEmail)}`);
      const json = await res.json();
      if (!res.ok) {
        alert(json.detail || "Unable to open module");
        return;
      }
      setSelectedModuleId(moduleId);
      setModuleData(json);
      setView("module");
    } catch (e) {
      console.error("Error opening module:", e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!selectedModuleId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/learn-python/quiz/${selectedModuleId}?user_email=${encodeURIComponent(userEmail)}`);
      const json = await res.json();
      if (!res.ok) {
        alert(json.detail || "Unable to load quiz");
        return;
      }
      setQuizData(json);
      setAnswers(new Array((json.questions || []).length).fill(null));
      setView("quiz");
    } catch (e) {
      console.error("Error loading quiz:", e);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!selectedModuleId || !quizData) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/learn-python/quiz/${selectedModuleId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          answers
        })
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.detail || "Quiz submission failed");
        return;
      }
      setResult(json);
      setView("result");
      await loadCourse();
    } catch (e) {
      console.error("Error submitting quiz:", e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/learn-python/certificate?user_email=${encodeURIComponent(userEmail)}&user_name=${encodeURIComponent(userName)}`
      );
      if (!res.ok) {
        const json = await res.json();
        alert(json.detail || "Certificate is not available yet");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "learn-python-certificate.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error downloading certificate:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Learn Python</h1>
          <p className="text-gray-600">Complete modules, pass quizzes, unlock certificate.</p>
        </div>

        {course && (
          <div className="bg-white rounded-xl p-5 shadow border mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-600">{course.progress_percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full"
                style={{ width: `${course.progress_percent || 0}%` }}
              />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {course.completed_modules}/{course.total_modules} modules completed
            </div>
          </div>
        )}

        {loading && <div className="text-center text-gray-700 mb-6">Loading...</div>}

        {view === "course" && course && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.modules.map((m) => (
              <div key={m.module_id} className="bg-white border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{m.title}</h3>
                    <p className="text-sm text-gray-600">{m.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Difficulty: {m.difficulty}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${m.unlocked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {m.unlocked ? (m.completed ? "Completed" : "Unlocked") : "Locked"}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Attempts: {m.attempts || 0} | Best Score: {m.best_score || 0}%
                </div>
                <button
                  className="mt-3 px-4 py-2 rounded-lg text-white bg-blue-600 disabled:bg-gray-400"
                  disabled={!m.unlocked}
                  onClick={() => openModule(m.module_id)}
                >
                  Open Module
                </button>
              </div>
            ))}
          </div>
        )}

        {view === "module" && moduleData && (
          <div className="bg-white rounded-xl p-6 shadow border">
            <button className="text-blue-600 mb-4" onClick={() => setView("course")}>← Back to modules</button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{moduleData.title}</h2>
            <p className="text-sm text-gray-600 mb-4">Difficulty: {moduleData.difficulty}</p>
            <p className="text-gray-700 mb-3">{moduleData.content?.explanation}</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              {(moduleData.content?.key_points || []).map((p, i) => <li key={i}>{p}</li>)}
            </ul>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-auto text-sm">
              <code>{moduleData.content?.example_code || ""}</code>
            </pre>
            <button className="mt-5 px-5 py-2 bg-emerald-600 text-white rounded-lg" onClick={startQuiz}>Take Quiz</button>
          </div>
        )}

        {view === "quiz" && quizData && (
          <div className="bg-white rounded-xl p-6 shadow border">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{quizData.title} - Quiz</h2>
            <div className="space-y-5">
              {quizData.questions.map((q, qi) => (
                <div key={q.question_id} className="border rounded-lg p-4">
                  <p className="font-semibold text-gray-800 mb-2">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === oi}
                          onChange={() => {
                            const next = [...answers];
                            next[qi] = oi;
                            setAnswers(next);
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400"
              disabled={answers.some((a) => a === null)}
              onClick={submitQuiz}
            >
              Submit Quiz
            </button>
          </div>
        )}

        {view === "result" && result && (
          <div className="bg-white rounded-xl p-6 shadow border">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Quiz Result</h2>
            <p className="text-gray-700">Score: <b>{result.score}%</b> ({result.correct_answers}/{result.total_questions})</p>
            <p className="text-gray-700">Passing Score: {result.passing_score}%</p>
            <p className={`mt-2 font-semibold ${result.passed ? "text-emerald-600" : "text-red-600"}`}>
              {result.passed ? "Passed! Next module unlocked." : "Not passed. Retry to continue."}
            </p>
            <div className="flex gap-3 mt-5">
              {!result.passed && (
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg" onClick={startQuiz}>
                  Retry Quiz
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setView("course")}>
                Back to Modules
              </button>
              {result.certificate_available && (
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg" onClick={downloadCertificate}>
                  Download Certificate
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-5 shadow border mt-6">
          <h3 className="font-bold text-gray-800 mb-2">Score History</h3>
          {history.length === 0 ? (
            <p className="text-gray-600 text-sm">No attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 12).map((h, idx) => (
                <div key={idx} className="text-sm text-gray-700 border rounded p-2 flex justify-between">
                  <span>{h.module_title}</span>
                  <span className={h.passed ? "text-emerald-600" : "text-red-600"}>{h.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
