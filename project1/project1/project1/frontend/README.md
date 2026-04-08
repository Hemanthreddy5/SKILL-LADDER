# Job Seeker Portal - Light Theme

A comprehensive job seeker portal built with React, featuring a beautiful light theme with 3D animations and glassmorphism effects.

## Features

### 🎨 **Light Theme Design**
- Beautiful light color palette with glassmorphism effects
- 3D animations and floating elements
- Responsive design for all devices

### 📊 **Dashboard**
- User profile with photo upload/capture
- ATS score display with charts
- Applied jobs timeline
- Skill development tracking
- Interactive graphs and pie charts

### 📄 **Resume & ATS**
- PDF resume upload
- Skills and CGPA extraction
- ATS score calculation
- Resume analysis and recommendations

### 💼 **Job Recommendations**
- Current job openings display
- Personalized recommendations based on skills
- Job filtering by category
- Easy application process

### 📝 **Activities**
- Applied jobs tracking
- Mock test exams with video proctoring
- Exam results and progress tracking

### 🎓 **Learn Platform**
- Personalized learning paths
- Programming language preferences
- Study time planning
- Skill level assessment

### 💻 **CodeLearn**
- 20+ top interview questions
- Multi-language support (Python, JavaScript, Java, C++, C)
- Integrated code editor
- Code execution simulation

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Navigate to the frontend directory:**
   ```bash
   cd project1/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install additional required packages:**
   ```bash
   npm install firebase recharts
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
project1/frontend/
├── src/
│   ├── components/
│   │   ├── Login.js                    # Login/Signup page
│   │   ├── LeftSidebar.js              # Navigation sidebar
│   │   ├── ResumeATS.js                # Resume upload & ATS analysis
│   │   ├── JobRecommendations.js       # Job recommendations
│   │   ├── Activities.js               # Applied jobs & mock tests
│   │   ├── LearnPlatform.js            # Learning path generator
│   │   ├── CodeLearn.js                # Coding interview questions
│   │   ├── ExamComponent.js            # Mock test with video proctoring
│   │   └── dashboard/
│   │       └── JobSeekerDashboard.js   # Main dashboard
│   ├── firebase/
│   │   └── config.js                   # Firebase configuration
│   ├── App.js                          # Main app component
│   ├── index.css                       # Global styles
│   └── lightGlass.css                  # Light theme styles
└── README.md
```

## Key Technologies

- **React** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend services (Auth, Firestore, Storage)
- **Recharts** - Data visualization
- **React Router** - Navigation

## Features in Detail

### 🔐 Authentication
- User registration and login
- Profile management
- Secure authentication with Firebase

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### 🎭 3D Animations
- Floating elements
- Glow effects
- Smooth transitions
- Particle systems

### 📊 Data Visualization
- Pie charts for skill distribution
- Bar charts for job applications
- Line charts for progress tracking
- Area charts for ATS scores

### 🎥 Video Proctoring
- Camera and microphone access
- Real-time video feed during exams
- Secure exam environment

### 💾 Data Persistence
- Firebase Firestore for user data
- Firebase Storage for file uploads
- Real-time data synchronization

## Usage

1. **Sign Up/Login** - Create an account or sign in
2. **Upload Resume** - Add your PDF resume for ATS analysis
3. **View Dashboard** - See your profile, ATS score, and applied jobs
4. **Browse Jobs** - Find and apply to job recommendations
5. **Take Mock Tests** - Practice with video-proctored exams
6. **Learn** - Get personalized learning paths
7. **Code Practice** - Solve interview questions in multiple languages

## Firebase Configuration

The project uses Firebase for backend services. The configuration is already set up in `src/firebase/config.js` with the provided API keys.

## Customization

### Theme Colors
- Edit `src/lightGlass.css` to modify the light theme
- Update CSS variables for custom color schemes

### Questions
- Add more coding questions in `CodeLearn.js`
- Modify mock test questions in `ExamComponent.js`

### Job Data
- Replace sample job data with real API integration
- Update job categories and filters

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   npm start -- --port 3001
   ```

2. **Firebase connection issues:**
   - Check internet connection
   - Verify Firebase configuration

3. **Camera/microphone permissions:**
   - Allow browser permissions
   - Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is created for educational purposes as a BTech final year project.

---

**Note:** This is a comprehensive job seeker portal with modern UI/UX design, featuring all the requested functionality including resume analysis, job recommendations, mock tests, learning paths, and coding practice platform.
