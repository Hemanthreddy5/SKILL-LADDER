import React, { useState } from "react";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" }
];

export default function CodeCompiler() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");
    try {
      // For demo, use Judge0 API (public code runner)
      const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language === "python" ? 71 : language === "java" ? 62 : 54 // 71:Python3, 62:Java, 54:C++
        })
      });
      const data = await response.json();
      setOutput(data.stdout || data.stderr || "No output");
    } catch (err) {
      setOutput("Error running code");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-8 mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Online Code Compiler</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <select className="border rounded p-2 w-full sm:w-40" value={language} onChange={e => setLanguage(e.target.value)}>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition" onClick={handleRun} disabled={loading}>{loading ? "Running..." : "Run Code"}</button>
      </div>
      <textarea className="w-full border rounded p-2 mb-4 font-mono min-h-[180px]" value={code} onChange={e => setCode(e.target.value)} placeholder="Write your code here..." />
      <div className="bg-gray-100 rounded p-4 font-mono min-h-[80px]">
        <div className="font-semibold text-gray-700 mb-2">Output:</div>
        <pre className="whitespace-pre-wrap break-all">{output}</pre>
      </div>
      <div className="text-xs text-gray-400 mt-2">Powered by Judge0 API. For production, use your own backend for security.</div>
    </div>
  );
}
