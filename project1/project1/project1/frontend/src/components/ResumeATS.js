import React, { useState, useRef } from 'react';
import { db, storage } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ResumeATS({ user, onResult }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    console.log('File selected:', selectedFile);
    console.log('File type:', selectedFile.type);
    console.log('File name:', selectedFile.name);

    if (selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      console.log('PDF file accepted');
    } else {
      console.log('Invalid file type:', selectedFile.type);
      alert('Please upload a PDF file');
    }
  };

  const extractTextFromPDF = async (file) => {
    // For now, we'll use a more realistic text extraction approach
    // In production, you would use a PDF parsing library like pdf-parse
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // Try to extract text from the file
          let extractedText = '';

          // For PDF files, we'll simulate extraction with realistic data
          // In a real implementation, you would use pdf-parse or similar library
          if (file.type === 'application/pdf') {
            // Simulate different resume content based on file size/name
            const fileName = file.name.toLowerCase();
            if (fileName.includes('software') || fileName.includes('developer')) {
              extractedText = `
                John Doe
                Software Engineer
                Email: john.doe@email.com
                Phone: (555) 123-4567
                
                EDUCATION
                Bachelor of Technology in Computer Science
                CGPA: 8.5/10
                University of Technology, 2020-2024
                
                SKILLS
                Programming Languages: Python, JavaScript, Java, C++, TypeScript
                Web Technologies: React, Node.js, HTML, CSS, Angular, Vue.js
                Databases: MySQL, MongoDB, PostgreSQL, Redis
                Tools: Git, Docker, AWS, Jenkins, Kubernetes
                Frameworks: Express.js, Django, Spring Boot, Laravel
                
                EXPERIENCE
                Software Developer Intern at TechCorp
                - Developed web applications using React and Node.js
                - Implemented RESTful APIs and microservices
                - Worked with MySQL and MongoDB databases
                - Used Git for version control and Docker for deployment
                
                PROJECTS
                E-commerce Platform
                - Built using React, Node.js, MongoDB
                - Implemented user authentication and payment integration
                - Deployed on AWS using Docker containers
                
                Machine Learning Project
                - Developed a recommendation system using Python
                - Used scikit-learn, pandas, and numpy libraries
                - Implemented data preprocessing and model training
              `;
            } else if (fileName.includes('data') || fileName.includes('analyst')) {
              extractedText = `
                Jane Smith
                Data Scientist
                Email: jane.smith@email.com
                Phone: (555) 987-6543
                
                EDUCATION
                Master of Science in Data Science
                CGPA: 9.2/10
                Data University, 2022-2024
                
                SKILLS
                Programming Languages: Python, R, SQL, Scala
                Machine Learning: TensorFlow, PyTorch, scikit-learn, pandas
                Big Data: Hadoop, Spark, Kafka, Hive
                Visualization: Tableau, Power BI, Matplotlib, Seaborn
                Cloud: AWS, Azure, Google Cloud Platform
                
                EXPERIENCE
                Data Analyst at DataCorp
                - Analyzed large datasets using Python and SQL
                - Built predictive models using machine learning
                - Created interactive dashboards with Tableau
                - Collaborated with cross-functional teams
                
                PROJECTS
                Customer Segmentation Analysis
                - Used K-means clustering for customer segmentation
                - Implemented in Python with scikit-learn
                - Achieved 85% accuracy in predictions
              `;
            } else {
              // Default resume content
              extractedText = `
                Alex Johnson
                Full Stack Developer
                Email: alex.johnson@email.com
                Phone: (555) 456-7890
                
                EDUCATION
                Bachelor of Engineering in Information Technology
                CGPA: 8.8/10
                Tech Institute, 2019-2023
                
                SKILLS
                Programming Languages: JavaScript, Python, Java, PHP
                Frontend: React, Angular, Vue.js, HTML5, CSS3, Bootstrap
                Backend: Node.js, Express.js, Django, Spring Boot
                Databases: MySQL, PostgreSQL, MongoDB, Redis
                DevOps: Docker, Kubernetes, AWS, CI/CD, Jenkins
                
                EXPERIENCE
                Full Stack Developer at WebSolutions
                - Developed responsive web applications
                - Implemented RESTful APIs and GraphQL
                - Optimized database queries and performance
                - Led agile development processes
                
                PROJECTS
                Social Media Platform
                - Built with React, Node.js, and MongoDB
                - Real-time messaging and notifications
                - Image upload and processing features
              `;
            }
          } else {
            // For non-PDF files, try to read as text
            extractedText = e.target.result || '';
          }

          resolve(extractedText);
        } catch (error) {
          console.error('Error extracting text:', error);
          // Fallback to a basic resume template
          resolve(`
            Resume Content
            Email: user@email.com
            Phone: (555) 000-0000
            
            EDUCATION
            Degree in Computer Science
            CGPA: 7.5/10
            
            SKILLS
            Programming: JavaScript, Python, Java
            Web Development: HTML, CSS, React
            Database: MySQL, MongoDB
            
            EXPERIENCE
            Software Developer
            - Developed web applications
            - Worked with various technologies
          `);
        }
      };
      reader.readAsText(file);
    });
  };

  const extractSkills = (text) => {
    const extractedSkills = [];
    const textLower = text.toLowerCase();

    console.log('Extracting skills from text:', text.substring(0, 200) + '...');

    Object.entries(skillDatabase).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
          extractedSkills.push(skill);
          console.log(`Found skill: ${skill} in category: ${category}`);
        }
      });
    });

    const uniqueSkills = [...new Set(extractedSkills)]; // Remove duplicates
    console.log('Extracted skills:', uniqueSkills);
    return uniqueSkills;
  };

  const extractCGPA = (text) => {
    const cgpaMatch = text.match(/cgpa[:\s]*(\d+\.?\d*)/i);
    if (cgpaMatch) {
      return parseFloat(cgpaMatch[1]);
    }
    return null;
  };

  const calculateATSScore = (skills, cgpa, text) => {
    let score = 50; // Base score

    console.log('Calculating ATS score with:', { skills, cgpa, textLength: text.length });

    // Skills contribution (30 points)
    const skillScore = Math.min(skills.length * 2, 30);
    score += skillScore;
    console.log(`Skills score: ${skillScore} (${skills.length} skills)`);

    // CGPA contribution (10 points)
    if (cgpa) {
      const cgpaScore = Math.min((cgpa / 10) * 10, 10);
      score += cgpaScore;
      console.log(`CGPA score: ${cgpaScore} (CGPA: ${cgpa})`);
    }

    // Text quality contribution (10 points)
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    const hasEducation = /education|degree|bachelor|master|phd/i.test(text);
    const hasExperience = /experience|work|intern|job/i.test(text);

    if (hasEmail) score += 2;
    if (hasPhone) score += 2;
    if (hasEducation) score += 3;
    if (hasExperience) score += 3;

    console.log(`Text quality: Email=${hasEmail}, Phone=${hasPhone}, Education=${hasEducation}, Experience=${hasExperience}`);
    console.log(`Final ATS score: ${Math.min(Math.round(score), 100)}`);

    return Math.min(Math.round(score), 100);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const analysisResponse = await fetch('http://localhost:8001/upload_resume', {
        method: 'POST',
        body: formData
      });

      if (!analysisResponse.ok) {
        const errData = await analysisResponse.json().catch(() => ({}));
        throw new Error(errData.detail || 'Backend analysis failed');
      }

      const analysisData = await analysisResponse.json();

      const analysisResult = {
        fileName: file.name,
        fileUrl: null,
        skills: analysisData.skills || [],
        categorized_skills: analysisData.categorized_skills || {},
        academic_score: analysisData.academic_score || 'N/A',
        score_type: analysisData.score_type || 'Score',
        atsScore: analysisData.ats_score || 0,
        extractedText: analysisData.text_preview || 'Resume content extracted',
        uploadedAt: new Date().toISOString()
      };

      try {
        const userRef = doc(db, "users", user.email);
        await updateDoc(userRef, {
          resumeAnalysis: analysisResult,
          lastUpdated: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.warn('Firestore save failed:', firestoreError);
      }

      setResult(analysisResult);
      if (onResult) {
        onResult(analysisResult);
      }

    } catch (error) {
      console.error('Error in upload process:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-6">
            Resume & ATS Analyzer
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Upload your resume and get comprehensive ATS optimization insights powered by AI analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-12 shadow-2xl">
            <div
              className={`border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-500 ${dragActive
                ? 'border-blue-500 bg-blue-50/50 scale-105'
                : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto animate-float-3d shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    {file ? file.name : 'Upload your resume'}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {file ? 'Ready to analyze' : 'Drag and drop your PDF resume here, or click to browse files'}
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg font-semibold"
                >
                  Choose File
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />

                <p className="text-sm text-gray-500">Supports PDF files up to 10MB</p>
              </div>
            </div>

            {file && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isAnalyzing}
                  className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl text-xl font-bold"
                >
                  {isUploading || isAnalyzing ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isUploading ? 'Uploading...' : 'Analyzing...'}</span>
                    </div>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>

                {/* Status Indicator */}
                {(isUploading || isAnalyzing) && (
                  <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-blue-700 font-medium">
                        {isUploading ? 'Uploading to server...' : 'Analyzing resume content...'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      This may take a few moments. If it takes too long, we'll use fallback data.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Score Cards */}
            <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-10 shadow-2xl">
              <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">Analysis Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* ATS Score */}
                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl p-8 border border-blue-500/30 transform hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-4">{result.atsScore}/100</div>
                    <div className="text-gray-700 text-xl font-medium mb-6">ATS Score</div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-2000 shadow-lg"
                        style={{ width: `${result.atsScore}%` }}
                      ></div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      {result.atsScore >= 80 ? 'Excellent' : result.atsScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>

                {/* Academic Score (CGPA or Percentage) */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-8 border border-emerald-500/30 transform hover:scale-105 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-emerald-600 mb-4">
                      {result.academic_score || 'N/A'}
                    </div>
                    <div className="text-gray-700 text-xl font-medium">{result.score_type || 'Academic Score'}</div>
                    {result.academic_score && result.academic_score !== 'N/A' && (
                      <div className="mt-4 text-sm text-gray-600">
                        Academic detail identifying performance level
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skills */}
              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Extracted Skills</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 rounded-full text-sm font-medium border border-purple-500/30 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">AI Recommendations</h3>
                </div>
                <div className="space-y-4">
                  {result.atsScore < 70 && (
                    <div className="flex items-start p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
                      <span className="text-amber-500 mr-3 mt-1 text-xl">💡</span>
                      <div>
                        <div className="font-semibold text-gray-800">Improve ATS Score</div>
                        <div className="text-gray-600 text-sm">Add more relevant keywords to boost your score</div>
                      </div>
                    </div>
                  )}
                  {result.skills.length < 5 && (
                    <div className="flex items-start p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
                      <span className="text-blue-500 mr-3 mt-1 text-xl">⚡</span>
                      <div>
                        <div className="font-semibold text-gray-800">Add Technical Skills</div>
                        <div className="text-gray-600 text-sm">Include more programming languages and tools</div>
                      </div>
                    </div>
                  )}
                  {!result.cgpa && (
                    <div className="flex items-start p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/50">
                      <span className="text-emerald-500 mr-3 mt-1 text-xl">📊</span>
                      <div>
                        <div className="font-semibold text-gray-800">Include CGPA</div>
                        <div className="text-gray-600 text-sm">Add your CGPA if it's above 7.0</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start p-4 bg-purple-50/50 rounded-xl border border-purple-200/50">
                    <span className="text-purple-500 mr-3 mt-1 text-xl">✨</span>
                    <div>
                      <div className="font-semibold text-gray-800">Format & Achievements</div>
                      <div className="text-gray-600 text-sm">Ensure proper formatting and add quantifiable achievements</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
