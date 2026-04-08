import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import homeBg from '../images/home.jpg';

export default function Navbar({ user, activeSection, setActiveSection }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Always show sidebar for dashboard
  if (location.pathname !== '/dashboard' && location.pathname !== '/') {
    return (
      <nav className="w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 p-4 shadow-lg flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <img src={homeBg} alt="logo" className="w-12 h-12 rounded-full shadow-lg" />
          <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow">Skill Ladder</span>
        </div>
        <div className="flex items-center space-x-8">
          {user && (
            <Link to="/" className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200">Dashboard</Link>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {user && <span className="text-white font-medium">{user.email}</span>}
        </div>
      </nav>
    );
  }

  // Dashboard sidebar
  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-xl border-r border-white/30 shadow-2xl z-50 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Skill Ladder
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <svg className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-gray-800 font-medium text-sm truncate">{user.email}</p>
              <p className="text-gray-600 text-xs">
                {(user.role === 'job_seeker' || user.role === 'student') ? '🎓 Job Seeker' : '💼 Job Provider'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">

        {/* Dashboard Navigation */}
        {user && (user.role === "job_seeker" || user.role === "student") && (
          <>
            <button
              onClick={() => setActiveSection && setActiveSection('homepage')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'homepage'
                  ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border border-blue-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isCollapsed && <span className="font-medium">Dashboard</span>}
            </button>

            <button
              onClick={() => setActiveSection && setActiveSection('resume-ats')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'resume-ats'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 border border-emerald-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!isCollapsed && <span className="font-medium">Resume & ATS</span>}
            </button>

            <button
              onClick={() => setActiveSection && setActiveSection('job-recommends')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'job-recommends'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 border border-purple-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              {!isCollapsed && <span className="font-medium">Job Recommends</span>}
            </button>

            <button
              onClick={() => setActiveSection && setActiveSection('activities')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'activities'
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 border border-orange-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isCollapsed && <span className="font-medium">Activities</span>}
            </button>

            <button
              onClick={() => setActiveSection && setActiveSection('learn-platform')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'learn-platform'
                  ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-600 border border-pink-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
              </svg>
              {!isCollapsed && <span className="font-medium">Learning Guide</span>}
            </button>
            
            <button
              onClick={() => setActiveSection && setActiveSection('compiler')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeSection === 'compiler'
                  ? 'bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-600 border border-green-500/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {!isCollapsed && <span className="font-medium">Compiler</span>}
            </button>
          </>
        )}

        {/* Job Provider Navigation */}
        {user && user.role === "job_provider" && (
          <button
            onClick={() => setActiveSection && setActiveSection('homepage')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              activeSection === 'homepage'
                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 border border-blue-500/30'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {!isCollapsed && <span className="font-medium">Dashboard</span>}
          </button>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/30">
        <button 
          onClick={() => window.location.reload()}
          className={`w-full flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-300 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
