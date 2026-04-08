# Firebase Setup and Data Persistence Guide

## 🔥 Firebase Backend Integration Complete!

Your project now has full Firebase integration for data persistence. Here's how to set it up and verify it's working:

## 📋 Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillladder-9bf10`
3. Go to **Project Settings** (gear icon)
4. Click on **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Rename it to `firebase-service-account.json`
8. Place it in: `D:\project1\project1\project1\backend\firebase-service-account.json`

### 2. Update Environment Variables

Create a `.env` file in the backend directory with:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Development Settings
DEBUG=True
ENVIRONMENT=development
```

## 🧪 Testing Data Persistence

### Method 1: Test Firebase Connection

1. Start the backend server:
   ```bash
   cd D:\project1\project1\project1\backend
   python main.py
   ```

2. Test Firebase connection:
   ```bash
   curl http://localhost:8000/test-firebase
   ```

   **Expected Response (Success):**
   ```json
   {
     "status": "success",
     "message": "Firebase connection working!",
     "test_user_id": "generated-uuid",
     "firebase_status": "connected"
   }
   ```

### Method 2: Test User Registration

1. Register a new user:
   ```bash
   curl -X POST http://localhost:8000/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123",
       "role": "job_seeker",
       "name": "Test User",
       "phone": "1234567890",
       "graduationYear": "2025",
       "studyYear": "3rd Year",
       "degreeType": "BTech",
       "collegeName": "Test College"
     }'
   ```

   **Expected Response:**
   ```json
   {
     "status": "registered",
     "email": "test@example.com",
     "role": "job_seeker",
     "user_id": "firebase-document-id"
   }
   ```

### Method 3: Test User Login

1. Login with the registered user:
   ```bash
   curl -X POST http://localhost:8000/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123"
     }'
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "email": "test@example.com",
     "role": "job_seeker",
     "user_id": "firebase-document-id"
   }
   ```

### Method 4: Test Job Application

1. Apply for a job:
   ```bash
   curl -X POST http://localhost:8000/apply_job/ \
     -H "Content-Type: application/json" \
     -d '{
       "job_id": 1,
       "user_email": "test@example.com"
     }'
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "Successfully applied for Python Developer at TechNova",
     "job_id": 1,
     "application_id": "firebase-document-id",
     "applied_at": "2024-01-01T00:00:00Z"
   }
   ```

### Method 5: Test Mock Test Submission

1. Submit a mock test result:
   ```bash
   curl -X POST http://localhost:8000/submit_mock_test/ \
     -H "Content-Type: application/json" \
     -d '{
       "user_email": "test@example.com",
       "score": 8,
       "total_questions": 10,
       "subject": "Python Programming"
     }'
   ```

   **Expected Response:**
   ```json
   {
     "status": "success",
     "message": "Mock test result submitted successfully",
     "result_id": "firebase-document-id"
   }
   ```

## 🔍 Verify Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillladder-9bf10`
3. Go to **Firestore Database**
4. Check the following collections:
   - `users` - Contains registered users
   - `applications` - Contains job applications
   - `mock_test_results` - Contains test results
   - `interviews` - Contains scheduled interviews

## 🚀 Frontend Integration

The frontend is already configured with Firebase. You can verify by:

1. Starting the frontend:
   ```bash
   cd D:\project1\project1\project1\frontend
   npm start
   ```

2. Open `http://localhost:3000`
3. Register a new user
4. Check Firebase Console to see the data

## 📊 Data Collections Structure

### Users Collection
```json
{
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "user_type": "job_seeker",
  "full_name": "John Doe",
  "phone": "1234567890",
  "graduation_year": "2025",
  "study_year": "3rd Year",
  "degree_type": "BTech",
  "college_name": "University Name",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Applications Collection
```json
{
  "job_id": 1,
  "user_email": "user@example.com",
  "job_title": "Python Developer",
  "company": "TechNova",
  "status": "applied",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Mock Test Results Collection
```json
{
  "user_email": "user@example.com",
  "score": 8,
  "total_questions": 10,
  "percentage": 80.0,
  "subject": "Python Programming",
  "submitted_at": "2024-01-01T00:00:00Z"
}
```

## 🛠️ Troubleshooting

### If Firebase Connection Fails:

1. **Check Service Account Key:**
   - Ensure the JSON file is in the correct location
   - Verify the file has proper JSON format
   - Check file permissions

2. **Check Environment Variables:**
   - Ensure `.env` file exists in backend directory
   - Verify `FIREBASE_SERVICE_ACCOUNT_PATH` is correct

3. **Check Firebase Project:**
   - Ensure Firestore is enabled in Firebase Console
   - Check if the project ID matches: `skillladder-9bf10`

4. **Check Logs:**
   - Look for Firebase initialization messages in console
   - Check for any error messages during startup

### Mock Mode Fallback:

If Firebase is not configured, the system will automatically fall back to mock mode, which means:
- Data is stored temporarily in memory
- Data will be lost when the server restarts
- You'll see "Using mock Firebase mode" in the console

## ✅ Success Indicators

You'll know Firebase is working when you see:
- ✅ Firebase Admin SDK initialized successfully
- ✅ User created in Firebase: email@example.com
- ✅ Application created in Firebase: user@example.com -> Job Title
- ✅ Mock test result saved in Firebase: user@example.com

## 🎯 Next Steps

1. Set up Firebase service account key
2. Test the connection using the provided endpoints
3. Verify data persistence in Firebase Console
4. Test the full application flow through the frontend

Your Firebase integration is now complete and ready for production use! 🚀
