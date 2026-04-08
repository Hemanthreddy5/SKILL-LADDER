import React from "react";
import { useNavigate } from "react-router-dom";

export default function ResumeScanCard({ scanResult }) {
  const navigate = useNavigate();
  // Try to parse basic sections and add formatting
  function formatResume(text) {
  if (typeof text !== 'string') {
    if (text == null) return null;
    text = String(text);
  }
  // Section icons
  const sectionIcons = {
    skills: '🛠️',
    'work experience': '💼',
    education: '🎓',
    projects: '📁',
    summary: '📝',
    certifications: '📜',
    achievements: '🏆',
    contact: '📞',
    profile: '👤',
    objective: '🎯',
    github: '🐙',
    linkedin: '🔗',
    email: '✉️',
    site: '🌐',
    portfolio: '🗂️',
    'last updated': '⏰',
  };
  // Split into lines
  const lines = text.split(/\r?\n/);
  return lines.map((line, idx) => {
      const trimmed = line.trim();
      // Section headers
      const sectionMatch = trimmed.match(/^(Skills|Work Experience|Education|Projects|Summary|Certifications|Achievements|Contact|Profile|Objective|Last updated|Github|LinkedIn|Portfolio|Site|Email)/i);
      if (sectionMatch) {
        const key = sectionMatch[1].toLowerCase();
        return (
          <div key={idx} className="flex items-center gap-2 mt-4 mb-2 animate-fadeInDown">
            <span className="text-2xl">{sectionIcons[key] || '📄'}</span>
            <span className="font-bold text-blue-900 text-lg tracking-wide">{line}</span>
          </div>
        );
      }
      // Skills line (comma separated)
      if (/^skills[:\s]/i.test(trimmed) && trimmed.includes(',')) {
        const skills = trimmed.replace(/^skills[:\s]*/i, '').split(',').map(s => s.trim()).filter(Boolean);
        return (
          <div key={idx} className="flex flex-wrap gap-2 mb-2 animate-fadeInLeft">
            {skills.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">{skill}</span>
            ))}
          </div>
        );
      }
      // Email, GitHub, LinkedIn, Portfolio, Site as clickable links
      if (/([\w.-]+@[\w.-]+\.[A-Za-z]{2,6})/.test(trimmed)) {
        const email = trimmed.match(/([\w.-]+@[\w.-]+\.[A-Za-z]{2,6})/)[1];
        return (
          <div key={idx} className="flex items-center gap-2 animate-fadeInLeft">
            <span className="text-xl">✉️</span>
            <a href={`mailto:${email}`} className="text-blue-700 underline font-mono">{email}</a>
          </div>
        );
      }
      if (/github/i.test(trimmed) && /github\.com\//i.test(trimmed)) {
        const url = trimmed.match(/(https?:\/\/)?(www\.)?github\.com\/[\w-]+/i);
        if (url) {
          return (
            <div key={idx} className="flex items-center gap-2 animate-fadeInLeft">
              <span className="text-xl">🐙</span>
              <a href={url[0].startsWith('http') ? url[0] : 'https://' + url[0]} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-mono">{url[0]}</a>
            </div>
          );
        }
      }
      if (/linkedin/i.test(trimmed) && /linkedin\.com\//i.test(trimmed)) {
        const url = trimmed.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[\w\/-]+/i);
        if (url) {
          return (
            <div key={idx} className="flex items-center gap-2 animate-fadeInLeft">
              <span className="text-xl">🔗</span>
              <a href={url[0].startsWith('http') ? url[0] : 'https://' + url[0]} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-mono">{url[0]}</a>
            </div>
          );
        }
      }
      if ((/portfolio|site/i.test(trimmed)) && /(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
        const url = trimmed.match(/(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i);
        if (url) {
          return (
            <div key={idx} className="flex items-center gap-2 animate-fadeInLeft">
              <span className="text-xl">🌐</span>
              <a href={url[0].startsWith('http') ? url[0] : 'https://' + url[0]} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-mono">{url[0]}</a>
            </div>
          );
        }
      }
      // All-caps lines
      if (/^[A-Z\s]{6,}$/.test(trimmed)) {
        return <div key={idx} className="uppercase tracking-wide font-semibold text-blue-700 mt-2 mb-1 animate-fadeInDown">{line}</div>;
      }
      // Bulletize lines that look like list items
      if (/^[*-] /.test(trimmed)) {
        return <div key={idx} className="pl-4 list-disc animate-fadeInLeft">{line}</div>;
      }
      // Otherwise, just show the line
      return <div key={idx} className="animate-fadeInLeft" style={{whiteSpace: 'pre-line'}}>{line}</div>;
    });
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-blue-200 p-8 max-w-3xl mx-auto my-6 overflow-y-auto min-h-[220px] max-h-[400px] animate-glow">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 animate-border-glow rounded-2xl"></div>
      <h3 className="text-xl font-bold text-blue-700 mb-4 text-center tracking-wide animate-fadeIn">Resume Scan Result</h3>
      <div className="relative z-10 text-gray-900 text-base leading-relaxed font-mono">
        {formatResume(scanResult)}
      </div>
      {/* Next button to go to Job Finder */}
      <div className="flex justify-center mt-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded shadow-lg transition text-lg animate-fadeIn"
          onClick={() => navigate("/job-finder")}
        >
          Next: Find Jobs
        </button>
      </div>
    </div>
  );
}

// Add these animations to your CSS (e.g., in index.css or App.css):
/*
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px 2px #3b82f6, 0 0 0 #fff0; }
  50% { box-shadow: 0 0 40px 6px #60a5fa, 0 0 0 #fff0; }
}
.animate-glow { animation: glow 2.5s infinite alternate; }

@keyframes border-glow {
  0% { box-shadow: 0 0 0 0 #60a5fa44; }
  100% { box-shadow: 0 0 16px 8px #60a5fa44; }
}
.animate-border-glow { animation: border-glow 2s infinite alternate; }

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fadeInLeft { animation: fadeInLeft 0.6s; }

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeInDown { animation: fadeInDown 0.6s; }
*/
