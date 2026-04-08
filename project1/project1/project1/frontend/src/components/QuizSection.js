import React, { useState } from "react";

export default function QuizSection({ quiz }) {
  const [selected, setSelected] = useState(Array(quiz.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qi, opt) => {
    const copy = [...selected];
    copy[qi] = opt;
    setSelected(copy);
  };

  const handleSubmit = () => {
    let sc = 0;
    quiz.forEach((q, i) => {
      if (selected[i] === q.a) sc++;
    });
    setScore(sc);
    setShowResult(true);
  };

  return (
    <div className="bg-white border rounded-xl p-4 mt-4">
      <h4 className="text-lg font-bold text-blue-700 mb-2">Quiz</h4>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3">
          <div className="font-semibold mb-1">Q{i+1}: {q.q}</div>
          <div className="flex flex-wrap gap-2">
            {q.options.map(opt => (
              <button
                key={opt}
                className={`px-3 py-1 rounded border ${selected[i] === opt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} transition`}
                onClick={() => handleSelect(i, opt)}
                disabled={showResult}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!showResult ? (
        <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleSubmit} disabled={selected.includes(null)}>Submit Quiz</button>
      ) : (
        <div className="mt-2 font-semibold text-blue-700">Score: {score} / {quiz.length}</div>
      )}
    </div>
  );
}
