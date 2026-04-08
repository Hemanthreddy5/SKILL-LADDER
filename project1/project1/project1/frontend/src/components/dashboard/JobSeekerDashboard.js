import React, { useState, useEffect } from "react";
import ResumeATS from "../ResumeATS";
import JobRecommendations from "../JobRecommendations";
import Activities from "../Activities";
import LearnPythonCourse from "../LearnPythonCourse";
import Compiler from "../Compiler";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export default function JobSeekerDashboard({ user, scanResult, activeSection, setActiveSection }) {
  const [resumeResult, setResumeResult] = useState(scanResult);
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "Job Seeker",
    email: user?.email || "saran@gmail.com",
    skills: [],
    atsScore: "N/A",
    academicScore: "N/A",
    scoreType: "Score",
    appliedJobsCount: 0
  });

  const normalizeResumeAnalysis = (analysis) => {
    if (!analysis) return null;
    return {
      skills: analysis.skills || [],
      atsScore: analysis.atsScore ?? analysis.ats_score ?? "N/A",
      academicScore: analysis.academicScore ?? analysis.academic_score ?? "N/A",
      scoreType: analysis.scoreType ?? analysis.score_type ?? "Score"
    };
  };

  const getAppliedJobsCount = () => {
    try {
      const email = user?.email || "";
      if (!email) return 0;
      const storedAppliedJobs = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
      return storedAppliedJobs.filter((job) => job.userEmail === email).length;
    } catch {
      return 0;
    }
  };

  const refreshAppliedJobsCount = () => {
    setUserProfile((prev) => ({ ...prev, appliedJobsCount: getAppliedJobsCount() }));
  };

  useEffect(() => {
    const normalized = normalizeResumeAnalysis(resumeResult);
    if (normalized) {
      setUserProfile(prev => ({
        ...prev,
        ...normalized
      }));
    }
  }, [resumeResult]);

  useEffect(() => {
    refreshAppliedJobsCount();

    const handleStorageChange = () => refreshAppliedJobsCount();
    window.addEventListener("storage", handleStorageChange);

    // Same-tab updates for localStorage are not covered by "storage" event.
    const id = setInterval(refreshAppliedJobsCount, 1500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(id);
    };
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;

    const userRef = doc(db, "users", user.email);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() || {};
        const normalized = normalizeResumeAnalysis(data.resumeAnalysis);
        if (!normalized) return;

        setResumeResult((prev) => ({ ...(prev || {}), ...normalized }));
        setUserProfile((prev) => ({ ...prev, ...normalized }));
      },
      () => {
        // Silently ignore Firestore listener failures and keep local state.
      }
    );

    return () => unsubscribe();
  }, [user?.email]);

  const handleResumeResult = (result) => {
    setResumeResult(result);
    const normalized = normalizeResumeAnalysis(result);
    setUserProfile(prev => ({
      ...prev,
      ...(normalized || {})
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'homepage':
        return (
          <div className="p-8 min-h-screen">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-6">Skill Ladder</h1>
              <p className="text-2xl md:text-3xl text-gray-800 font-medium mb-4 max-w-4xl mx-auto">Your AI-Powered Career Launchpad</p>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">Transform your career journey with intelligent resume analysis, personalized job matching, and comprehensive skill development</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">ATS Score</h3>
                <p className="text-3xl font-bold text-gray-800">{userProfile.atsScore}/100</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(Number(userProfile.atsScore) || 0, 100))}%` }}></div>
                </div>
              </div>

              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Applied Jobs</h3>
                <p className="text-3xl font-bold text-gray-800">{userProfile.appliedJobsCount}</p>
                <p className="text-sm text-gray-500 mt-2">{userProfile.appliedJobsCount > 0 ? "Applications tracked live" : "Start applying today!"}</p>
              </div>

              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Skills</h3>
                <p className="text-3xl font-bold text-gray-800">{userProfile.skills.length}</p>
                <p className="text-sm text-gray-500 mt-2">Skills identified</p>
              </div>

              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{userProfile.scoreType}</h3>
                <p className="text-3xl font-bold text-gray-800">{userProfile.academicScore}</p>
                <p className="text-sm text-gray-500 mt-2">Academic Performance</p>
              </div>
            </div>


          </div>
        );
      case 'resume-ats':
        return <ResumeATS user={user} onResult={handleResumeResult} />;
      case 'job-recommends':
        return (
          <JobRecommendations
            user={user}
            skills={userProfile.skills}
            onViewActivities={() => setActiveSection('activities')}
          />
        );
      case 'activities':
        return <Activities user={user} />;
      case 'learn-platform':
        return <LearnPythonCourse user={user} />;
      case 'compiler':
        return <Compiler user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      <main className="min-h-screen overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
