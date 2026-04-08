# Skill Ladder - Career Development Platform

A comprehensive platform for students and job seekers to enhance their skills, analyze resumes, and find career opportunities.

## Recent Fixes (Latest Update)

### ✅ Fixed Loading Issues

**Resume Upload & ATS Analysis:**
- Added timeout mechanism (15 seconds) to prevent infinite loading
- Implemented fallback functionality when server is unavailable
- Added status indicators to show upload progress
- Simplified backend dependencies to avoid installation issues
- Better error handling for Firebase operations

**Learning Module:**
- Added timeout mechanism (10 seconds) for learning path generation
- Implemented local fallback processing when Firestore is unavailable
- Added status indicators for learning path generation
- Improved error handling for user preference saving

### 🔧 Technical Improvements

1. **Backend Simplification:**
   - Removed complex dependencies (spacy, pdfplumber, pytesseract)
   - Simplified PDF processing using PyPDF2 only
   - Added better error handling and logging

2. **Frontend Enhancements:**
   - Added timeout mechanisms to prevent infinite loading
   - Implemented graceful fallbacks for all operations
   - Added user-friendly status indicators
   - Improved error messages and user feedback

3. **Firebase Integration:**
   - Made Firebase operations optional (won't break functionality if unavailable)
   - Added fallback data when Firestore operations fail
   - Better error handling for authentication issues

## Features

### 🎯 Resume & ATS Analyzer
- Upload PDF resumes for analysis
- Extract skills and CGPA automatically
- Calculate ATS compatibility score
- Provide optimization recommendations
- **NEW:** Fallback functionality ensures analysis always completes

### 📚 Learning Platform
- Personalized learning path generation
- Programming language recommendations
- Development area suggestions
- Time-based study planning
- **NEW:** Local processing ensures learning paths are always generated

### 💼 Job Recommendations
- Skill-based job matching
- Company-specific recommendations
- Career guidance tools

### 🎓 Student Dashboard
- Progress tracking
- Skill assessment
- Learning history

## Setup Instructions

### Backend Setup
```bash
cd project1/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd project1/frontend
npm install
npm start
```

## Troubleshooting

### If Resume Upload Gets Stuck:
1. The system will automatically use fallback data after 15 seconds
2. Check that the backend server is running on port 8000
3. Ensure you're uploading a valid PDF file

### If Learning Path Generation Gets Stuck:
1. The system will automatically use local processing after 10 seconds
2. Check that Firebase is properly configured
3. The learning path will still be generated locally

### If Firebase Issues Occur:
- All features will work with local fallback data
- No data will be lost - everything is processed locally
- Check Firebase configuration in `src/firebase/config.js`

## Technology Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** FastAPI, Python
- **Database:** Firebase Firestore (with local fallbacks)
- **Storage:** Firebase Storage (optional)
- **PDF Processing:** PyPDF2

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Ensure all services are running
3. The system includes fallback mechanisms for most common issues
4. All features will work even if some services are unavailable
