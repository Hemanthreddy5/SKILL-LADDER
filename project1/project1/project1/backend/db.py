from supabase import Client, create_client
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
import os
import bcrypt
from dotenv import load_dotenv
from fastapi import HTTPException, Depends, Request
import jwt

# Password hashing - using bcrypt directly

class Database:
    def __init__(self, supabase: Client = None):
        if supabase is None:
            # Try to load environment variables, but don't fail if .env doesn't exist
            try:
                load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
            except:
                pass
            
            # Use environment variables or defaults
            supabase_url = os.getenv('SUPABASE_URL', 'https://your-project.supabase.co')
            supabase_key = os.getenv('SUPABASE_KEY', 'your-anon-key')
            
            try:
                self.supabase = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"Warning: Could not connect to Supabase: {e}")
                print("Using mock database mode")
                self.supabase = None
        else:
            self.supabase = supabase
    
    # ===== AUTHENTICATION =====
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a bcrypt hash"""
        try:
            # Handle string hashes (from database) vs bytes
            if isinstance(hashed_password, str):
                hashed_password = hashed_password.encode('utf-8')
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)
        except Exception as e:
            print(f"Password verification error: {e}")
            return False
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password using bcrypt"""
        # Ensure password is not longer than 72 bytes (bcrypt limit)
        password_bytes = password[:72].encode('utf-8') if len(password) > 72 else password.encode('utf-8')
        return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
    
    def create_access_token(self, data: dict, expires_delta: timedelta = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, os.getenv('SUPABASE_JWT_SECRET'), algorithm="HS256")
    
    # ===== USER MANAGEMENT =====
    async def get_current_user(self, token: str) -> Dict[str, Any]:
        """Get the current user from the token"""
        try:
            payload = jwt.decode(token, os.getenv('SUPABASE_JWT_SECRET'), algorithms=["HS256"])
            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid authentication credentials")
            
            # Get user from database
            user = self.supabase.table('users').select('*').eq('id', user_id).execute()
            if not user.data:
                raise HTTPException(status_code=404, detail="User not found")
            
            return user.data[0]
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user in the database"""
        try:
            # Hash the password
            if 'password' in user_data:
                user_data['password_hash'] = self.get_password_hash(user_data.pop('password'))
            
            # Set default values
            user_data.setdefault('user_type', 'job_seeker')
            user_data.setdefault('created_at', datetime.utcnow().isoformat())
            user_data.setdefault('updated_at', datetime.utcnow().isoformat())
            
            if self.supabase is None:
                # Mock database mode
                import uuid
                user_data['id'] = str(uuid.uuid4())
                user_data.pop('password_hash', None)
                return user_data
            
            result = self.supabase.table('users').insert(user_data).execute()
            if not result.data:
                raise HTTPException(status_code=400, detail="Failed to create user")
                
            # Don't return password hash
            user = result.data[0]
            user.pop('password_hash', None)
            return user
            
        except Exception as e:
            if 'duplicate key' in str(e).lower():
                raise HTTPException(status_code=400, detail="Email already registered")
            raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
    
    async def get_user_by_email(self, email: str, include_password: bool = False) -> Optional[Dict[str, Any]]:
        """Retrieve a user by email"""
        try:
            if self.supabase is None:
                # Mock database mode - return None for now
                return None
                
            result = self.supabase.table('users').select('*').eq('email', email).execute()
            if not result.data:
                return None
                
            user = result.data[0]
            # Don't return password hash
            if not include_password:
                user.pop('password_hash', None)
            return user
            
        except Exception as e:
            print(f"Error getting user: {str(e)}")
            return None
            
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a user by ID"""
        try:
            result = self.supabase.table('users').select('*').eq('id', user_id).execute()
            if not result.data:
                return None
                
            user = result.data[0]
            # Don't return password hash
            user.pop('password_hash', None)
            return user
            
        except Exception as e:
            print(f"Error getting user by ID: {str(e)}")
            return None
            
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Update user information"""
        try:
            # Don't allow updating email or password through this method
            user_data.pop('email', None)
            user_data.pop('password', None)
            user_data.pop('password_hash', None)
            
            # Update the updated_at timestamp
            user_data['updated_at'] = datetime.utcnow().isoformat()
            
            result = self.supabase.table('users')\
                .update(user_data)\
                .eq('id', user_id)\
                .execute()
                
            return len(result.data) > 0 if result.data else False
            
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return False
    
    # Job Management
    async def create_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job posting"""
        try:
            result = self.supabase.table('jobs').insert(job_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating job: {str(e)}")
            raise
    
    async def get_jobs(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get jobs with optional filters"""
        try:
            query = self.supabase.table('jobs').select('*')
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        query = query.eq(key, value)
            
            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting jobs: {str(e)}")
            return []
    
    # Application Management
    async def create_application(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job application"""
        try:
            result = self.supabase.table('applications').insert(application_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating application: {str(e)}")
            raise
    
    async def get_applications(self, job_id: int = None, user_email: str = None) -> List[Dict[str, Any]]:
        """Get applications with optional filters"""
        try:
            query = self.supabase.table('applications').select('*')
            
            if job_id is not None:
                query = query.eq('job_id', job_id)
            if user_email is not None:
                query = query.eq('email', user_email)
            
            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting applications: {str(e)}")
            return []
    
    # Interview Scheduling
    async def schedule_interview(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule a new interview"""
        try:
            result = self.supabase.table('interviews').insert(interview_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error scheduling interview: {str(e)}")
            raise
    
    async def get_interviews(self, email: str = None) -> List[Dict[str, Any]]:
        """Get interviews with optional email filter"""
        try:
            query = self.supabase.table('interviews').select('*')
            
            if email is not None:
                query = query.eq('email', email)
            
            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error getting interviews: {str(e)}")
            return []
