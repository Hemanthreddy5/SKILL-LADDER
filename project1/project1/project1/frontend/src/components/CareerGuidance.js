import React from "react";

const GUIDANCE_DB = [
  {
    skill: "python",
    advice: "Consider deepening your Python skills with frameworks like Django or Flask, or explore data science with Pandas and NumPy."
  },
  {
    skill: "react",
    advice: "Build a strong portfolio of React projects. Learn about hooks, context API, and state management libraries like Redux."
  },
  {
    skill: "machine learning",
    advice: "Take on real-world ML projects, participate in Kaggle competitions, and learn about model deployment."
  },
  {
    skill: "aws",
    advice: "Get certified in AWS and gain hands-on experience with cloud deployments and DevOps pipelines."
  },
  {
    skill: "excel",
    advice: "Master advanced Excel functions and consider learning Power BI or Tableau for data visualization."
  },
  // ... add more guidance as needed
];

export default function CareerGuidance({ skills }) {
  if (!skills || skills.length === 0) return null;
  const adviceList = GUIDANCE_DB.filter(g => skills.includes(g.skill));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">Career Guidance</h2>
      {adviceList.length === 0 ? (
        <p className="text-gray-600">No specific guidance found for your skills. Keep learning and exploring!</p>
      ) : (
        <ul className="list-disc pl-5 text-gray-700">
          {adviceList.map((item, idx) => (
            <li key={idx} className="mb-2">
              <span className="font-semibold text-blue-800">{item.skill}:</span> {item.advice}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
