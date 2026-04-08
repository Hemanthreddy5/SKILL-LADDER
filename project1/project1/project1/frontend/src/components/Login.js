import React, { useState, useEffect } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // New registration fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
                const [graduationYear, setGraduationYear] = useState("");
              const [studyYear, setStudyYear] = useState("");
              const [degreeType, setDegreeType] = useState("");
              const [collegeName, setCollegeName] = useState("");

  // Animation states
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearTimeout(timer);
  }, [animationPhase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !role)) {
      setError("Please fill all required fields" + (isRegister ? " and select a role." : "."));
      return;
    }
    
    if (isRegister && role === "job_seeker" && (!name || !phone || !graduationYear || !studyYear || !degreeType || !collegeName)) {
      setError("Please fill all registration fields for Job Seeker.");
      return;
    }
    
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "register" : "login";
      const requestBody = isRegister 
        ? { 
            email, 
            password, 
            role,
            name,
            phone,
            graduationYear,
            studyYear,
            degreeType,
            collegeName
          } 
        : { email, password };
        
      const res = await fetch(`http://localhost:8001/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.detail || "Authentication failed.");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      {/* Full Screen 3D Animated Background */}
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/40 to-indigo-400/40 rounded-full blur-3xl animate-pulse transition-all duration-5000 ${
          animationPhase === 0 ? 'translate-x-20 translate-y-10 scale-110' : 
          animationPhase === 1 ? '-translate-x-10 translate-y-20 scale-90' : 
          animationPhase === 2 ? 'translate-x-10 -translate-y-10 scale-105' : 
          'translate-x-0 translate-y-0 scale-100'
        }`}></div>
        
        <div className={`absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/40 to-pink-300/40 rounded-full blur-3xl animate-pulse transition-all duration-5000 ${
          animationPhase === 0 ? '-translate-x-15 translate-y-5 scale-90' : 
          animationPhase === 1 ? 'translate-x-10 -translate-y-15 scale-110' : 
          animationPhase === 2 ? '-translate-x-5 translate-y-10 scale-95' : 
          'translate-x-0 translate-y-0 scale-100'
        }`}></div>
        
        <div className={`absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-300/40 to-teal-300/40 rounded-full blur-3xl animate-pulse transition-all duration-5000 ${
          animationPhase === 0 ? 'translate-x-15 -translate-y-10 scale-105' : 
          animationPhase === 1 ? '-translate-x-10 translate-y-5 scale-90' : 
          animationPhase === 2 ? 'translate-x-5 -translate-y-15 scale-110' : 
          'translate-x-0 translate-y-0 scale-100'
        }`}></div>
      </div>

      {/* Floating 3D Educational Elements - Distributed across entire page */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Area */}
        <div className="absolute top-16 left-16 w-16 h-20 bg-gradient-to-br from-amber-300 to-orange-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '0s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg transform rotate-y-12"></div>
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>
        </div>

        {/* Top Right Area */}
        <div className="absolute top-24 right-20 w-20 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '1s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-lg transform rotate-y-6"></div>
          <div className="absolute top-1 left-1 w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>

        {/* Center Left Area */}
        <div className="absolute top-1/2 left-12 w-14 h-8 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '2s'}}>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-gradient-to-r from-purple-200 to-pink-300 rounded-full"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-purple-100 to-pink-200 rounded-full"></div>
        </div>

        {/* Center Right Area */}
        <div className="absolute top-1/2 right-16 w-16 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '3s'}}>
          <div className="absolute top-1 left-2 w-2 h-1 bg-yellow-300 rounded"></div>
          <div className="absolute top-1 right-2 w-2 h-1 bg-yellow-300 rounded"></div>
        </div>

        {/* Bottom Left Area */}
        <div className="absolute bottom-24 left-1/4 w-12 h-16 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '4s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-lg transform rotate-y-8"></div>
          <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Bottom Right Area */}
        <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '5s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg transform rotate-y-15"></div>
        </div>

        {/* Top Center Area */}
        <div className="absolute top-1/3 left-1/2 w-8 h-12 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '6s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-lg transform rotate-y-10"></div>
        </div>

        {/* Bottom Center Area */}
        <div className="absolute bottom-1/3 left-1/2 w-14 h-8 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-lg shadow-2xl animate-float-3d-element" style={{transformStyle: 'preserve-3d', animationDelay: '7s'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-lg transform rotate-y-8"></div>
        </div>
      </div>

      {/* 3D Particle System */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full opacity-60 animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              transform: `translateZ(${Math.random() * 200}px)`
            }}
          ></div>
        ))}
        {[...Array(30)].map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-40 animate-float-particle-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 15}s`,
              transform: `translateZ(${Math.random() * 150}px)`
            }}
          ></div>
        ))}
      </div>

      {/* 3D Educational Icons - Distributed across entire page */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Row */}
        <div className="absolute top-8 left-1/6 text-5xl animate-float-3d-icon" style={{animationDelay: '0s'}}>
          <div className="text-blue-500 opacity-40">💻</div>
        </div>

        <div className="absolute top-12 right-1/5 text-6xl animate-float-3d-icon" style={{animationDelay: '1s'}}>
          <div className="text-indigo-500 opacity-40">🧠</div>
        </div>

        <div className="absolute top-16 left-1/2 text-4xl animate-float-3d-icon" style={{animationDelay: '2s'}}>
          <div className="text-purple-500 opacity-40">🚀</div>
        </div>

        {/* Middle Top Row */}
        <div className="absolute top-1/3 left-1/8 text-5xl animate-float-3d-icon" style={{animationDelay: '3s'}}>
          <div className="text-amber-500 opacity-40">💡</div>
        </div>

        <div className="absolute top-1/3 right-1/8 text-6xl animate-float-3d-icon" style={{animationDelay: '4s'}}>
          <div className="text-emerald-500 opacity-40">📚</div>
        </div>

        <div className="absolute top-1/3 left-3/4 text-4xl animate-float-3d-icon" style={{animationDelay: '5s'}}>
          <div className="text-orange-500 opacity-40">🎯</div>
        </div>

        {/* Center Area */}
        <div className="absolute top-1/2 left-1/4 text-5xl animate-float-3d-icon" style={{animationDelay: '6s'}}>
          <div className="text-indigo-500 opacity-40">⚡</div>
        </div>

        <div className="absolute top-1/2 right-1/4 text-6xl animate-float-3d-icon" style={{animationDelay: '7s'}}>
          <div className="text-rose-500 opacity-40">🌟</div>
        </div>

        {/* Middle Bottom Row */}
        <div className="absolute bottom-1/3 left-1/6 text-4xl animate-float-3d-icon" style={{animationDelay: '8s'}}>
          <div className="text-blue-500 opacity-40">🎓</div>
        </div>

        <div className="absolute bottom-1/3 right-1/6 text-5xl animate-float-3d-icon" style={{animationDelay: '9s'}}>
          <div className="text-emerald-500 opacity-40">🔬</div>
        </div>

        <div className="absolute bottom-1/3 left-2/3 text-6xl animate-float-3d-icon" style={{animationDelay: '10s'}}>
          <div className="text-rose-500 opacity-40">💼</div>
        </div>

        {/* Bottom Row */}
        <div className="absolute bottom-16 left-1/4 text-5xl animate-float-3d-icon" style={{animationDelay: '11s'}}>
          <div className="text-violet-500 opacity-40">🎨</div>
        </div>

        <div className="absolute bottom-12 right-1/4 text-4xl animate-float-3d-icon" style={{animationDelay: '12s'}}>
          <div className="text-teal-500 opacity-40">🔧</div>
        </div>

        <div className="absolute bottom-8 left-3/4 text-6xl animate-float-3d-icon" style={{animationDelay: '13s'}}>
          <div className="text-amber-500 opacity-40">📊</div>
        </div>
      </div>

      {/* Floating Glass Morphism Login Form */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
        <div className="w-full max-w-md">
          <div className="glass-morphism-form rounded-3xl shadow-2xl p-6 md:p-8 animate-float-3d max-h-[90vh] overflow-y-auto">
            {/* 3D Logo and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-glow-3d">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 bg-clip-text text-transparent mb-2 animate-text-glow">
                Skill Ladder
              </h1>
              <p className="text-gray-700 text-base md:text-lg font-medium">
                {isRegister ? "Start Your Career Journey" : "Welcome to Your Learning Path"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* 3D Email Field */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                  required
                />
              </div>

              {/* 3D Password Field */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                  required
                />
              </div>

              {/* Registration Fields - Only show when isRegister is true */}
              {isRegister && (
                <>
                  {/* 3D Name Field */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                      required={role === "job_seeker"}
                    />
                  </div>

                  {/* 3D Phone Field */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                      required={role === "job_seeker"}
                    />
                  </div>

                  {/* 3D Role Selection */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 appearance-none text-base md:text-lg"
                      required
                    >
                      <option value="" className="bg-white text-gray-800">Select Your Role</option>
                      <option value="job_seeker" className="bg-white text-gray-800">🎓 Job Seeker</option>
                      <option value="job_provider" className="bg-white text-gray-800">💼 Job Provider</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Job Seeker Specific Fields */}
                  {role === "job_seeker" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <input
                            type="number"
                            placeholder="Graduation Year (e.g., 2025)"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            min="2020"
                            max="2030"
                            className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                            required
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <select
                            value={studyYear}
                            onChange={(e) => setStudyYear(e.target.value)}
                            className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 appearance-none text-base md:text-lg"
                            required
                          >
                            <option value="" className="bg-white text-gray-800">Select Study Year</option>
                            <option value="1st Year" className="bg-white text-gray-800">1st Year</option>
                            <option value="2nd Year" className="bg-white text-gray-800">2nd Year</option>
                            <option value="3rd Year" className="bg-white text-gray-800">3rd Year</option>
                            <option value="4th Year" className="bg-white text-gray-800">4th Year (Final)</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <select
                          value={degreeType}
                          onChange={(e) => setDegreeType(e.target.value)}
                          className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 appearance-none text-base md:text-lg"
                          required
                        >
                          <option value="" className="bg-white text-gray-800">Select Degree Type</option>
                          <option value="BE" className="bg-white text-gray-800">BE (Bachelor of Engineering)</option>
                          <option value="BTech" className="bg-white text-gray-800">BTech (Bachelor of Technology)</option>
                          <option value="BCA" className="bg-white text-gray-800">BCA (Bachelor of Computer Applications)</option>
                          <option value="BSc" className="bg-white text-gray-800">BSc (Bachelor of Science)</option>
                          <option value="BA" className="bg-white text-gray-800">BA (Bachelor of Arts)</option>
                          <option value="BBA" className="bg-white text-gray-800">BBA (Bachelor of Business Administration)</option>
                          <option value="Masters" className="bg-white text-gray-800">Masters</option>
                          <option value="PhD" className="bg-white text-gray-800">PhD</option>
                          <option value="Diploma" className="bg-white text-gray-800">Diploma</option>
                          <option value="Other" className="bg-white text-gray-800">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <input
                          type="text"
                          placeholder="College/University Name"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          className="relative w-full px-3 py-3 md:px-4 md:py-4 bg-white/20 border border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 transform hover:scale-105 text-base md:text-lg"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-300 rounded-xl p-3 md:p-4 text-red-700 text-sm md:text-lg animate-shake">
                  {error}
                </div>
              )}

              {/* 3D Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 md:py-5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-pulse-glow-3d relative overflow-hidden group text-lg md:text-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 md:mr-3"></div>
                      {isRegister ? "Creating Your Account..." : "Signing You In..."}
                    </div>
                  ) : (
                    isRegister ? "🚀 Create Account" : "🎯 Login"
                  )}
                </span>
              </button>

              {/* 3D Toggle Register/Login */}
              <button
                type="button"
                onClick={() => { 
                  setIsRegister(r => !r); 
                  setError(""); 
                  setEmail("");
                  setPassword("");
                  setRole("");
                  setName("");
                  setPhone("");
                  setGraduationYear("");
                  setStudyYear("");
                  setDegreeType("");
                  setCollegeName("");
                }}
                className="w-full text-gray-600 hover:text-gray-800 text-base md:text-lg transition-colors duration-300 transform hover:scale-105 font-medium"
              >
                {isRegister ? "Already have an account? Sign In" : "New to Skill Ladder? Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
