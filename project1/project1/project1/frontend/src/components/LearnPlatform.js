import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function LearnPlatform({ user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPreferences, setUserPreferences] = useState({
    languages: [],
    hoursPerWeek: '',
    skillLevel: '',
    learningGoals: []
  });
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Learning options
  const programmingLanguages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'csharp', name: 'C#', icon: '🎯' },
    { id: 'php', name: 'PHP', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', icon: '💎' },
    { id: 'swift', name: 'Swift', icon: '🍎' },
    { id: 'kotlin', name: 'Kotlin', icon: '📱' },
    { id: 'go', name: 'Go', icon: '🚀' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'typescript', name: 'TypeScript', icon: '📘' }
  ];

  // YouTube channels for each programming language
  const youtubeChannels = {
    python: [
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "Python tutorials for beginners" },
      { name: "Corey Schafer", url: "https://www.youtube.com/@coreyms", description: "In-depth Python programming" },
      { name: "Tech With Tim", url: "https://www.youtube.com/@TechWithTim", description: "Python projects and tutorials" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "Complete Python course" },
      { name: "CS Dojo", url: "https://www.youtube.com/@CSDojo", description: "Python for data science" }
    ],
    java: [
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "Java programming tutorials" },
      { name: "Amigoscode", url: "https://www.youtube.com/@amigoscode", description: "Java Spring Boot tutorials" },
      { name: "Coding with John", url: "https://www.youtube.com/@CodingWithJohn", description: "Java interview questions" },
      { name: "Baeldung", url: "https://www.youtube.com/@baeldung", description: "Java Spring tutorials" },
      { name: "Java Brains", url: "https://www.youtube.com/@javabrains", description: "Java EE and Spring" }
    ],
    javascript: [
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "JavaScript fundamentals" },
      { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "JavaScript projects" },
      { name: "The Net Ninja", url: "https://www.youtube.com/@TheNetNinja", description: "Modern JavaScript" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "Complete JS course" },
      { name: "Dev Ed", url: "https://www.youtube.com/@developedbyed", description: "JavaScript tutorials" }
    ],
    cpp: [
      { name: "The Cherno", url: "https://www.youtube.com/@TheCherno", description: "Extensive C++ tutorials" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "C++ for beginners" },
      { name: "CodeBeauty", url: "https://www.youtube.com/@CodeBeauty", description: "Effective C++ programming" },
      { name: "The New Boston", url: "https://www.youtube.com/@thenewboston", description: "Classic programming tutorials" }
    ],
    csharp: [
      { name: "IAmTimCorey", url: "https://www.youtube.com/@IAmTimCorey", description: "C# and .NET mastery" },
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "C# fundamentals" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "C# full course" }
    ],
    php: [
      { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "PHP for beginners" },
      { name: "The Net Ninja", url: "https://www.youtube.com/@TheNetNinja", description: "PHP tutorials" },
      { name: "Program with Gio", url: "https://www.youtube.com/@ProgramWithGio", description: "Modern PHP" }
    ],
    ruby: [
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "Ruby on Rails course" },
      { name: "GoRails", url: "https://www.youtube.com/@gorails", description: "Ruby on Rails projects" }
    ],
    swift: [
      { name: "Sean Allen", url: "https://www.youtube.com/@seanallen", description: "iOS development with Swift" },
      { name: "Paul Hudson", url: "https://www.youtube.com/@twostraws", description: "Swift programming" }
    ],
    kotlin: [
      { name: "Philipp Lackner", url: "https://www.youtube.com/@PhilippLackner", description: "Android development with Kotlin" },
      { name: "Practical Coding", url: "https://www.youtube.com/@PracticalCoding", description: "Kotlin tutorials" }
    ],
    go: [
      { name: "Golang Cafe", url: "https://www.youtube.com/@golangcafe", description: "Go programming" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "Go full course" }
    ],
    rust: [
      { name: "The Rustacean Station", url: "https://www.youtube.com/@RustaceanStation", description: "Rust discussions and tutorials" },
      { name: "No Boilerplate", url: "https://www.youtube.com/@NoBoilerplate", description: "Fast Rust learning" }
    ],
    typescript: [
      { name: "Matt Pocock", url: "https://www.youtube.com/@mattpocock", description: "TypeScript wizardry" },
      { name: "Jack Herrington", url: "https://www.youtube.com/@jherrington", description: "Advanced TypeScript" }
    ],
    react: [
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "React fundamentals" },
      { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "React projects" },
      { name: "The Net Ninja", url: "https://www.youtube.com/@TheNetNinja", description: "React hooks and context" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "React course" },
      { name: "Dev Ed", url: "https://www.youtube.com/@developedbyed", description: "React tutorials" }
    ],
    node: [
      { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", description: "Node.js backend" },
      { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "Node.js projects" },
      { name: "The Net Ninja", url: "https://www.youtube.com/@TheNetNinja", description: "Node.js tutorials" },
      { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", description: "Node.js course" },
      { name: "Dev Ed", url: "https://www.youtube.com/@developedbyed", description: "Node.js backend" }
    ],
    web: [
      { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", description: "Full stack web development" },
      { name: "Kevin Powell", url: "https://www.youtube.com/@kevinpowell", description: "CSS and layout specialist" },
      { name: "Web Dev Simplified", url: "https://www.youtube.com/@WebDevSimplified", description: "Modern web techniques" }
    ],
    ai: [
      { name: "Sentdex", url: "https://www.youtube.com/@sentdex", description: "Python for AI/ML" },
      { name: "Krish Naik", url: "https://www.youtube.com/@krishnaik06", description: "Data science and AI" }
    ]
  };

  const developmentAreas = [
    { id: 'web', name: 'Web Development', icon: '🌐', description: 'Build websites and web applications' },
    { id: 'mobile', name: 'Mobile Development', icon: '📱', description: 'Create iOS and Android apps' },
    { id: 'desktop', name: 'Desktop Development', icon: '💻', description: 'Build desktop applications' },
    { id: 'game', name: 'Game Development', icon: '🎮', description: 'Create video games' },
    { id: 'ai', name: 'AI & Machine Learning', icon: '🤖', description: 'Work with artificial intelligence' },
    { id: 'data', name: 'Data Science', icon: '📊', description: 'Analyze and visualize data' },
    { id: 'devops', name: 'DevOps', icon: '⚙️', description: 'Deploy and maintain applications' },
    { id: 'blockchain', name: 'Blockchain', icon: '⛓️', description: 'Build decentralized applications' }
  ];

  const timeOptions = [
    { value: '1-2', label: '1-2 hours per week' },
    { value: '3-5', label: '3-5 hours per week' },
    { value: '6-10', label: '6-10 hours per week' },
    { value: '10+', label: '10+ hours per week' }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to programming' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some programming experience' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced programmer' }
  ];

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.learningPreferences) {
          setUserPreferences(userData.learningPreferences);
          setCurrentStep(4); // Skip to learning path if preferences exist
          generateLearningPath(userData.learningPreferences);
        }
      }
    } catch (error) {
      console.warn('Error loading user preferences from Firestore:', error);
      // Continue with default state - user will go through the setup process
      console.log('Continuing with default preferences state');
    }
  };

  const handleLanguageToggle = (languageId) => {
    console.log('Language toggle clicked:', languageId);
    setUserPreferences(prev => {
      const newLanguages = prev.languages.includes(languageId)
        ? prev.languages.filter(id => id !== languageId)
        : [...prev.languages, languageId];
      console.log('Updated languages:', newLanguages);
      return {
        ...prev,
        languages: newLanguages
      };
    });
  };

  const handleGoalToggle = (goalId) => {
    console.log('Goal toggle clicked:', goalId);
    setUserPreferences(prev => {
      const newGoals = prev.learningGoals.includes(goalId)
        ? prev.learningGoals.filter(id => id !== goalId)
        : [...prev.learningGoals, goalId];
      console.log('Updated learning goals:', newGoals);
      return {
        ...prev,
        learningGoals: newGoals
      };
    });
  };

  const generateLearningPath = (preferences) => {
    console.log('Generating learning path for preferences:', preferences);

    const path = {
      languages: preferences.languages.map(langId =>
        programmingLanguages.find(lang => lang.id === langId)
      ).filter(Boolean), // Remove any undefined values
      areas: preferences.learningGoals.map(goalId =>
        developmentAreas.find(area => area.id === goalId)
      ).filter(Boolean), // Remove any undefined values
      weeklyHours: preferences.hoursPerWeek,
      skillLevel: preferences.skillLevel,
      courses: [],
      timeline: '12 weeks',
      estimatedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    // Generate course recommendations based on preferences
    path.courses = generateCourses(preferences);
    console.log('Generated learning path:', path);
    setLearningPath(path);
  };

  const generateCourses = (preferences) => {
    const courses = [];

    if (preferences.languages && preferences.languages.length > 0) {
      preferences.languages.forEach(langId => {
        const language = programmingLanguages.find(lang => lang.id === langId);
        if (language) {
          courses.push({
            id: `course-${langId}`,
            title: `Learn ${language.name}`,
            description: `Master ${language.name} programming fundamentals`,
            duration: '4 weeks',
            difficulty: 'Beginner', // Default difficulty
            type: 'video',
            progress: 0
          });
        }
      });
    }

    if (preferences.learningGoals && preferences.learningGoals.length > 0) {
      preferences.learningGoals.forEach(goalId => {
        const area = developmentAreas.find(area => area.id === goalId);
        if (area) {
          courses.push({
            id: `course-${goalId}`,
            title: `${area.name} Fundamentals`,
            description: area.description,
            duration: '6 weeks',
            difficulty: 'Intermediate',
            type: 'project-based',
            progress: 0
          });
        }
      });
    }

    console.log('Generated courses:', courses);
    return courses;
  };

  const handleNext = async () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('userPreferences:', userPreferences);

    if (currentStep === 3) {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Learning path generation timeout reached, using fallback');
        setLoading(false);

        // Generate learning path locally as fallback
        generateLearningPath(userPreferences);
        setCurrentStep(4);

        alert('Learning path generated! Using local processing due to server timeout.');
      }, 10000); // 10 second timeout

      try {
        console.log('Saving preferences to Firestore...');
        // Try to save preferences to Firestore
        try {
          const userRef = doc(db, "users", user.email);
          await updateDoc(userRef, {
            learningPreferences: userPreferences
          });
          console.log('Preferences saved successfully to Firestore');
        } catch (firestoreError) {
          console.warn('Firestore save failed, but continuing with local generation:', firestoreError);
          // Continue without saving to Firestore
        }

        clearTimeout(timeoutId); // Clear timeout if successful

        // Generate learning path locally
        console.log('Generating learning path...');
        generateLearningPath(userPreferences);
        setCurrentStep(4);
        console.log('Moved to step 4');
      } catch (error) {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error('Error in handleNext:', error);
        // Fallback: Generate learning path even if save fails
        console.log('Using fallback: generating learning path without saving');
        generateLearningPath(userPreferences);
        setCurrentStep(4);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Moving to next step:', currentStep + 1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep1 = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">What programming languages interest you?</h2>
      <p className="text-gray-600 mb-8">Select the languages you'd like to learn (you can choose multiple)</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {programmingLanguages.map((language) => (
          <button
            key={language.id}
            onClick={() => handleLanguageToggle(language.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${userPreferences.languages.includes(language.id)
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 bg-white/20 hover:border-blue-300'
              }`}
          >
            <div className="text-3xl mb-2">{language.icon}</div>
            <div className="font-semibold text-gray-800">{language.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">What development areas interest you?</h2>
      <p className="text-gray-600 mb-8">Choose the areas you want to specialize in</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {developmentAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => handleGoalToggle(area.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${userPreferences.learningGoals.includes(area.id)
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 bg-white/20 hover:border-purple-300'
              }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{area.icon}</span>
              <div>
                <div className="font-semibold text-gray-800">{area.name}</div>
                <div className="text-sm text-gray-600">{area.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tell us about your learning preferences</h2>

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">How much time can you dedicate per week?</h3>
          <div className="grid grid-cols-2 gap-4">
            {timeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  console.log('Time option selected:', option.value);
                  setUserPreferences(prev => ({ ...prev, hoursPerWeek: option.value }));
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${userPreferences.hoursPerWeek === option.value
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                  : 'border-gray-200 bg-white/20 hover:border-emerald-300'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">What's your current skill level?</h3>
          <div className="space-y-3">
            {skillLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  console.log('Skill level selected:', level.value);
                  setUserPreferences(prev => ({ ...prev, skillLevel: level.value }));
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${userPreferences.skillLevel === level.value
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white/20 hover:border-orange-300'
                  }`}
              >
                <div className="font-semibold text-gray-800">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Personalized Learning Path</h2>

      {learningPath && (
        <div className="space-y-8">
          {/* Overview */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Learning Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{learningPath.courses.length}</div>
                <div className="text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{learningPath.timeline}</div>
                <div className="text-gray-600">Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{learningPath.weeklyHours} hrs/week</div>
                <div className="text-gray-600">Study Time</div>
              </div>
            </div>
          </div>

          {/* Selected Languages */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Languages to Learn</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {learningPath.languages.map((language) => (
                <div key={language.id} className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-3xl mb-2">{language.icon}</div>
                  <div className="font-semibold text-gray-800">{language.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Areas */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Development Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPath.areas.map((area) => (
                <div key={area.id} className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl">
                  <span className="text-2xl">{area.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{area.name}</div>
                    <div className="text-sm text-gray-600">{area.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Recommendations */}
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Courses</h3>
            <div className="space-y-4">
              {learningPath.courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{course.title}</div>
                      <div className="text-sm text-gray-600">{course.description}</div>
                      <div className="text-xs text-gray-500">{course.duration}</div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
                    onClick={() => showYouTubeChannels(course)}
                  >
                    Start Course
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Completion */}
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Timeline</h3>
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Estimated completion date: <span className="font-semibold">{learningPath.estimatedCompletion}</span>
              </p>
              <p className="text-sm text-gray-600">
                Based on {learningPath.weeklyHours} hours per week of dedicated study time
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const showYouTubeChannels = (course) => {
    setSelectedCourse(course);
    setShowYouTubeModal(true);
  };

  const openYouTubeChannel = (url) => {
    window.open(url, '_blank');
  };

  const closeYouTubeModal = () => {
    setShowYouTubeModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-text-glow">
            Learning Guide
          </h1>
          <p className="text-gray-600 text-lg">
            Get personalized learning recommendations based on your goals
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg mb-8 animate-fade-in-scale">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/20 text-gray-700 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={
                (() => {
                  const step1Disabled = currentStep === 1 && userPreferences.languages.length === 0;
                  const step2Disabled = currentStep === 2 && userPreferences.learningGoals.length === 0;
                  const step3Disabled = currentStep === 3 && (!userPreferences.hoursPerWeek || !userPreferences.skillLevel);

                  console.log('Button validation:', {
                    currentStep,
                    step1Disabled,
                    step2Disabled,
                    step3Disabled,
                    languages: userPreferences.languages,
                    learningGoals: userPreferences.learningGoals,
                    hoursPerWeek: userPreferences.hoursPerWeek,
                    skillLevel: userPreferences.skillLevel
                  });

                  return step1Disabled || step2Disabled || step3Disabled;
                })()
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                currentStep === 3 ? 'Generate Learning Path' : 'Next'
              )}
            </button>
          </div>
        )}

        {/* Status Indicator for Learning Path Generation */}
        {loading && (
          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-blue-700 font-medium">Generating your personalized learning path...</span>
            </div>
            <p className="text-sm text-blue-600 mt-2 text-center">
              This may take a few moments. If it takes too long, we'll use local processing.
            </p>
          </div>
        )}
      </div>

      {/* YouTube Channels Modal */}
      {showYouTubeModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">🎥 Top YouTube Channels for {selectedCourse.title}</h3>
              <button
                onClick={closeYouTubeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {(() => {
                const languageId = selectedCourse.id.split('-')[1];
                const channels = youtubeChannels[languageId] || [];

                if (channels.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No YouTube channels found for this course.</p>
                    </div>
                  );
                }

                return channels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">{channel.name}</h4>
                        <p className="text-gray-600 text-sm">{channel.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openYouTubeChannel(channel.url)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Start Class
                    </button>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-700 font-medium mb-4">Can't find what you're looking for?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.open(`https://www.google.com/search?q=best+resources+to+learn+${selectedCourse.title}`, '_blank')}
                  className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  🔍 Search on Google
                </button>
                <button
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${selectedCourse.title}`, '_blank')}
                  className="px-6 py-3 bg-red-50 border-2 border-red-500 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  🎬 Search on YouTube
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
