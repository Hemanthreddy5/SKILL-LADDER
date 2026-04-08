import React, { useState } from "react";

const LANG_MAP = {
  python: { id: 71, label: "Python 3" },
  java: { id: 62, label: "Java" },
  cpp: { id: 54, label: "C++" },
};

export default function CodeRunner({ lang }) {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setOutput("Running...");
    try {
      const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        },
        body: JSON.stringify({
          source_code: code,
          language_id: LANG_MAP[lang]?.id || 71
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
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-4 mb-2">
        <span className="font-semibold text-blue-700">{LANG_MAP[lang]?.label || "Python 3"}</span>
        <button className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition text-sm" onClick={handleRun} disabled={loading}>{loading ? "Running..." : "Run Code"}</button>
      </div>
      <textarea className="w-full border rounded p-2 font-mono min-h-[120px] mb-2" value={code} onChange={e => setCode(e.target.value)} placeholder={`Write your ${LANG_MAP[lang]?.label || 'Python 3'} code here...`} />
      <div className="bg-white border rounded p-2 font-mono min-h-[40px] text-sm">
        <div className="font-semibold text-gray-700 mb-1">Output:</div>
        <pre className="whitespace-pre-wrap break-all">{output}</pre>
      </div>
      <div className="text-xs text-gray-400 mt-1">Powered by Judge0 API. Set your RapidAPI key in the code for real use.</div>
    </div>
  );
}
