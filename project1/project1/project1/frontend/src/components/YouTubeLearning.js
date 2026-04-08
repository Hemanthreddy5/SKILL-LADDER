import React, { useState } from 'react';

// Programming language channels data
const PROGRAMMING_CHANNELS = {
  JavaScript: [
    {
      name: "Traversy Media",
      url: "https://www.youtube.com/@TraversyMedia",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Modern web development tutorials"
    },
    {
      name: "JavaScript Mastery",
      url: "https://www.youtube.com/@javascriptmastery",
      image: "https://yt3.googleusercontent.com/wg1TITEoPfxvBGfzuqWyt3bqm_qu35ZhMswUv3feetU3xNX_6wsAXZF40OlPIgY4TmqbqCmAZ1U=s176-c-k-c0x00ffffff-no-rj",
      description: "Advanced JavaScript and React projects"
    },
    {
      name: "The Net Ninja",
      url: "https://www.youtube.com/@NetNinja",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_n8QbTuJ0GYIW5-Ek0Tz7_P2Xg_Kx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8Qx8=s176-c-k-c0x00ffffff-no-rj",
      description: "Web development tutorials and courses"
    }
  ],
  Python: [
    {
      name: "Programming with Mosh",
      url: "https://www.youtube.com/@programmingwithmosh",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kpd0jb0tVFtj0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0=s176-c-k-c0x00ffffff-no-rj",
      description: "Python programming from basics to advanced"
    },
    {
      name: "Corey Schafer",
      url: "https://www.youtube.com/@coreyms",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Python tutorials and best practices"
    },
    {
      name: "Tech With Tim",
      url: "https://www.youtube.com/@TechWithTim",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Python projects and programming tutorials"
    }
  ],
  Java: [
    {
      name: "Coding with John",
      url: "https://www.youtube.com/@CodingWithJohn",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Java programming tutorials for beginners"
    },
    {
      name: "Java Brains",
      url: "https://www.youtube.com/@Java.Brains",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Java frameworks and enterprise development"
    },
    {
      name: "Derek Banas",
      url: "https://www.youtube.com/@derekbanas",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Java tutorials and programming concepts"
    }
  ],
  "C++": [
    {
      name: "The Cherno",
      url: "https://www.youtube.com/@TheCherno",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "C++ programming and game development"
    },
    {
      name: "CodeBeauty",
      url: "https://www.youtube.com/@CodeBeauty",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "C++ tutorials and programming fundamentals"
    },
    {
      name: "Bo Qian",
      url: "https://www.youtube.com/@BoQianTheProgrammer",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Advanced C++ concepts and best practices"
    }
  ],
  React: [
    {
      name: "React Official",
      url: "https://www.youtube.com/@reactjs",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "Official React tutorials and updates"
    },
    {
      name: "Academind",
      url: "https://www.youtube.com/@academind",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "React and modern web development"
    },
    {
      name: "Ben Awad",
      url: "https://www.youtube.com/@benawad",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_kGrKU5l8lVYNkNBOmJLpw0DgXzBMhOlvhyYGCLSZvKGw=s176-c-k-c0x00ffffff-no-rj",
      description: "React projects and coding tutorials"
    }
  ]
};

export default function YouTubeLearning() {
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [userAnswers, setUserAnswers] = useState({});
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Interactive questions to determine user's learning path
  const questions = [
    {
      id: 'experience',
      question: 'What is your programming experience level?',
      options: ['Beginner', 'Intermediate', 'Advanced']
    },
    {
      id: 'goal',
      question: 'What is your primary learning goal?',
      options: ['Web Development', 'Data Science', 'Mobile Apps', 'Game Development', 'System Programming']
    },
    {
      id: 'timeCommitment',
      question: 'How much time can you dedicate to learning per week?',
      options: ['1-3 hours', '4-7 hours', '8-15 hours', '15+ hours']
    }
  ];

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const getPersonalizedRecommendations = () => {
    setShowRecommendations(true);
  };

  const getRecommendedLanguages = () => {
    const goal = userAnswers.goal;
    const experience = userAnswers.experience;

    if (goal === 'Web Development') {
      return experience === 'Beginner' ? ['JavaScript', 'React'] : ['JavaScript', 'React'];
    } else if (goal === 'Data Science') {
      return ['Python'];
    } else if (goal === 'Mobile Apps') {
      return ['React', 'Java'];
    } else if (goal === 'Game Development') {
      return ['C++'];
    } else if (goal === 'System Programming') {
      return ['C++', 'Java'];
    }
    return ['JavaScript', 'Python'];
  };

  return (
    <div className="space-y-8">
      {!showRecommendations ? (
        // Interactive Assessment
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Let's Find Your Perfect Learning Path
          </h2>
          
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  {index + 1}. {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerChange(q.id, option)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userAnswers[q.id] === option
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(userAnswers).length === questions.length && (
            <div className="text-center mt-8">
              <button
                onClick={getPersonalizedRecommendations}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Get My Personalized Learning Path
              </button>
            </div>
          )}
        </div>
      ) : (
        // YouTube Channels Display
        <div className="space-y-6">
          {/* Personalized Recommendations */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Personalized Learning Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-purple-700">Experience Level</h3>
                <p className="text-gray-600">{userAnswers.experience}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-blue-700">Learning Goal</h3>
                <p className="text-gray-600">{userAnswers.goal}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-green-700">Time Commitment</h3>
                <p className="text-gray-600">{userAnswers.timeCommitment}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Recommended Languages:</h3>
              <div className="flex flex-wrap gap-2">
                {getRecommendedLanguages().map(lang => (
                  <span key={lang} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-purple-700">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Learning Language</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.keys(PROGRAMMING_CHANNELS).map((language) => (
                <button
                  key={language}
                  onClick={() => setSelectedLanguage(language)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedLanguage === language
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>

            {/* YouTube Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROGRAMMING_CHANNELS[selectedLanguage].map((channel, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{channel.name}</h3>
                      <p className="text-sm text-gray-600">{selectedLanguage} Expert</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{channel.description}</p>
                  
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Watch Channel
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Assessment Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setShowRecommendations(false);
                setUserAnswers({});
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Take Assessment Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
