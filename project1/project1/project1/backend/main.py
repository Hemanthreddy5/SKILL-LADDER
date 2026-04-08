
from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import hashlib
import json
import bcrypt
from datetime import datetime, timedelta
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import uvicorn

# Import routers
from routers import auth, jobs
from firebase_service import firebase_service
from services.resume_parser import resume_parser

# Load environment variables
try:
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
except:
    pass  # .env file doesn't exist, use defaults

# File paths
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
LEARN_PYTHON_COURSE_FILE = os.path.join(os.path.dirname(__file__), "learn_python_course.json")
LEARN_PYTHON_PROGRESS_FILE = os.path.join(os.path.dirname(__file__), "learn_python_progress.json")
LEARN_PYTHON_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "learn_python_score_history.json")

# Security
SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing - using bcrypt directly (already imported at top)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Initialize FastAPI
app = FastAPI(title="Job Portal API", version="1.0.0", redirect_slashes=False)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)

# Security utils
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash"""
    try:
        # Handle string hashes (from database) vs bytes
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    # Ensure password is not longer than 72 bytes (bcrypt limit)
    password_bytes = password[:72].encode('utf-8') if len(password) > 72 else password.encode('utf-8')
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Here you would typically fetch the user from your database
    # For now, we'll return a mock user
    return {"email": email, "id": "user123", "user_type": "job_seeker"}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For backward compatibility with existing code
supabase = None  # This will be initialized only if needed and available

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def _load_json_file(path, default_value):
    try:
        if not os.path.exists(path):
            return default_value
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default_value

def _save_json_file(path, payload):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

def _get_learn_python_course():
    return _load_json_file(LEARN_PYTHON_COURSE_FILE, {"course_id": "learn-python", "course_name": "Learn Python", "modules": []})

def _get_learn_python_progress_store():
    return _load_json_file(LEARN_PYTHON_PROGRESS_FILE, {})

def _get_learn_python_history_store():
    return _load_json_file(LEARN_PYTHON_HISTORY_FILE, {})

def _compute_unlock_map(modules, user_progress):
    unlock_map = {}
    for index, module in enumerate(modules):
        module_id = module.get("module_id")
        if index == 0:
            unlock_map[module_id] = True
        else:
            prev_module_id = modules[index - 1].get("module_id")
            prev_data = user_progress.get(prev_module_id, {})
            unlock_map[module_id] = bool(prev_data.get("passed"))
    return unlock_map

def _build_simple_pdf(text_lines):
    # Minimal one-page PDF generator (no external libs required)
    safe_lines = [line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)") for line in text_lines]
    content_lines = ["BT", "/F1 16 Tf", "50 760 Td"]
    for i, line in enumerate(safe_lines):
        if i > 0:
            content_lines.append("0 -24 Td")
        content_lines.append(f"({line}) Tj")
    content_lines.append("ET")
    stream_content = "\n".join(content_lines).encode("utf-8")

    objects = []
    objects.append(b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
    objects.append(b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
    objects.append(b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n")
    objects.append(f"4 0 obj << /Length {len(stream_content)} >> stream\n".encode("utf-8") + stream_content + b"\nendstream endobj\n")
    objects.append(b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n")

    pdf = b"%PDF-1.4\n"
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj
    xref_offset = len(pdf)
    pdf += f"xref\n0 {len(offsets)}\n".encode("utf-8")
    pdf += b"0000000000 65535 f \n"
    for off in offsets[1:]:
        pdf += f"{off:010d} 00000 n \n".encode("utf-8")
    pdf += f"trailer << /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF".encode("utf-8")
    return pdf

@app.post("/register")
async def register(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    
    if not all([email, password, role]):
        raise HTTPException(status_code=400, detail="Missing registration fields.")
    
    # Validate role
    if role not in ["job_seeker", "job_provider"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'job_seeker' or 'job_provider'.")
    
    # Check if user already exists in Firebase
    existing_user = await firebase_service.get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")
    
    # Create user object with additional fields for job seekers
    user_data = {
        "email": email, 
        "password_hash": get_password_hash(password),  # Use proper bcrypt hashing
        "user_type": role,  # Firebase uses user_type
        "role": role, 
        "history": []
    }
    
    # Add additional fields for job seekers
    if role == "job_seeker":
        name = data.get("name")
        phone = data.get("phone")
        graduation_year = data.get("graduationYear")
        study_year = data.get("studyYear")
        degree_type = data.get("degreeType")
        college_name = data.get("collegeName")

        if not all([name, phone, graduation_year, study_year, degree_type, college_name]):
            raise HTTPException(status_code=400, detail="Missing required fields for job seeker registration.")

        user_data.update({
            "full_name": name,
            "phone": phone,
            "graduation_year": graduation_year,
            "study_year": study_year,
            "degree_type": degree_type,
            "college_name": college_name
        })
    
    # Save to Firebase
    try:
        created_user = await firebase_service.create_user(user_data)
        print(f"[OK] User registered successfully in Firebase: {email}")
        return {"status": "registered", "email": email, "role": role, "user_id": created_user.get("id")}
    except Exception as e:
        print(f"[ERROR] Error registering user: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    if not all([email, password]):
        raise HTTPException(status_code=400, detail="Missing login fields.")
    
    # Get user from Firebase
    user = await firebase_service.get_user_by_email(email, include_password=True)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    # Verify password
    if not verify_password(password, user["password_hash"]):
        print(f"[ERROR] Password verification failed for: {email}")
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    print(f"[OK] User logged in successfully: {email}")
    
    # Get role from user_type or role field
    role = user.get("role") or user.get("user_type", "job_seeker")
    
    return {
        "status": "success", 
        "email": user["email"], 
        "role": role, 
        "user_id": user.get("id"),
        "name": user.get("full_name", user.get("name", "")),
        "user_type": user.get("user_type", role)
    }

@app.post("/save_history")
async def save_history(request: Request):
    data = await request.json()
    email = data.get("email")
    entry = data.get("entry")
    if not email or not entry:
        raise HTTPException(status_code=400, detail="Missing email or entry.")
    users = load_users()
    for u in users:
        if u["email"] == email:
            if "history" not in u:
                u["history"] = []
            u["history"].append(entry)
            save_users(users)
            return {"status": "saved"}
    raise HTTPException(status_code=404, detail="User not found.")

@app.get("/get_history")
async def get_history(email: str):
    users = load_users()
    user = next((u for u in users if u["email"] == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"history": user.get("history", [])}

@app.get("/admin/all_users")
async def admin_all_users():
    users = load_users()
    return [{"email": u["email"], "role": u["role"], "history": u.get("history", [])} for u in users]

# Interview scheduling (simple demo)
INTERVIEWS_FILE = os.path.join(os.path.dirname(__file__), "interviews.json")

def load_interviews():
    if not os.path.exists(INTERVIEWS_FILE):
        return []
    with open(INTERVIEWS_FILE, "r") as f:
        return json.load(f)

def save_interviews(interviews):
    with open(INTERVIEWS_FILE, "w") as f:
        json.dump(interviews, f, indent=2)

@app.post("/admin/schedule_interview")
async def schedule_interview(request: Request):
    data = await request.json()
    # expects: { email, round, date, notes }
    interviews = load_interviews()
    interviews.append(data)
    save_interviews(interviews)
    return {"status": "scheduled"}

@app.get("/admin/get_interviews")
async def get_interviews(email: str = None):
    interviews = load_interviews()
    if email:
        interviews = [i for i in interviews if i.get("email") == email]
    return {"interviews": interviews}


# Placeholder for resume upload
import io
from fastapi import HTTPException
from PyPDF2 import PdfReader
import re

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    
    try:
        contents = await file.read()
        
        # Use the advanced NLP ResumeParser
        analysis_result = resume_parser.parse_resume(contents, file.filename)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
            
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Resume processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Placeholder for ATS scoring
@app.post("/ats_score")
async def ats_score():
    # TODO: Implement ATS scoring logic
    return {"score": 85}

# Job recommendation endpoint
from fastapi import Query

# Keep runtime store empty by default. Only provider-posted jobs should appear.
JOBS_DB = []

def _safe_int(value, default=None):
    try:
        if value is None or value == "":
            return default
        return int(value)
    except Exception:
        return default

def _parse_deadline(deadline_value):
    if not deadline_value:
        return None
    try:
        return datetime.fromisoformat(str(deadline_value).replace("Z", "+00:00")).date()
    except Exception:
        try:
            return datetime.strptime(str(deadline_value), "%Y-%m-%d").date()
        except Exception:
            return None

def _normalize_status(status_value):
    value = str(status_value or "").strip().lower()
    if value == "closed":
        return "Closed"
    if value == "expired":
        return "Expired"
    return "Active"

def _compute_job_status(job):
    current_status = _normalize_status(job.get("status"))
    if current_status == "Closed":
        return "Closed"

    deadline_date = _parse_deadline(job.get("deadline"))
    if deadline_date and datetime.utcnow().date() > deadline_date:
        return "Expired"

    application_limit = _safe_int(job.get("application_limit"))
    applications_received = _safe_int(job.get("applications_received"), 0)
    if application_limit is not None and application_limit >= 0 and applications_received >= application_limit:
        return "Closed"

    return "Active"

def _public_job(job):
    payload = dict(job)
    payload.pop("_firebase_doc_id", None)
    payload.pop("_source", None)
    return payload

async def _get_application_counts():
    counts = {}
    unique = set()
    try:
        firebase_apps = await firebase_service.get_applications()
    except Exception:
        firebase_apps = []

    all_apps = list(firebase_apps or []) + list(JOB_APPLICATIONS or [])
    for app in all_apps:
        key = (str(app.get("job_id")), str(app.get("user_email", "")).lower())
        if key in unique:
            continue
        unique.add(key)
        job_key = key[0]
        counts[job_key] = counts.get(job_key, 0) + 1
    return counts

def _normalize_local_job(job):
    return {
        "id": job.get("id"),
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "salary": job.get("salary") or job.get("salary_range", ""),
        "description": job.get("description", ""),
        "skills": job.get("skills", []),
        "rounds": job.get("rounds", "3"),
        "website": job.get("website", ""),
        "type": job.get("type") or job.get("job_type", "Full-time"),
        "posted_by": job.get("posted_by"),
        "posted_date": job.get("posted_date") or job.get("created_at", ""),
        "status": job.get("status", "active"),
        "application_limit": _safe_int(job.get("application_limit")),
        "applications_received": _safe_int(job.get("applications_received"), 0),
        "deadline": job.get("deadline"),
        "_source": "local",
    }

def _normalize_firebase_job(job):
    return {
        "id": job.get("id"),
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "salary": job.get("salary") or job.get("salary_range", ""),
        "description": job.get("description", ""),
        "skills": job.get("skills", []),
        "rounds": job.get("rounds", "3"),
        "website": job.get("website", ""),
        "type": job.get("type") or job.get("job_type", "Full-time"),
        "posted_by": job.get("posted_by"),
        "posted_date": job.get("posted_date") or job.get("created_at", ""),
        "status": job.get("status", "active"),
        "application_limit": _safe_int(job.get("application_limit")),
        "applications_received": _safe_int(job.get("applications_received"), 0),
        "deadline": job.get("deadline") or job.get("application_deadline"),
        "_source": "firebase",
        "_firebase_doc_id": job.get("id"),
    }

async def _get_merged_jobs(include_inactive: bool = False, posted_by: str = None):
    app_counts = await _get_application_counts()
    jobs = []

    for job in JOBS_DB:
        normalized = _normalize_local_job(job)
        if posted_by and normalized.get("posted_by") != posted_by:
            continue
        normalized["applications_received"] = app_counts.get(str(normalized.get("id")), normalized.get("applications_received", 0))
        normalized["status"] = _compute_job_status(normalized)
        if normalized.get("application_limit") is not None:
            normalized["remaining_slots"] = max(normalized["application_limit"] - normalized["applications_received"], 0)
        else:
            normalized["remaining_slots"] = None
        jobs.append(normalized)

    try:
        firebase_jobs = await firebase_service.get_jobs({"posted_by": posted_by} if posted_by else None)
    except Exception as e:
        print(f"Error loading Firebase jobs: {e}")
        firebase_jobs = []

    for job in firebase_jobs:
        normalized = _normalize_firebase_job(job)
        normalized["applications_received"] = app_counts.get(str(normalized.get("id")), normalized.get("applications_received", 0))
        normalized["status"] = _compute_job_status(normalized)
        if normalized.get("application_limit") is not None:
            normalized["remaining_slots"] = max(normalized["application_limit"] - normalized["applications_received"], 0)
        else:
            normalized["remaining_slots"] = None
        jobs.append(normalized)

    dedup = {}
    for job in jobs:
        key = f"{job.get('title')}|{job.get('company')}|{job.get('posted_by')}|{job.get('posted_date')}"
        dedup[key] = job

    merged = list(dedup.values())
    if not include_inactive:
        merged = [j for j in merged if j.get("status") == "Active"]
    return merged

@app.post("/recommend_jobs")
async def recommend_jobs(request: Request):
    data = await request.json()
    skills = data.get("skills", [])
    jobs = await _get_merged_jobs(include_inactive=False)
    
    if not skills:
        # If no skills provided, return all jobs
        return {"jobs": [_public_job(j) for j in jobs]}
    
    # Score jobs by number of matching skills and skill relevance
    scored_jobs = []
    for job in jobs:
        match_count = len([s for s in job["skills"] if s.lower() in [skill.lower() for skill in skills]])
        # Bonus points for exact skill matches
        exact_matches = len([s for s in job["skills"] if s.lower() in [skill.lower() for skill in skills]])
        score = match_count * 2 + exact_matches
        
        scored_jobs.append((score, job))
    
    # Sort by score descending, then by job title
    scored_jobs.sort(key=lambda x: (-x[0], x[1]["title"]))
    
    # Return top 10 most relevant jobs
    recommended_jobs = [job for _, job in scored_jobs[:10]]
    
    return {
        "jobs": [_public_job(j) for j in recommended_jobs],
        "total_matches": len(scored_jobs),
        "skills_analyzed": skills
    }

@app.get("/get_all_jobs")
async def get_all_jobs():
    jobs = await _get_merged_jobs(include_inactive=False)
    return {"jobs": [_public_job(j) for j in jobs]}

# Store job applications
JOB_APPLICATIONS = []

# Store mock test results
MOCK_TEST_RESULTS = []
# Store notifications (fallback when Firebase unavailable)
NOTIFICATIONS = []

@app.post("/apply_job")
async def apply_job(request: Request):
    try:
        data = await request.json()
        job_id = data.get("job_id")
        user_email = data.get("user_email")
        
        if not job_id or not user_email:
            raise HTTPException(status_code=400, detail="Missing job_id or user_email")
        
        all_jobs = await _get_merged_jobs(include_inactive=True)
        job = next((j for j in all_jobs if str(j.get("id")) == str(job_id)), None)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if job.get("status") != "Active":
            raise HTTPException(status_code=400, detail=f"Applications are {job.get('status').lower()} for this job")

        # Re-check count and deadline at apply-time to avoid race/late applies.
        current_count = _safe_int(job.get("applications_received"), 0)
        application_limit = _safe_int(job.get("application_limit"))
        if application_limit is not None and current_count >= application_limit:
            raise HTTPException(status_code=400, detail="Application limit reached for this job")

        deadline_date = _parse_deadline(job.get("deadline"))
        if deadline_date and datetime.utcnow().date() > deadline_date:
            raise HTTPException(status_code=400, detail="Application deadline has passed")
        
        # Check if user already applied
        existing_applications = await firebase_service.get_applications(job_id=job_id, user_email=user_email)
        if existing_applications:
            raise HTTPException(status_code=400, detail="User already applied for this job")
        
        # Create application
        application_data = {
            "job_id": job_id,
            "user_email": user_email,
            "job_title": job["title"],
            "company": job["company"],
            "applied_at": datetime.utcnow().isoformat(),
            "status": "applied"
        }
        
        # Save to Firebase
        created_application = await firebase_service.create_application(application_data)

        # Keep local in-memory list in sync for endpoints that read from it.
        # This avoids empty monitor views when Firebase-backed inserts succeed.
        local_application = {
            "id": created_application.get("id", len(JOB_APPLICATIONS) + 1),
            "job_id": int(job_id) if str(job_id).isdigit() else job_id,
            "user_email": user_email,
            "job_title": job["title"],
            "company": job["company"],
            "applied_at": created_application.get("applied_at") or application_data["applied_at"],
            "status": created_application.get("status") or "applied"
        }
        already_local = any(
            app.get("job_id") == local_application["job_id"] and app.get("user_email") == user_email
            for app in JOB_APPLICATIONS
        )
        if not already_local:
            JOB_APPLICATIONS.append(local_application)

        # Update local job counter/status
        for local_job in JOBS_DB:
            if str(local_job.get("id")) == str(job_id):
                local_job["applications_received"] = _safe_int(local_job.get("applications_received"), 0) + 1
                local_job["status"] = _compute_job_status(local_job)
                break

        # Update Firebase job counter/status if this is a Firebase job document.
        firebase_doc_id = job.get("_firebase_doc_id")
        if firebase_doc_id:
            next_count = current_count + 1
            next_status = _compute_job_status({
                "status": job.get("status"),
                "deadline": job.get("deadline"),
                "application_limit": application_limit,
                "applications_received": next_count
            })
            await firebase_service.update_job(firebase_doc_id, {
                "applications_received": next_count,
                "status": next_status
            })
        
        return {
            "status": "success",
            "message": f"Successfully applied for {job['title']} at {job['company']}",
            "job_id": job_id,
            "application_id": created_application.get("id"),
            "applied_at": created_application.get("applied_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in apply_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_job_applications")
async def get_job_applications(job_id: int = None, user_email: str = None):
    try:
        # Prefer Firebase data (source of truth), fallback to local in-memory list.
        firebase_apps = await firebase_service.get_applications(job_id=job_id, user_email=user_email)
        if firebase_apps:
            normalized_apps = []
            for app in firebase_apps:
                item = dict(app)
                item["applied_at"] = item.get("applied_at") or item.get("created_at")
                normalized_apps.append(item)
            return {"applications": normalized_apps}
    except Exception as e:
        print(f"Error reading applications from Firebase: {e}")

    if job_id is not None:
        applications = [app for app in JOB_APPLICATIONS if app.get("job_id") == job_id]
    elif user_email is not None:
        applications = [app for app in JOB_APPLICATIONS if app.get("user_email") == user_email]
    else:
        applications = JOB_APPLICATIONS

    return {"applications": applications}

@app.post("/update_application_status")
async def update_application_status(request: Request):
    try:
        data = await request.json()
        application_id = data.get("application_id")
        decision = str(data.get("status", "")).strip().lower()
        posted_by = data.get("posted_by")

        if not application_id or decision not in {"selected", "rejected"} or not posted_by:
            raise HTTPException(status_code=400, detail="application_id, posted_by and valid status are required")

        all_jobs = await _get_merged_jobs(include_inactive=True, posted_by=posted_by)
        provider_job_ids = {str(j.get("id")) for j in all_jobs}

        target_app = None
        try:
            all_apps = await firebase_service.get_applications()
        except Exception:
            all_apps = []
        for app in all_apps:
            if str(app.get("id")) == str(application_id) and str(app.get("job_id")) in provider_job_ids:
                target_app = app
                break

        if target_app:
            await firebase_service.update_application(str(application_id), {"status": decision})
        else:
            for app in JOB_APPLICATIONS:
                if str(app.get("id")) == str(application_id):
                    # local auth fallback
                    local_job = next((j for j in JOBS_DB if str(j.get("id")) == str(app.get("job_id"))), None)
                    if local_job and local_job.get("posted_by") != posted_by:
                        raise HTTPException(status_code=403, detail="Not authorized to update this application")
                    app["status"] = decision
                    target_app = app
                    break

        if not target_app:
            raise HTTPException(status_code=404, detail="Application not found")

        notification_payload = {
            "user_email": target_app.get("user_email"),
            "title": "Job Application Update",
            "message": f"Your application for {target_app.get('job_title', 'this role')} at {target_app.get('company', 'the company')} has been {decision}.",
            "type": "application_status",
            "job_id": target_app.get("job_id"),
            "provider_email": posted_by,
            "status": decision
        }

        try:
            await firebase_service.create_notification(notification_payload)
        except Exception:
            notification_payload["id"] = len(NOTIFICATIONS) + 1
            notification_payload["created_at"] = datetime.utcnow().isoformat()
            NOTIFICATIONS.append(notification_payload)

        return {"status": "success", "message": f"Application {decision} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_application_status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_notifications")
async def get_notifications(user_email: str):
    try:
        notifications = await firebase_service.get_notifications(user_email=user_email)
        if notifications:
            notifications = sorted(notifications, key=lambda x: x.get("created_at", ""), reverse=True)
            return {"notifications": notifications}
    except Exception as e:
        print(f"Error reading notifications from Firebase: {e}")

    local_items = [n for n in NOTIFICATIONS if n.get("user_email") == user_email]
    local_items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"notifications": local_items}

# Learn Python Course APIs
@app.get("/learn-python/course")
async def learn_python_course(user_email: str):
    course = _get_learn_python_course()
    modules = course.get("modules", [])
    progress_store = _get_learn_python_progress_store()
    user_progress = progress_store.get(user_email, {})
    unlock_map = _compute_unlock_map(modules, user_progress)

    response_modules = []
    completed_count = 0
    for module in modules:
        module_id = module.get("module_id")
        data = user_progress.get(module_id, {})
        passed = bool(data.get("passed"))
        if passed:
            completed_count += 1
        response_modules.append({
            "module_id": module_id,
            "title": module.get("title"),
            "difficulty": module.get("difficulty", "Easy"),
            "description": module.get("description", ""),
            "unlocked": unlock_map.get(module_id, False),
            "completed": passed,
            "best_score": data.get("best_score", 0),
            "attempts": data.get("attempts", 0)
        })

    total_modules = len(modules)
    progress_percent = int((completed_count / total_modules) * 100) if total_modules else 0
    return {
        "course_id": course.get("course_id", "learn-python"),
        "course_name": course.get("course_name", "Learn Python"),
        "issuer": "Skill Ladder",
        "progress_percent": progress_percent,
        "completed_modules": completed_count,
        "total_modules": total_modules,
        "modules": response_modules
    }

@app.get("/learn-python/module/{module_id}")
async def learn_python_module(module_id: str, user_email: str):
    course = _get_learn_python_course()
    modules = course.get("modules", [])
    target = next((m for m in modules if str(m.get("module_id")) == str(module_id)), None)
    if not target:
        raise HTTPException(status_code=404, detail="Module not found")

    progress_store = _get_learn_python_progress_store()
    user_progress = progress_store.get(user_email, {})
    unlock_map = _compute_unlock_map(modules, user_progress)
    if not unlock_map.get(module_id, False):
        raise HTTPException(status_code=403, detail="Module is locked. Pass previous module quiz first.")

    return {
        "module_id": target.get("module_id"),
        "title": target.get("title"),
        "difficulty": target.get("difficulty", "Easy"),
        "content": target.get("content", {})
    }

@app.get("/learn-python/quiz/{module_id}")
async def learn_python_quiz(module_id: str, user_email: str):
    course = _get_learn_python_course()
    modules = course.get("modules", [])
    target = next((m for m in modules if str(m.get("module_id")) == str(module_id)), None)
    if not target:
        raise HTTPException(status_code=404, detail="Module not found")

    progress_store = _get_learn_python_progress_store()
    user_progress = progress_store.get(user_email, {})
    unlock_map = _compute_unlock_map(modules, user_progress)
    if not unlock_map.get(module_id, False):
        raise HTTPException(status_code=403, detail="Quiz is locked. Pass previous module first.")

    questions = []
    for q in target.get("quiz", []):
        questions.append({
            "question_id": q.get("question_id"),
            "question": q.get("question"),
            "options": q.get("options", [])
        })
    return {
        "module_id": target.get("module_id"),
        "title": target.get("title"),
        "passing_score": 60,
        "questions": questions
    }

@app.post("/learn-python/quiz/{module_id}/submit")
async def submit_learn_python_quiz(module_id: str, request: Request):
    data = await request.json()
    user_email = data.get("user_email")
    answers = data.get("answers", [])
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")
    if not isinstance(answers, list):
        raise HTTPException(status_code=400, detail="answers must be an array")

    course = _get_learn_python_course()
    modules = course.get("modules", [])
    target = next((m for m in modules if str(m.get("module_id")) == str(module_id)), None)
    if not target:
        raise HTTPException(status_code=404, detail="Module not found")

    progress_store = _get_learn_python_progress_store()
    history_store = _get_learn_python_history_store()
    user_progress = progress_store.get(user_email, {})
    unlock_map = _compute_unlock_map(modules, user_progress)
    if not unlock_map.get(module_id, False):
        raise HTTPException(status_code=403, detail="Quiz is locked")

    quiz_questions = target.get("quiz", [])
    total = len(quiz_questions)
    correct = 0
    for idx, question in enumerate(quiz_questions):
        submitted = answers[idx] if idx < len(answers) else None
        if submitted == question.get("correct_index"):
            correct += 1

    score_percent = int((correct / total) * 100) if total else 0
    passed = score_percent >= 60

    module_progress = user_progress.get(module_id, {"attempts": 0, "best_score": 0, "passed": False, "completed": False})
    module_progress["attempts"] = int(module_progress.get("attempts", 0)) + 1
    module_progress["best_score"] = max(int(module_progress.get("best_score", 0)), score_percent)
    module_progress["last_score"] = score_percent
    module_progress["passed"] = bool(module_progress.get("passed")) or passed
    module_progress["completed"] = bool(module_progress.get("completed")) or passed
    module_progress["updated_at"] = datetime.utcnow().isoformat()
    user_progress[module_id] = module_progress
    progress_store[user_email] = user_progress
    _save_json_file(LEARN_PYTHON_PROGRESS_FILE, progress_store)

    user_history = history_store.get(user_email, [])
    user_history.append({
        "module_id": module_id,
        "module_title": target.get("title"),
        "score": score_percent,
        "passed": passed,
        "attempted_at": datetime.utcnow().isoformat()
    })
    history_store[user_email] = user_history
    _save_json_file(LEARN_PYTHON_HISTORY_FILE, history_store)

    all_passed = True
    for module in modules:
        module_data = user_progress.get(module.get("module_id"), {})
        if not module_data.get("passed"):
            all_passed = False
            break

    return {
        "module_id": module_id,
        "score": score_percent,
        "correct_answers": correct,
        "total_questions": total,
        "passed": passed,
        "passing_score": 60,
        "next_module_unlocked": passed,
        "certificate_available": all_passed
    }

@app.get("/learn-python/progress")
async def learn_python_progress(user_email: str):
    progress_store = _get_learn_python_progress_store()
    history_store = _get_learn_python_history_store()
    return {
        "user_email": user_email,
        "module_progress": progress_store.get(user_email, {}),
        "score_history": history_store.get(user_email, [])
    }

@app.get("/learn-python/certificate")
async def learn_python_certificate(user_email: str, user_name: str = "Learner"):
    course = _get_learn_python_course()
    modules = course.get("modules", [])
    progress_store = _get_learn_python_progress_store()
    user_progress = progress_store.get(user_email, {})
    all_passed = len(modules) > 0 and all(user_progress.get(m.get("module_id"), {}).get("passed") for m in modules)
    if not all_passed:
        raise HTTPException(status_code=403, detail="Complete all modules with passing score to get certificate")

    completion_date = datetime.utcnow().strftime("%Y-%m-%d")
    pdf_bytes = _build_simple_pdf([
        "Skill Ladder - Course Completion Certificate",
        f"Name: {user_name}",
        f"Course: {course.get('course_name', 'Learn Python')}",
        f"Completion Date: {completion_date}",
        "Issued by: Skill Ladder"
    ])
    filename = f"learn-python-certificate-{user_email.replace('@', '_at_')}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# Job Provider Endpoints
@app.post("/post_job")
async def post_job(request: Request):
    try:
        data = await request.json()
        required_fields = ["title", "company", "location", "salary", "description", "skills", "posted_by"]
        
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        application_limit = _safe_int(data.get("application_limit"))
        deadline = data.get("deadline")
        if application_limit is not None and application_limit <= 0:
            raise HTTPException(status_code=400, detail="application_limit must be greater than 0")
        if deadline and not _parse_deadline(deadline):
            raise HTTPException(status_code=400, detail="deadline must be a valid date")

        # Create new job
        new_job = {
            "id": len(JOBS_DB) + 1,
            "title": data["title"],
            "company": data["company"],
            "location": data["location"],
            "salary": data["salary"],
            "description": data["description"],
            "skills": data["skills"],
            "rounds": data.get("rounds", "3"),
            "website": data.get("website", ""),
            "type": data.get("type", "Full-time"),
            "posted_by": data["posted_by"],
            "posted_date": "2024-01-01",
            "status": "Active",
            "application_limit": application_limit,
            "applications_received": 0,
            "deadline": deadline
        }
        
        JOBS_DB.append(new_job)

        # Persist to Firebase for durability across backend restarts.
        try:
            created_job = await firebase_service.create_job({
                "title": new_job["title"],
                "description": new_job["description"],
                "company": new_job["company"],
                "location": new_job["location"],
                "salary_range": new_job["salary"],
                "job_type": new_job["type"],
                "skills": new_job["skills"],
                "posted_by": new_job["posted_by"],
                "status": new_job["status"],
                "application_limit": new_job["application_limit"],
                "applications_received": 0,
                "deadline": new_job["deadline"]
            })
            if created_job and created_job.get("id"):
                new_job["id"] = created_job.get("id")
        except Exception as e:
            print(f"Warning: Firebase job persistence failed: {e}")
        
        return {
            "status": "success",
            "message": "Job posted successfully",
            "job_id": new_job["id"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in post_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/delete_job/{job_id}")
async def delete_job(job_id: str, posted_by: str):
    try:
        deleted = False

        # Delete from in-memory jobs (supports int/string IDs)
        job = next((j for j in JOBS_DB if str(j.get("id")) == str(job_id)), None)
        if job:
            if job.get("posted_by") != posted_by:
                raise HTTPException(status_code=403, detail="Not authorized to delete this job")
            JOBS_DB.remove(job)
            deleted = True

        # Delete from Firebase jobs if present
        try:
            provider_jobs = await firebase_service.get_jobs({"posted_by": posted_by})
            firebase_job = next((j for j in provider_jobs if str(j.get("id")) == str(job_id)), None)
            if firebase_job:
                await firebase_service.delete_job(str(firebase_job.get("id")))
                deleted = True
        except Exception as e:
            print(f"Error deleting Firebase job: {e}")

        if not deleted:
            raise HTTPException(status_code=404, detail="Job not found")

        # Remove related applications (local cache)
        global JOB_APPLICATIONS
        JOB_APPLICATIONS = [app for app in JOB_APPLICATIONS if str(app.get("job_id")) != str(job_id)]
        
        return {"status": "success", "message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_job: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_jobs_by_provider")
async def get_jobs_by_provider(posted_by: str):
    jobs = await _get_merged_jobs(include_inactive=True, posted_by=posted_by)
    return {"jobs": [_public_job(j) for j in jobs]}

@app.post("/stop_job_applications/{job_id}")
async def stop_job_applications(job_id: str, request: Request):
    data = await request.json()
    posted_by = data.get("posted_by")
    if not posted_by:
        raise HTTPException(status_code=400, detail="Missing posted_by")

    target = None
    for job in JOBS_DB:
        if str(job.get("id")) == str(job_id):
            target = job
            break

    if target and target.get("posted_by") != posted_by:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    if target:
        target["status"] = "Closed"

    try:
        provider_jobs = await firebase_service.get_jobs({"posted_by": posted_by})
        for job in provider_jobs:
            if str(job.get("id")) == str(job_id):
                await firebase_service.update_job(job.get("id"), {"status": "Closed"})
                break
    except Exception as e:
        print(f"Error closing Firebase job: {e}")

    if not target:
        all_jobs = await _get_merged_jobs(include_inactive=True, posted_by=posted_by)
        if not any(str(j.get("id")) == str(job_id) for j in all_jobs):
            raise HTTPException(status_code=404, detail="Job not found")

    return {"status": "success", "message": "Applications closed for this job", "job_id": job_id}

# Mock Test Results
@app.post("/submit_mock_test")
async def submit_mock_test(request: Request):
    try:
        data = await request.json()
        required_fields = ["user_email", "score", "total_questions", "subject"]
        
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        result_data = {
            "user_email": data["user_email"],
            "score": data["score"],
            "total_questions": data["total_questions"],
            "percentage": round((data["score"] / data["total_questions"]) * 100, 2),
            "subject": data["subject"]
        }
        
        # Save to Firebase
        created_result = await firebase_service.save_mock_test_result(result_data)

        # Keep local cache in sync as fallback.
        local_result = {
            "id": created_result.get("id", len(MOCK_TEST_RESULTS) + 1),
            "user_email": result_data["user_email"],
            "score": result_data["score"],
            "total_questions": result_data["total_questions"],
            "percentage": result_data["percentage"],
            "subject": result_data["subject"],
            "submitted_at": created_result.get("submitted_at")
        }
        MOCK_TEST_RESULTS.append(local_result)
        
        print(f"[OK] Mock test result saved to Firebase: {data['user_email']}")
        return {
            "status": "success",
            "message": "Mock test result submitted successfully",
            "result_id": created_result.get("id")
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in submit_mock_test: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_mock_test_results")
async def get_mock_test_results(user_email: str = None):
    try:
        firebase_results = await firebase_service.get_mock_test_results(user_email=user_email)
        if firebase_results:
            return {"results": firebase_results}
    except Exception as e:
        print(f"Error reading mock test results from Firebase: {e}")

    if user_email:
        results = [result for result in MOCK_TEST_RESULTS if result.get("user_email") == user_email]
    else:
        results = MOCK_TEST_RESULTS

    return {"results": results}

# Analytics for Job Providers
@app.get("/get_provider_analytics")
async def get_provider_analytics(posted_by: str):
    try:
        # Get jobs posted by this provider
        provider_jobs = [job for job in JOBS_DB if job["posted_by"] == posted_by]
        
        # Get applications for these jobs
        job_ids = [job["id"] for job in provider_jobs]
        applications = [app for app in JOB_APPLICATIONS if app["job_id"] in job_ids]
        
        # Get mock test results for applicants
        applicant_emails = list(set([app["user_email"] for app in applications]))
        mock_results = [result for result in MOCK_TEST_RESULTS if result["user_email"] in applicant_emails]
        
        # Calculate analytics
        total_jobs = len(provider_jobs)
        total_applications = len(applications)
        total_applicants = len(applicant_emails)
        total_mock_tests = len(mock_results)
        
        # Average mock test score
        avg_score = 0
        if mock_results:
            avg_score = sum(result["percentage"] for result in mock_results) / len(mock_results)
        
        # Job-wise application count
        job_applications = {}
        for job in provider_jobs:
            job_applications[job["title"]] = len([app for app in applications if app["job_id"] == job["id"]])
        
        # Skills distribution
        all_skills = []
        for job in provider_jobs:
            all_skills.extend(job["skills"])
        
        skill_counts = {}
        for skill in all_skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
        
        return {
            "total_jobs": total_jobs,
            "total_applications": total_applications,
            "total_applicants": total_applicants,
            "total_mock_tests": total_mock_tests,
            "average_mock_score": round(avg_score, 2),
            "job_applications": job_applications,
            "skill_distribution": skill_counts,
            "recent_applications": applications[-10:] if applications else [],
            "recent_mock_results": mock_results[-10:] if mock_results else []
        }
    except Exception as e:
        print(f"Error in get_provider_analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Placeholder for feedback
@app.post("/feedback")
async def feedback(feedback: str = Form(...)):
    # TODO: Save feedback
    return {"status": "received"}

# Placeholder for chatbot
@app.post("/chatbot/")
async def chatbot(query: str = Form(...)):
    # TODO: Integrate AI chatbot
    return {"response": "This is a placeholder response."}

# JSON endpoint for chatbot (for frontend)
from fastapi import Body

@app.post("/chatbot")
async def chatbot_json(request: Request):
    data = await request.json()
    question = data.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing 'question' in request body.")
    # TODO: Integrate chatbot logic here
    return {"answer": f"You asked: {question}. This is a placeholder answer."}

# Test endpoint to verify Firebase connection
@app.get("/test-firebase")
async def test_firebase():
    try:
        # Test creating a sample user
        test_user_data = {
            "email": "test@firebase.com",
            "password_hash": hash_password("test123"),
            "role": "job_seeker",
            "user_type": "job_seeker",
            "full_name": "Test User",
            "phone": "1234567890"
        }
        
        # Try to create user
        created_user = await firebase_service.create_user(test_user_data)
        
        return {
            "status": "success",
            "message": "Firebase connection working!",
            "test_user_id": created_user.get("id"),
            "firebase_status": "connected"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Firebase connection failed: {str(e)}",
            "firebase_status": "disconnected"
        }

@app.post("/test-data")
async def create_test_data():
    try:
        if supabase is None:
            return {
                "status": "warning",
                "message": "Supabase not configured. Cannot create test data.",
                "user_id": None,
                "job_id": None
            }
        
        # Test user data
        user_data = {
            "email": "test@example.com",
            "password_hash": hash_password("testpassword123"),
            "user_type": "job_seeker",
            "full_name": "Test User"
        }
        
        # Insert user
        user = supabase.table('users').insert(user_data).execute()
        user_id = user.data[0]['id'] if user.data else None
        
        if not user_id:
            return {"status": "error", "message": "Failed to create test user"}
        
        # Test job data
        job_data = {
            "title": "Software Developer",
            "description": "Looking for a skilled software developer...",
            "company": "Tech Corp",
            "location": "Remote",
            "salary_range": "$80,000 - $120,000",
            "job_type": "Full-time",
            "skills": ["Python", "JavaScript", "React"],
            "posted_by": user_id,
            "status": "active"
        }
        
        # Insert job
        job = supabase.table('jobs').insert(job_data).execute()
        job_id = job.data[0]['id'] if job.data else None
        
        return {
            "status": "success",
            "message": "Test data created successfully",
            "user_id": user_id,
            "job_id": job_id
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
