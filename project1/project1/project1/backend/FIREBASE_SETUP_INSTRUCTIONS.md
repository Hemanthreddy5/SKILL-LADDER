# Firebase Service Account Setup Instructions

## 📋 Quick Setup Guide

### Step 1: Download Service Account Key
1. Go to: https://console.firebase.google.com/project/skillladder-9bf10/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Download the JSON file
4. Rename it to: `firebase-service-account.json`
5. Place it in: `D:\project1\project1\project1\backend\firebase-service-account.json`

### Step 2: Create Environment File
Create a `.env` file in the backend directory with:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DEBUG=True
ENVIRONMENT=development
```

### Step 3: Test Firebase Connection
After setting up the service account key, restart the backend and test:

```bash
# Restart backend
python main.py

# Test Firebase connection
curl http://localhost:8000/test-firebase
```

### Step 4: Verify Data in Firebase Console
1. Go to: https://console.firebase.google.com/project/skillladder-9bf10/firestore
2. You should see collections: users, applications, mock_test_results, interviews

## 🔍 Troubleshooting

### If you see "Using mock Firebase mode":
- Service account key is missing or incorrect
- Check file path in .env file
- Verify JSON file format

### If you see Firebase errors:
- Check Firebase project permissions
- Ensure Firestore is enabled
- Verify service account has proper roles

## 📁 File Structure Should Look Like:
```
backend/
├── firebase-service-account.json  ← Your downloaded key
├── .env                          ← Environment variables
├── firebase_service.py           ← Firebase service
├── main.py                       ← Updated main file
└── requirements.txt              ← Dependencies
```
