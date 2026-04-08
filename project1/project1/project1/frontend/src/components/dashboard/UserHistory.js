import React, { useEffect, useState } from "react";

export default function UserHistory({ email }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`http://localhost:8001/get_history/?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .finally(() => setLoading(false));
  }, [email]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">Your Resume & Job History</h2>
      {loading ? (
        <div>Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-gray-600">No history found yet.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {history.slice().reverse().map((entry, idx) => (
            <li key={idx} className="py-4">
              <div className="mb-2 text-sm text-gray-500">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}</div>
              <div className="mb-1 font-semibold text-blue-800">Skills: {entry.skills && entry.skills.join(", ")}</div>
              <div className="mb-1 text-gray-700">Summary: {entry.summary}</div>
              {entry.jobs && entry.jobs.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold text-green-700">Job Suggestions:</div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {entry.jobs.map((job, jdx) => (
                      <li key={jdx}>{job.title} @ {job.company}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
