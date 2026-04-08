import React from "react";

export default function JobModal({ job, onClose }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="bg-white p-8 max-w-lg w-full relative rounded-2xl shadow-2xl animate-slideUp border-2 border-blue-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-xl text-gray-300 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold mb-3 text-blue-800 drop-shadow">{job.title}</h2>
        <div className="mb-2 text-lg text-blue-700 font-semibold">{job.company}</div>
        <div className="mb-2 text-sm text-blue-600">Location: <span className="font-semibold">{job.location || "Remote"}</span></div>
        <div className="mb-2 text-sm text-green-700">Salary: <span className="font-bold">{job.salary || "Best in industry"}</span></div>
        <div className="mb-2 text-sm text-purple-700">Rounds: <span className="font-bold">{job.rounds || "3+"}</span></div>
        <div className="mb-4 text-gray-800">{job.description}</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {job.skills.map((skill, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold shadow border border-blue-300">
              {skill}
            </span>
          ))}
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold px-8 py-2 mt-2 rounded-lg shadow-lg transition" onClick={() => {onClose(true);}}>Apply Now</button>
      </div>
    </div>
  );
}
