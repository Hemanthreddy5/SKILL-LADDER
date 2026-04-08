import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function ExamComponent({ user, examId, onComplete }) {
  const [stream, setStream] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isStarted, setIsStarted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const videoRef = useRef(null);

  const mockQuestions = [
    {
      id: 1,
      question: "What is the time complexity of binary search?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correct: 1
    },
    {
      id: 2,
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      correct: 1
    },
    {
      id: 3,
      question: "What is the primary purpose of an ATS system?",
      options: ["To schedule interviews", "To parse resumes", "To send emails", "To create job postings"],
      correct: 1
    },
    {
      id: 4,
      question: "Which programming paradigm does JavaScript primarily follow?",
      options: ["Procedural", "Object-oriented", "Functional", "All of the above"],
      correct: 3
    },
    {
      id: 5,
      question: "What does API stand for?",
      options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Integration"],
      correct: 0
    }
  ];

  useEffect(() => {
    setQuestions(mockQuestions);
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, timeLeft]);

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      setPermissionsGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        const maybePromise = videoRef.current.play();
        if (maybePromise && typeof maybePromise.catch === 'function') {
          maybePromise.catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to continue with the exam.');
    }
  };

  const startExam = () => {
    if (!permissionsGranted) {
      alert('Please grant camera and microphone permissions first.');
      return;
    }
    setIsStarted(true);
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    const score = questions.reduce((total, q) => {
      return total + (answers[q.id] === q.correct ? 1 : 0);
    }, 0);
    
    const percentage = (score / questions.length) * 100;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`completedExams.${examId}`]: {
          score: percentage,
          completedAt: new Date().toISOString(),
          totalQuestions: questions.length,
          correctAnswers: score
        }
      });
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      onComplete && onComplete(percentage);
    } catch (error) {
      console.error('Error saving exam results:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Mock Test Exam</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Exam Instructions:</h2>
              <ul className="text-gray-700 space-y-2">
                <li>• This exam contains {questions.length} multiple choice questions</li>
                <li>• You have 1 hour to complete the exam</li>
                <li>• Camera and microphone access is required for proctoring</li>
                <li>• You cannot go back to previous questions</li>
                <li>• The exam will auto-submit when time runs out</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Camera Setup:</h2>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              <button
                onClick={requestPermissions}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                {permissionsGranted ? '✓ Permissions Granted' : 'Grant Camera & Microphone Access'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={startExam}
                disabled={!permissionsGranted}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with timer and video */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-mono text-lg">
                Time: {formatTime(timeLeft)}
              </div>
              <div className="text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-2">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-32 h-24 object-cover rounded"
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {currentQ.question}
          </h2>
          
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQ.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                  answers[currentQ.id] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300 hover:bg-white/70'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
