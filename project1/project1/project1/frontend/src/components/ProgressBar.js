import React, { useState, useEffect } from "react";

export default function ProgressBar({ language }) {
  const key = `progress_${language}`;
  const [progress, setProgress] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  });

  useEffect(() => {
    localStorage.setItem(key, progress);
  }, [progress, key]);

  const handleAdvance = () => {
    setProgress(p => (p < 100 ? p + 20 : 100));
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-700 text-sm">Your Progress</span>
        <span className="text-gray-700 text-sm">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" onClick={handleAdvance} disabled={progress >= 100}>Mark Lesson Complete</button>
    </div>
  );
}
