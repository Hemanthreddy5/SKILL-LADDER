import React, { useState, useEffect } from "react";
import JobPostForm from "./JobPostForm";
import { PieChart } from "./PieChart";
import FunnelChart from "../FunnelChart";

export default function EmployeeDashboard({ user, postedJobs, setPostedJobs }) { // Employee dashboard
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    // Simulate: count users with role 'student' from localStorage 'users' array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    setStudentCount(users.filter(u => u.role === 'student').length);
  }, []);
  // Demo hiring funnel data
  const funnelStages = [
    { label: "Applied", count: 15 },
    { label: "Interviewed", count: 8 },
    { label: "Offered", count: 4 },
    { label: "Hired", count: 2 }
  ];
  // Demo metrics
  const avgTimeToHire = "12 days";
  const offerAcceptance = "50%";

  // Feedback state
  const [feedbacks, setFeedbacks] = useState(() => JSON.parse(localStorage.getItem("employee_feedback") || "[]"));
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackPrivate, setFeedbackPrivate] = useState(false);

  const handleFeedback = () => {
    const fb = { text: feedbackText, private: feedbackPrivate, date: new Date().toLocaleString() };
    const updated = [fb, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem("employee_feedback", JSON.stringify(updated));
    setFeedbackText("");
    setFeedbackPrivate(false);
  };

  function handleExport() {
    // Export funnel data as CSV
    const csv = ["Stage,Count", ...funnelStages.map(s => `${s.label},${s.count}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hiring_funnel.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-900 py-12">
      <div className="glass-card max-w-3xl w-full p-8 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-blue-300 mb-4">Employee Dashboard</h2>
        <div className="mb-6 text-lg text-white/80">Welcome, <span className="font-semibold text-blue-100">{user.email}</span>!</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Students</h3>
              <PieChart data={{ "Registered Students": studentCount }} />
            </div>
            {/* Analytics Section */}
            <div className="glass p-4 rounded-xl mt-6 w-full animate-fadeIn">
              <h3 className="text-lg font-bold text-blue-200 mb-2">Hiring Funnel</h3>
              <FunnelChart stages={funnelStages} />
              <div className="mt-4 flex flex-col gap-2 text-white/80 text-sm">
                <div>Avg. Time to Hire: <span className="font-semibold text-blue-100">{avgTimeToHire}</span></div>
                <div>Offer Acceptance Rate: <span className="font-semibold text-blue-100">{offerAcceptance}</span></div>
                <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleExport}>Export as CSV</button>
              </div>
            </div>
          </div>
          {/* Job Posting Card */}
          <div className="glass p-6 rounded-2xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-bold text-blue-200 mb-2">Post a New Job</h3>
            <JobPostForm postedJobs={postedJobs} setPostedJobs={setPostedJobs} />
          </div>
          {/* Candidate Review Card */}
          <div className="glass p-6 rounded-2xl shadow-lg animate-slideUp">
            <h3 className="text-xl font-bold text-blue-200 mb-2">Review Candidates</h3>
            <div className="text-white/70 mb-2">AI-matched candidates will appear here.</div>
            <div className="flex flex-col gap-2">
              <div className="bg-blue-900/60 p-3 rounded text-white/90 animate-fadeIn">No candidates yet.</div>
            </div>
          </div>
        </div>
        {/* Feedback Section */}
        <div className="glass p-6 rounded-2xl shadow-lg mt-8 animate-fadeIn">
          <h3 className="text-xl font-bold text-blue-200 mb-2">Feedback & Review</h3>
          <div className="mb-4">
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full border rounded p-2 text-base mb-2" placeholder="Leave feedback for a student or process..." />
            <label className="flex items-center gap-2 text-sm text-white/80 mb-2">
              <input type="checkbox" checked={feedbackPrivate} onChange={e => setFeedbackPrivate(e.target.checked)} />
              Private (not visible to student)
            </label>
            <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleFeedback} disabled={!feedbackText.trim()}>Submit Feedback</button>
          </div>
          <div className="mt-2">
            <h4 className="text-blue-100 font-semibold mb-2">Previous Feedback</h4>
            <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
              {feedbacks.length === 0 ? <div className="text-white/60">No feedback yet.</div> : feedbacks.map((f, i) => (
                <div key={i} className={`p-2 rounded ${f.private ? 'bg-blue-950/60' : 'bg-blue-800/60'}`}>
                  <div className="text-white/90 text-sm">{f.text}</div>
                  <div className="text-xs text-blue-200 mt-1">{f.date} {f.private && <span className="ml-2 text-red-300">(Private)</span>}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
