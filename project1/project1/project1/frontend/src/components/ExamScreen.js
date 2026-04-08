import React, { useState } from "react";
import CodeRunner from "./CodeRunner";

// MCQ and True/False types
const HARD_QUESTIONS = {
  IBM: [
    { q: "What is the output of the following Python code? print([i*i for i in range(3)])", a: "[0, 1, 4]", type: "short" },
    { q: "Which sorting algorithm is best for nearly sorted data?", a: "Insertion sort", type: "mcq", options: ["Bubble sort", "Selection sort", "Insertion sort", "Quick sort"] },
    { q: "What is the time complexity of heap sort?", a: "O(n log n)", type: "mcq", options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"] },
    { q: "What is memoization in dynamic programming?", a: "Caching results of expensive function calls", type: "short" },
    { q: "Python: What does the 'with' statement do?", a: "It simplifies exception handling by encapsulating common preparation and cleanup tasks.", type: "short" },
  ],
  Google: [
    { q: "What is the output of: System.out.println(1 + 2 + \"3\"); in Java?", a: "33", type: "short" },
    { q: "Which data structure is used for BFS traversal?", a: "Queue", type: "mcq", options: ["Stack", "Queue", "Tree", "Heap"] },
    { q: "What is the complexity of Dijkstra's algorithm using a min-heap?", a: "O((V+E) log V)", type: "short" },
    { q: "C++: What is a virtual function?", a: "A function that can be overridden in a derived class.", type: "short" },
    { q: "What is the main advantage of a trie over a hash table?", a: "Efficient prefix search", type: "short" },
  ],
  Amazon: [
    { q: "What is the maximum subarray sum problem called?", a: "Kadane's Algorithm", type: "short" },
    { q: "What does CAP theorem stand for?", a: "Consistency, Availability, Partition tolerance", type: "short" },
    { q: "Which sorting algorithm is stable?", a: "Merge sort", type: "mcq", options: ["Heap sort", "Quick sort", "Merge sort", "Selection sort"] },
    { q: "What is the output of: cout << 5/2; in C++?", a: "2", type: "short" },
    { q: "What is a lambda function in Python?", a: "An anonymous function", type: "short" },
  ]
};

const APTITUDE_QUESTIONS = [
  { q: "What is 12 * 8?", a: "96", type: "short" },
  { q: "If a train travels 60km in 1.5 hours, what is its speed? (km/h)", a: "40", type: "short" },
  { q: "Find the next number: 2, 6, 12, 20, ...", a: "30", type: "short" },
  { q: "Which of the following is a prime number?", a: "13", type: "mcq", options: ["12", "13", "14", "15"] },
  { q: "The sum of angles in a triangle is?", a: "180", type: "mcq", options: ["90", "180", "270", "360"] },
  { q: "The sky is blue. True or False?", a: "True", type: "tf" },
  { q: "If 5x = 20, what is x?", a: "4", type: "short" },
  { q: "What is the average of 10, 20, 30, 40, 50?", a: "30", type: "short" },
];

const PROGRAMMING_QUESTIONS = [
  { q: "What does '=== ' mean in JavaScript?", a: "strict equality", type: "short" },
  { q: "What is the output of: print(len('hello')) in Python?", a: "5", type: "short" },
  { q: "Which data structure uses FIFO?", a: "queue", type: "mcq", options: ["stack", "queue", "tree", "graph"] },
  { q: "What is the time complexity of binary search?", a: "O(log n)", type: "mcq", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"] },
  { q: "What keyword is used to define a function in Python?", a: "def", type: "short" },
  { q: "HTML stands for HyperText Markup Language. True or False?", a: "True", type: "tf" },
];

function getRandomQuestions(arr, n) {
  // Shuffle and pick n
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export const EXAM_QUESTION_BANK = { APTITUDE_QUESTIONS, PROGRAMMING_QUESTIONS };


export default function ExamScreen({ onSubmit, company, round }) {
  // Randomize questions once per mount
  let hardQs = [];
  if (company && HARD_QUESTIONS[company]) {
    hardQs = HARD_QUESTIONS[company];
  }
  const [aptitudeQs] = useState(() => getRandomQuestions([...APTITUDE_QUESTIONS, ...hardQs], 5));
  const [programmingQs] = useState(() => getRandomQuestions(PROGRAMMING_QUESTIONS, 5));
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(0); // 0...total-1
  const totalQuestions = aptitudeQs.length + programmingQs.length;
  const allQuestions = [...aptitudeQs.map(q => ({ ...q, typeGroup: 'aptitude' })), ...programmingQs.map(q => ({ ...q, typeGroup: 'prog' }))];

  const handleChange = (idx, val, type) => {
    // idx is the index in allQuestions
    let key;
    if (type === 'aptitude') {
      key = `aptitude_${idx}`;
    } else {
      key = `prog_${idx - aptitudeQs.length}`;
    }
    setAnswers(ans => ({ ...ans, [key]: val }));
  };

  const handleNext = () => {
    if (step < totalQuestions - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReview = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Save question text with answers for review
    const answerPayload = {};
    allQuestions.forEach((q, idx) => {
      answerPayload[`Q${idx+1}`] = {
        question: q.q,
        type: q.type,
        answer: answers[`${q.typeGroup}_${q.typeGroup === 'aptitude' ? idx : idx - aptitudeQs.length}`] || "",
        correct: q.a
      };
    });
    if (onSubmit) onSubmit(answerPayload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Save question text with answers for review
    const answerPayload = {};
    aptitudeQs.forEach((q, idx) => {
      answerPayload[`Aptitude Q${idx+1}`] = {
        question: q.q,
        type: q.type,
        answer: answers[`aptitude_${idx}`] || "",
        correct: q.a
      };
    });
    programmingQs.forEach((q, idx) => {
      answerPayload[`Programming Q${idx+1}`] = {
        question: q.q,
        type: q.type,
        answer: answers[`prog_${idx}`] || "",
        correct: q.a
      };
    });
    if (onSubmit) onSubmit(answerPayload);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-3 sm:p-6 md:p-8 w-full max-w-full md:max-w-2xl overflow-x-auto">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">{company} - {round} Exam</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="text-blue-900 font-semibold">Question {step + 1} of {totalQuestions}</div>
          <div className="w-full sm:w-1/2 h-2 bg-blue-100 rounded mt-2 sm:mt-0">
            <div className="h-2 bg-blue-500 rounded" style={{ width: `${((step+1)/totalQuestions)*100}%` }}></div>
          </div>
        </div>
        {!submitted ? (
          <form onSubmit={handleReview}>
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 shadow flex flex-col gap-2 mb-4">
              <div className="font-medium text-blue-900 mb-1 text-base sm:text-lg">Q{step + 1}. {allQuestions[step].q}</div>
              {allQuestions[step].type === 'mcq' ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 mt-1">
                  {allQuestions[step].options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2 bg-white rounded px-3 py-2 border border-blue-200 cursor-pointer hover:bg-blue-100 transition text-base sm:text-lg">
                      <input
                        type="radio"
                        name={`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`}
                        value={opt}
                        checked={answers[`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`] === opt}
                        onChange={e => handleChange(step, e.target.value, allQuestions[step].typeGroup)}
                        disabled={submitted}
                        required
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : allQuestions[step].type === 'tf' ? (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-1">
                  {['True', 'False'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 bg-white rounded px-3 py-2 border border-blue-200 cursor-pointer hover:bg-blue-100 transition text-base sm:text-lg">
                      <input
                        type="radio"
                        name={`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`}
                        value={opt}
                        checked={answers[`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`] === opt}
                        onChange={e => handleChange(step, e.target.value, allQuestions[step].typeGroup)}
                        disabled={submitted}
                        required
                        className="w-5 h-5 accent-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`} className="text-gray-700 text-sm">Your Answer:</label>
                  <input type="text" id={`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`} className="w-full border rounded p-2 text-base sm:text-lg" value={answers[`${allQuestions[step].typeGroup}_${allQuestions[step].typeGroup === 'aptitude' ? step : step - aptitudeQs.length}`] || ""} onChange={e => handleChange(step, e.target.value, allQuestions[step].typeGroup)} disabled={submitted} />
                  {/* Code Runner for programming questions */}
                  {allQuestions[step].typeGroup === 'prog' && (
                    <CodeRunner lang={allQuestions[step].q.toLowerCase().includes('python') ? 'python' : allQuestions[step].q.toLowerCase().includes('java') ? 'java' : 'cpp'} />
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded shadow hover:bg-gray-300 transition disabled:opacity-60" onClick={handlePrev} disabled={step === 0}>Previous</button>
              {step < totalQuestions - 1 ? (
                <button type="button" className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition" onClick={handleNext}>Next</button>
              ) : (
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition">Review Answers</button>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold text-blue-700 mb-4">Exam Submitted!</h3>
            <p className="text-gray-600 mb-2">Thank you for completing the exam. Your answers have been submitted for review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
