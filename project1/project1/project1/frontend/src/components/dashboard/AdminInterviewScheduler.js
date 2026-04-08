import React, { useEffect, useState } from "react";

export default function AdminInterviewScheduler({ selectedUser }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  const fetchInterviews = () => {
    setLoading(true);
    fetch(`http://localhost:8001/admin/get_interviews?email=${encodeURIComponent(selectedUser)}`)
      .then(res => res.json())
      .then(data => setInterviews(data.interviews || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedUser) fetchInterviews();
  }, [selectedUser]);

  const handleSchedule = e => {
    e.preventDefault();
    fetch("http://localhost:8001/admin/schedule_interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedUser, round, date, notes })
    })
      .then(res => res.json())
      .then(() => {
        setMsg("Interview scheduled!");
        setRound(""); setDate(""); setNotes("");
        fetchInterviews();
      });
  };

  if (!selectedUser) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mt-8">
      <h2 className="text-2xl font-semibold mb-2 text-blue-700">Schedule Interview for {selectedUser}</h2>
      <form onSubmit={handleSchedule} className="mb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Round (e.g. Aptitude, Coding)"
          value={round}
          onChange={e => setRound(e.target.value)}
          className="border px-3 py-2 rounded w-40"
          required
        />
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border px-3 py-2 rounded w-52"
          required
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Schedule</button>
      </form>
      {msg && <div className="text-green-700 mb-2">{msg}</div>}
      <h3 className="text-lg font-bold mb-2 text-blue-800">Scheduled Interviews</h3>
      {loading ? (
        <div>Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="text-gray-600">No interviews scheduled.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {interviews.map((i, idx) => (
            <li key={idx} className="py-2">
              <div><span className="font-semibold">Round:</span> {i.round}</div>
              <div><span className="font-semibold">Date:</span> {i.date ? new Date(i.date).toLocaleString() : ""}</div>
              {i.notes && <div><span className="font-semibold">Notes:</span> {i.notes}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
