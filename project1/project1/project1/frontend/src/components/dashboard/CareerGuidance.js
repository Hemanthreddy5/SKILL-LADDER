import React from "react";

export default function CareerGuidance() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg w-full max-w-lg mt-8 border border-blue-200">
      <h2 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
        <span role="img" aria-label="guidance">🧭</span> Career Guidance
      </h2>
      <ul className="list-disc list-inside text-blue-900 space-y-2">
        <li>
          <span className="font-semibold">Skill Gap Analysis:</span> Get suggestions on skills to learn based on your resume and job interests.
        </li>
        <li>
          <span className="font-semibold">Recommended Courses:</span> Explore curated online courses to boost your employability.
        </li>
        <li>
          <span className="font-semibold">Mock Interviews:</span> Practice with AI-powered or peer interviews for confidence.
        </li>
        <li>
          <span className="font-semibold">Personalized Roadmap:</span> Receive a step-by-step plan for your target career path.
        </li>
        <li>
          <span className="font-semibold">Resume Tips:</span> Improve your resume with actionable feedback and examples.
        </li>
      </ul>
      <div className="mt-4 text-sm text-blue-600 italic">
        Need more help? Contact your college career center or book a 1:1 session with a mentor!
      </div>
    </div>
  );
}
