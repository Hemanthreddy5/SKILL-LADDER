import React, { useState } from "react";
import CareerGuidance from "./CareerGuidance";
import CompanyATS from "../CompanyATS";
import ResumeScanCard from "../ResumeScanCard";
import FunnelChart from "../FunnelChart";

export default function StudentDashboard({ user, scanResult, onScan, jobSuggestions, careerGuidance, userHistorySection, postedJobs = [], resumeHistory = [], appliedJobs = [] }) { // Student dashboard
  // Exam/test state
  const [completedExams, setCompletedExams] = useState([]);

  // Applied jobs for this user
  const myAppliedJobs = appliedJobs.filter(j => j.userEmail === user.email);
  // Unique companies applied to
  const appliedCompanies = Array.from(new Set(myAppliedJobs.map(j => j.company)));
  // FunnelChart data: label = company name, count = 1
  const funnelStages = appliedCompanies.map(company => ({ label: company, count: 1 }));

  // Handle starting exam in new tab
  const handleStartExam = (job, jobIndex) => {
    const examUrl = `/exam?company=${encodeURIComponent(job.company)}&jobTitle=${encodeURIComponent(job.jobTitle)}&userEmail=${encodeURIComponent(user.email)}&jobIndex=${jobIndex}&mode=aptitude_reasoning_30`;
    const examWindow = window.open(examUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (!examWindow) {
      alert('Please allow pop-ups for this site to start the exam.');
      return;
    }

    // Listen for mock test completion
    const handleMessage = (event) => {
      if (event.data.type === 'MOCK_TEST_COMPLETED') {
        setCompletedExams(prev => [...prev, jobIndex]);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  return (
    <div>
      {/* Applied Jobs Timeline & Exam Section */}
      {myAppliedJobs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-green-700 mb-4">Applied Jobs Timeline</h3>
          <FunnelChart stages={funnelStages} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {myAppliedJobs.map((job, idx) => {
              const isCompleted = completedExams.includes(idx);
              return (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-4 shadow animate-fadeIn flex flex-col gap-2">
                  <div className="font-bold text-lg text-green-800 mb-1">{job.jobTitle} @ {job.company}</div>
                  <div className="text-xs text-gray-600">Applied: {new Date(job.appliedAt).toLocaleString()}</div>
                  {!isCompleted && (
                    <button 
                      className="mt-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-semibold transition-colors" 
                      onClick={() => handleStartExam(job, idx)}
                    >
                      Start Test (New Tab)
                    </button>
                  )}
                  {isCompleted && (
                    <div className="text-green-700 font-semibold mt-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Test Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
