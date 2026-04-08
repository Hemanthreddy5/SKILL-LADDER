import React, { useState } from "react";

export default function CareerCounselling() {
  const [booking, setBooking] = useState({ date: "", time: "", message: "" });
  const [booked, setBooked] = useState(false);
  const [chat, setChat] = useState("");
  const [chatSent, setChatSent] = useState(false);
  const [botReply, setBotReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = (e) => {
    e.preventDefault();
    const requests = JSON.parse(localStorage.getItem("career_bookings") || "[]");
    requests.push({ ...booking, submitted: new Date().toLocaleString() });
    localStorage.setItem("career_bookings", JSON.stringify(requests));
    setBooked(true);
    setBooking({ date: "", time: "", message: "" });
  };

  const handleChat = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBotReply("");
    setChatSent(false);
    try {
      const res = await fetch("http://localhost:5001/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: chat })
      });
      const data = await res.json();
      setBotReply(data.answer);
      setChatSent(true);
    } catch (err) {
      setBotReply("Could not reach the counsellor bot. Please try again later.");
      setChatSent(true);
    }
    setLoading(false);
    setChat("");
  };


  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8 mb-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-4 text-center">Career Counselling</h2>
      <img src="https://imgs.search.brave.com/2xVBxJCh-_EUslRPKJc_3JEAIL5j848PIfaQAgvnGfM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29maWEuY29tLnNn/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzA2L0NhcmVlci1D/b3Vuc2VsbGluZy1j/b21wcmVzc2VkLnBu/Zw" alt="Career Counselling" className="rounded-xl mb-4 w-full max-h-64 object-cover" />
      <p className="text-lg text-gray-700 mb-4 text-center">
        Get personalized guidance on your career path! Our expert counsellors help you discover your strengths, explore opportunities, and plan your future with confidence.
      </p>
      <ul className="list-disc pl-6 text-blue-900 mb-4">
        <li>1:1 Counselling Sessions</li>
        <li>Resume & Interview Preparation</li>
        <li>Skill Gap Analysis</li>
        <li>Industry Insights & Roadmaps</li>
      </ul>
      {/* Booking Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Book a Counselling Session</h3>
        {booked ? (
          <div className="text-green-700 font-semibold">Your booking request was submitted! Our counsellor will contact you soon.</div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleBooking}>
            <div className="flex gap-2">
              <input type="date" value={booking.date} onChange={e => setBooking(b => ({ ...b, date: e.target.value }))} className="border rounded p-2 w-1/2" required />
              <input type="time" value={booking.time} onChange={e => setBooking(b => ({ ...b, time: e.target.value }))} className="border rounded p-2 w-1/2" required />
            </div>
            <textarea value={booking.message} onChange={e => setBooking(b => ({ ...b, message: e.target.value }))} className="border rounded p-2" placeholder="What do you want to discuss?" required />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Book Session</button>
          </form>
        )}
      </div>
      {/* Quick Chat/Help Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Ask a Quick Question</h3>
        <form className="flex flex-col gap-2" onSubmit={handleChat}>
          <textarea value={chat} onChange={e => setChat(e.target.value)} className="border rounded p-2" placeholder="Type your question here..." required />
          <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" disabled={loading}>{loading ? "Sending..." : "Send Question"}</button>
        </form>
        {chatSent && (
          <div className="mt-2 p-2 bg-white border border-blue-200 rounded text-blue-800 font-semibold animate-fadeIn">
            <span className="font-bold">Counsellor Bot:</span> {botReply}
          </div>
        )}
      </div>
      {/* Extra Resources */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-xl font-bold text-blue-700 mb-2">Career Resources</h3>
        <ul className="list-disc pl-6 text-blue-900">
          <li><a href="https://www.careerguide.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CareerGuide.com</a></li>
          <li><a href="https://www.topresume.com/career-advice" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TopResume Career Advice</a></li>
          <li><a href="https://www.interviewbit.com/hr-interview-questions/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">InterviewBit HR Questions</a></li>
        </ul>
      </div>
    </div>
  );
}
