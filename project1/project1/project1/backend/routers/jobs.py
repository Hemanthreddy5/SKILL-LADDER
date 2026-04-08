from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import Database

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

# Request/Response models
class JobBase(BaseModel):
    title: str
    description: str
    company: str
    location: str
    salary_range: Optional[str] = None
    job_type: str = "Full-time"
    skills: List[str] = []
    requirements: List[str] = []
    responsibilities: List[str] = []
    application_deadline: Optional[datetime] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    posted_by: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic V2

# Initialize database
db = Database()

# Dependency for getting current user
async def get_current_user() -> dict:
    """Mock current user for now - replace with proper auth"""
    return {"id": "user123", "user_type": "job_provider", "email": "test@example.com"}

@router.post("/", response_model=JobResponse)
async def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    """Create a new job posting"""
    if current_user["user_type"] != "job_provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job providers can create job postings"
        )
    
    job_data = job.dict()
    job_data["posted_by"] = current_user["id"]
    job_data["status"] = "active"
    job_data["created_at"] = datetime.utcnow()
    job_data["updated_at"] = datetime.utcnow()
    
    try:
        result = db.supabase.table('jobs').insert(job_data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating job: {str(e)}"
        )

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    skip: int = 0, 
    limit: int = 10,
    search: Optional[str] = None,
    location: Optional[str] = None,
    job_type: Optional[str] = None
):
    """Get all active jobs with optional filters"""
    try:
        query = db.supabase.table('jobs').select('*').eq('status', 'active')
        
        # Apply filters
        if search:
            query = query.or_(f"or(title.ilike.%{search}%,description.ilike.%{search}%)")
        if location:
            query = query.ilike('location', f'%{location}%')
        if job_type:
            query = query.eq('job_type', job_type)
            
        # Apply pagination
        query = query.range(skip, skip + limit - 1)
        
        result = query.execute()
        return result.data if result.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching jobs: {str(e)}"
        )

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """Get job details by ID"""
    try:
        result = db.supabase.table('jobs').select('*').eq('id', job_id).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching job: {str(e)}"
        )

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str, 
    job: JobBase, 
    current_user: dict = Depends(get_current_user)
):
    """Update a job posting"""
    try:
        # Check if job exists and user is the owner
        existing_job = db.supabase.table('jobs').select('*').eq('id', job_id).execute()
        if not existing_job.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
            
        if existing_job.data[0]['posted_by'] != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this job"
            )
        
        # Update job
        job_data = job.dict()
        job_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = db.supabase.table('jobs').update(job_data).eq('id', job_id).execute()
        return result.data[0] if result.data else None
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job: {str(e)}"
        )
