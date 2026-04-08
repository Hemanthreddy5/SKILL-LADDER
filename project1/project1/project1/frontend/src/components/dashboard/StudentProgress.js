import React, { useEffect, useState } from "react";
import { PieChart } from "./PieChart";

// Mock exam data - replace with real API/localStorage as needed
const EXAMS = [
  { name: "Aptitude Test" },
  { name: "Coding Round" },
  { name: "Interview" }
];

export default function StudentProgress({ pipelineSubmissions, setPipelineSubmissions }) {
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    // Simulate: fetch students from localStorage 'users' array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    // Each user has: email, name, passedOutYear, completedExams: [exam names]
    setStudentData(users.filter(u => u.role === 'student'));
  }, []);

  // Count students who completed each exam
  const examStats = EXAMS.map(exam => ({
    name: exam.name,
    count: studentData.filter(s => s.completedExams && s.completedExams.includes(exam.name)).length
  }));

  // Approve/reject handler
  const handleVerify = (studentEmail, company, round, status) => {
    setPipelineSubmissions(prev => {
      const updated = { ...prev };
      if (updated[studentEmail] && updated[studentEmail][company] && updated[studentEmail][company][round]) {
        updated[studentEmail][company][round].status = status;
      }
      return updated;
    });
    setViewAnswers(null);
  };

  // State for viewing answers modal
  const [viewAnswers, setViewAnswers] = useState(null);

  // Gather all pending submissions
  const pendingList = [];
  Object.entries(pipelineSubmissions || {}).forEach(([studentEmail, companyObj]) => {
    Object.entries(companyObj || {}).forEach(([company, roundObj]) => {
      Object.entries(roundObj || {}).forEach(([round, info]) => {
        if (info.status === 'pending') {
          pendingList.push({ studentEmail, company, round });
        }
      });
    });
  });

  // Get all companies and rounds
  const users = JSON.parse(localStorage.getItem("users") || "[]").filter(u => u.role === 'student');
  const companySet = new Set();
  users.forEach(u => (u.selectedCompanies || []).forEach(c => companySet.add(c)));
  const allCompanies = Array.from(companySet);

  // Helper: get exam status for student/company/round
  const getExamStatus = (email, company, round) => {
    return pipelineSubmissions?.[email]?.[company]?.[round]?.status || "Not Started";
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-blue-200">
      <h2 className="text-3xl font-bold text-blue-800 mb-6">Student Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-10">
        {examStats.map(stat => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{stat.name}</h3>
            <PieChart data={{ [stat.name]: stat.count }} />
          </div>
        ))}
      </div>
      {/* Pending Approvals Section */}
      <div className="w-full max-w-3xl mb-8">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3">Pending Submissions for Approval</h3>
        {pendingList.length === 0 ? (
          <div className="text-gray-500 text-center">No pending submissions.</div>
        ) : (
          <table className="min-w-full bg-white rounded-xl shadow-lg mb-4">
            <thead>
              <tr className="bg-yellow-100 text-blue-900">
                <th className="py-2 px-4">Student Email</th>
                <th className="py-2 px-4">Company</th>
                <th className="py-2 px-4">Round</th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="py-2 px-4">{item.studentEmail}</td>
                  <td className="py-2 px-4">{item.company}</td>
                  <td className="py-2 px-4">{item.round}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded mr-2"
                      onClick={() => setViewAnswers(item)}
                    >
                      View Answers
                    </button>
                    <button className="px-3 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600" onClick={() => handleVerify(item.studentEmail, item.company, item.round, 'approved')}>Approve</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleVerify(item.studentEmail, item.company, item.round, 'rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for viewing answers */}
      {viewAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-8 w-full max-w-2xl relative">
            <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setViewAnswers(null)}>&times;</button>
            <h3 className="text-xl font-bold text-blue-800 mb-4">Answers for {viewAnswers.studentEmail} - {viewAnswers.company} ({viewAnswers.round})</h3>
            <div className="mb-4">
              {(() => {
                const ans = pipelineSubmissions?.[viewAnswers.studentEmail]?.[viewAnswers.company]?.[viewAnswers.round]?.answers || {};
                if (Object.keys(ans).length === 0) return <div className="text-gray-500">No answers submitted.</div>;
                return (
                  <ul className="list-disc pl-5 space-y-2">
                    {Object.entries(ans).map(([k, v], i) => (
                      <li key={i}>
                        <div className="font-semibold text-blue-700">{k}:</div>
                        <div className="ml-2">
                          <div className="text-blue-900">Q: <span className="font-medium">{v.question}</span></div>
                          <div className="text-gray-700">Ans: <span className="font-mono">{v.answer}</span> {v.answer && v.correct && (v.answer.trim().toLowerCase() === v.correct.trim().toLowerCase() ? <span className="text-green-600 font-bold ml-2">✔</span> : <span className="text-red-600 font-bold ml-2">✘</span>)}</div>
                          {v.correct && <div className="text-xs text-gray-500">Correct: {v.correct}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
            <div className="flex gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded" onClick={() => handleVerify(viewAnswers.studentEmail, viewAnswers.company, viewAnswers.round, 'approved')}>Approve</button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded" onClick={() => handleVerify(viewAnswers.studentEmail, viewAnswers.company, viewAnswers.round, 'rejected')}>Reject</button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto w-full max-w-4xl">
        <table className="min-w-full bg-white rounded-xl shadow-lg">
          <thead>
            <tr className="bg-blue-200 text-blue-900">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Passed Out Year</th>
              <th className="py-2 px-4">Registered Companies</th>
            </tr>
          </thead>
          <tbody>
            {users.map(student => (
              <tr key={student.email} className="text-center">
                <td className="py-2 px-4">{student.name || "-"}</td>
                <td className="py-2 px-4">{student.email}</td>
                <td className="py-2 px-4">{student.passedOutYear || "-"}</td>
                <td className="py-2 px-4">
                  {(student.selectedCompanies || []).length === 0 ? <span className="text-gray-400">-</span> : (
                    <ul className="list-disc list-inside text-left">
                      {(student.selectedCompanies || []).map((company, idx) => (
                        <li key={idx}>
                          <span className="font-semibold text-blue-900">{company}</span>
                          {/* For each round, show status */}
                          <ul className="ml-2">
                            {(window.JOB_FINDER_COMPANIES || []).find(c => c.name === company)?.rounds?.map((round, rIdx) => (
                              <li key={rIdx} className="text-sm">
                                <span className="text-blue-700">{round}:</span> <span className="font-mono">{getExamStatus(student.email, company, round)}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
