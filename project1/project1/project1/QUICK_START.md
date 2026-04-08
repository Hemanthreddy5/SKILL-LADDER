# Quick Start Guide

## Prerequisites
- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn

## Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Project

### Option 1: Use the Batch File (Windows)
Simply double-click `START_BOTH.bat` to start both servers.

### Option 2: Manual Start

#### Terminal 1 - Backend
```bash
cd backend
python main.py
```
Backend will run on http://localhost:8000

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## Firebase Configuration

The project uses Firebase for backend services. Make sure the `firebase-service-account.json` file is present in the backend directory.

## Troubleshooting

### Backend Won't Start
1. Check if Python is installed: `python --version`
2. Install dependencies: `pip install -r requirements.txt`
3. Check if port 8000 is available

### Frontend Won't Start
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Check if port 3000 is available

### Firebase Connection Issues
- Verify `firebase-service-account.json` exists and is valid
- Check that Firebase project is active in Firebase Console

## Project Structure

```
project1/
├── backend/           # FastAPI backend
│   ├── main.py       # Main API file
│   ├── firebase_service.py  # Firebase integration
│   ├── routers/      # API routes
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/         # React components
│   └── package.json
└── START_BOTH.bat    # Quick start script
```

## Features

- User Authentication (Registration/Login)
- Job Posting and Management
- Job Applications
- Resume Upload and ATS Scoring
- Mock Tests
- Interview Scheduling
- Admin Dashboard
