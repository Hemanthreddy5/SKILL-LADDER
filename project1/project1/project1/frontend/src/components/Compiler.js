import React, { useState } from 'react';

export default function Compiler({ user }) {
  const [code, setCode] = useState('# Write your Python code here...\nn = int(input())\nfor i in range(n):\n    print(i)');
  const [input, setInput] = useState('5');
  const [output, setOutput] = useState('Ready to execute Python code...');
  const [isLoading, setIsLoading] = useState(false);

  const runCode = async () => {
    if (!code.trim()) {
      setOutput('Please enter some code to execute.');
      return;
    }

    setIsLoading(true);
    setOutput('Executing...');

    try {
      const response = await fetch('http://localhost:5000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input })
      });

      const result = await response.json();

      let outputText = '';
      if (result.output) {
        outputText += result.output;
      }
      if (result.error) {
        outputText += `\nError: ${result.error}`;
      }
      if (!result.output && !result.error) {
        outputText = 'Code executed successfully (no output)';
      }

      setOutput(outputText || 'No output');
    } catch (error) {
      setOutput(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEditor = () => {
    setCode('');
    setInput('');
    setOutput('Ready to execute Python code...');
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
            🐍 Python Code Compiler
          </h1>
          <div className="text-sm text-gray-500">
            Run Python code directly in your browser
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Code Editor:</h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 font-mono text-sm p-4 bg-gray-800 text-white rounded-lg shadow-inner"
            placeholder="# Write your Python code here..."
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Input (for input() function):</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-24 font-mono text-sm p-4 bg-gray-100 rounded-lg shadow-inner"
            placeholder="Enter input values here (one per line)..."
          />
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={runCode}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span>▶️ Run Code</span>
            )}
          </button>
          <button
            onClick={clearEditor}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow hover:shadow-lg transition-all duration-300"
          >
            🗑️ Clear
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Output:</h3>
          <div className="w-full min-h-[200px] font-mono text-sm p-4 bg-gray-100 rounded-lg shadow-inner whitespace-pre-wrap">
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}
