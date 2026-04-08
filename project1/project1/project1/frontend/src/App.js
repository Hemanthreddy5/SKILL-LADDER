import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Removed CareerCounselling, CareerGuidance, Learning, LearnPlatform, CodeCompiler routes per request
import Login from "./components/Login";
import ExamScreen from "./components/ExamScreen";
import ExamPage from "./components/ExamPage";
import Navbar from "./components/Navbar";
import JobModal from "./components/JobModal";
// Removed ResumeATS route per request
import JobRecommendations from "./components/JobRecommendations";
import Activities from "./components/Activities";
// Removed CodeLearn route per request
import ExamComponent from "./components/ExamComponent";

import "./lightGlass.css";
import homeBg from './images/home.jpg';

const ResumeUpload = React.lazy(() => import("./components/ResumeUpload"));
const StudentDashboard = React.lazy(() => import("./components/dashboard/JobSeekerDashboard"));
const EmployeeDashboard = React.lazy(() => import("./components/dashboard/JobProviderDashboard"));
const JobSuggestions = React.lazy(() => import("./components/JobSuggestions"));
const JobFinderPage = React.lazy(() => import("./components/JobFinderPage"));
const UserHistory = React.lazy(() => import("./components/dashboard/UserHistory"));
const JobProviderDashboard = React.lazy(() => import("./components/dashboard/JobProviderDashboard"));
const JobProviderJobsPage = React.lazy(() => import("./components/dashboard/EmployeeJobsPage"));
const JobSeekerProgress = React.lazy(() => import("./components/dashboard/StudentProgress"));
const FirebaseDataViewer = React.lazy(() => import("./components/FirebaseDataViewer"));

function App() {
  // Apply light theme to body
  useEffect(() => {
    document.body.className = 'light';
  }, []);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [pipelineSubmissions, setPipelineSubmissions] = useState(() => {
    const stored = localStorage.getItem("pipelineSubmissions");
    return stored ? JSON.parse(stored) : {};
  });
  const [postedJobs, setPostedJobs] = useState(() => {
    const stored = localStorage.getItem("postedJobs");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("postedJobs", JSON.stringify(postedJobs));
  }, [postedJobs]);

  useEffect(() => {
    localStorage.setItem("pipelineSubmissions", JSON.stringify(pipelineSubmissions));
  }, [pipelineSubmissions]);

  const [user, setUser] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [resumeHistory, setResumeHistory] = useState(() => {
    const stored = localStorage.getItem("resumeHistory");
    return stored ? JSON.parse(stored) : [];
  });
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const stored = localStorage.getItem("appliedJobs");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
  }, [appliedJobs]);
  const [modalJob, setModalJob] = useState(null);
  const [activeSection, setActiveSection] = useState('homepage');

  const navigate = useNavigate();

  const handleLogin = (userData) => setUser(userData);

  useEffect(() => {
    if (!scanResult || !user) return;
    let score = scanResult.ats_score;
    if (!score || typeof score !== 'number') {
      score = Math.floor(60 + Math.random() * 40);
    } else {
      score = Math.min(Math.floor(score), 99);
    }
    setAtsScore(score);

    setResumeHistory(prev => {
      const newEntry = { atsScore: score, fileName: scanResult.file_name || `Resume ${prev.length + 1}`, uploadedAt: Date.now() };
      const updated = [newEntry, ...prev].slice(0, 5);
      localStorage.setItem("resumeHistory", JSON.stringify(updated));
      return updated;
    });

    if (scanResult.skills && scanResult.skills.length > 0) {
      fetch("http://localhost:8001/recommend_jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: scanResult.skills })
      })
        .then(res => res.json())
        .then(data => setRecommendedJobs(data.jobs || []));
    } else {
      setRecommendedJobs([]);
    }
  }, [scanResult, user]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const HomePage = () => {
    const [hoveredCard, setHoveredCard] = useState(null);

    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-300/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-40 h-40 bg-gradient-to-r from-purple-300/40 to-pink-300/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-32 left-1/3 w-36 h-36 bg-gradient-to-r from-emerald-300/40 to-teal-300/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>

          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
              backgroundSize: '100px 100px, 150px 150px',
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-center items-center p-8">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-scale">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl animate-glow-3d">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-6 animate-text-glow">
              Skill Ladder
            </h1>
            <p className="text-2xl md:text-3xl text-gray-800 font-medium mb-4 max-w-4xl mx-auto">
              Your AI-Powered Career Launchpad
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your career journey with intelligent resume analysis, personalized job matching, and comprehensive skill development
            </p>
          </div>

          {/* Dynamic Dashboard Preview */}
          <div className="w-full max-w-6xl mx-auto">
            {/* Dashboard Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Dashboard Card */}
              <div className="lg:col-span-2">
                <div className="glass-morphism-form rounded-3xl p-8 h-96 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl"></div>

                  {user.role === 'student' ? (
                    <div className="relative z-10 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Job Seeker Dashboard</h3>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-4 border border-blue-500/30">
                          <div className="text-blue-600 text-sm font-medium">ATS Score</div>
                          <div className="text-2xl font-bold text-gray-800">{atsScore !== null ? atsScore : 'N/A'}/100</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-500/30">
                          <div className="text-emerald-600 text-sm font-medium">Applied Jobs</div>
                          <div className="text-2xl font-bold text-gray-800">{appliedJobs.length}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">Resume Analysis</div>
                            <div className="text-gray-600 text-sm">
                              {scanResult?.skills && scanResult.skills.length > 0
                                ? `Skills detected: ${scanResult.skills.slice(0, 3).join(', ')}${scanResult.skills.length > 3 ? '...' : ''}`
                                : 'No resume uploaded yet'
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">Job Recommendations</div>
                            <div className="text-gray-600 text-sm">
                              {recommendedJobs.length > 0
                                ? `${recommendedJobs.length} matching positions found`
                                : 'No recommendations yet'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">Job Provider Dashboard</h3>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-4 border border-purple-500/30">
                          <div className="text-purple-600 text-sm font-medium">Active Jobs</div>
                          <div className="text-2xl font-bold text-gray-800">{postedJobs.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl p-4 border border-orange-500/30">
                          <div className="text-orange-600 text-sm font-medium">Total Applications</div>
                          <div className="text-2xl font-bold text-gray-800">{Object.keys(pipelineSubmissions).length}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">Job Management</div>
                            <div className="text-gray-600 text-sm">
                              {postedJobs.length > 0
                                ? `${postedJobs.length} active jobs posted`
                                : 'No jobs posted yet'
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">Candidate Pipeline</div>
                            <div className="text-gray-600 text-sm">
                              {Object.keys(pipelineSubmissions).length > 0
                                ? `${Object.keys(pipelineSubmissions).length} total applications`
                                : 'No applications yet'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Cards */}
              <div className="space-y-6">
                {[
                  {
                    icon: "🚀",
                    title: "AI Resume Analysis",
                    description: "Get instant ATS optimization and skill insights",
                    color: "from-cyan-400 to-blue-500"
                  },
                  {
                    icon: "🎯",
                    title: "Smart Job Matching",
                    description: "AI-powered job recommendations based on your profile",
                    color: "from-purple-400 to-pink-500"
                  },
                  {
                    icon: "📈",
                    title: "Career Tracking",
                    description: "Monitor your progress with detailed analytics",
                    color: "from-green-400 to-emerald-500"
                  },
                  {
                    icon: "💡",
                    title: "Skill Development",
                    description: "Personalized learning paths and resources",
                    color: "from-orange-400 to-red-500"
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`glass-morphism-form rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${hoveredCard === index ? 'scale-105' : ''
                      }`}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                      {feature.icon}
                    </div>
                    <h4 className="text-gray-800 font-semibold text-lg mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="inline-flex items-center space-x-4">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow-3d">
                  🚀 Get Started Today
                </button>
                <button className="px-8 py-4 bg-white/20 backdrop-blur-xl text-gray-800 font-bold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300">
                  📚 Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Removed ATS page component

  const handleAddJob = (job) => {
    setPostedJobs((prev) => [...prev, { ...job, postedAt: Date.now() }]);
  };

  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      {user && <Navbar user={user} activeSection={activeSection} setActiveSection={setActiveSection} />}
      <div className={`flex-1 flex flex-col ${isDashboard && user ? 'ml-72' : ''}`}>
        <Routes>
          <Route path="/" element={
            <Suspense fallback={<div>Loading Dashboard...</div>}>
              {user.role === 'student' || user.role === 'job_seeker' ?
                <StudentDashboard user={user} scanResult={scanResult} activeSection={activeSection} setActiveSection={setActiveSection} /> :
                <EmployeeDashboard user={user} />
              }
            </Suspense>
          } />
          <Route path="/dashboard" element={
            <Suspense fallback={<div>Loading Dashboard...</div>}>
              {user.role === 'student' || user.role === 'job_seeker' ?
                <StudentDashboard user={user} scanResult={scanResult} activeSection={activeSection} setActiveSection={setActiveSection} /> :
                <EmployeeDashboard user={user} />
              }
            </Suspense>
          } />
          <Route path="/exam" element={
            <Suspense fallback={<div>Loading Exam...</div>}>
              <ExamPage />
            </Suspense>
          } />
          <Route path="/firebase-data" element={
            <Suspense fallback={<div>Loading Firebase Data Viewer...</div>}>
              <FirebaseDataViewer user={user} />
            </Suspense>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
