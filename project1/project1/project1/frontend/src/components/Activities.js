import React, { useState, useEffect } from "react";
import SimpleMockTest from "./SimpleMockTest";

export default function Activities({ user }) {
  const [loading, setLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [showMockTest, setShowMockTest] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    loadNotifications();
  }, [user?.email]);

  const loadUserData = () => {
    try {
      // Load applied jobs from localStorage
      const storedAppliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      const userAppliedJobs = storedAppliedJobs.filter(job => job.userEmail === user?.email);
      setAppliedJobs(userAppliedJobs);
      
      // Load completed exams from localStorage
      const storedCompletedExams = JSON.parse(localStorage.getItem('completedExams') || '[]');
      const userCompletedExams = storedCompletedExams.filter(exam => exam.userEmail === user?.email);
      setCompletedExams(userCompletedExams.map(exam => exam.jobIndex));
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8001/get_notifications?user_email=${encodeURIComponent(user?.email || '')}`);
      if (!response.ok) return;
      const data = await response.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleStartExam = (job, jobIndex) => {
    // Open proctored exam in new tab with 30 mixed questions and camera/mic permissions
    const examUrl = `/exam?company=${encodeURIComponent(job.company)}&jobTitle=${encodeURIComponent(job.jobTitle)}&userEmail=${encodeURIComponent(user.email)}&jobIndex=${jobIndex}&mode=aptitude_reasoning_30`;
    const examWindow = window.open(examUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (!examWindow) {
      alert('Please allow pop-ups for this site to start the mock test.');
      return;
    }

    // Listen for completion message from exam window
    const handleMessage = async (event) => {
      if (event.data && event.data.type === 'MOCK_TEST_COMPLETED') {
        const payload = event.data.data || {};

        const examResult = {
          userEmail: payload.userEmail || user.email,
          jobIndex,
          jobTitle: payload.jobTitle || job.jobTitle,
          company: payload.company || job.company,
          score: Number(payload.score) || 0,
          totalQuestions: Number(payload.totalQuestions) || 0,
          percentage: Number(payload.percentage) || 0,
          completedAt: payload.completedAt || new Date().toISOString()
        };

        const existingResults = JSON.parse(localStorage.getItem('completedExams') || '[]');
        const alreadySaved = existingResults.some(
          (r) => r.userEmail === examResult.userEmail && r.jobIndex === jobIndex
        );
        if (!alreadySaved) {
          localStorage.setItem('completedExams', JSON.stringify([...existingResults, examResult]));
        }

        // Persist for provider dashboard monitor.
        try {
          await fetch('http://localhost:8001/submit_mock_test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_email: examResult.userEmail,
              score: examResult.score,
              total_questions: examResult.totalQuestions || 1,
              subject: `${examResult.jobTitle} - ${examResult.company}`
            })
          });
        } catch (e) {
          console.error('Error saving mock test result to backend:', e);
        }

        setCompletedExams(prev => [...prev, jobIndex]);
        loadUserData();
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const handleMockTestCompletion = (result) => {
    // Add the job index to completed exams
    setCompletedExams(prev => [...prev, selectedJob.jobIndex]);
    
    // Save to localStorage
    const examResult = {
      userEmail: user.email,
      jobIndex: selectedJob.jobIndex,
      jobTitle: selectedJob.job.jobTitle,
      company: selectedJob.job.company,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      completedAt: result.completedAt
    };
    
    const existingResults = JSON.parse(localStorage.getItem('completedExams') || '[]');
    const updatedResults = [...existingResults, examResult];
    localStorage.setItem('completedExams', JSON.stringify(updatedResults));
    
    setShowMockTest(false);
    setSelectedJob(null);
  };

  const handleCloseMockTest = () => {
    setShowMockTest(false);
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-text-glow">
            Activities & Progress
          </h1>
          <p className="text-gray-600 text-lg">
            Track your job applications and mock test performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg animate-fade-in-scale">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{appliedJobs.length}</div>
              <div className="text-gray-600">Total Applications</div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg animate-fade-in-scale">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{completedExams.length}</div>
              <div className="text-gray-600">Completed Tests</div>
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg animate-fade-in-scale">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {appliedJobs.length > 0 ? Math.round((completedExams.length / appliedJobs.length) * 100) : 0}%
              </div>
              <div className="text-gray-600">Test Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Applied Jobs Timeline */}
        {appliedJobs.length > 0 ? (
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg animate-fade-in-scale">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Applied Jobs Timeline</h2>
            
            <div className="space-y-6">
              {appliedJobs.map((job, index) => {
                const isCompleted = completedExams.includes(index);
                const daysAgo = Math.floor((new Date() - new Date(job.appliedAt)) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{job.jobTitle}</h3>
                            <p className="text-gray-600 font-medium">{job.company}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📅 Applied {daysAgo} days ago</span>
                          <span>📊 Status: {job.status}</span>
                          {isCompleted && (
                            <span className="text-emerald-600 font-medium">✅ Test Completed</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {!isCompleted ? (
                          <button
                            onClick={() => handleStartExam(job, index)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold transition-all duration-300 transform hover:scale-105"
                          >
                            Start Proctored Mock Test
                          </button>
                        ) : (
                          <div className="text-center">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-emerald-600 font-medium text-sm">Completed</span>
                          </div>
                        )}
                        
                        <button className="px-4 py-2 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg animate-fade-in-scale text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start applying to jobs to see your activities here</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
              Browse Jobs
            </button>
          </div>
        )}

        {/* Mock Test Information */}
        <div className="mt-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg animate-fade-in-scale">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-600">No updates yet from job providers.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="bg-white/30 border border-white/40 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{item.title || 'Application Update'}</p>
                    <p className="text-gray-700">{item.message}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.status === 'selected'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status || 'info'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mock Test Information */}
        <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-gray-800 mb-4">About Mock Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Video and microphone monitoring</li>
                <li>• Real-time proctoring</li>
                <li>• Multiple choice questions</li>
                <li>• Coding challenges</li>
                <li>• Time-based assessments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Requirements:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Allow camera and microphone access</li>
                <li>• Stable internet connection</li>
                <li>• Quiet environment</li>
                <li>• No external devices</li>
                <li>• Full-screen mode recommended</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mock Test Modal */}
      {showMockTest && selectedJob && (
        <SimpleMockTest
          job={selectedJob.job}
          onComplete={handleMockTestCompletion}
          onClose={handleCloseMockTest}
        />
      )}
    </div>
  );
}
