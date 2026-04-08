import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from typing import Dict, Any, List, Optional
from datetime import datetime
import os
import json
from dotenv import load_dotenv

class FirebaseService:
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Try to load environment variables
            load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
        except:
            pass
        
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # Use service account key if available, otherwise use default credentials
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', './firebase-service-account.json')
            if service_account_path and os.path.exists(service_account_path):
                try:
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                    self.db = firestore.client()
                    print("Firebase Admin SDK initialized successfully")
                except Exception as e:
                    print(f"Error initializing Firebase: {e}")
                    self.db = None
                    return
            else:
                # Try to use default credentials (for Google Cloud environments)
                try:
                    firebase_admin.initialize_app()
                    self.db = firestore.client()
                    print("Firebase Admin SDK initialized successfully")
                except Exception as e:
                    print(f"Warning: Could not initialize Firebase Admin SDK: {e}")
                    print("Using mock Firebase mode")
                    self.db = None
                    return
        else:
            # Firebase already initialized
            self.db = firestore.client()
            print("Firebase Admin SDK already initialized")
    
    # ===== USER MANAGEMENT =====
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user in Firestore"""
        try:
            if self.db is None:
                # Mock mode
                import uuid
                user_data['id'] = str(uuid.uuid4())
                user_data['created_at'] = datetime.utcnow().isoformat()
                user_data['updated_at'] = datetime.utcnow().isoformat()
                return user_data
            
            # Prepare user data for Firestore
            user_type = user_data.get('user_type', user_data.get('role', 'job_seeker'))
            user_doc = {
                'email': user_data.get('email'),
                'password_hash': user_data.get('password_hash'),
                'user_type': user_type,
                'role': user_data.get('role', user_type),  # Store role for backward compatibility
                'full_name': user_data.get('full_name'),
                'phone': user_data.get('phone'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Add job seeker specific fields
            if user_data.get('user_type') == 'job_seeker':
                user_doc.update({
                    'graduation_year': user_data.get('graduation_year'),
                    'study_year': user_data.get('study_year'),
                    'degree_type': user_data.get('degree_type'),
                    'college_name': user_data.get('college_name')
                })
            
            # Create document in Firestore
            doc_ref = self.db.collection('users').add(user_doc)
            user_id = doc_ref[1].id
            
            # Return user data with ID
            user_data['id'] = user_id
            user_data['created_at'] = user_doc['created_at'].isoformat()
            user_data['updated_at'] = user_doc['updated_at'].isoformat()
            
            print(f"User created in Firebase: {user_data['email']}")
            return user_data
            
        except Exception as e:
            print(f"Error creating user in Firebase: {e}")
            raise Exception(f"Failed to create user: {str(e)}")
    
    async def get_user_by_email(self, email: str, include_password: bool = False) -> Optional[Dict[str, Any]]:
        """Get user by email from Firestore"""
        try:
            if self.db is None:
                # Mock mode - return None for now
                return None
            
            users_ref = self.db.collection('users')
            query = users_ref.where('email', '==', email).limit(1)
            docs = query.stream()
            
            for doc in docs:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                
                # Ensure role field exists for backward compatibility
                if 'role' not in user_data:
                    user_data['role'] = user_data.get('user_type', 'job_seeker')
                if 'user_type' not in user_data:
                    user_data['user_type'] = user_data.get('role', 'job_seeker')
                
                # Convert datetime objects to strings
                if 'created_at' in user_data:
                    user_data['created_at'] = user_data['created_at'].isoformat()
                if 'updated_at' in user_data:
                    user_data['updated_at'] = user_data['updated_at'].isoformat()
                
                # Remove password hash if not requested
                if not include_password and 'password_hash' in user_data:
                    user_data.pop('password_hash')
                
                return user_data
            
            return None
            
        except Exception as e:
            print(f"Error getting user from Firebase: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID from Firestore"""
        try:
            if self.db is None:
                return None
            
            doc_ref = self.db.collection('users').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                
                # Convert datetime objects to strings
                if 'created_at' in user_data:
                    user_data['created_at'] = user_data['created_at'].isoformat()
                if 'updated_at' in user_data:
                    user_data['updated_at'] = user_data['updated_at'].isoformat()
                
                # Remove password hash
                user_data.pop('password_hash', None)
                return user_data
            
            return None
            
        except Exception as e:
            print(f"Error getting user by ID from Firebase: {e}")
            return None
    
    # ===== JOB MANAGEMENT =====
    async def create_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job in Firestore"""
        try:
            if self.db is None:
                # Mock mode
                import uuid
                job_data['id'] = str(uuid.uuid4())
                job_data['created_at'] = datetime.utcnow().isoformat()
                job_data['updated_at'] = datetime.utcnow().isoformat()
                return job_data
            
            # Prepare job data for Firestore
            job_doc = {
                'title': job_data.get('title'),
                'description': job_data.get('description'),
                'company': job_data.get('company'),
                'location': job_data.get('location'),
                'salary_range': job_data.get('salary_range'),
                'job_type': job_data.get('job_type', 'Full-time'),
                'skills': job_data.get('skills', []),
                'requirements': job_data.get('requirements', []),
                'responsibilities': job_data.get('responsibilities', []),
                'posted_by': job_data.get('posted_by'),
                'status': job_data.get('status', 'active'),
                'application_limit': job_data.get('application_limit'),
                'applications_received': job_data.get('applications_received', 0),
                'deadline': job_data.get('deadline'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'application_deadline': job_data.get('application_deadline')
            }
            
            # Create document in Firestore
            doc_ref = self.db.collection('jobs').add(job_doc)
            job_id = doc_ref[1].id
            
            job_data['id'] = job_id
            job_data['created_at'] = job_doc['created_at'].isoformat()
            job_data['updated_at'] = job_doc['updated_at'].isoformat()
            
            print(f"Job created in Firebase: {job_data['title']}")
            return job_data
            
        except Exception as e:
            print(f"Error creating job in Firebase: {e}")
            raise Exception(f"Failed to create job: {str(e)}")
    
    async def get_jobs(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get jobs from Firestore with optional filters"""
        try:
            if self.db is None:
                return []
            
            jobs_ref = self.db.collection('jobs')
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        jobs_ref = jobs_ref.where(key, '==', value)
            
            docs = jobs_ref.stream()
            jobs = []
            
            for doc in docs:
                job_data = doc.to_dict()
                job_data['id'] = doc.id
                
                # Convert datetime objects to strings
                if 'created_at' in job_data:
                    job_data['created_at'] = job_data['created_at'].isoformat()
                if 'updated_at' in job_data:
                    job_data['updated_at'] = job_data['updated_at'].isoformat()
                if 'application_deadline' in job_data and job_data['application_deadline']:
                    job_data['application_deadline'] = job_data['application_deadline'].isoformat()
                
                jobs.append(job_data)
            
            return jobs
            
        except Exception as e:
            print(f"Error getting jobs from Firebase: {e}")
            return []

    async def update_job(self, job_id: str, updates: Dict[str, Any]) -> bool:
        """Update a job document in Firestore by document ID"""
        try:
            if self.db is None:
                return True

            payload = dict(updates or {})
            payload['updated_at'] = datetime.utcnow()
            self.db.collection('jobs').document(str(job_id)).update(payload)
            return True
        except Exception as e:
            print(f"Error updating job in Firebase: {e}")
            return False

    async def delete_job(self, job_id: str) -> bool:
        """Delete a job document in Firestore by document ID"""
        try:
            if self.db is None:
                return True
            self.db.collection('jobs').document(str(job_id)).delete()
            return True
        except Exception as e:
            print(f"Error deleting job in Firebase: {e}")
            return False
    
    # ===== APPLICATION MANAGEMENT =====
    async def create_application(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new job application in Firestore"""
        try:
            if self.db is None:
                # Mock mode
                import uuid
                application_data['id'] = str(uuid.uuid4())
                application_data['created_at'] = datetime.utcnow().isoformat()
                application_data['updated_at'] = datetime.utcnow().isoformat()
                return application_data
            
            # Prepare application data for Firestore
            app_doc = {
                'job_id': application_data.get('job_id'),
                'user_email': application_data.get('user_email'),
                'job_title': application_data.get('job_title'),
                'company': application_data.get('company'),
                'status': application_data.get('status', 'applied'),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Create document in Firestore
            doc_ref = self.db.collection('applications').add(app_doc)
            app_id = doc_ref[1].id
            
            application_data['id'] = app_id
            application_data['created_at'] = app_doc['created_at'].isoformat()
            application_data['updated_at'] = app_doc['updated_at'].isoformat()
            
            print(f"Application created in Firebase: {application_data['user_email']} -> {application_data['job_title']}")
            return application_data
            
        except Exception as e:
            print(f"Error creating application in Firebase: {e}")
            raise Exception(f"Failed to create application: {str(e)}")
    
    async def get_applications(self, job_id: int = None, user_email: str = None) -> List[Dict[str, Any]]:
        """Get applications from Firestore with optional filters"""
        try:
            if self.db is None:
                return []
            
            apps_ref = self.db.collection('applications')
            
            # Apply filters
            if job_id is not None:
                apps_ref = apps_ref.where('job_id', '==', job_id)
            if user_email is not None:
                apps_ref = apps_ref.where('user_email', '==', user_email)
            
            docs = apps_ref.stream()
            applications = []
            
            for doc in docs:
                app_data = doc.to_dict()
                app_data['id'] = doc.id
                
                # Convert datetime objects to strings
                if 'created_at' in app_data:
                    app_data['created_at'] = app_data['created_at'].isoformat()
                if 'updated_at' in app_data:
                    app_data['updated_at'] = app_data['updated_at'].isoformat()
                
                applications.append(app_data)
            
            return applications
            
        except Exception as e:
            print(f"Error getting applications from Firebase: {e}")
            return []

    async def update_application(self, application_id: str, updates: Dict[str, Any]) -> bool:
        """Update an application document in Firestore by document ID"""
        try:
            if self.db is None:
                return True
            payload = dict(updates or {})
            payload['updated_at'] = datetime.utcnow()
            self.db.collection('applications').document(str(application_id)).update(payload)
            return True
        except Exception as e:
            print(f"Error updating application in Firebase: {e}")
            return False

    # ===== NOTIFICATIONS =====
    async def create_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a notification in Firestore"""
        try:
            if self.db is None:
                import uuid
                notification_data['id'] = str(uuid.uuid4())
                notification_data['created_at'] = datetime.utcnow().isoformat()
                return notification_data

            doc = {
                'user_email': notification_data.get('user_email'),
                'title': notification_data.get('title'),
                'message': notification_data.get('message'),
                'type': notification_data.get('type', 'info'),
                'job_id': notification_data.get('job_id'),
                'provider_email': notification_data.get('provider_email'),
                'status': notification_data.get('status'),
                'created_at': datetime.utcnow()
            }
            doc_ref = self.db.collection('notifications').add(doc)
            notification_data['id'] = doc_ref[1].id
            notification_data['created_at'] = doc['created_at'].isoformat()
            return notification_data
        except Exception as e:
            print(f"Error creating notification in Firebase: {e}")
            raise Exception(f"Failed to create notification: {str(e)}")

    async def get_notifications(self, user_email: str = None) -> List[Dict[str, Any]]:
        """Get notifications from Firestore"""
        try:
            if self.db is None:
                return []
            ref = self.db.collection('notifications')
            if user_email:
                ref = ref.where('user_email', '==', user_email)
            docs = ref.stream()
            notifications = []
            for doc in docs:
                item = doc.to_dict()
                item['id'] = doc.id
                if 'created_at' in item and item['created_at']:
                    item['created_at'] = item['created_at'].isoformat()
                notifications.append(item)
            return notifications
        except Exception as e:
            print(f"Error getting notifications from Firebase: {e}")
            return []
    
    # ===== MOCK TEST RESULTS =====
    async def save_mock_test_result(self, result_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save mock test result in Firestore"""
        try:
            if self.db is None:
                # Mock mode
                import uuid
                result_data['id'] = str(uuid.uuid4())
                result_data['submitted_at'] = datetime.utcnow().isoformat()
                return result_data
            
            # Prepare result data for Firestore
            result_doc = {
                'user_email': result_data.get('user_email'),
                'score': result_data.get('score'),
                'total_questions': result_data.get('total_questions'),
                'percentage': result_data.get('percentage'),
                'subject': result_data.get('subject'),
                'submitted_at': datetime.utcnow()
            }
            
            # Create document in Firestore
            doc_ref = self.db.collection('mock_test_results').add(result_doc)
            result_id = doc_ref[1].id
            
            result_data['id'] = result_id
            result_data['submitted_at'] = result_doc['submitted_at'].isoformat()
            
            print(f"Mock test result saved in Firebase: {result_data['user_email']}")
            return result_data
            
        except Exception as e:
            print(f"Error saving mock test result in Firebase: {e}")
            raise Exception(f"Failed to save mock test result: {str(e)}")
    
    async def get_mock_test_results(self, user_email: str = None) -> List[Dict[str, Any]]:
        """Get mock test results from Firestore"""
        try:
            if self.db is None:
                return []
            
            results_ref = self.db.collection('mock_test_results')
            
            if user_email is not None:
                results_ref = results_ref.where('user_email', '==', user_email)
            
            docs = results_ref.stream()
            results = []
            
            for doc in docs:
                result_data = doc.to_dict()
                result_data['id'] = doc.id
                
                # Convert datetime objects to strings
                if 'submitted_at' in result_data:
                    result_data['submitted_at'] = result_data['submitted_at'].isoformat()
                
                results.append(result_data)
            
            return results
            
        except Exception as e:
            print(f"Error getting mock test results from Firebase: {e}")
            return []
    
    # ===== INTERVIEW SCHEDULING =====
    async def schedule_interview(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule an interview in Firestore"""
        try:
            if self.db is None:
                # Mock mode
                import uuid
                interview_data['id'] = str(uuid.uuid4())
                interview_data['created_at'] = datetime.utcnow().isoformat()
                return interview_data
            
            # Prepare interview data for Firestore
            interview_doc = {
                'email': interview_data.get('email'),
                'round': interview_data.get('round'),
                'date': interview_data.get('date'),
                'notes': interview_data.get('notes'),
                'created_at': datetime.utcnow()
            }
            
            # Create document in Firestore
            doc_ref = self.db.collection('interviews').add(interview_doc)
            interview_id = doc_ref[1].id
            
            interview_data['id'] = interview_id
            interview_data['created_at'] = interview_doc['created_at'].isoformat()
            
            print(f"Interview scheduled in Firebase: {interview_data['email']}")
            return interview_data
            
        except Exception as e:
            print(f"Error scheduling interview in Firebase: {e}")
            raise Exception(f"Failed to schedule interview: {str(e)}")
    
    async def get_interviews(self, email: str = None) -> List[Dict[str, Any]]:
        """Get interviews from Firestore"""
        try:
            if self.db is None:
                return []
            
            interviews_ref = self.db.collection('interviews')
            
            if email is not None:
                interviews_ref = interviews_ref.where('email', '==', email)
            
            docs = interviews_ref.stream()
            interviews = []
            
            for doc in docs:
                interview_data = doc.to_dict()
                interview_data['id'] = doc.id
                
                # Convert datetime objects to strings
                if 'created_at' in interview_data:
                    interview_data['created_at'] = interview_data['created_at'].isoformat()
                
                interviews.append(interview_data)
            
            return interviews
            
        except Exception as e:
            print(f"Error getting interviews from Firebase: {e}")
            return []

# Create a global instance
firebase_service = FirebaseService()
