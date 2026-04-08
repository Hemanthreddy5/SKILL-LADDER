import React, { useState } from 'react';

export default function PracticeCoding({ user }) {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const languages = [
    { id: 'python', name: 'Python', template: '# Write your Python code here\ndef solution():\n    pass\n\nsolution()' },
    { id: 'java', name: 'Java', template: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}' },
    { id: 'cpp', name: 'C++', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}' }
  ];

  const problems = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
      ],
      testCases: [
        { input: '[2,7,11,15]\n9', expected: '[0,1]' },
        { input: '[3,2,4]\n6', expected: '[1,2]' }
      ]
    },
    {
      id: 2,
      title: 'Reverse String',
      difficulty: 'Easy',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
      examples: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
      ],
      testCases: [
        { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
      ]
    },
    {
      id: 3,
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' }
      ],
      testCases: [
        { input: '()', expected: 'true' },
        { input: '()[]{}\n', expected: 'true' },
        { input: '(]', expected: 'false' }
      ]
    },
    {
      id: 4,
      title: 'Maximum Subarray',
      difficulty: 'Medium',
      description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }
      ],
      testCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }
      ]
    },
    {
      id: 5,
      title: 'Binary Search',
      difficulty: 'Easy',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
      examples: [
        { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
        { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
      ],
      testCases: [
        { input: '[-1,0,3,5,9,12]\n9', expected: '4' },
        { input: '[-1,0,3,5,9,12]\n2', expected: '-1' }
      ]
    }
  ];

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
          input: selectedProblem?.testCases[0]?.input || ''
        }),
        mode: 'cors'
      });
      const result = await response.json();
      setOutput(result.output || result.error || 'No output');
    } catch (error) {
      // Fallback mock output
      setOutput(`Mock Output (${selectedLanguage}):\nCode executed successfully!\nResult: Sample output for ${selectedProblem?.title || 'problem'}`);
    }
    setIsRunning(false);
  };

  const selectProblem = (problem) => {
    setSelectedProblem(problem);
    const template = languages.find(lang => lang.id === selectedLanguage)?.template || '';
    setCode(template);
    setOutput('');
  };

  const changeLanguage = (langId) => {
    setSelectedLanguage(langId);
    const template = languages.find(lang => lang.id === langId)?.template || '';
    setCode(template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Practice Coding</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems List */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Problems</h2>
            <div className="space-y-3">
              {problems.map(problem => (
                <div
                  key={problem.id}
                  onClick={() => selectProblem(problem)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedProblem?.id === problem.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{problem.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProblem && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedProblem.title}</h2>
                <p className="text-gray-700 mb-4">{selectedProblem.description}</p>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Examples:</h3>
                  {selectedProblem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded mb-2">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Code Editor</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg border border-gray-600"
                placeholder="Write your code here..."
              />
              
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={runCode}
                  disabled={isRunning || !selectedProblem}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Output</h3>
              <pre className="bg-gray-900 text-white p-4 rounded-lg min-h-[100px] overflow-auto">
                {output || 'Run your code to see output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
