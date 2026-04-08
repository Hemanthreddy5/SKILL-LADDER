import React from "react";

// Example companies data. In production, fetch from backend API.
const companies = [
  {
    name: "Company A",
    recommended: true,
    rounds: [
      { day: 2, type: "Aptitude", status: "pending" },
      { day: 3, type: "Technical", status: "pending" },
    ],
  },
  {
    name: "Company B",
    recommended: true,
    rounds: [
      { day: 1, type: "Interview IQ", status: "pending" },
      { day: 4, type: "Technical", status: "pending" },
      { day: 5, type: "HR", status: "pending" },
    ],
  },
  // ...add more companies up to 15
  ...Array.from({ length: 13 }, (_, i) => ({
    name: `Company ${String.fromCharCode(67 + i)}`,
    recommended: false,
    rounds: [
      { day: 1, type: "Aptitude", status: "pending" },
      { day: 2, type: "Technical", status: "pending" },
    ],
  })),
];

export default function CompanyATS() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl">
      {companies.map((company, idx) => (
        <div
          key={company.name}
          className={`rounded-2xl shadow-xl p-6 bg-white/90 border-2 ${company.recommended ? "border-yellow-400" : "border-blue-200"} transition hover:scale-105 hover:shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-2xl font-extrabold ${company.recommended ? "text-yellow-600" : "text-blue-800"}`}>{company.name}</h3>
            {company.recommended && <span className="bg-yellow-300 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">Recommended</span>}
          </div>
          <div className="space-y-2">
            {company.rounds.sort((a, b) => a.day - b.day).map((round, rIdx) => (
              <div key={rIdx} className="flex items-center justify-between bg-blue-50 rounded px-3 py-2">
                <span className="font-medium text-blue-900">Day {round.day}: {round.type}</span>
                <button className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow transition">Submit</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
